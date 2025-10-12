import YoutubeOrchestrator from "@/services/orchestrators/YoutubeOrchestrator";
import { FormDataType } from "@/app/_components/shared/PostInputForm";
import {
  GlobalMetadata,
  Media,
  RedditMedia,
  YoutubeMedia,
} from "@/services/common/types";
import { SummaryService } from "@/services/content/summaryService";
import { YoutubeAPIService } from "@/services/Platform/youtube/YoutubeAPIService";
import { YoutubeMetadataSevice } from "@/services/Platform/youtube/YoutubeMetadataService";
import { EmbeddingService } from "@/services/vector/EmbeddingService";
import { ProcessingService } from "@/services/vector/PreprocessingService";
import { VectorStore } from "@/services/content/VectorStoreService";
import { RedditMetadataSevice } from "@/services/Platform/reddit/RedditMetadataService";
import { EmbeddingRepository } from "@/services/database/EmbeddingRepository";
import { YoutubeMediaRepository } from "@/services/database/YoutubeMediaRepository";
import { categoryDefinitions } from "@/services/common/constants";

interface PlatformInfo {
  platformLinkAndType: Record<string, string>;
  length: number;
}

interface SimilarYT {
  similarityScore: number;
  mediaData: Media;
  youtubeData: YoutubeMedia;
  embeddings: number[];
}

interface SimilarRDT {
  similarityScore: number;
  mediaData: Media;
  redditData: RedditMedia;
}

export class HelperFunctions {
  // Here the bot will give the url
  public static async fetchVideoFromBot() {
    const link: string = "someURL";
    const youtubeOrchestrator = new YoutubeOrchestrator();
    return () => youtubeOrchestrator.mainYoutubeOrchestrator(link, "");
  }

  public static getIdOfplatform = (media: Media): number => {
    if (!media || media === undefined || media === null) {
      throw new Error("Media is empty or not an acceptable value");
    }
    if (media.youtubeId === undefined) {
      throw new Error("YoutubeId is null or not an acceptable value");
    }
    if (media.redditId === undefined) {
      throw new Error("redditId is null or not an acceptable value");
    }
    const platform = media.platform.toLowerCase().trim();
    if (!platform || platform === null) {
      throw new Error("Platform is null or empty");
    }
    let platformId: number = 0;
    if (platform === "youtube" && media.youtubeId) {
      platformId = media.youtubeId;
    } else if (platform === "reddit" && media.redditId) {
      platformId = media.redditId;
    }

    if (platformId === 0) {
      throw Error("Not assigned any id see the issue properly!!");
    }
    return platformId;
  };

  // Finally return Promise<Media[]> this is for reddit and youtube
  // static async RootOrchestrator(data: FormDataType): Promise<any> {
  //     const summaryService = new SummaryService();
  //     const youtubeAPIService = new YoutubeAPIService();
  //     const redditAPIService = new RedditAPIService();

  //     // Destructuring the form data;
  //     const {
  //         url: links,
  //         category,
  //         customTags,
  //         fetchSimilar,
  //         similarityLevel
  //     } = data;

  //     // saved the link data in database using appropriate orchestrator
  //     const platfromInfo:PlatformInfo = this.parseLinksForPlatform(links);
  //     const orchestratorResult = await this.OrchestratorCaller(platfromInfo);

  //     // Convert the fetched data into array, if already an array then just return it
  //     const videos: GlobalMetadata[] = Array.isArray(orchestratorResult)
  //         ? orchestratorResult
  //         : [orchestratorResult];

  //     // Parallelly generate search queries for each video
  //     const videoProcessingPromises = videos.map(async (video:GlobalMetadata) => {
  //     const embeddings:number[] = video.embeddingsType.embeddings;
  //     const searchQuery = await summaryService.generateSearchQuery(
  //             category,
  //             customTags,
  //             similarityLevel
  //         );
  //         return { video, embeddings, searchQuery };
  //     });
  //     const processedVideos = await Promise.all(videoProcessingPromises);

  //     // Combining and Cleaning the generated search queries
  //     const searchQuery:string =  this.combineSearchQueries(
  //         processedVideos.map(pv => pv.searchQuery)
  //     );

  //     // Calling Youtube api for getting 10-20 videos based on search query
  //     const multipleYtVideos: any[] = await youtubeAPIService.fetchMultipleYtVideosFromQuery(searchQuery);

