import { YoutubeAPIService } from "../platform/youtube/YoutubeAPIService";
import { YoutubeMetadataSevice } from "../platform/youtube/YoutubeMetadataService";
import { EmbeddingRepository } from "../database/EmbeddingRepository";
import {
  EmbeddingOrchestratorInputType,
  EmbeddingOrchestratorReturntype,
  GlobalMetadata,
  YoutubeMetadata,
} from "../common/types";
import { EmbeddingService } from "../vector/EmbeddingService";
import { categoryDefinitions } from "@/services/common/constants";
import { ProcessingService } from "../vector/PreprocessingService";
import { VectorStore } from "../content/VectorStoreService";
import { YoutubeMediaRepository } from "../database/YoutubeMediaRepository";
import { eventBus } from "../common/eventBus";

export default class YoutubeOrchestrator {
  private youtubeAPIService: YoutubeAPIService;
  private youtubeMetadataService: YoutubeMetadataSevice;
  private embeddingService: EmbeddingService;
  private preprocessingService: ProcessingService;
  private vectorStore: VectorStore;
  private embeddingRepository: EmbeddingRepository;
  private youtubeRepository: YoutubeMediaRepository;

  constructor() {
    this.youtubeAPIService = new YoutubeAPIService();
    this.youtubeMetadataService = new YoutubeMetadataSevice();
    this.embeddingService = new EmbeddingService();
    this.preprocessingService = new ProcessingService();
    this.vectorStore = new VectorStore();
    this.embeddingRepository = new EmbeddingRepository();
    this.youtubeRepository = new YoutubeMediaRepository();
  }

  async processLink(
    link: string,
    userId: string
  ): Promise<GlobalMetadata> {
    const emitLog = (msg: string) => {
      console.log(msg);
      eventBus.emit(`log-${userId}`, msg);
    };

    try {
      // ========== Step 2.1: Parse the link to get the video id ==========
      const videoId = this.youtubeAPIService.parseVideoId(link);
      emitLog("Parsed the video id");

      // ========== Step 2.2: Get the actual video from YT servers ==========
      const fetchedYoutubeMetadata: YoutubeMetadata =
        await this.youtubeAPIService.fetchVideoMetadata(videoId);

      emitLog("Fetching the best available metadata from the video...");

      // ========== Step 2.3: Extract the required fields from the fetched video ==========
      const { mediaData, youtubeData } = (
        await this.youtubeMetadataService.parallelExtractYoutubeMedia([
          fetchedYoutubeMetadata,
        ])
      ).shift()!;

      // ========== Step 2.4: Generate embeddings for the preprocessed content ==========
      const embeddingOrchestratorInput: EmbeddingOrchestratorInputType = {
        youtubeMetadata: fetchedYoutubeMetadata,
        mediaData,
        youtubeData
      }
      const { cleanedAndProcessedContent, contentEmbeddings } =
        await this.embeddingOrchestrator(embeddingOrchestratorInput);

      // ========== Step 2.5: Store the embeddings in the database ==========
      mediaData.embeddingId = await this.embeddingRepository.storeContent(
        cleanedAndProcessedContent,
        contentEmbeddings
      );
      
      // ========== Step 2.6: Store the media data and youtube data in the database ==========
      await this.youtubeRepository.saveYoutubeMediaData(
          mediaData,
          youtubeData,
          userId
        );
        
      console.log("Final Orchestrator Output", {
        mediaData: mediaData.id,
        embeddingId: mediaData.embeddingId,
        category: mediaData.category,
        userId
      });
      
      return { 
        media: mediaData,
        embeddingsType: {
          embeddingId: mediaData.embeddingId,
          embeddings: contentEmbeddings,
        } 
      };
    } catch (error) {
      console.error(`Error Orchestrating youtube video`, error);
      throw error;
    }
  }

  async embeddingOrchestrator(
    EmbeddingOrchestratorInputType: EmbeddingOrchestratorInputType
  ): Promise<EmbeddingOrchestratorReturntype> {
     const { youtubeMetadata, mediaData, youtubeData } = EmbeddingOrchestratorInputType;
    try {
      // Initialize the embeddings for the categories
      const categoryEmbeddings: Record<string, number[]> =
        await this.embeddingService.initializeEmbeddings(categoryDefinitions);
      console.log(
        "Categories available for classification:",
        Object.keys(categoryEmbeddings)
      );

      // Preprocess the content/clean the fetched data
      const cleanedAndProcessedContent: string =
        this.preprocessingService.extractAndPreprocessData(
          mediaData,
          youtubeData,
          youtubeMetadata
        );

      // Generate embeddings for the preprocessed content
      const contentEmbeddings: number[] =
        await this.embeddingService.generateEmbeddings(cleanedAndProcessedContent);
      if (!categoryDefinitions || Object.keys(categoryDefinitions).length === 0)
        throw new Error("Category definitions are empty");
      console.log(
        `Found ${Object.keys(categoryDefinitions).length} category definitions`
      );

      // Classify the video in which category belongs to based on the embeddings 
      mediaData.category = this.vectorStore.classifyEmbedding(contentEmbeddings, categoryEmbeddings);
      console.log("Assigned Category: ", mediaData.category);
      return { cleanedAndProcessedContent, contentEmbeddings, assignedCategory: mediaData.category };
    } catch (error) {
      console.error("YoutubeOrchestrator: Error in storig embeddings:", error);
      throw error;
    }
  }
}
