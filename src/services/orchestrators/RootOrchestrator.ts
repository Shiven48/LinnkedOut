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

  static async SingleLinkOrchestratorCaller(
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
      return await this.processSingleLink(key, platform, userId);
    }

    // handling multiple links
    const orchestratorPromises = entries.map(([key, platform]) =>
      this.processSingleLink(key, platform, userId)
    );

    try {
      const results = await Promise.all(orchestratorPromises);
      return results;
    } catch (error) {
      throw new Error(`Failed to process orchestrators: ${error}`);
    }
  }

  static async processSingleLink(
    key: string,
    platform: string,
    userId: string
  ): Promise<GlobalMetadata> {
    const normalizedPlatform = platform.toLowerCase();

    console.log(`Processing key: ${key}, platform: ${normalizedPlatform}`);

    switch (normalizedPlatform) {
      case "youtube":
        const youtubeOrchestrator = new YoutubeOrchestrator();
        return await youtubeOrchestrator.processLink(key, userId);

      // case 'reddit':
      //     const redditOrchestrator = new RedditOrchestrator();
      //     return await redditOrchestrator.processLink(key);

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