  //     // Calling Reddit api for getting 10-20 videos based on search query
  //     const fullRedditResponse:any[] = await redditAPIService.fetchMultipleRDTVideosFromQuery(searchQuery);
  //     const multipleRedditVideos = fullRedditResponse.map((post: any) =>{
  //         const redditMetadata = post.data.children
  //         return redditMetadata.data
  //     });

  //     // Structuring the fetched videos according to defined types
  //     const extractedYTVideoData : { mediaData: Media, youtubeData: YoutubeMedia }[] = await this.parallelExtractYoutubeMedia(multipleYtVideos);
  //     const extractedRDTVideoData: { mediaData: Media, redditData:  RedditMedia  }[] = await this.parallelExtractRedditMedia(fullRedditResponse, multipleRedditVideos);

  //     // const length = extractedYTVideoData.length + extractedRDTVideoData.length
  //     // return { extractedYTVideoData, extractedRDTVideoData, length }
  //     if (fetchSimilar) {
  //         // generating embeddings of extracted structured videos
  //         const fetchedYTVideosEmbeddings : number[][] = await this.batchEmbedYTVideos(extractedYTVideoData);
  //         const fetchedRDTVideosEmbeddings: number[][] = await this.batchEmbedRDTVideos(extractedRDTVideoData);

  //         // Sorting videos by Similarity with the input link
  //         const allInputEmbeddings:number[][] = processedVideos.map(pv => pv.embeddings);
  //         const ytVideos : SimilarYT[]  = this.extractTopYoutubeVideos(allInputEmbeddings, fetchedYTVideosEmbeddings, extractedYTVideoData);
  //         const rdtVideos: SimilarRDT[] = this.extractTopRedditVideos(allInputEmbeddings, fetchedRDTVideosEmbeddings, extractedRDTVideoData);

  //         // Returning Media
  //         return this.fetchTopTenMedias(ytVideos, rdtVideos);
  //     } else {
  //         const topTenMedias = [];
  //         const mediaPerPlatfrom:number = 20;
  //         const inputMedias = [...extractedYTVideoData, ...extractedRDTVideoData] // 40
  //         const noOfPlatforms = Math.ceil(inputMedias.length / mediaPerPlatfrom); // 2
  //         const allowedMediaPerPlatfrom = Math.ceil(mediaPerPlatfrom / noOfPlatforms); // 10
  //         console.log(noOfPlatforms, mediaPerPlatfrom, allowedMediaPerPlatfrom);

  //         // let platform = 0;
  //         // for(platform; platform < noOfPlatforms; platform++){
  //         //     let initialIndex = platform * mediaPerPlatfrom
  //         //     let finalIndex = (platform * mediaPerPlatfrom) + mediaPerPlatfrom;
  //         //     topTenMedias.push(
  //         //         ...inputMedias
  //         //             .slice(initialIndex, finalIndex)
  //         //             .slice(0,allowedMediaPerPlatfrom)
  //         //             .map(media => media.mediaData)
  //         //     );
  //         // }
  //         // return topTenMedias;
  //     }
  //     return orchestratorResult;
  // }

  // Single video YT platform orchestrator

