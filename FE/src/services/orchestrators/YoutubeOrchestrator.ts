import { YoutubeAPIService } from "../Platform/youtube/YoutubeAPIService";
import { YoutubeMetadataSevice } from "../Platform/youtube/YoutubeMetadataService";
import { YoutubeTranscriptService } from "../Platform/youtube/YoutubeTranscriptionService";
import { EmbeddingRepository } from "../database/EmbeddingRepository";
import { EmbeddingReturntype, GlobalMetadata, Media, YoutubeMedia} from "../common/types";
import { EmbeddingService } from "../vector/EmbeddingService";
import { categoryDefinitions } from "@/services/common/constants";
import { ProcessingService } from "../vector/PreprocessingService";
import { VectorStore } from "../content/VectorStoreService";
import { YoutubeMediaRepository } from "../database/YoutubeMediaRepository";
import { media } from "@/server/db";

export default class YoutubeOrchestrator {

    private youtubeAPIService:YoutubeAPIService;
    private youtubeMetadataService:YoutubeMetadataSevice;
    private youtubeTranscriptionService:YoutubeTranscriptService; 
    private embeddingService:EmbeddingService;
    private preprocessingService:ProcessingService;
    private vectorStore:VectorStore;
    private embeddingRepository:EmbeddingRepository;
    private youtubeRepository:YoutubeMediaRepository;

    constructor(){
        this.youtubeAPIService = new YoutubeAPIService();
        this.youtubeMetadataService = new YoutubeMetadataSevice();
        this.youtubeTranscriptionService = new YoutubeTranscriptService();
        this.embeddingService = new EmbeddingService(); 
        this.preprocessingService = new ProcessingService();
        this.vectorStore = new VectorStore();
        this.embeddingRepository = new EmbeddingRepository();
        this.youtubeRepository = new YoutubeMediaRepository();
    }

    async mainYoutubeOrchestrator(link:string):Promise<GlobalMetadata> {
        try{
            const videoId = this.youtubeAPIService.parseVideoId(link);
            const fetchedYoutubeMetadata = await this.youtubeAPIService.fetchVideoMetadata(videoId);
            const mediaData:Media = this.youtubeMetadataService.extractMediaData(fetchedYoutubeMetadata);
            const youtubeData = await this.youtubeMetadataService.extractYoutubeData(fetchedYoutubeMetadata);
            youtubeData.englishCaptions = await this.youtubeTranscriptionService.fetchTranscript(videoId, mediaData.title);
            mediaData.tags = await this.youtubeMetadataService.extractTags(fetchedYoutubeMetadata, mediaData, youtubeData);
            const { preprocessedContent, contentEmbeddings, assignedCategory } = await this.embeddingOrchestrator(mediaData, youtubeData)            
            // mediaData.embeddingId = await this.embeddingRepository.storeContent(preprocessedContent, contentEmbeddings, assignedCategory);  
            // await this.youtubeRepository.saveYoutubeMediaData(mediaData, youtubeData);
            const EmbeddingMetadata:EmbeddingReturntype = { embeddingId: 2000, embeddings: contentEmbeddings}
            
            return({media:mediaData, embeddingsType:EmbeddingMetadata})
        } catch(error){
            console.error(`Error Orchestrating youtube video`,error);
            throw error;
        }
    }

    async embeddingOrchestrator(mediaData:Media, youtubeData:YoutubeMedia):Promise<{
        preprocessedContent: string,
        contentEmbeddings: number[],
        assignedCategory: string
    }> {
        try{
            const categoryEmbeddings:Record<string, number[]> = await this.embeddingService.initializeEmbeddings(categoryDefinitions)
            console.log("Categories available for classification:", Object.keys(categoryEmbeddings));
                
            const preprocessedContent: string = this.preprocessingService.extractAndPreprocessData(mediaData, youtubeData);
            const contentEmbeddings: number[] = await this.embeddingService.generateEmbeddings(preprocessedContent);
            if (!categoryDefinitions || Object.keys(categoryDefinitions).length === 0) throw new Error("Category definitions are empty");
            console.log(`Found ${Object.keys(categoryDefinitions).length} category definitions`);

            const assignedCategory = this.vectorStore.classifyEmbedding(contentEmbeddings, categoryEmbeddings);
            mediaData.category = assignedCategory;
            return { preprocessedContent, contentEmbeddings, assignedCategory };
        } catch (error) {
            console.error("YoutubeOrchestrator: Error in storig embeddings:", error);
            throw error;
        } 
    } 

}