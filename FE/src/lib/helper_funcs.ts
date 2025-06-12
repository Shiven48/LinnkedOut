import { FormDataType } from '@/app/_components/shared/PostInputForm';
import { GlobalMetadata, Media, RedditMedia, YoutubeMedia } from '@/services/common/types';
import { SummaryService } from '@/services/content/summaryService';
import { YoutubeAPIService } from '@/services/Platform/youtube/YoutubeAPIService';
import { YoutubeMetadataSevice } from '@/services/Platform/youtube/YoutubeMetadataService';
import { EmbeddingService } from '@/services/vector/EmbeddingService';
import { ProcessingService } from '@/services/vector/PreprocessingService';
import { VectorStore } from '@/services/content/VectorStoreService';
import { RedditAPIService } from '@/services/Platform/reddit/RedditAPIService';
import { RedditMetadataSevice } from '@/services/Platform/reddit/RedditMetadataService';
import YoutubeOrchestrator from "@/services/orchestrators/YoutubeOrchestrator";
import RedditOrchestrator from '@/services/orchestrators/RedditOrchestrator';

interface PlatformInfo { 
    platformLinkAndType: Record<string, string>, 
    length: number 
}

interface SimilarYT {
    similarityScore: number;
    mediaData: Media;
    youtubeData: YoutubeMedia;
}

interface SimilarRDT {
    similarityScore: number,
    mediaData: Media,
    redditData: RedditMedia
}

export class HelperFunctions {

    // Here the bot will give the url
    public static async fetchVideoFromBot() {
        const link: string = 'someURL'
        const youtubeOrchestrator = new YoutubeOrchestrator();
        return () => youtubeOrchestrator.mainYoutubeOrchestrator(link);
    }

    public static getIdOfplatform = (media: Media): number => {
        if (!media || media === undefined || media === null) {
            throw new Error('Media is empty or not an acceptable value')
        }
        if (media.youtubeId === undefined) {
            throw new Error('YoutubeId is null or not an acceptable value')
        }
        if (media.redditId === undefined) {
            throw new Error('redditId is null or not an acceptable value')
        }
        const platform = media.platform.toLowerCase().trim();
        if (!platform || platform === null) {
            throw new Error('Platform is null or empty')
        }
        let platformId: number = 0;
        if (platform === 'youtube' && media.youtubeId) {
            platformId = media.youtubeId;
        }
        else if (platform === 'reddit' && media.redditId) {
            platformId = media.redditId;
        }

        if (platformId === 0) {
            throw Error('Not assigned any id see the issue properly!!');
        }
        return platformId;
    }

    static async PipelineInitializer(data: FormDataType): Promise<Media[]> {
        const summaryService = new SummaryService();
        const youtubeAPIService = new YoutubeAPIService();
        const redditAPIService = new RedditAPIService();

        // Destructuring the form data;
        const {
            url: links,
            category,
            customTags,
            fetchSimilar,
            similarityLevel
        } = data;

        // fetch and structure the video provided in URL
        const platfromInfo:PlatformInfo = this.parseLinksForPlatform(links);
        const orchestratorResult = await this.OrchestratorCaller(platfromInfo);

        // Convert the fetched data into array, if already an array then just return it
        const videos: GlobalMetadata[] = Array.isArray(orchestratorResult)
            ? orchestratorResult
            : [orchestratorResult];

        // Parallelly generate search queries for each video
        const videoProcessingPromises = videos.map(async (video:GlobalMetadata) => {
        const embeddings:number[] = video.embeddingsType.embeddings;
        const searchQuery = await summaryService.generateSearchQuery(
                category, 
                customTags, 
                similarityLevel
            );
            return { video, embeddings, searchQuery };
        });
        const processedVideos = await Promise.all(videoProcessingPromises);

        // Combining and Cleaning the generated search queries
        const searchQuery:string =  this.combineSearchQueries(
            processedVideos.map(pv => pv.searchQuery)
        );

        // Calling Youtube api for getting 10-20 videos based on search query
        const multipleYtVideos: any[] = await youtubeAPIService.fetchMultipleYtVideosFromQuery(searchQuery);
        
        // Calling Reddit api for getting 10-20 videos based on search query
        const multipleRedditVideos: any[] = await redditAPIService.fetchMultipleRDTVideosFromQuery(searchQuery);

        // Structuring the fetched videos according to defined types
        const extractedYTVideoData : { mediaData: Media, youtubeData: YoutubeMedia }[] = await this.parallelExtractYoutubeMedia(multipleYtVideos);
        const extractedRDTVideoData: { mediaData: Media, redditData:  RedditMedia  }[] = await this.parallelExtractRedditMedia(multipleRedditVideos);

        if (fetchSimilar) {
            // generating embeddings of extracted structired videos
            const fetchedYTVideosEmbeddings : number[][] = await this.batchEmbedYTVideos(extractedYTVideoData);
            const fetchedRDTVideosEmbeddings: number[][] = await this.batchEmbedRDTVideos(extractedRDTVideoData);

            // Mapping videos and sorting by Similarity
            const allInputEmbeddings:number[][] = processedVideos.map(pv => pv.embeddings);
            const ytVideos : SimilarYT[]  = this.extractTopYoutubeVideos(allInputEmbeddings, fetchedYTVideosEmbeddings, extractedYTVideoData);
            const rdtVideos: SimilarRDT[] = this.extractTopRedditVideos(allInputEmbeddings, fetchedRDTVideosEmbeddings, extractedRDTVideoData);

            // Returning Media
            return this.fetchTopTenMedias(ytVideos, rdtVideos);
        } else {
            const mediaPerPlatfrom:number = 20;
            const inputMedias = [...extractedYTVideoData, ...extractedRDTVideoData]
            const topTenMedias = [];
            const noOfPlatforms = inputMedias.length / mediaPerPlatfrom; // 2
            const allowedMediaPerPlatfrom = Math.ceil(mediaPerPlatfrom / noOfPlatforms); // 10  
            console.log(noOfPlatforms, mediaPerPlatfrom, allowedMediaPerPlatfrom);

            let platform = 0;
            for(platform; platform < noOfPlatforms; platform++){
                let initialIndex = platform * mediaPerPlatfrom 
                let finalIndex = (platform * mediaPerPlatfrom) + mediaPerPlatfrom;
                topTenMedias.push(
                    ...inputMedias
                        .slice(initialIndex, finalIndex)
                        .slice(0,allowedMediaPerPlatfrom)
                        .map(media => media.mediaData)
                );
            }
            console.log(`topTenMedias: ${JSON.stringify(topTenMedias, null, 2)}`);
            return topTenMedias;
        }
    }