  static async RootOrchestrator(
    data: FormDataType,
    userId: string
  ): Promise<SimilarYT[]> {
    const summaryService = new SummaryService();
    const youtubeAPIService = new YoutubeAPIService();
    const embeddingService = new EmbeddingService();

    // Destructuring the form data;
    const {
      url: links,
      category,
      customTags,
      fetchSimilar,
      similarityLevel,
    } = data;

    // saved the link data in database using appropriate orchestrator
    const platfromInfo: PlatformInfo = this.parseLinksForPlatform(links);
    const orchestratorResult = await this.OrchestratorCaller(
      platfromInfo,
      userId
    );

    // Convert the fetched data into array, if already an array then just return it
    const inputVideos: GlobalMetadata[] = Array.isArray(orchestratorResult)
      ? orchestratorResult
      : [orchestratorResult];

    // If 1 video array then process for 1 else process for N
    // Parallely generate search queries for each video
    const inputVideoProcessingPromises = inputVideos.map(
      async (video: GlobalMetadata) => {
        const embeddings: number[] = video.embeddingsType.embeddings;
        const searchQuery = await summaryService.generateSearchQuery(
          category,
          customTags,
          similarityLevel
        );
        return { video, embeddings, searchQuery };
      }
    );
    const inputProcessedVideos = await Promise.all(
      inputVideoProcessingPromises
    );

    // Combining and Cleaning the generated search queries
    // Here it can be made using 20 videos or only one but we will get a single string as we are
    // concatinating the strings
    const searchQuery: string = this.combineSearchQueries(
      inputProcessedVideos.map((pv) => pv.searchQuery)
    );

    // Calling Youtube api for getting 10-20 videos based on search query
    const unprocessedFetchedVideos: any[] =
      await youtubeAPIService.fetchMultipleYtVideosFromQuery(searchQuery);

    // Structuring the all 20 fetched videos according to defined types
    const extractedYTVideoData: {
      mediaData: Media;
      youtubeData: YoutubeMedia;
    }[] = await this.parallelExtractYoutubeMedia(
      unprocessedFetchedVideos,
      userId
    );
    let finalizedMedias: SimilarYT[] = [];
    let categoryEmbeddings: Record<string, number[]> = {};

    if (fetchSimilar) {
      // Map all embeddings of input videos into an array (1 because of i passed 1 link)
      const allInputEmbeddings: number[][] = inputProcessedVideos.map(
        (pv) => pv.embeddings
      );

      // Now batch the embedding creation of all the fetched videos (N because i fetched N links from api)
      let fetchedYTVideosEmbeddings: {
        preprocessedContents: string[];
        contentEmbeddings: number[][];
      } = await this.batchEmbedYTVideos(extractedYTVideoData);

      // Here i have return 20 videos with their extracted data as well as embedding and similarity score with input media
      const contentEmbedding = fetchedYTVideosEmbeddings.contentEmbeddings;
      const ytVideos: SimilarYT[] = this.extractTopYoutubeVideos(
        allInputEmbeddings,
        contentEmbedding,
        extractedYTVideoData
      );
      console.log(`Must be 20: ${ytVideos.length}`);

      // return top 10 videos
      finalizedMedias = this.fetchTopTenMedias(ytVideos);
      categoryEmbeddings = await embeddingService.initializeEmbeddings(
        categoryDefinitions
      );

      // This batch is for saving all the data
      const batchResults: SimilarYT[] = await this.processBatch(
        finalizedMedias,
        categoryEmbeddings,
        fetchedYTVideosEmbeddings
      );

      return batchResults;
    } else {
      throw Error(`Fetch similar is not True: ${fetchSimilar}`);
    }
  }

  static async processBatch(
    batch: SimilarYT[],
    categoryEmbeddings: Record<string, number[]>,
    fetchedYTVideosEmbeddings: {
      preprocessedContents: string[];
      contentEmbeddings: number[][];
    }
  ): Promise<SimilarYT[]> {
    const embeddingRepository = new EmbeddingRepository();
    const youtubeRepository = new YoutubeMediaRepository();
    const vectorStore = new VectorStore();

    const { contentEmbeddings, preprocessedContents } =
      fetchedYTVideosEmbeddings;

    return Promise.all(
      batch.map(async (data, index) => {
        const { mediaData, youtubeData } = data;
        const assignedCategory = vectorStore.classifyEmbedding(
          data.embeddings,
          categoryEmbeddings
        );
        mediaData.category = assignedCategory;

        const preprocessedContent = preprocessedContents[index];
        const contentEmbedding = contentEmbeddings[index];

        // Store embeddings
        mediaData.embeddingId = await embeddingRepository.storeContent(
          preprocessedContent,
          contentEmbedding,
          assignedCategory
        );

        console.log(`Stored embeddingId: ${mediaData.embeddingId}`);

        // Store media and YT data
        await youtubeRepository.saveYoutubeMediaData(mediaData, youtubeData);

        return data;
      })
    );
  }

  public static parseLinksForPlatform(links: string[]): PlatformInfo {
    try {
      if (links && links.length >= 1) {
        const linkMapper: Record<string, string> = {};
        // For a single link
        if (links.length === 1) {
          if (links[0].includes(`youtube`) || links[0].includes(`youtu.be`)) {
            linkMapper[links[0]] = "youtube".toLowerCase().trim();
          }
          // else if (links[0].includes('www.reddit.com/r') || links[0].includes(`reddit`)) {
          //     linkMapper[links[0]] = 'reddit'.toLowerCase().trim();
          // }
          return { platformLinkAndType: linkMapper, length: 1 };
        }
        // For Multiple link
        else if (links.length > 1) {
          links.forEach((link: string) => {
            if (link.includes(`youtube`) || link.includes(`youtu.be`)) {
              linkMapper[link] = "youtube".toLowerCase().trim();
            }
            // else if (link.includes('www.reddit.com/r') || link.includes(`reddit`)) {
            //     linkMapper[link] = 'reddit'.toLowerCase().trim();
            // }
          });
          return { platformLinkAndType: linkMapper, length: links.length };
        }
      }
      throw new Error(`Invalid link format the links are empty`);
    } catch (error) {
      console.error(`Unable to fetch platfrom type from link`, error);
      throw error;
    }
  }

