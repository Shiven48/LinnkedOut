import { VoyageEmbeddings } from "@langchain/community/embeddings/voyage";
import { Media } from "../../types";
import { extractCaptions } from "./youtubeService";
import path from 'path'
import fs from 'fs/promises'
import { store } from "@/state/store";
import { setEmbeddings } from "@/state/Slice/EmbeddingSlice";
import { Helper } from "@/lib/helper_data";
import { extractComments } from "./redditService";
import natural from 'natural';
import stopwords from 'stopwords-iso';

class EmbeddingGenerator {
  private voyageEmbeddings: VoyageEmbeddings;
  private cachePath:string; 

  constructor() {
    this.voyageEmbeddings = new VoyageEmbeddings({
      apiKey: process.env.VOYAGE_API_KEY,
    });
    this.cachePath = path.join(process.cwd(), '.cache', 'category-embeddings.json');
  }

  async initializeEmbeddings(categories: Record<string, string>): Promise<Record<string, number[]>> {
    try{
      // check for cached embeddings 
      const cachedEmbeddings = await this.getCachedCategoryEmbeddings();
      
      // if cache found then use it from centralised zustand store
      if(cachedEmbeddings && Object.keys(cachedEmbeddings).length === Object.keys(categories).length) {
        console.log(`Using cached embeddings for ${Object.keys(cachedEmbeddings).length} categories`);
        store.dispatch(setEmbeddings(cachedEmbeddings))
        return cachedEmbeddings;
      } else{
        // or else generate the embeddings and then store it in the cache
        console.log(`Generating new embeddings for ${Object.keys(categories).length} categories`);
        const embeddings = await this.generateCategoryEmbeddings()
        store.dispatch(setEmbeddings(embeddings))
        await this.cacheEmbeddings(embeddings)
        console.log(`Initialized Embeddings successfully!`);
        return embeddings;
      }
    } catch(error){
        console.error("Error initializing embeddings:", error);
        throw error;
    }
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

  async extractAndPreprocessData(mediaData: Media, platformData: any):Promise<string> {
    let textSources = [];

    if (mediaData?.title) {
      textSources.push(mediaData.title);
    }

    if (platformData?.description) {
      textSources.push(platformData.description);
    }

    if (platformData?.englishCaptions) {
      const extractedCaptions = extractCaptions(platformData.englishCaptions);
      textSources.push(extractedCaptions);
    }

    if(platformData?.comments) {
      const extractedComments:string = extractComments(platformData.comments);
      textSources.push(extractedComments)
    }

    let unifiedText:string = textSources.join(' ');
    unifiedText = this.cleanText(unifiedText);
    unifiedText = unifiedText.slice(0, 1000);
    return unifiedText;
  }

private cleanText(text: string): string {
  let cleaned = text.toLowerCase().replace(/https?:\/\/\S+/g, '');
  
  // Tokenize
  const tokenizer = new natural.WordTokenizer();
  const tokens = tokenizer.tokenize(cleaned);
  
  // Removing stopwords, emoji, and special characters
  const combinedStopwords = [...stopwords.en, ...stopwords.hi];
  const filteredTokens = tokens.filter(token => 
    !combinedStopwords.includes(token) && 
    token.length > 1 && 
    !/[^\x00-\x7F]+/.test(token) &&
    !/^\d+$/.test(token)
  );
  
  return filteredTokens.join(' ');
}

  // private cleanText(text:string):string {
  //   let cleaned = text.replace(/[-_=]{2,}/g, '');
  //   cleaned = cleaned.replace(/https?:\/\/\S+/g, '');
  //   cleaned = cleaned.replace(/\d+:\d+/g, '');
  //   cleaned = cleaned.replace(/[^\w\s'-]/g, ' ');
  //   cleaned = cleaned.replace(/\b(Subscribe|Follow|Learn more|LinkedIn|Twitter|Facebook|Instagram|visit|YouTube|contact|gmail)\b/gi, '');
  //   cleaned = cleaned.toLowerCase();
  //   cleaned = cleaned.replace(/\n+/g, ' ');
  //   cleaned = cleaned.replace(/\s+/g, ' ');

  //   const words = cleaned.split(/\s+/);
  //   const uniqueWords: string[] = [];
  //   const seenWords = new Set();

  //   words.forEach(word => {
  //     if(!seenWords.has(word) && word.trim() !== ''){
  //       uniqueWords.push(word);
  //       seenWords.add(word);
  //     }
  //   });

  //   return uniqueWords.join(' ').trim();
  // }

  async generateCategoryEmbeddings(): Promise<Record<string, number[]>> {
    const categories:Record<string, string> = Helper.categoryDefinitions;
    
    if(!categories || Object.keys(categories).length === 0){
      console.warn("No categories provided to generate embeddings for");
      return {};
    }

    // const cacheExists:boolean = await this.checkCacheExists();

    // // check if the cache is valid if not then change it to the the below implementation 
    // if(cacheExists){
    // const cachedEmbeddings:Record<string,number[]> = await this.getCachedCategoryEmbeddings();
    // console.info(`Fetched categories embeddings from the cache`)

    // const allCategoriesPresent = Object.keys(categories).every(cat => 
    //   cachedEmbeddings.hasOwnProperty(cat) && 
    //   Array.isArray(cachedEmbeddings[cat]) && 
    //   cachedEmbeddings[cat].length > 0
    // );

    // if (allCategoriesPresent) {
    //   console.log(`All ${Object.keys(cachedEmbeddings).length} categories found in cache`);
    //   return cachedEmbeddings;
    // }
    // console.info("Cache missing some categories, generating new embeddings");
    // }

    // Fetching keys and values from the categories object
    const categoryEmbeddings:Record<string,number[]> = {};    
    const categoryEntries = Object.entries(categories);

    // Generating the category embeddings 
    try {
      console.info(`Generating batch embeddings for ${categoryEntries.length} categories`);
      
      // Prepare descriptions for batch embedding
      const descriptions = categoryEntries.map(([_, desc]) => desc);
      const categoryNames = categoryEntries.map(([name, _]) => name);
      
      const embeddings: number[][] = await this.generateBatchEmbeddings(descriptions);
      
      categoryNames.forEach((name, i) => {
        categoryEmbeddings[name] = embeddings[i];
        console.log(`Generated embedding for category: ${name}`);
      });
      
      console.log(`Successfully generated embeddings for all ${categoryNames.length} categories`);
    } catch (error) {
      console.error("Failed to generate batch embeddings:", error);
      throw error;
    }
  
    // caching the newly generated embeddings 
    if (Object.keys(categoryEmbeddings).length > 0) {
      await this.cacheEmbeddings(categoryEmbeddings);
    }
    
    return categoryEmbeddings;
  }

  private async cacheEmbeddings(embeddings: Record<string, number[]>): Promise<void> {
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

  private async getCachedCategoryEmbeddings(): Promise<Record<string, number[]>> {
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

  // For future use if implementation changes
  private async checkCacheExists(): Promise<boolean> {
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

export default EmbeddingGenerator;