    public static parseLinksForPlatform(links: string[]):PlatformInfo {
        try {
            if (links && links.length >= 1) {
                const linkMapper: Record<string, string> = {};
                // For a single link
                if (links.length === 1) {
                    if (links[0].includes(`youtube`) || links[0].includes(`youtu.be`)) {
                        linkMapper[links[0]] = 'youtube'.toLowerCase().trim();
                    }
                    else if (links[0].includes('www.reddit.com/r') || links[0].includes(`reddit`)) {
                        linkMapper[links[0]] = 'reddit'.toLowerCase().trim();
                    }
                    return { platformLinkAndType: linkMapper, length: 1 };
                }
                // For Multiple link
                else if (links.length > 1) {
                    links.forEach((link: string) => {
                        if (link.includes(`youtube`) || link.includes(`youtu.be`)) {
                            linkMapper[link] = 'youtube'.toLowerCase().trim();
                        }
                        else if (link.includes('www.reddit.com/r') || link.includes(`reddit`)) {
                            linkMapper[link] = 'reddit'.toLowerCase().trim();
                        }
                    })
                    return { platformLinkAndType: linkMapper, length: links.length };
                }
            }
            throw new Error(`Invalid link format the links are empty`)
        } catch (error) {
            console.error(`Unable to fetch platfrom type from link`, error)
            throw error;
        }
    }

    static async OrchestratorCaller(platfromInfo: PlatformInfo): Promise<GlobalMetadata | GlobalMetadata[]> {

        const { platformLinkAndType, length } = platfromInfo;
        const entries = Object.entries(platformLinkAndType);

        if (entries.length !== length) {
            throw new Error(`Length mismatch: expected ${length}, got ${entries.length}`);
        }

        if (entries.length === 0) {
            throw new Error('No platforms provided');
        }

        if (length === 1) {
            const [key, platform] = entries[0];
            return await this.processOrchestrator(key, platform);
        }

        const orchestratorPromises = entries.map(([key, platform]) =>
            this.processOrchestrator(key, platform)
        );

        try {
            const results = await Promise.all(orchestratorPromises);
            return results;
        } catch (error) {
            throw new Error(`Failed to process orchestrators: ${error}`);
        }
    }

    private static async processOrchestrator(key: string, platform: string): Promise<GlobalMetadata> {
        const normalizedPlatform = platform.toLowerCase();

        console.log(`Processing key: ${key}, platform: ${normalizedPlatform}`);

        switch (normalizedPlatform) {
            case 'youtube':
                const youtubeOrchestrator = new YoutubeOrchestrator();
                return await youtubeOrchestrator.mainYoutubeOrchestrator(key);

            case 'reddit':
                const redditOrchestrator = new RedditOrchestrator();
                return await redditOrchestrator.mainRedditOrchestrator(key);

            default:
                throw new Error(`Unsupported platform type: ${platform}`);
        }
    }

    static combineSearchQueries(queries: string[]): string {
        const processingService = new ProcessingService();
        if (queries.length === 1) return queries[0];
    
        return processingService.cleanText(queries.join(' '))
    }

