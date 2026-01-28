import { insertEmbeddings } from "@/server/functions/media";

export class EmbeddingRepository {

    async storeContent(content: string, contentEmbeddings:number[]):Promise<number> {
      try {
        const { id } = await insertEmbeddings(content,contentEmbeddings); 
        if(!id) throw new Error('Id is not present on the returning object')
        return id;
      } catch (error) {
        console.error('Error inserting data:', error);
        throw error;
      }
    }

}