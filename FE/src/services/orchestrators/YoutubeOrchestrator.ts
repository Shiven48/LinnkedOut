import { TranscriptResponse } from "youtube-transcript";
import { YoutubeAPIService } from "../Platform/youtube/YoutubeAPIService";
import { YoutubeMetadataSevice } from "../Platform/youtube/YoutubeMetadataService";
import { YoutubeTranscriptService } from "../Platform/youtube/YoutubeTranscriptionService";
import { EmbeddingRepository } from "../database/EmbeddingRepository";
import { Media, YoutubeMedia } from "../common/types";
import { EmbeddingService } from "../vector/EmbeddingService";
import { categoryDefinitions } from "@/services/common/constants";
import { ProcessingService } from "../vector/PreprocessingService";
import { VectorStore } from "../content/VectorStoreService";
import { YoutubeMediaRepository } from "../database/YoutubeMediaRepository";

export default class YoutubeOrchestrator {

    private youtubeAPIService:YoutubeAPIService;
    private youtubeMetadataService:YoutubeMetadataSevice;
    private youtubeTranscriptionService:YoutubeTranscriptService; 
    private embeddingService:EmbeddingService;
    private preprocessingService:ProcessingService;
    private vectorStore:VectorStore;
    private embeddingRepository:EmbeddingRepository;
    private youtubeRepository;

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

    async mainYoutubeOrchestrator(link:string){
        try{
            const videoId = this.youtubeAPIService.parseVideoId(link);
            const fetchedYoutubeMetadata = await this.youtubeAPIService.fetchVideoMetadata(videoId);

            const mediaData = this.youtubeMetadataService.extractMediaData(fetchedYoutubeMetadata);
            const youtubeData = await this.youtubeMetadataService.extractYoutubeData(fetchedYoutubeMetadata);
            const transcripts:TranscriptResponse[] = await this.youtubeTranscriptionService.fetchTranscript(videoId);
            youtubeData.englishCaptions = this.youtubeTranscriptionService.extractEnglishCaptions(transcripts);
        
            const embeddingsId:number = await this.embeddingStorageOrchestrator(mediaData, youtubeData)
            mediaData.embeddingId = embeddingsId;
            const metaDataId:number = await this.youtubeRepository.saveYoutubeMediaData(mediaData, youtubeData);
            console.log('Inserted all data successfully')
            
            return { videoMetadataId:metaDataId, embeddingsId: embeddingsId }
        } catch(error){
            throw error;
        }
    }

    private async embeddingStorageOrchestrator(mediaData:Media, youtubeData:YoutubeMedia):Promise<number> {
        try{
            const categoryEmbeddings:Record<string, number[]> = await this.embeddingService.initializeEmbeddings(categoryDefinitions)
            console.log("Categories available for classification:", Object.keys(categoryEmbeddings));
                
            const preprocessedContent: string = this.preprocessingService.extractAndPreprocessData(mediaData, youtubeData);
            const contentEmbeddings: number[] = await this.embeddingService.generateEmbeddings(preprocessedContent);
            if (!categoryDefinitions || Object.keys(categoryDefinitions).length === 0) throw new Error("Category definitions are empty");
            console.log(`Found ${Object.keys(categoryDefinitions).length} category definitions`);

            const assignedCategory = this.vectorStore.classifyEmbedding(contentEmbeddings, categoryEmbeddings);
            mediaData.category = assignedCategory;
            const embeddingIdInDatabase:number = await this.embeddingRepository.storeContent(preprocessedContent, contentEmbeddings, assignedCategory);
            return embeddingIdInDatabase;  
        } catch (error) {
            console.error("YoutubeOrchestrator: Error in storig embeddings:", error);
            throw error;
        } 
    } 

}