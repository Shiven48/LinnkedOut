import { VoyageEmbeddings } from "@langchain/community/embeddings/voyage";
import { store } from "@/state/store";
import { setEmbeddings } from "@/state/Slice/EmbeddingSlice";
import { categoryDefinitions } from "@/services/common/constants";
import { CacheService } from "./CacheService";

export class EmbeddingService {
  private voyageEmbeddings: VoyageEmbeddings;
  private cacheService: CacheService;

  constructor() {
    this.voyageEmbeddings = new VoyageEmbeddings({
      apiKey: process.env.VOYAGE_API_KEY,
      batchSize: 20,
      maxRetries: 3,
      modelName: 'voyage-3.5-lite',
    });
    this.cacheService = new CacheService();
  }

  async initializeEmbeddings(categories: Record<string, string>): Promise<Record<string, number[]>> {
    try {
      // check for cached embeddings 
      const cachedEmbeddings = await this.cacheService.getCachedCategoryEmbeddings();

      // if cache found then use it from centralised zustand store
      if (cachedEmbeddings && Object.keys(cachedEmbeddings).length === Object.keys(categories).length) {
        console.log(`Using cached embeddings for ${Object.keys(cachedEmbeddings).length} categories`);
        store.dispatch(setEmbeddings(cachedEmbeddings))
        return cachedEmbeddings;
      } else {
        // or else generate the embeddings and then store it in the cache
        console.log(`Generating new embeddings for ${Object.keys(categories).length} categories`);
        const embeddings = await this.generateCategoryEmbeddings()
        store.dispatch(setEmbeddings(embeddings))
        await this.cacheService.cacheEmbeddings(embeddings)
        console.log(`Initialized Embeddings successfully!`);
        return embeddings;
      }
    } catch (error) {
      console.error("Error initializing embeddings:", error);
      throw error;
    }
  }

  async generateEmbeddings(content: string): Promise<number[]> {
    try {
      if (!this.voyageEmbeddings) throw new Error("voyageEmbeddings is not initialized");
      if (!content || typeof content !== "string" || content.trim() === "") throw new Error("Content is invalid or empty");

      const embedding = await this.voyageEmbeddings.embedQuery(content);
      if (!embedding || !Array.isArray(embedding) || embedding.length === 0) throw new Error("Generated embedding is invalid");

      return embedding;
    } catch (error) {
      if (error instanceof Error) {
        console.error(`Error in generateEmbeddings: ${error.message}`);
        throw error;
      }
      throw error;
    }
  }

  async generateBatchEmbeddings(contents: string[]): Promise<number[][]> {
    try {
      if (!contents || contents.length === 0) throw new Error(`The content is not valid`);
      
      if (!this.voyageEmbeddings) {
        throw new Error("voyageEmbeddings is not initialized");
      }
      
      const validContents = contents.filter(content => 
        content && typeof content === 'string' && content.trim().length > 0
      );
      
      if (validContents.length === 0) {
        throw new Error("No valid content to embed");
      }
      
      console.log(`Embedding ${validContents.length} valid documents out of ${contents.length} total`);
      console.log("First content sample:", validContents[0]?.substring(0, 100) + "...");
      
      const result = await this.voyageEmbeddings.embedDocuments(validContents);
      
      console.log("Raw result type:", typeof result);
      console.log("Raw result is array:", Array.isArray(result));
      console.log("Result length:", result?.length);
      if (result && Array.isArray(result) && result.length > 0) {
        console.log("First embedding type:", typeof result[0]);
        console.log("First embedding is array:", Array.isArray(result[0]));
        console.log("First embedding length:", result[0]?.length);
      }
      
      if (!result) {
        throw new Error("Voyage embedding API returned null/undefined result");
      }
      
      if (!Array.isArray(result)) {
        throw new Error(`Expected array result, got ${typeof result}: ${JSON.stringify(result)}`);
      }
      
      if (result.length === 0) {
        throw new Error("Voyage embedding API returned empty array");
      }
      
      for (let i = 0; i < result.length; i++) {
        if (!Array.isArray(result[i])) {
          throw new Error(`Embedding at index ${i} is not an array: ${typeof result[i]}`);
        }
        if (result[i].length === 0) {
          throw new Error(`Embedding at index ${i} is empty array`);
        }
      }

      console.log(`Successfully generated ${result.length} embeddings`);
      return result;
      
    } catch (error: any) {
      // Enhanced error handling
      console.error("Batch Embedding Generation Error Details:");
      console.error("Error type:", typeof error);
      console.error("Error message:", error?.message);
      console.error("Error stack:", error?.stack);
      
      if (error.response?.status === 429) {
        console.warn("Rate limit hit. Implementing retry logic...");
        throw new Error("Rate limit exceeded. Please try again later.");
      }
      
      if (error.message?.includes('API key')) {
        throw new Error("Invalid or missing Voyage API key");
      }
      
      throw error;
    }
  }


  async generateCategoryEmbeddings(): Promise<Record<string, number[]>> {
    const categories: Record<string, string> = categoryDefinitions;

    if (!categories || Object.keys(categories).length === 0) {
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
    const categoryEmbeddings: Record<string, number[]> = {};
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
      await this.cacheService.cacheEmbeddings(categoryEmbeddings);
    }

    return categoryEmbeddings;
  }

}