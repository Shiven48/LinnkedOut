import { CommentData, Media, RedditComment, RedditMedia, SimilarRDT } from "@/services/common/types";
import { SummaryService } from "@/services/content/summaryService";
import { VectorStore } from "@/services/content/VectorStoreService";
import { EmbeddingService } from "@/services/vector/EmbeddingService";
import { ProcessingService } from "@/services/vector/PreprocessingService";

export class RedditMetadataSevice {

    extractMediaData = (redditPostMetaData: any): Media => {
        // Since multipleRedditVideos is now an array of post.data objects,
        // redditPostMetaData is already the post data, not the full response
        const postData = redditPostMetaData;
        const { title, post_hint, id, media, preview } = postData;

        const resolutions = preview?.images[0]?.resolutions || [];
        const thumbnailUrl = Array.isArray(resolutions) && resolutions.length
            ? resolutions[resolutions.length - 1].url
            : undefined;

        const { fallback_url, duration } = media?.reddit_video || {};
        const parsedThumbnailUrl = thumbnailUrl ? this.parseImage(thumbnailUrl) : undefined;
        const durationMs: number = this.parseDuration(duration)

        const generalizedMedia:Media = {
            type: this.getType(post_hint),
            platform: 'reddit',
            thumbnailUrl: parsedThumbnailUrl,
            postUrl: fallback_url || '',
            title: title,
            durationMs: durationMs!,
            postId: id
        };
        return generalizedMedia;
    }

    parseImage(unParsedImageUrl: string): string {
        try {
            let parsedUrl: string = '';
            if (unParsedImageUrl) {
                parsedUrl = decodeURIComponent(unParsedImageUrl).replace(/&amp;/g, '&');
            }
            return parsedUrl;
        } catch (error) {
            console.error("Error parsing image:", error);
            return unParsedImageUrl;
        }
    }

    getType(post_hint: string): "short" | "image" | "video" | "photo" | "self" {
        if (post_hint === 'hosted:video') {
            return 'video';
        } else if (post_hint === 'hosted:image' || post_hint === 'photo' || post_hint === 'image') {
            return 'image';
        } else if (post_hint === 'self'){
            return 'self' 
        } else {
            return 'short';
        }
    }

    parseDuration = (duration: string | number): number => {
        let durationMs: number;
        if (typeof duration === 'string') {
            durationMs = Math.round(Number(parseFloat(duration) * 1000));
        } else if (typeof duration === 'number') {
            durationMs = Math.round(duration * 1000);
        } else {
            durationMs = 0;
        }
        return durationMs
    }

    extractRedditData = (redditPostMetaData: any): RedditMedia => {
        const postData = redditPostMetaData;
        const { subreddit, author, url, selftext, post_hint} = postData;
        const type = this.getType(post_hint)

        const redditMedia:RedditMedia = {
            subreddit: subreddit,
            author: author,
            postLink: url
        };

        type === 'self' ? redditMedia.selftext = selftext : redditMedia;  
        return redditMedia;
    }

    extractTopComments = (fullRedditResponse: any) => {
        // This are all of the video comments
        const comments: RedditComment[] = fullRedditResponse.data?.children || [];
        // {
        //  kind: 'Listing',
        //  data: {
        //      after: null,
        //      dist: null,
        //      modhash: null,
        //      geo_filter: '',
        //      children: [Array],
        //      before: null
        //  }
        // }
        const sortedComments = comments.sort((a, b) => b.data.score - a.data.score);
        const topComments: CommentData[] = sortedComments.slice(0, 10).map(comment => {

            const result: CommentData = {
                body: comment.data.body,
                score: comment.data.score,
                author: comment.data.author,
                ups: comment.data.ups,
                downs: comment.data.downs
            };

            // Here i have passed the child object or the inner object
            const extractRpls = this.extractNestedReplies(comment.data.replies);

            if (extractRpls && extractRpls.length > 0) {
                result.replies = extractRpls
            }

            return result;
        });

        return topComments;
    };

