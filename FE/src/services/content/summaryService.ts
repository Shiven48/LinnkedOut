import { PromptTemplate } from "@langchain/core/prompts";
import { ChatGroq } from "@langchain/groq";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import { Document } from "langchain/document";
import { StreamChunk } from '@/services/common/types';

export class SummaryService {
  private llm: ChatGroq;
  
  constructor() {
    this.llm = this.initializeModel();
  }
  
  private initializeModel(): ChatGroq {
    return new ChatGroq({
      model: 'llama-3.3-70b-versatile',
      apiKey: process.env.GROQ_API_KEY!,
      temperature: 0.7,
      streaming: true,
    });
  }

  public createTemplate(): PromptTemplate {
    return PromptTemplate.fromTemplate(
      "Summarize the main points or the main theme of the whole document such that it can be used as notes for revision of concept maintaining all the scientific concepts and terms and explaining and adding the core idea in summary: {context}"
    );
  }

  public async createChain(prompt: PromptTemplate) {
    return await createStuffDocumentsChain({
      llm: this.llm,
      prompt,
    });
  }
  
  public async generateSummary(text: string): Promise<Response> {
    const docs: Document[] = [new Document({ pageContent: text })];
    const prompt = this.createTemplate();
    const chain = await this.createChain(prompt);
    
    const stream = new ReadableStream<Uint8Array>({
      async start(controller: ReadableStreamDefaultController<Uint8Array>) {
        const asyncIterable:AsyncIterable<StreamChunk> = await chain.stream({ context: docs });
        for await (const chunk of asyncIterable) {
          const textChunk: string =
            typeof chunk === 'string'
              ? chunk
              : chunk?.content ?? '';
          controller.enqueue(new TextEncoder().encode(textChunk));
        }
        controller.close();
      },
    });

    return new Response(stream, {
        headers: {
          'Content-Type': 'text/plain',
          'Cache-Control': 'no-cache',
        },
      });
  }
}