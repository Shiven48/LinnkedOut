import {
  GlobalMetadata,
  Media,
  PlatformInfo,
  SimilarRDT,
  SimilarYT,
} from "../common/types";
import { ProcessingService } from "../vector/PreprocessingService";
import YoutubeOrchestrator from "./YoutubeOrchestrator";

export class RootOrchestrator {
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
  //         return this.extractTopTenMedias(ytVideos, rdtVideos);
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

  static getIdOfplatform = (media: Media): number => {
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

  static parseLinksForPlatform(links: string[]): PlatformInfo {
    try {
      if (links && links.length >= 1) {
        // For a single link
        if (links && links.length === 1) {
          return RootOrchestrator.parseSingleLink(links[0]);
        }
        // For Multiple link
        else if (links.length > 1) {
          return RootOrchestrator.parseMultipleLinks(links);
        }
      }
      throw new Error(`Invalid link format the links are empty`);
    } catch (error) {
      console.error(`Unable to fetch platfrom type from link`, error);
      throw error;
    }
  }

  static parseSingleLink(link: string): PlatformInfo {
    if (!link || link === undefined || link === null) {
      throw new Error(`[URL Parsing Error]Invalid link format, URL: ${link}`);
    }
    try {
      const linkMapper: Record<string, string> = {};

      if (link.includes(`youtube`) || link.includes(`youtu.be`)) {
        linkMapper[link] = "youtube".toLowerCase().trim();
      } else if (link.includes('www.reddit.com/r') || link.includes(`reddit`)) {
        linkMapper[link] = 'reddit'.toLowerCase().trim();
      } 
      return { platformLinkAndType: linkMapper, length: 1 };
    } catch (error) {
      console.error(`Unable to fetch platfrom type from link`, error);
      throw error;
    }
  }

  static parseMultipleLinks(links: string[]): PlatformInfo {
    const linkMapper: Record<string, string> = {};
    const linkParsingError: string[] = [];

    links.forEach((link: string) => {
      if (link.includes(`youtube`) || link.includes(`youtu.be`)) {
        linkMapper[link] = "youtube".toLowerCase().trim();
      } else if (link.includes('www.reddit.com/r') || link.includes(`reddit`)) {
        linkMapper[link] = 'reddit'.toLowerCase().trim();
      } else {
        linkParsingError.push(link);
      }
    })

    if(linkParsingError && linkParsingError.length > 0){
      throw new Error(`
        [URL Parsing Error]Invalid link format for ${linkParsingError.length} urls, 
        ${linkParsingError.join(", ")} are Invalid
      `);
    }

    return { platformLinkAndType: linkMapper, length: links.length };
  }

  static async OrchestratorCaller(
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

  static async processOrchestrator(
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

  static extractTopTenMedias(
    ytVideos: SimilarYT[],
    rdtVideos: SimilarRDT[] = []
  ): Media[] {
    // Input validation
    if (!Array.isArray(ytVideos)) {
      throw new Error("ytVideos must be an array");
    }

    if (!Array.isArray(rdtVideos)) {
      throw new Error("rdtVideos must be an array");
    }

    // Filter out invalid entries
    const validYtVideos = ytVideos.filter(
      (video) => video?.mediaData && typeof video.similarityScore === "number"
    );

    const validRdtVideos = rdtVideos.filter(
      (video) => video?.mediaData && typeof video.similarityScore === "number"
    );
    return [...validYtVideos, ...validRdtVideos]
      .map((media) => ({
        media: media.mediaData,
        maxSimilarity: media.similarityScore || 0,
      }))
      .sort((a, b) => b.maxSimilarity - a.maxSimilarity)
      .slice(0, 10)
      .map((media) => media.media);
  }
}