    extractNestedReplies = (replies: any): CommentData[] | undefined => {
        if (!replies || !replies.data || !replies.data.children) {
            return;
        }

        return replies.data.children
            .filter((reply: any) => reply.data?.body)
            .map((reply: any) => {
                const result: CommentData = {
                    body: reply.data.body,
                    score: reply.data.score,
                    author: reply.data.author,
                    ups: reply.data.ups,
                    downs: reply.data.downs
                };

                const extractRpls = this.extractNestedReplies(reply.data.replies);
                if (extractRpls && extractRpls.length > 0) {
                    result.replies = extractRpls
                }

                return result;
            });
    };

    extractComments = (comments: CommentData[], extractedCommentsArr: string[] = [], seenComments = new Set<string>()): string => {
        comments.forEach(comment => {
            if (!seenComments.has(comment.body)) {
                const body = comment.body;
                seenComments.add(body);
                extractedCommentsArr.push(body);
            }
            if (comment.replies && comment.replies.length > 0) {
                this.extractComments(comment.replies, extractedCommentsArr, seenComments);
            }
        });
        const extractedComments: string = extractedCommentsArr.reduce((accumulator, comm) => {
            return accumulator + comm.toLowerCase().trim() + ' ';
        }, '');
        return extractedComments;
    }

    public extractTags = async (fetchedYoutubeMetadata: any, mediaData: Media, redditData: RedditMedia): Promise<string[]> => {
        const tags = fetchedYoutubeMetadata.snippet?.tags;
        if (!tags || tags === undefined) {
            console.warn('Tags are not present for the following media, generating tags...');
            return await this.generateTags(mediaData, redditData);
        }
        return tags;
    }

    public generateTags = async (mediaData: Media, redditData: RedditMedia): Promise<string[]> => {
        const processingService = new ProcessingService();
        const summaryService = new SummaryService();
        const preprocessedDataForTags: string = processingService.extractAndPreprocessData(mediaData, redditData);
        return await summaryService.generateTags(preprocessedDataForTags);
    }

    public extractAllIds = (extractedMedias:any[]) => {
        return extractedMedias.map((media:any) => media.id);
    }

    static async parallelExtractRedditMedia(fullRedditResponse:any[], multipleRedditVideos: any[], ): Promise<{ mediaData: Media, redditData: RedditMedia }[]> {
        const redditMetadataService = new RedditMetadataSevice();

        const videoPromises: Promise<{ mediaData: Media; redditData: RedditMedia }>[] = multipleRedditVideos.map(async (video: any) => {
            
            const mediaData:Media = redditMetadataService.extractMediaData(video);
            const redditData: RedditMedia = redditMetadataService.extractRedditData(video);
            redditData.comments = redditMetadataService.extractTopComments(fullRedditResponse);
            
            const [tags] = await Promise.all([
                await redditMetadataService.extractTags(video, mediaData, redditData)
            ]);

            mediaData.tags = tags;
            return { mediaData, redditData };
        });

        return await Promise.all(videoPromises);
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

    // static extractTopRedditVideos(
    //     inputEmbeddings: number[][], 
    //     fetchedEmbeddings: number[][], 
    //     extractedVideoData: { mediaData: Media, redditData: RedditMedia }[]
    // ):SimilarRDT[] {
    //     const vecStore = new VectorStore()
    //     const scoredVideos = extractedVideoData.map((videoData, index) => {
    //     const fetchedEmbedding:number[] = fetchedEmbeddings[index];
        
    //     const maxSimilarity = Math.max(
    //         ...inputEmbeddings.map((inputEmbedding:number[]) => 
    //             vecStore.cosineSimilarity(inputEmbedding, fetchedEmbedding)
    //         )
    //     );
        
    //     return {
    //         ...videoData,
    //         similarityScore: maxSimilarity
    //     };
    // });

}