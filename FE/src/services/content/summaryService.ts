import { ChatPromptTemplate, PromptTemplate } from "@langchain/core/prompts";
import { ChatGroq } from "@langchain/groq";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import { Document } from "langchain/document";
import { StreamChunk } from "@/services/common/types";
import { Summary_Template, Tags_Template } from "../common/constants";
import {
  CommaSeparatedListOutputParser,
  ListOutputParser,
  StringOutputParser,
  StructuredOutputParser,
} from "@langchain/core/output_parsers";
import { RunnableSequence } from "@langchain/core/runnables";

export class SummaryService {
  private llm: ChatGroq;

  constructor() {
    this.llm = this.initializeModel();
  }

  private initializeModel(): ChatGroq {
    return new ChatGroq({
      model: "llama-3.3-70b-versatile",
      apiKey: process.env.GROQ_API_KEY!,
      temperature: 0.7,
      streaming: true,
    });
  }

  public createTemplate(template: string): PromptTemplate {
    return PromptTemplate.fromTemplate(template);
  }

  public async createChain(prompt: PromptTemplate) {
    return await createStuffDocumentsChain({
      llm: this.llm,
      prompt,
    });
  }

  public async generateSummary(text: string): Promise<Response> {
    const docs: Document[] = [new Document({ pageContent: text })];
    const prompt = this.createTemplate(Summary_Template);
    const chain = await this.createChain(prompt);

    const stream = new ReadableStream<Uint8Array>({
      async start(controller: ReadableStreamDefaultController<Uint8Array>) {
        const asyncIterable: AsyncIterable<StreamChunk> = await chain.stream({
          context: docs,
        });
        for await (const chunk of asyncIterable) {
          const textChunk: string =
            typeof chunk === "string" ? chunk : chunk?.content ?? "";
          controller.enqueue(new TextEncoder().encode(textChunk));
        }
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain",
        "Cache-Control": "no-cache",
      },
    });
  }

  public async generateTags(prompt: string): Promise<string[]> {
    const parser = new CommaSeparatedListOutputParser();
    const template = this.createTemplate(Tags_Template);

    const chain = RunnableSequence.from([
      (input: { data: string }) => ({ data: input }),
      template,
      this.llm,
      parser,
    ]);

    const output: string[] = await chain.invoke({ data: prompt });
    return output;
  }

  public async generateSearchQuery(
    category: string,
    customTags: string[],
    similarity: string
  ): Promise<string> {
    const formattedTags = customTags
      .map((tag: string) => tag.replace("#", ""))
      .join(", ");
    const prompt: string = `
      You are an expert at creating YouTube search queries that find high-quality educational content.

      TASK: Generate a single YouTube search query based on the following:

      CATEGORY: "${category}"
      USER INTERESTS: ${formattedTags}
      SIMILARITY LEVEL: ${similarity}

      REQUIREMENTS:
      1. Create ONE search query (not multiple queries)
      2. Use 3-5 specific keywords separated by spaces (not commas)
      3. Focus on practical, hands-on content rather than theory
      4. Avoid generic terms like "tutorial", "guide", "beginner", "advanced"
      5. Include specific topics, concepts, or methodologies from the interests
      6. Target content that shows real-world applications or demonstrations

      EXAMPLES OF GOOD QUERIES:
      - "Quantum computing entanglement explained"
      - "Machine learning model deployment flask"
      - "Ancient Rome daily life documentary"
      - "supply chain logistics optimization techniques"

      AVOID:
      - Roadmap or theoretical content
      - Vague terms like "basics", "introduction", "overview"
      - Generic phrases like "how to learn"
      - Broad categories without specificity

      Generate a single search query that will find high-quality, practical videos for someone interested in these topics:
    `;

    const tags = await this.generateTags(prompt);
    return tags.join(" ");
  }
}
