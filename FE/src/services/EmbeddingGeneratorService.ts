import { VoyageEmbeddings } from "@langchain/community/embeddings/voyage";
import { Media, YoutubeMedia } from "../../types";
import { extractCaptions } from "./youtubeService";

class EmbeddingGenerator {
  private voyageEmbeddings: VoyageEmbeddings;

  constructor() {
    this.voyageEmbeddings = new VoyageEmbeddings({
      apiKey: process.env.VOYAGE_API_KEY,
    });
  }

  async generateEmbeddings(content: string): Promise<number[]> {
    try {
      if (!this.voyageEmbeddings) {
        throw new Error("voyageEmbeddings is not initialized");
      }
      if (!content || typeof content !== "string" || content.trim() === "") {
        throw new Error("Content is invalid or empty");
      }
      const embedding = await this.voyageEmbeddings.embedQuery(content);
      if (!embedding || !Array.isArray(embedding) || embedding.length === 0) {
        throw new Error("Generated embedding is invalid");
      }
      return embedding;
    } catch (error) {
      if(error instanceof Error){
        console.error(`Error in generateEmbeddings: ${error.message}`);
        throw error;
      }
        throw error;
    }
  }

  async generateBatchEmbeddings(contents: string[]): Promise<number[][]> {
    try {
        return await this.voyageEmbeddings.embedDocuments(contents)
    } catch (error) {
        console.error("Batch Embedding Generation Error:", error);
        throw error;
      }
  }

  async extractAndPreprocessData(mediaData: Media, platformData: YoutubeMedia):Promise<string> {
    let unifiedText: string = mediaData.title.trim();
    const { description, englishCaptions } = platformData;

    if (!englishCaptions && description) {
      unifiedText += " " + description.trim();
    } else if (!description && englishCaptions) {
      const extractedCaptions: string = extractCaptions(englishCaptions);
      unifiedText += " " + extractedCaptions.trim();
    } else if (description && englishCaptions) {
      const extractedCaptions: string = extractCaptions(englishCaptions);
      unifiedText += " " + description.trim() + " " + extractedCaptions.trim();
    }

    unifiedText = unifiedText
      .replace(/https?:\/\/\S+/g, '')
      .replace(/\d+:\d+/g, '')
      .replace(/[^\w\s'-]/g, '')
      .replace(/\b(Subscribe|Follow|Learn more|LinkedIn|Twitter|Facebook|Instagram|visit|YouTube)\b/gi, '')
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .trim();

    // Remove duplicate words while preserving order
    const sentences = unifiedText.split(/\s+/);
    const uniqueSentences:string[] = [];
    const seenWords = new Set();

    sentences.forEach(word => {
      if (!seenWords.has(word)) {
        uniqueSentences.push(word);
        seenWords.add(word);
      }
    });
    unifiedText = uniqueSentences.join(' ').slice(0, 1000);         
    return unifiedText;
  }

  async generateCategoryEmbeddings(categories: Record<string, string>): Promise<Record<string, number[]>> {
    const categoryEmbeddings: Record<string, number[]> = {};
    for (const [category, description] of Object.entries(categories)) {
      try {
        if (!description) {
          console.warn(`Skipping ${category}: description is empty or undefined`);
          continue;
        }
        const embedding: number[] = await this.generateEmbeddings(description);
        if (!embedding || embedding.length === 0) {
          console.error(`No embedding generated for category: ${category}`);
          continue;
        }
        categoryEmbeddings[category] = embedding;
      } catch (error) {
        console.error(`Error generating embedding for ${category}:`, error);
      }
    }
    return categoryEmbeddings;
  }
}

export default EmbeddingGenerator;