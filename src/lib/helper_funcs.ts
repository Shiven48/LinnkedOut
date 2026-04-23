import { FormDataType } from "@/app/_components/shared/PostInputForm";
import {
  GlobalMetadata,
  Media,
  PlatformInfo,
  ScoreExtractionResult,
  SimilarYT,
  YoutubeMedia,
  YoutubeMetadata,
  CaptionItem,
} from "@/services/common/types";
import { SummaryService } from "@/services/content/summaryService";
import { YoutubeAPIService } from "@/services/platform/youtube/YoutubeAPIService";
import { YoutubeMetadataSevice } from "@/services/platform/youtube/YoutubeMetadataService";
import { RootOrchestrator } from "@/services/orchestrators/RootOrchestrator";
import { YoutubeFilterService } from "@/services/platform/youtube/YoutubeFilterService";
import { EmbeddingRepository } from "@/services/database/EmbeddingRepository";
import { YoutubeMediaRepository } from "@/services/database/YoutubeMediaRepository";
import { YoutubeTranscriptService } from "@/services/platform/youtube/YoutubeTranscriptionService";
import { eventBus } from "@/services/common/eventBus";

export class HelperFunctions {
  private static async fetchTranscripts(
    videoId: string,
    _title?: string
  ): Promise<CaptionItem[]> {
    try {
      const transcriptService = new YoutubeTranscriptService();
      const captions = await transcriptService.fetchTranscript(videoId, _title);
      
      console.log(`[fetchTranscripts] Successfully fetched ${captions.length} captions`);
      return captions;
    } catch (error) {
      console.error(`[fetchTranscripts] Error fetching transcripts:`, error);
      return [];
    }
  }