  private static async OrchestratorCaller(
    platfromInfo: PlatformInfo,
    userId: string
  ): Promise<GlobalMetadata | GlobalMetadata[]> {
    const { platformLinkAndType, length } = platfromInfo;
    const entries = Object.entries(platformLinkAndType);

    if (entries.length !== length) {
      throw new Error(
        `Length mismatch: expected ${length}, got ${entries.length}`
      );
    }

    if (entries.length === 0) {
      throw new Error("No platforms provided");
    }

    // handling single link
    if (length === 1) {
      const [key, platform] = entries[0];
      return await this.processOrchestrator(key, platform, userId);
    }

    // handling multiple links
    const orchestratorPromises = entries.map(([key, platform]) =>
      this.processOrchestrator(key, platform, userId)
    );

    try {
      const results = await Promise.all(orchestratorPromises);
      return results;
    } catch (error) {
      throw new Error(`Failed to process orchestrators: ${error}`);
    }
  }

  private static async processOrchestrator(
    key: string,
    platform: string,
    userId: string
  ): Promise<GlobalMetadata> {
    const normalizedPlatform = platform.toLowerCase();

    console.log(`Processing key: ${key}, platform: ${normalizedPlatform}`);

    switch (normalizedPlatform) {
      case "youtube":
        const youtubeOrchestrator = new YoutubeOrchestrator();
        return await youtubeOrchestrator.mainYoutubeOrchestrator(key, userId);

      // case 'reddit':
      //     const redditOrchestrator = new RedditOrchestrator();
      //     return await redditOrchestrator.mainRedditOrchestrator(key);

      default:
        throw new Error(`Unsupported platform type: ${platform}`);
    }
  }

  static combineSearchQueries(queries: string[]): string {
    const processingService = new ProcessingService();
    if (queries.length === 1) return queries[0];

    return processingService.cleanText(queries.join(" "));
  }

  static async parallelExtractYoutubeMedia(
    multipleYtVideos: any[],
    userId: string
  ): Promise<{ mediaData: Media; youtubeData: YoutubeMedia }[]> {
    const youtubeMetadataService = new YoutubeMetadataSevice();
    const videoPromises = multipleYtVideos.map(async (video: any) => {
      try {
        const mediaData = youtubeMetadataService.extractMediaData(
          video,
          userId
        );
        const youtubeData = await youtubeMetadataService.extractYoutubeData(
          video
        );
        const tags = await youtubeMetadataService.extractTags(
          video,
          mediaData,
          youtubeData
        );
        mediaData.tags = tags;
        return { mediaData, youtubeData };
      } catch (error) {
        console.error("Error processing video:", video, error);
        throw error;
      }
    });
    return await Promise.all(videoPromises);
  }

  static async parallelExtractRedditMedia(
    fullRedditResponse: any[],
    multipleRedditVideos: any[]
  ): Promise<{ mediaData: Media; redditData: RedditMedia }[]> {
    const redditMetadataService = new RedditMetadataSevice();

    const videoPromises: Promise<{
      mediaData: Media;
      redditData: RedditMedia;
    }>[] = multipleRedditVideos.map(async (video: any) => {
      const mediaData: Media = redditMetadataService.extractMediaData(video);
      const redditData: RedditMedia =
        redditMetadataService.extractRedditData(video);
      redditData.comments =
        redditMetadataService.extractTopComments(fullRedditResponse);

      const [tags] = await Promise.all([
        await redditMetadataService.extractTags(video, mediaData, redditData),
      ]);

      mediaData.tags = tags;
      return { mediaData, redditData };
    });

    return await Promise.all(videoPromises);
  }

  static async batchEmbedYTVideos(
    extractedVideos: { mediaData: Media; youtubeData: YoutubeMedia }[]
  ): Promise<{
    preprocessedContents: string[];
    contentEmbeddings: number[][];
  }> {
    const embeddingService = new EmbeddingService();
    const preprocessingService = new ProcessingService();

    const preprocessedContents: string[] = extractedVideos.map((video) => {
      const { mediaData, youtubeData } = video;
      return preprocessingService.extractAndPreprocessData(
        mediaData,
        youtubeData
      );
    });

    const contentEmbeddings: number[][] =
      await embeddingService.generateBatchEmbeddings(preprocessedContents);
    return {
      preprocessedContents: preprocessedContents,
      contentEmbeddings: contentEmbeddings,
    };
  }

