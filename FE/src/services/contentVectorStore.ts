import { insertEmbeddings } from "@/server/functions/media";

export class contentVectorStore {

  classifyEmbedding(contentEmbeddings: number[], categoryEmbeddings: Record<string, number[]>): string {
    if (!contentEmbeddings || contentEmbeddings.length === 0) {
      throw new Error("Content embeddings are empty or invalid");
    }
    
    if (!categoryEmbeddings || Object.keys(categoryEmbeddings).length === 0) {
      throw new Error("Category embeddings are empty or invalid");
    }
    
    console.log(`Classifying content against ${Object.keys(categoryEmbeddings).length} categories`);
    
    const similarities: { category: string; similarity: number }[] = [];
    
    for (const [category, catEmbeddings] of Object.entries(categoryEmbeddings)) {
      try {
        const similarity = this.cosineSimilarity(contentEmbeddings, catEmbeddings);
        similarities.push({ category, similarity });
      } catch (error) {
        console.error(`Error calculating similarity for category ${category}:`, error);
      }
    }
    
    similarities.sort((a, b) => b.similarity - a.similarity);
    
    similarities.forEach(({ category, similarity }) => {
      console.log(`${similarity.toFixed(6)} : ${category}`);
    });
    
    if (similarities.length === 0) {
      throw new Error("Failed to calculate similarities with any category");
    }
    
    return similarities[0].category;
  }

  cosineSimilarity(vecA: number[], vecB: number[]): number {
    if (!vecA || !vecB || vecA.length === 0 || vecB.length === 0) {
      throw new Error("Vectors cannot be empty");
    }
    
    if (vecA.length !== vecB.length) {
      throw new Error(`Vector dimensions don't match: ${vecA.length} vs ${vecB.length}`);
    }
    
    const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
    
    const magA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
    const magB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
    
    if (magA === 0 || magB === 0) {
      console.warn("One or both vectors have zero magnitude");
      return 0;
    }
    
    return dotProduct / (magA * magB);
  }

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