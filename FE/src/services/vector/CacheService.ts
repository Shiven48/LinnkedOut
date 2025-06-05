import path from 'path'
import fs from 'fs/promises'

export class CacheService {

    private cachePath:string; 

    constructor(){
        this.cachePath = path.join(process.cwd(), '.cache', 'category-embeddings.json');
    }

    async cacheEmbeddings(embeddings: Record<string, number[]>): Promise<void> {
    try {
      // For server-side Next.js
      const cacheDir = path.join(process.cwd(), '.cache');
      await fs.mkdir(cacheDir, { recursive: true });
      
      const cachePath = path.join(cacheDir, 'category-embeddings.json');
      await fs.writeFile(cachePath, JSON.stringify(embeddings));
      
      console.log("Category embeddings cached successfully");
    } catch (error) {
      console.error("Failed to cache embeddings:", error);
    }
  }

  async getCachedCategoryEmbeddings(): Promise<Record<string, number[]>> {
    try {
      const filePath = this.cachePath;
      try {
        const data = await fs.readFile(filePath, 'utf-8');
        const parsed:any = JSON.parse(data);

        if(parsed && typeof parsed === 'object' && !Array.isArray(parsed)){
          const categoryCount = Object.keys(parsed).length;
          console.log(`Found ${categoryCount} categories in cache`);
          return parsed as Record<string,number[]>;
        } else{
          console.warn('Cache exists but does not contain valid embeddings data')
          return {};
        }
      } catch (error) {
        console.error('Cache File not present or cant be read')
        return {};
      }
    } catch (error) {
      console.error("Failed to retrieve cached embeddings:", error);
      return {};
    }
  }

    async checkCacheExists(): Promise<boolean> {
        try{
          const cacheFilePath = this.cachePath;
          const stats = await fs.stat(cacheFilePath);
          return stats.size > 0;
        } catch(error){
          console.error(error)
          return false
        }
    }
}