  static async batchEmbedRDTVideos(
    extractedVideos: { mediaData: Media; redditData: RedditMedia }[]
  ): Promise<number[][]> {
    const embeddingService = new EmbeddingService();
    const preprocessingService = new ProcessingService();

    const preprocessedContents: string[] = extractedVideos.map((video) => {
      const { mediaData, redditData } = video;
      return preprocessingService.extractAndPreprocessData(
        mediaData,
        redditData
      );
    });

    const contentEmbeddings: number[][] =
      await embeddingService.generateBatchEmbeddings(preprocessedContents);
    return contentEmbeddings;
  }

  static extractTopYoutubeVideos(
    inputEmbeddings: number[][], // 1
    fetchedEmbeddings: number[][], // N
    extractedVideoData: { mediaData: Media; youtubeData: YoutubeMedia }[]
  ): SimilarYT[] {
    const vecStore = new VectorStore();
    // This scoredVideos is giving top videos for a single link so map is giving an array
    const scoredVideos = extractedVideoData.map((videoData, index) => {
      // Video to embedding map
      const fetchedEmbedding = fetchedEmbeddings[index];

      // Each fetched media's embedding similarity is being calculated with the user input media
      // For each pass it will work N times so for N passes it will work N X N times
      const maxSimilarity = Math.max(
        ...inputEmbeddings.map((inputEmbedding) =>
          vecStore.cosineSimilarity(inputEmbedding, fetchedEmbedding)
        )
      );

      return {
        ...videoData,
        similarityScore: maxSimilarity,
        embeddings: fetchedEmbedding,
      };
    });

    return scoredVideos.sort((a, b) => b.similarityScore - a.similarityScore);
    // .slice(0, 10)
  }

  static extractTopRedditVideos(
    inputEmbeddings: number[][],
    fetchedEmbeddings: number[][],
    extractedVideoData: { mediaData: Media; redditData: RedditMedia }[]
  ): SimilarRDT[] {
    const vecStore = new VectorStore();
    const scoredVideos = extractedVideoData.map((videoData, index) => {
      const fetchedEmbedding: number[] = fetchedEmbeddings[index];

      const maxSimilarity = Math.max(
        ...inputEmbeddings.map((inputEmbedding: number[]) =>
          vecStore.cosineSimilarity(inputEmbedding, fetchedEmbedding)
        )
      );

      return {
        ...videoData,
        similarityScore: maxSimilarity,
      };
    });

    return scoredVideos
      .sort((a, b) => b.similarityScore - a.similarityScore)
      .slice(0, 10);
  }

  // For reddit and youtube
  // static fetchTopTenMedias(ytVideos:SimilarYT[], rdtVideos: SimilarRDT[] = []):Media[] {
  //     // Input validation
  //     if (!Array.isArray(ytVideos)) {
  //         throw new Error('ytVideos must be an array');
  //     }

  //     if (!Array.isArray(rdtVideos)) {
  //         throw new Error('rdtVideos must be an array');
  //     }

  //     // Filter out invalid entries
  //     const validYtVideos = ytVideos.filter(video =>
  //         video?.mediaData && typeof video.similarityScore === 'number'
  //     );

  //     const validRdtVideos = rdtVideos.filter(video =>
  //         video?.mediaData && typeof video.similarityScore === 'number'
  //     );
  //     return [
  //         ...validYtVideos,
  //         ...validRdtVideos
  //     ]
  //     .map(media => ({
  //         media: media.mediaData,
  //         maxSimilarity: media.similarityScore || 0
  //     }))
  //     .sort((a, b) => b.maxSimilarity - a.maxSimilarity)
  //     .slice(0, 10)
  //     .map(media => media.media);

  // }

  // Here you will get all the metadata of 20 videos
  static fetchTopTenMedias(ytVideos: SimilarYT[]): SimilarYT[] {
    // Input validation
    if (!Array.isArray(ytVideos)) {
      throw new Error("ytVideos must be an array");
    }

    // Filter out invalid entries
    const validYtVideos: SimilarYT[] = ytVideos.filter(
      (video) => video?.mediaData && typeof video.similarityScore === "number"
    );

    // Return 20 videos based on the max similarity
    return [...validYtVideos]
      .map((media) => ({
        mediaData: media.mediaData,
        similarityScore: media.similarityScore || 0,
        youtubeData: media.youtubeData,
        embeddings: media.embeddings,
      }))
      .sort((a, b) => b.similarityScore - a.similarityScore)
      .slice(0, 10);
  }
}
