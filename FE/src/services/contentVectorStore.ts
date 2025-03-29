import { insertYoutubeEmbeddings } from "@/server/functions/media";

export class contentVectorStore {

  classifyEmbedding(contentEmbeddings:number[],categoryEmbeddings:Record<string,number[]>):string {
      let maxSimilarity:number = 0;
      let mostSimilarCategoryForContent:string = "";
  
      for(const [category, catEmbeddings] of Object.entries(categoryEmbeddings)){
        const temperorySimilarity:number = this.cosineSimilarity(contentEmbeddings,catEmbeddings)
        if(temperorySimilarity > maxSimilarity){
          maxSimilarity = temperorySimilarity;
          mostSimilarCategoryForContent = category;
        }
      }
      return mostSimilarCategoryForContent;
    }

    cosineSimilarity(vecA:number[], vecB:number[]):number {
      const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
      const magA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
      const magB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
      return dotProduct / (magA * magB);
    }
  
    async storeContent(content: string, contentEmbeddings:number[], category: string){
      try {
        const id = await insertYoutubeEmbeddings(content,contentEmbeddings,category); 
        if(!id) throw new Error('Id is not present on the returning object')
        return id;
      } catch (error) {
        console.error('Error inserting data:', error);
        throw error;
      }
    }

    // Yet to do 
    // async semanticSearch(query: string, limit: number = 10){
    //   try{
    //     const queryEmbedding:number[] = await this.embeddingGenerator.generateEmbeddings(query);
    //     return await getSimilarSearchedFromEmbeddings(queryEmbedding,limit);
    //   } catch(error){

    //   }
    // }
}

  // "Your detailed content here", 
  //     ["Learning & Skills", "Career Growth"]