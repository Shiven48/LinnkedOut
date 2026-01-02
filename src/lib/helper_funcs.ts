import { FormDataType } from "@/app/_components/shared/PostInputForm";
import {
  GlobalMetadata,
  Media,
  PlatformInfo,
  ScoreExtractionResult,
  SimilarYT,
  YoutubeMedia,
  YoutubeMetadata,
} from "@/services/common/types";
import { SummaryService } from "@/services/content/summaryService";
import { YoutubeAPIService } from "@/services/platform/youtube/YoutubeAPIService";
import { YoutubeMetadataSevice } from "@/services/platform/youtube/YoutubeMetadataService";
import { RootOrchestrator } from "@/services/orchestrators/RootOrchestrator";
import { YoutubeFilterService } from "@/services/platform/youtube/YoutubeFilterService";
import { EmbeddingRepository } from "@/services/database/EmbeddingRepository";
import { YoutubeMediaRepository } from "@/services/database/YoutubeMediaRepository";
import { YoutubeTranscriptService } from "@/services/platform/youtube/YoutubeTranscriptionService";

export class HelperFunctions {
  static async testFlow(data: FormDataType, userId: string) {
    const summaryService = new SummaryService();
    const youtubeAPIService = new YoutubeAPIService();
    const filterService = new YoutubeFilterService();
    const youtubeMetadataService = new YoutubeMetadataSevice();
    const transcriptService = new YoutubeTranscriptService();
    
    // Destructuring the form data;
    const {
      url: links,
      category,
      customTags,
      fetchSimilar,
      similarityLevel,
    } = data;

    // saved the link data in database using appropriate orchestrator
    const platformInfo: PlatformInfo =
      RootOrchestrator.parseLinksForPlatform(links);
    const orchestratorResult = await RootOrchestrator.OrchestratorCaller(
      platformInfo,
      userId
    );
    const userInputProcessingResult: GlobalMetadata[] = Array.isArray(
      orchestratorResult
    )
      ? orchestratorResult
      : [orchestratorResult];

    // If 1 video array then process for 1 else process for N
    // Parallely generate search queries for each video
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

    const video = inputProcessedVideos[0];
    const categoryId: string = video.searchQueryResult.categoryId;
    const topicId: string = video.searchQueryResult.topicId;
    const primaryQuery: string = video.searchQueryResult.searchQuery;
    const alternativeQueries: string[] = video.alternatives;

    console.log(`QueryProcessorResult: ${JSON.stringify(video, null, 2)}`);
    const allQueries = [primaryQuery, ...alternativeQueries].slice(0, 3);

    // Three queries each will return YoutubeMetadata[]
    const fetchPromises:Promise<YoutubeMetadata[]>[] = allQueries.map(async (query, index) => {
      console.log(
        `Fetching videos for query ${
          index + 1
        }: "${query}": ${categoryId} : ${topicId}`
      );
      return await youtubeAPIService.searchVideos(query, categoryId, topicId);
    });

    const videoResults: YoutubeMetadata[][] = (
      await Promise.all(fetchPromises)
    )

    const videoResultsFlattened: YoutubeMetadata[] = videoResults.flat();
    console.log(`Fetched ${videoResultsFlattened.length} videos from the youtube search api`);

    // Filtering
    const filteredVideos: ScoreExtractionResult[] =
      filterService.processVideos(videoResultsFlattened);

    // Option 2: Process all at once (more efficient)
    const extractedYTVideoData: {
      mediaData: Media;
      youtubeData: YoutubeMedia;
    }[] = await Promise.all(
      filteredVideos.map(async (scoreResult: ScoreExtractionResult) => {
        const { video } = scoreResult;
        const result = (
          await youtubeMetadataService.parallelExtractYoutubeMedia([video])
        ).shift()!;
        
        console.log(`[testFlow] Fetching transcripts for: ${result.mediaData.title}`);
        result.youtubeData.englishCaptions = await transcriptService.fetchTranscript(
          video.id, 
          result.mediaData.title
        );
        
        return result;
      })
    );

    // Semantic matching
    let ytVideos: SimilarYT[] = [];
    let fetchedYTVideosEmbeddings: {
      preprocessedContents: string[];
      contentEmbeddings: number[][];
    } | null = null;
    if (fetchSimilar) {
      const allInputEmbeddings: number[][] = [video.embeddings];
      // batch embedding fetched videos (N because we fetched N links from api)
      fetchedYTVideosEmbeddings =
        await youtubeMetadataService.batchEmbedYTVideos(extractedYTVideoData);

      console.log("Batch Embedding Successful");

      // Here i have return 20 videos with their extracted data as well as embedding and similarity score with input media
      const contentEmbedding = fetchedYTVideosEmbeddings.contentEmbeddings;
      ytVideos = youtubeMetadataService.extractTopYoutubeVideos(
        allInputEmbeddings,
        contentEmbedding,
        extractedYTVideoData
      );
      console.log(`Must be 12: ${ytVideos.length}`);
    }

    // This batch is for saving all the data
    if (fetchedYTVideosEmbeddings) {
      const batchResults: SimilarYT[] = await this.processBatch(
        ytVideos,
        fetchedYTVideosEmbeddings,
        userId
      );

      return batchResults;
    } else {
      console.error("fetched yt videos embeddings are null");
      throw new Error(
        `property 'fetchedYTVideosEmbeddings' is : ${fetchedYTVideosEmbeddings}`
      );
    }
  }

  static async processBatch(
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
