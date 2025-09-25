import { Media, YTStatsAndTopics, YoutubeMedia, YoutubeMetadata, YTStatistics, SimilarYT } from '@/services/common/types'
import { SummaryService } from '@/services/content/summaryService';
import { VectorStore } from '@/services/content/VectorStoreService';
import { EmbeddingService } from '@/services/vector/EmbeddingService';
import { ProcessingService } from '@/services/vector/PreprocessingService';

export class YoutubeMetadataSevice {

    public extractMediaData = (youtubeMetaData: YoutubeMetadata): Media => {
        const { id } = youtubeMetaData;
        const { title, thumbnails } = youtubeMetaData.snippet;
        const { duration } = youtubeMetaData.contentDetails || {};
        const durationMs: number = this.parseDurationToMs(duration)
        const thumbnailUrl = this.getThumbnailUrl(thumbnails);
        const type:'short' | 'image' | 'video' | 'photo' | 'self' = this.determineVideoType(durationMs)

        return {
            type,
            platform: 'youtube',
            thumbnailUrl,
            postUrl: `https://www.youtube.com/watch?v=${id}`,
            title,
            durationMs: durationMs!,
            postId: id, 
            category: '',
        }
    };

    public extractTags = async (fetchedYoutubeMetadata: YoutubeMetadata, mediaData: Media, youtubeData: YoutubeMedia):Promise<void> => {
        let tags:string[] = []
        tags = fetchedYoutubeMetadata.snippet?.tags;
        if(!tags || tags === undefined) {
            console.warn('Tags are not present for the following media, generating tags...');
            tags = await this.generateTags(mediaData, youtubeData, fetchedYoutubeMetadata);
        }
        mediaData.tags = tags
    }

    public generateTags = async (mediaData: Media, youtubeData: YoutubeMedia, fetchedYoutubeMetadata:YoutubeMetadata):Promise<string[]> => {
        const processingService = new ProcessingService();
        const summaryService = new SummaryService();
        const preprocessedDataForTags:string = processingService.extractAndPreprocessData(mediaData, youtubeData, fetchedYoutubeMetadata);
        return await summaryService.generateTags(preprocessedDataForTags);
    } 

    public extractYoutubeData = (youtubeMetaData: YoutubeMetadata): YoutubeMedia => {
        const { description } = youtubeMetaData.snippet;
        const { definition } = youtubeMetaData.contentDetails || {};
        return {
            description,
            definition
        };
    };

    public parseDurationToMs = (isoDuration: string): number => {
        if (!isoDuration) return 0;

        let hours = 0, minutes = 0, seconds = 0;

        const hourMatch = isoDuration.match(/(\d+)H/);
        const minuteMatch = isoDuration.match(/(\d+)M/);
        const secondMatch = isoDuration.match(/(\d+)S/);

        if (hourMatch) hours = parseInt(hourMatch[1]);
        if (minuteMatch) minutes = parseInt(minuteMatch[1]);
        if (secondMatch) seconds = parseInt(secondMatch[1]);

        return (hours * 3600 + minutes * 60 + seconds) * 1000;
    };

    public determineVideoType = (durationMs:number): 'short' | 'image' | 'video' | 'photo' => {
        if (durationMs && durationMs < 60000) {
            return 'short';
        }
        return 'video';
    };

    public  getThumbnailUrl = (thumbnails: any): string => {
        const { maxres, standard, high, medium, default: defaultThumbnail } = thumbnails;
        if (maxres) {
            return maxres.url;
        } else if (standard) {
            return standard.url;
        } else if (high) {
            return high.url;
        } else if (medium) {
            return medium.url;
        } else if (defaultThumbnail) {
            return defaultThumbnail.url;
        }
        return '';
    }

    public extractStats = (youtubeMetaData: YoutubeMetadata): YTStatsAndTopics => {
        const {statistics, topicDetails} = youtubeMetaData
        return {
            viewCount: statistics.viewCount,
            likeCount: statistics.likeCount,
            favoriteCount: statistics.favoriteCount,
            commentCount: statistics.commentCount,
            topicCategories: topicDetails.topicCategories
        }
    }

    public async batchEmbedYTVideos(
        extractedVideos: { mediaData: Media; youtubeData: YoutubeMedia }[]
    ): Promise<{preprocessedContents: string[], contentEmbeddings: number[][]}> {
        const embeddingService = new EmbeddingService();
        const preprocessingService = new ProcessingService();

        const preprocessedContents: string[] = extractedVideos.map((video) => {
            const { mediaData, youtubeData } = video;
            return preprocessingService.extractAndPreprocessData(mediaData, youtubeData);
        });

        const contentEmbeddings: number[][] = await embeddingService.generateBatchEmbeddings(preprocessedContents);
        return {preprocessedContents: preprocessedContents, contentEmbeddings: contentEmbeddings};
    }

    async parallelExtractYoutubeMedia(multipleYtVideos: YoutubeMetadata[]): Promise<{ mediaData: Media, youtubeData: YoutubeMedia }[]> {
        const youtubeMetadataService = new YoutubeMetadataSevice();
        const videoPromises = multipleYtVideos.map(async (video: YoutubeMetadata) => {
            try {
                const mediaData = youtubeMetadataService.extractMediaData(video);
                const youtubeData = youtubeMetadataService.extractYoutubeData(video);
                await youtubeMetadataService.extractTags(video, mediaData, youtubeData);
                return { mediaData, youtubeData };
            } catch (error) {
                console.error('Error processing video:', video, error);
                throw error;
            }
        });
        return await Promise.all(videoPromises);
    }

    public parallelExtractYoutubeStats(multipleYtVideos: YoutubeMetadata[]):YTStatsAndTopics[] {
        const youtubeMetadataService = new YoutubeMetadataSevice();
        return multipleYtVideos.map((video: YoutubeMetadata) => {
            try {
                return youtubeMetadataService.extractStats(video);
            } catch (error) {
                console.error('Error extracting stats and topic details:', video, error);
                throw error;
            }
        });
    }

    public extractTopYoutubeVideos(
        inputEmbeddings: number[][], // 1
        fetchedEmbeddings: number[][], // N
        extractedVideoData: { mediaData: Media, youtubeData: YoutubeMedia }[]
    ):SimilarYT[] {
        const vecStore = new VectorStore()
        // This scoredVideos is giving top videos for a single link so map is giving an array
        const scoredVideos = extractedVideoData.map((videoData, index) => {
                // Video to embedding map
                const fetchedEmbedding = fetchedEmbeddings[index];
                
                // Each fetched media's embedding similarity is being calculated with the user input media
                // For each pass it will work N times so for N passes it will work N X N times
                const maxSimilarity = Math.max(
                    ...inputEmbeddings.map(inputEmbedding => 
                        vecStore.cosineSimilarity(inputEmbedding, fetchedEmbedding)
                    )
                );
                
                return {
                    ...videoData,
                    similarityScore: maxSimilarity,
                    embeddings: fetchedEmbedding
                };
            });
       
        return scoredVideos
            .sort((a, b) => b.similarityScore - a.similarityScore)
            .slice(0, 12)
    }
}