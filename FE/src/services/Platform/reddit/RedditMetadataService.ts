import { CommentData, Media, RedditComment, RedditMedia } from "@/services/common/types";

export class RedditMetadataSevice {

    extractMediaData = async (redditPostMetaData:any):Promise<Media> => {
        const postData = redditPostMetaData[0].data.children[0].data;  
        const { title, post_hint, id, media, preview } = postData;
        
        const resolutions = preview?.images[0]?.resolutions || [];
        const thumbnailUrl = Array.isArray(resolutions) && resolutions.length
                        ? resolutions[resolutions.length - 1].url
                        : undefined;
       
        const { fallback_url, duration } = media?.reddit_video || {};
        const parsedThumbnailUrl = thumbnailUrl ? this.parseImage(thumbnailUrl) : undefined;
        const durationMs:number = this.parseDuration(duration)
        
        return {
            type: this.getType(post_hint),
            platform: 'reddit',
            thumbnailUrl: parsedThumbnailUrl,
            postUrl: fallback_url || '',
            title: title,
            durationMs: durationMs!,
            postId: id
        };
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

    getType(post_hint: string): "short" | "image" | "video" | "photo" {
        console.log(post_hint)
        if (post_hint === 'hosted:video') {
            return 'video';
        } else if (post_hint === 'hosted:image' || post_hint === 'photo' || post_hint === 'image') {
            return 'image';
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

    extractRedditData = async(redditPostMetaData: any): Promise<RedditMedia> => {
        const postData = redditPostMetaData[0].data.children[0].data;  
        const { subreddit, author, permalink } = postData;
        
        return {
            subreddit: subreddit,
            author: author,
            postLink: `https://reddit.com${permalink}`
        };
    }

    extractTopComments = async (data: any) => {
        const comments: RedditComment[] = data[1]?.data?.children || [];
    
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
        
            if(extractRpls && extractRpls.length > 0) {
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
                const result: CommentData  = {
                    body: reply.data.body,
                    score: reply.data.score,
                    author: reply.data.author,
                    ups: reply.data.ups,
                    downs: reply.data.downs
                };
    
                const extractRpls = this.extractNestedReplies(reply.data.replies);
                if(extractRpls && extractRpls.length > 0) {
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
    const extractedComments:string = extractedCommentsArr.reduce((accumulator, comm) => {
        return accumulator + comm.toLowerCase().trim() + ' ';
    }, '');
    return extractedComments;
  }

}