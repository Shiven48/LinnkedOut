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
      console.log("Embedding", contents.length, "documents");
      console.log(contents)

      const result = await this.voyageEmbeddings.embedDocuments(contents);
      if (!result || !Array.isArray(result) || !Array.isArray(result[0])) {
        console.error("Invalid result from voyageEmbeddings:", result);
        throw new Error("Voyage embedding API returned an invalid result");
      }

      return result;
    } catch (error:any) {
      if (error.response?.status === 429) {
        console.warn("Rate limit hit. You need to retry after a delay.");
      }
      console.error("Batch Embedding Generation Error:", error);
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