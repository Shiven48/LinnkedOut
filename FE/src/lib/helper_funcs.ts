import { FormDataType } from '@/app/_components/shared/PostInputForm';
import { GlobalMetadata, Media, YoutubeMedia } from '@/services/common/types';
import { SummaryService } from '@/services/content/summaryService';
import { YoutubeAPIService } from '@/services/Platform/youtube/YoutubeAPIService';
import { YoutubeMetadataSevice } from '@/services/Platform/youtube/YoutubeMetadataService';
import { EmbeddingService } from '@/services/vector/EmbeddingService';
import { ProcessingService } from '@/services/vector/PreprocessingService';
import { VectorStore } from '@/services/content/VectorStoreService';
import RedditOrchestrator from '@/services/orchestrators/RedditOrchestrator';
import YoutubeOrchestrator from "@/services/orchestrators/YoutubeOrchestrator";

export class HelperFunctions {

    // Here the bot will give the url
    public static async fetchVideoFromBot() {
        const link: string = 'someURL'
        const youtubeOrchestrator = new YoutubeOrchestrator();
        return () => youtubeOrchestrator.mainYoutubeOrchestrator(link);
    }

    public static getIdOfplatform = (media: Media):number => {
            if(!media || media === undefined || media === null){
                throw new Error('Media is empty or not an acceptable value')
            }
            if(media.youtubeId === undefined){
                throw new Error('YoutubeId is null or not an acceptable value')
            }
            if(media.redditId === undefined){
                throw new Error('redditId is null or not an acceptable value')
            }
            const platform = media.platform.toLowerCase().trim();
            if(!platform || platform === null){
                throw new Error('Platform is null or empty')
            }
            let platformId:number = 0;
            if(platform === 'youtube' && media.youtubeId){
                platformId = media.youtubeId;
            }
            else if(platform === 'reddit' && media.redditId){
                platformId = media.redditId;
            }

            if(platformId === 0){
                throw Error('Not assigned any id see the issue properly!!');
            }
            return platformId;
    }

    static async PipelineInitializer(data:FormDataType): Promise<Media[]>{
        const summaryService = new SummaryService();
        const youtubeAPIService = new YoutubeAPIService();
        const { url:links, category, customTags, fetchSimilar, similarityLevel } = data;

        const video:GlobalMetadata = await this.parseLinksForPlatform(links); // sense platfrom and invoke that orchestractor
        const embeddings:number[] = video.embeddingsType.embeddings
        const searchResultQuery:string = await summaryService.generateSearchQuery(category, customTags, similarityLevel);
        const multipleYtVideos:any[] = await youtubeAPIService.fetchMultipleVideosFromQuery(searchResultQuery);
        const extractedVideoData:{mediaData:Media, youtubeData:YoutubeMedia}[] = await this.parallelExtractMedia(multipleYtVideos);
        
        if(fetchSimilar){
            // First doing for youtube
            console.log(`Taking long route`);
            const allVideosEmbeddings:number[][] = await this.parallelEmbedVideos(extractedVideoData);
            return await this.extractTopYoutubeVideos(embeddings,allVideosEmbeddings, extractedVideoData);
        }
        console.log(`Taking short route`);
        return extractedVideoData.splice(10).map(media => media.mediaData);
    }

    public static async parseLinksForPlatform(links: string[]):Promise<GlobalMetadata> {
        try{
            // if(links && links.length >= 1){
                // if(links.length === 1) {
                //     return await this.OrchestratorCaller(links[0]);
                // }
                // else if(links.length > 1) {
                //     const orchestratorCalls:Promise<any>[] = links.map((link: string) =>
                //         this.OrchestratorCaller(link)
                //     );
                //     const results = await Promise.allSettled(orchestratorCalls);

                //     results.forEach((result, index) => {
                //         if (result.status === "fulfilled") {
                //         console.log(`Link ${links[index]} processed successfully.`);
                //         } else {
                //         console.error(`Link ${links[index]} failed:`, result.reason);
                //         }
                //     });
                // }
            // }
            return await this.OrchestratorCaller(links[0]);
        } catch(error){
            console.error(`Unable to fetch platfrom type from link`,error)
            throw error;
        }
    }

    static async OrchestratorCaller(link: string): Promise<GlobalMetadata>{
        if(link.includes(`youtube`) || link.includes(`youtu.be`)){
            const youtubeOrchestrator:YoutubeOrchestrator = new YoutubeOrchestrator(); 
            return await youtubeOrchestrator.mainYoutubeOrchestrator(link)
        }
        else if(link.includes('www.reddit.com/r') || link.includes(`reddit`)){
            const redditOrchestrator:RedditOrchestrator = new RedditOrchestrator();
            return await redditOrchestrator.mainRedditOrchestrator(link);
        }
        throw Error('Unknown video type -> OrchestratorCaller');
    }

    static async parallelExtractMedia(multipleYtVideos:any[]): Promise<{mediaData:Media, youtubeData:YoutubeMedia}[]>{
        const youtubeMetadataService = new YoutubeMetadataSevice();

        const videoPromises: Promise<{ mediaData: Media; youtubeData: YoutubeMedia }>[] = multipleYtVideos.map(async (video: any) => {
            const mediaData = youtubeMetadataService.extractMediaData(video);
            const youtubeData = await youtubeMetadataService.extractYoutubeData(video);
            mediaData.tags = await youtubeMetadataService.extractTags(video, mediaData, youtubeData);
            return { mediaData, youtubeData };
        });
        
        return await Promise.all(videoPromises);
    }

    static async parallelEmbedVideos(
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

    static async extractTopYoutubeVideos(
        embeddings: number[],
        allVideosEmbeddings:number[][], 
        extractedVideos: {mediaData:Media, youtubeData:YoutubeMedia}[]
    ){
        const vecStore = new VectorStore();
        const MappedSimilarity = allVideosEmbeddings.map((SingleVideoEmbedding, index) => {
            const similarity = vecStore.cosineSimilarity(SingleVideoEmbedding, embeddings)
            return {
                mediaData: extractedVideos[index].mediaData,
                youtubeData: extractedVideos[index].youtubeData,
                similarity
            }
        })
        return MappedSimilarity
            .sort((a,b) => b.similarity - a.similarity)
            .slice(10)
            .map(complexObj => complexObj.mediaData);
    }

}