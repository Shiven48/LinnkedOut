import { FormDataType } from '@/app/_components/shared/PostInputForm';
import { GlobalMetadata, Media, PlatformInfo, ScoreExtractionResult, SimilarYT, YoutubeMedia, YoutubeMetadata } from '@/services/common/types';
import { SummaryService } from '@/services/content/summaryService';
import { YoutubeAPIService } from '@/services/Platform/youtube/YoutubeAPIService';
import { YoutubeMetadataSevice } from '@/services/Platform/youtube/YoutubeMetadataService';
import { EmbeddingService } from '@/services/vector/EmbeddingService';
import { VectorStore } from '@/services/content/VectorStoreService';
import { RootOrchestrator } from '@/services/orchestrators/RootOrchestrator';
import { YoutubeFilterService } from '@/services/Platform/youtube/YoutubeFilterService';
import { EmbeddingRepository } from '@/services/database/EmbeddingRepository';
import { YoutubeMediaRepository } from '@/services/database/YoutubeMediaRepository';

export class HelperFunctions {

    // static async RootOrchestrator(data: FormDataType): Promise<SimilarYT[]> {
    //     const summaryService = new SummaryService();
    //     const youtubeAPIService = new YoutubeAPIService();
    //     const embeddingService = new EmbeddingService();

    //     // Destructuring the form data;
    //     const {
    //         url: links,
    //         category,
    //         customTags,
    //         fetchSimilar,
    //         similarityLevel
    //     } = data;

    //     // saved the link data in database using appropriate orchestrator
    //     const platfromInfo:PlatformInfo = RootOrchestrator.parseLinksForPlatform(links);
    //     const orchestratorResult = await RootOrchestrator.OrchestratorCaller(platfromInfo);

    //     // Convert the fetched data into array, if already an array then just return it
    //     const inputVideos: GlobalMetadata[] = Array.isArray(orchestratorResult)
    //         ? orchestratorResult
    //         : [orchestratorResult];
        
    //     // If 1 video array then process for 1 else process for N
    //     // Parallely generate search queries for each video
    //     const inputVideoProcessingPromises = inputVideos.map(async (video:GlobalMetadata) => {
    //         const embeddings:number[] = video.embeddingsType.embeddings;
    //         const searchQuery = await summaryService.generateSearchQuery(
    //             category,
    //             customTags, 
    //             similarityLevel
    //         );
    //         return { video, embeddings, searchQuery };
    //     });
    //     const inputProcessedVideos = await Promise.all(inputVideoProcessingPromises);

    //     // Combining and Cleaning the generated search queries
    //     // Here it can be made using 20 videos or only one but we will get a single string as we are
    //     // concatinating the strings
    //     const searchQuery:string =  RootOrchestrator.combineSearchQueries(
    //         inputProcessedVideos.map(pv => pv.searchQuery)
    //     );

    //     // Calling Youtube api for getting 10-20 videos based on search query
    //     const unprocessedFetchedVideos: any[] = await youtubeAPIService.fetchMultipleYtVideosFromQuery(searchQuery);

    //     // Structuring the all 20 fetched videos according to defined types
    //     const extractedYTVideoData : { mediaData: Media, youtubeData: YoutubeMedia}[] = await this.parallelExtractYoutubeMedia(unprocessedFetchedVideos);
    //     let finalizedMedias:SimilarYT[] = []
    //     let categoryEmbeddings: Record<string, number[]> = {}

    //     if (fetchSimilar) {
    //         // Map all embeddings of input videos into an array (1 because of i passed 1 link)
    //         // const allInputEmbeddings:number[][] = inputProcessedVideos.map(pv => pv.embeddings);

    //         // Now batch the embedding creation of all the fetched videos (N because i fetched N links from api)
    //         // let fetchedYTVideosEmbeddings: {preprocessedContents:string[], contentEmbeddings: number[][]} = 
    //         //     await this.batchEmbedYTVideos(extractedYTVideoData);

    //         // Here i have return 20 videos with their extracted data as well as embedding and similarity score with input media
    //         // const contentEmbedding = fetchedYTVideosEmbeddings.contentEmbeddings
    //         // const ytVideos : SimilarYT[]  = this.extractTopYoutubeVideos(allInputEmbeddings, contentEmbedding, extractedYTVideoData);

    //         // return top 10 videos
    //         // finalizedMedias = this.fetchTopTenMedias(ytVideos)
    //         // categoryEmbeddings = await embeddingService.initializeEmbeddings(categoryDefinitions)

    //         // This batch is for saving all the data
    //         // const batchResults:SimilarYT[] = await this.processBatch(
    //         //     finalizedMedias,
    //         //     categoryEmbeddings,
    //         //     fetchedYTVideosEmbeddings
    //         // );

    //     //     return batchResults
    //     } else {
    //         throw Error(`Fetch similar is not True: ${fetchSimilar}`)
    //     }
    // }