    static async parallelExtractYoutubeMedia(multipleYtVideos: any[]): Promise<{ mediaData: Media, youtubeData: YoutubeMedia }[]> {
        const youtubeMetadataService = new YoutubeMetadataSevice();

        const videoPromises: Promise<{ mediaData: Media; youtubeData: YoutubeMedia }>[] = multipleYtVideos.map(async (video: any) => {
            const mediaData = youtubeMetadataService.extractMediaData(video);
            const youtubeData = await youtubeMetadataService.extractYoutubeData(video);
            mediaData.tags = await youtubeMetadataService.extractTags(video, mediaData, youtubeData);
            return { mediaData, youtubeData };
        });

        return await Promise.all(videoPromises);
    }

    static async parallelExtractRedditMedia(multipleYtVideos: any[]): Promise<{ mediaData: Media, redditData: RedditMedia }[]> {
        const redditMetadataService = new RedditMetadataSevice();

        const videoPromises: Promise<{ mediaData: Media; redditData: RedditMedia }>[] = multipleYtVideos.map(async (video: any) => {
            const mediaData:Media = await redditMetadataService.extractMediaData(video);
            const redditData: RedditMedia = await redditMetadataService.extractRedditData(video);
            redditData.comments = await redditMetadataService.extractTopComments(video);
            mediaData.tags = await redditMetadataService.extractTags(video, mediaData, redditData);
            return { mediaData, redditData };
        });

        return await Promise.all(videoPromises);
    }

    static async batchEmbedYTVideos(
        extractedVideos: { mediaData: Media; youtubeData: YoutubeMedia }[]
    ): Promise<number[][]> {
        const embeddingService = new EmbeddingService();
        const preprocessingService = new ProcessingService();

        const preprocessedContents: string[] = extractedVideos.map((video) => {
            const { mediaData, youtubeData } = video;
            return preprocessingService.extractAndPreprocessData(mediaData, youtubeData);
        });

        const contentEmbeddings: number[][] = await embeddingService.generateBatchEmbeddings(preprocessedContents);
        return contentEmbeddings;
    }

    static async batchEmbedRDTVideos(
        extractedVideos: { mediaData: Media; redditData: RedditMedia }[]
    ):Promise<number[][]> {
        const embeddingService = new EmbeddingService();
        const preprocessingService = new ProcessingService();

        const preprocessedContents: string[] = extractedVideos.map((video) => {
            const { mediaData, redditData } = video;
            return preprocessingService.extractAndPreprocessData(mediaData, redditData);
        });

        const contentEmbeddings: number[][] = await embeddingService.generateBatchEmbeddings(preprocessedContents);
        return contentEmbeddings;
    }

    static extractTopYoutubeVideos(
        inputEmbeddings: number[][], 
        fetchedEmbeddings: number[][], 
        extractedVideoData: { mediaData: Media, youtubeData: YoutubeMedia }[]
    ):SimilarYT[] {
        const vecStore = new VectorStore()
        const scoredVideos = extractedVideoData.map((videoData, index) => {
        const fetchedEmbedding = fetchedEmbeddings[index];
        
        const maxSimilarity = Math.max(
            ...inputEmbeddings.map(inputEmbedding => 
                vecStore.cosineSimilarity(inputEmbedding, fetchedEmbedding)
            )
        );
        
        return {
            ...videoData,
            similarityScore: maxSimilarity
        };
    });
       
    return scoredVideos
        .sort((a, b) => b.similarityScore - a.similarityScore)
        .slice(0, 10)
    }

    static extractTopRedditVideos(
        inputEmbeddings: number[][], 
        fetchedEmbeddings: number[][], 
        extractedVideoData: { mediaData: Media, redditData: RedditMedia }[]
    ):SimilarRDT[] {
        const vecStore = new VectorStore()
        const scoredVideos = extractedVideoData.map((videoData, index) => {
        const fetchedEmbedding:number[] = fetchedEmbeddings[index];
        
        const maxSimilarity = Math.max(
            ...inputEmbeddings.map((inputEmbedding:number[]) => 
                vecStore.cosineSimilarity(inputEmbedding, fetchedEmbedding)
            )
        );
        
        return {
            ...videoData,
            similarityScore: maxSimilarity
        };
    });
       
    return scoredVideos
        .sort((a, b) => b.similarityScore - a.similarityScore)
        .slice(0, 10)
    }

    static fetchTopTenMedias(ytVideos:SimilarYT[], rdtVideos:SimilarRDT[]):Media[] {
        return [
            ...ytVideos, 
            ...rdtVideos
        ]
        .map(media => ({media: media.mediaData, maxSimilarity: media.similarityScore}))
        .sort((a,b) => b.maxSimilarity - a.maxSimilarity)
        .slice(0,10)
        .map(media => media.media)
    }
}