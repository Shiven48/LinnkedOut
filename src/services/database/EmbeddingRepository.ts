import { insertEmbeddings } from "@/server/functions/media";

export class EmbeddingRepository {

    async storeContent(content: string, contentEmbeddings:number[]):Promise<number> {
      try {
        console.log(`[EmbeddingRepository] Inserting embeddings into database...`);
        const { id } = await insertEmbeddings(content, contentEmbeddings); 
        
        if (!id) {
          throw new Error("Received an invalid or missing ID from insertEmbeddings.");
        }
        
        console.log(`[EmbeddingRepository] Successfully stored embeddings with ID: ${id}`);
        return id;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        console.error(`[EmbeddingRepository] Failed to insert data: ${errorMessage}`, error);
        throw new Error(`Embedding storage failed: ${errorMessage}`);
      }
    }

}