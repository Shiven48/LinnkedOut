import { StringOutputParser } from "@langchain/core/output_parsers";
import { PromptTemplate } from "@langchain/core/prompts";
import { ChatGroq } from "@langchain/groq";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents"
import { Document } from "langchain/document"

export class summaryService {

    private llm!: ChatGroq;

    constructor(){
        this.initializeModel();
    }

    private initializeModel(): void {
        this.llm = new ChatGroq({
            model: 'llama-3.3-70b-versatile',
            apiKey: process.env.GROQ_API_KEY!,
            temperature: 2
        })
    }

    async generateSummary(text: string):Promise<string> {
        const docs = [
            new Document({ pageContent: text }),
        ];

        const prompt = PromptTemplate.fromTemplate(
            "Summarize the main points or the main theme of the whole document such that it can be used as notes for revision of concept maintaining all the scientific concepts and terms and explaining and adding the core idea in summary: {context}"
        );

        const chain = await createStuffDocumentsChain({
            llm: this.llm,
            outputParser: new StringOutputParser(),
            prompt,
        })

        const summarizedText:string = await chain.invoke({ context: docs});
        console.log(summarizedText)
        return summarizedText;
    }
}