    static async testFlow(data: FormDataType):Promise<any> {
        const summaryService = new SummaryService();
        const youtubeAPIService = new YoutubeAPIService();
        const embeddingService = new EmbeddingService();
        const filterService = new YoutubeFilterService();
        const youtubeMetadataService = new YoutubeMetadataSevice();
        // Destructuring the form data;
        const {
            url: links,
            category,
            customTags,
            fetchSimilar,
            similarityLevel
        } = data;

        // saved the link data in database using appropriate orchestrator
        const platformInfo:PlatformInfo = RootOrchestrator.parseLinksForPlatform(links);
        const orchestratorResult = await RootOrchestrator.OrchestratorCaller(platformInfo);
        const userInputProcessingResult: GlobalMetadata[] = Array.isArray(orchestratorResult) ? orchestratorResult : [orchestratorResult];
        
        // If 1 video array then process for 1 else process for N
        // Parallely generate search queries for each video
        const inputVideoProcessingPromises = userInputProcessingResult.map(async (processedVideo: GlobalMetadata) => {
            const embeddings: number[] = processedVideo.embeddingsType.embeddings;
            
            const queryAnalysis = await summaryService.generateSearchQuery(
                category,
                customTags, 
                similarityLevel,
                { includeAlternatives: true, maxAlternatives: 3 }
            );
            
            return { 
                processedVideo, 
                embeddings, 
                searchQueryResult: queryAnalysis.primary,
                alternatives: queryAnalysis.alternatives,
                qualityMetrics: queryAnalysis.qualityMetrics
            };
        });
        const inputProcessedVideos = await Promise.all(inputVideoProcessingPromises);

        const video = inputProcessedVideos[0]
        const categoryId:string = video.searchQueryResult.categoryId;
        const topicId:string = video.searchQueryResult.topicId;
        const primaryQuery:string = video.searchQueryResult.searchQuery;
        const alternativeQueries:string[] = video.alternatives;

        const allQueries = [primaryQuery, ...alternativeQueries].slice(0, 3);

        // Three queries each will return YoutubeMetadata[]
        const fetchPromises = allQueries.map(async (query, index) => {
            console.log(`🔍 Fetching videos for query ${index + 1}: "${query}": ${categoryId} : ${topicId}`);
            return await youtubeAPIService.searchVideos(query, categoryId, topicId);
        });

        const videoResults:YoutubeMetadata[] = (await Promise.all(fetchPromises)).flat();
        console.log(`Fetched ${videoResults.length} videos from the youtube search api`)

        // Filtering
        const filteredVideos:ScoreExtractionResult[] = filterService.processVideos(
            videoResults
        )
        
        // Semantic matching
        let ytVideos:SimilarYT[] = []
        let fetchedYTVideosEmbeddings: {preprocessedContents:string[], contentEmbeddings: number[][]} | null = null;
        if (fetchSimilar) {
            const allInputEmbeddings:number[][] = [video.embeddings]
            const extractedYTVideoData : { mediaData: Media, youtubeData: YoutubeMedia }[] = 
                await youtubeMetadataService.parallelExtractYoutubeMedia(videoResults);
            
            // batch embedding fetched videos (N because we fetched N links from api)
            fetchedYTVideosEmbeddings = await youtubeMetadataService.batchEmbedYTVideos(extractedYTVideoData);

            console.log('Batch Embedding Successful')

            // Here i have return 20 videos with their extracted data as well as embedding and similarity score with input media
            const contentEmbedding = fetchedYTVideosEmbeddings.contentEmbeddings
            ytVideos = youtubeMetadataService.extractTopYoutubeVideos(allInputEmbeddings, contentEmbedding, extractedYTVideoData);
            console.log(`Must be 12: ${ytVideos.length}`)
        }

        // This batch is for saving all the data
        if(fetchedYTVideosEmbeddings){
            const batchResults:SimilarYT[] = await this.processBatch(
                ytVideos,
                fetchedYTVideosEmbeddings
            );

            return batchResults
        } else{
            console.error("fetched yt videos embeddings are null")
            throw new Error(`property 'fetchedYTVideosEmbeddings' is : ${fetchedYTVideosEmbeddings}`)
        }

    }

    static async processBatch(
            batch: SimilarYT[], 
            fetchedYTVideosEmbeddings: {preprocessedContents:string[], contentEmbeddings: number[][]}
        ):Promise<SimilarYT[]> {
        const embeddingRepository = new EmbeddingRepository();
        const youtubeRepository = new YoutubeMediaRepository()
        const vectorStore = new VectorStore();

        const {contentEmbeddings, preprocessedContents} = fetchedYTVideosEmbeddings

        return Promise.all(
            batch.map(async (data,index) => {
                const { mediaData, youtubeData } = data;                
                const preprocessedContent = preprocessedContents[index]
                const contentEmbedding = contentEmbeddings[index]
                
                // Store embeddings
                mediaData.embeddingId = await embeddingRepository.storeContent(
                    preprocessedContent, 
                    contentEmbedding, 
                );

                console.log(`Stored embeddingId: ${mediaData.embeddingId}`)
                
                // Store media and YT data
                await youtubeRepository.saveYoutubeMediaData(mediaData, youtubeData);
                
                return data
            })
        );
    };

}