  static async OrchestrateIngestionPipeline(
    data: FormDataType, 
    userId: string,
    onLog?: (msg: string) => void
  ) {
    try {
      const summaryService = new SummaryService();
      const youtubeAPIService = new YoutubeAPIService();
      const filterService = new YoutubeFilterService();
      const youtubeMetadataService = new YoutubeMetadataSevice();
      
      const emitLog = (msg: string) => {
        console.log(msg);
        if (onLog) onLog(msg);
        eventBus.emit(`log-${userId}`, msg);
      };
      
      // ========== Step 1: Destructuring the form data ========== 
      const {
        url: links,
        category,
        customTags,
        fetchSimilar,
        similarityLevel,
      } = data;
      emitLog("Destructuring the form data");

      // ========== Step 2: Saving the link data in database using appropriate orchestrator ==========
      const platformInfo: PlatformInfo =
        RootOrchestrator.parseLinksForPlatform(links);
      emitLog("Parsing the link data for platform");
      
      const orchestratorResult:GlobalMetadata | GlobalMetadata[] = await RootOrchestrator.SingleLinkOrchestratorCaller(
        platformInfo,
        userId
      );
      
      const userInputProcessingResult: GlobalMetadata[] = Array.isArray(
        orchestratorResult
      )
        ? orchestratorResult
        : [orchestratorResult];
      emitLog("Saving the link data in database using appropriate orchestrator");

      // ========== Step 3: Parallely generate search queries ========== 
      const inputVideoProcessingPromises = userInputProcessingResult.map(
        async (processedVideo: GlobalMetadata) => {
          const embeddings: number[] = processedVideo.embeddingsType.embeddings;

          const queryAnalysis = await summaryService.generateSearchQuery(
            category,
            customTags,
            similarityLevel,
            { includeAlternatives: true, maxAlternatives: 3 }
          );

          processedVideo.media.category = queryAnalysis.categoryName;
          return {
            processedVideo,
            embeddings,
            searchQueryResult: queryAnalysis.primary,
            alternatives: queryAnalysis.alternatives,
            qualityMetrics: queryAnalysis.qualityMetrics,
          };
        }
      );
      const inputProcessedVideos = await Promise.all(
        inputVideoProcessingPromises
      );
      emitLog("Generating search queries for content discovery");

      const video = inputProcessedVideos[0];
      const categoryId: string = video.searchQueryResult.categoryId;
      const topicId: string = video.searchQueryResult.topicId;
      const primaryQuery: string = video.searchQueryResult.searchQuery;
      const alternativeQueries: string[] = video.alternatives;
      const allQueries = [primaryQuery, ...alternativeQueries].slice(0, 3);
      emitLog(`Searching for similar content across ${allQueries.length} queries`); 
      
      // ========== Step 4: fetching top similar videos from Youtube API ========== 
      const videoResults: YoutubeMetadata[][] = await Promise.all(allQueries.map(async (query) => {
        return await youtubeAPIService.searchVideos(query, categoryId, topicId);
      }));
      const videoResultsFlattened: YoutubeMetadata[] = videoResults.flat();
      emitLog(`Found ${videoResultsFlattened.length} potential matches. Filtering for quality...`);

      // ========== Step 5: Filtering and removing duplicates or unwanted videos ==========
      const filteredVideos: ScoreExtractionResult[] =
        filterService.filterYoutubeVideos(videoResultsFlattened);
      emitLog(`Filtering successful`);

      // ========== Step 6: Extracting metadata and transcripts ==========
      const extractedYTVideoData: {
        mediaData: Media;
        youtubeData: YoutubeMedia;
      }[] = await Promise.all(
        filteredVideos.map(async (scoreResult: ScoreExtractionResult) => {
          const { video } = scoreResult;
          const result = (
            await youtubeMetadataService.parallelExtractYoutubeMedia([video])
          ).shift()!;
          
          result.youtubeData.englishCaptions = await this.fetchTranscripts(
            video.id, 
            result.mediaData.title
          );
          return result;
        })
      );
      emitLog(`Extracting metadata and transcripts successful`);

      let ytVideos: SimilarYT[] = [];
      let fetchedYTVideosEmbeddings: { preprocessedContents: string[], contentEmbeddings: number[][]} | null = null;
      
      if (fetchSimilar) {
        // ========== Step 7: Batch Embedding the fetched yt videos ==========  
        const allInputEmbeddings: number[][] = [video.embeddings];
        fetchedYTVideosEmbeddings = await youtubeMetadataService.batchEmbedYTVideos(extractedYTVideoData);
        emitLog(`Successfully embedded ${extractedYTVideoData.length} videos for similarity comparison`);

        // ========== Step 8: Extracting top videos based on Semantic Similarity Score ==========
        const contentEmbedding = fetchedYTVideosEmbeddings.contentEmbeddings;
        ytVideos = youtubeMetadataService.extractTopYoutubeVideos(
          allInputEmbeddings,
          contentEmbedding,
          extractedYTVideoData
        );
        emitLog(`Successfully identified ${ytVideos.length} highly relevant similar videos.`);
      }

      // ========== Step 9: Saving all the data in batches ==========
      if (fetchedYTVideosEmbeddings) {
        emitLog(`Storing all data in batches...`);
        const batchResults: SimilarYT[] = await this.storeDataInBatches(
          ytVideos,
          fetchedYTVideosEmbeddings,
          userId
        );
        emitLog("Orchestration complete! Redirecting to feed...");
        eventBus.emit(`complete-${userId}`);
        return batchResults;
      } else {
        throw new Error("fetched yt videos embeddings are null");
      }
    } catch (error) {
      console.error("orchestrateFlow error:", error);
      eventBus.emit(`complete-${userId}`);
      throw error;
    }
  }

  static async storeDataInBatches(
    batch: SimilarYT[],
    fetchedYTVideosEmbeddings: {
      preprocessedContents: string[];
      contentEmbeddings: number[][];
    },
    userId: string
  ): Promise<SimilarYT[]> {
    const embeddingRepository = new EmbeddingRepository();
    const youtubeRepository = new YoutubeMediaRepository();

    const { contentEmbeddings, preprocessedContents } =
      fetchedYTVideosEmbeddings;

    return Promise.all(
      batch.map(async (data, index) => {
        const { mediaData, youtubeData } = data;
        const preprocessedContent = preprocessedContents[index];
        const contentEmbedding = contentEmbeddings[index];

        // Store embeddings
        mediaData.embeddingId = await embeddingRepository.storeContent(
          preprocessedContent,
          contentEmbedding
        );        
        console.log(`Stored embeddingId: ${mediaData.embeddingId}`);

        // Store media and YT data
        await youtubeRepository.saveYoutubeMediaData(
          mediaData,
          youtubeData,
          userId
        );
        
        return data;
      })
    );
  }
}
