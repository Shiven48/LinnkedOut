import { insertEmbeddings } from "@/server/functions/media";

export class EmbeddingRepository {

    async storeContent(content: string, contentEmbeddings:number[], category: string):Promise<number> {
      try {
        const { id } = await insertEmbeddings(content,contentEmbeddings,category); 
        if(!id) throw new Error('Id is not present on the returning object')
        return id;
      } catch (error) {
        console.error('Error inserting data:', error);
        throw error;
      }
    }

    // Yet to implement
    // async semanticSearch(query: string, limit: number = 10){
    //   try{
    //     const queryEmbedding:number[] = await this.embeddingGenerator.generateEmbeddings(query);
    //     return await getSimilarSearchedFromEmbeddings(queryEmbedding,limit);
    //   } catch(error){
    //   }
    // }

}