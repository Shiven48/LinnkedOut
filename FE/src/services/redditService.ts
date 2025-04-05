import { CommentData, Media, RedditComment, RedditMedia } from "../../types";
import { HelperFunctions } from "../lib/helper_funcs"
import { insertMedia, insertRedditMedia } from "../server/functions/media";
import { NextResponse } from "next/server";

export const fetchVideoFromRedditURL = async (embeddedLink: string) => {
    try {
        const redditId = HelperFunctions.parseRedditLinkForId(embeddedLink);
        const subreddit = HelperFunctions.parseRedditLinkForSubreddit(embeddedLink);

        if (!process.env.REDDIT_BEARER_TOKEN) {
            throw new Error('Unable to fetch Reddit bearer token');
        }
        
        const redditAuthToken = process.env.REDDIT_BEARER_TOKEN;
        
        // Fetching the Reddit post
        const fetchedRedditPost = await fetch(`https://oauth.reddit.com/r/${subreddit}/comments/${redditId}.json`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${redditAuthToken}`,
            },
        });

        // Handle failed fetch or invalid response
        if (!fetchedRedditPost.ok) {
            const errorBody = await fetchedRedditPost.text().catch(e => 'Failed to parse error response');
            console.error('Reddit API error details:', {
                status: fetchedRedditPost.status,
                statusText: fetchedRedditPost.statusText,
                body: errorBody,
            });
            throw new Error(`Reddit API error: ${fetchedRedditPost.status} ${fetchedRedditPost.statusText}. Details: ${errorBody}`);
        }

        const fetchedRedditMetaData = await fetchedRedditPost.json();

        const mediaData = await extractMediaData(fetchedRedditMetaData);
        
        const redditData = await extractRedditData(fetchedRedditMetaData);
        
        redditData.comments = await extractTopComments(fetchedRedditMetaData);
        
        const savedMedia = saveRedditPostToDatabase(mediaData, redditData);     

        if (!savedMedia) {
            return NextResponse.json({ message: 'Error saving to the database' }, { status: 500 });
        }
        return savedMedia
    } catch (error) {
        console.error('Error in fetching Reddit post:', error);
        throw error;
    }
};

export const extractMediaData = async (redditPostMetaData:any):Promise<Media> => {
    const postData = redditPostMetaData[0].data.children[0].data;  
    const { title, post_hint, id, media, preview } = postData;
    
    const resolutions = preview?.images[0]?.resolutions || [];
    const thumbnailUrl = Array.isArray(resolutions) && resolutions.length
                    ? resolutions[resolutions.length - 1].url
                    : undefined;
   
    const { fallback_url, duration } = media?.reddit_video || {};
    const parsedThumbnailUrl = thumbnailUrl ? parseImage(thumbnailUrl) : undefined;
    const durationMs:number = parseDuration(duration)
    
    return {
        type: getType(post_hint),
        platform: 'reddit',
        thumbnailUrl: parsedThumbnailUrl,
        postUrl: fallback_url || '',
        title: title,
        durationMs: durationMs!,
        postId: id
    };
}

export const extractRedditData = async(redditPostMetaData: any): Promise<RedditMedia> => {
    const postData = redditPostMetaData[0].data.children[0].data;  
    const { subreddit, author, permalink } = postData;
    
    return {
        subreddit: subreddit,
        author: author,
        postLink: `https://reddit.com${permalink}`
    };
}

export const extractTopComments = async (data: any) => {
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
        const extractRpls = extractNestedReplies(comment.data.replies);
    
        if(extractRpls && extractRpls.length > 0) {
            result.replies = extractRpls 
        }
    
        return result;
    });
    
    return topComments;
};

export const extractNestedReplies = (replies: any): CommentData[] | undefined => {
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

            const extractRpls = extractNestedReplies(reply.data.replies);
            if(extractRpls && extractRpls.length > 0) {
                result.replies = extractRpls 
            }
            
            return result;
        });
};

export const saveRedditPostToDatabase = async (mediaData:Media, redditData:RedditMedia):Promise<number> => {
    // Inserting into media schema
    const { id:mediaId } = await insertMedia(mediaData);
    redditData.mediaId = mediaId;

    // Inserting into RedditMedia schema
    const { id:redditId } = await insertRedditMedia(redditData);
    return redditId;
}

export function getType(post_hint: string): "short" | "image" | "video" | "photo" {
    if (post_hint === 'hosted:video') {
        return 'video';
    } else if (post_hint === 'hosted:image' || post_hint === 'photo') {
        return 'image';
    } else {
        return 'short';
    }
}

export function parseImage(unParsedImageUrl: string): string {
    try {
        let parsedUrl:string = '';
        if (unParsedImageUrl) {
            parsedUrl = decodeURIComponent(unParsedImageUrl).replace(/&amp;/g, '&');
        }
        return parsedUrl;
    } catch (error) {
        console.error("Error parsing image:", error);
            return unParsedImageUrl;
        }
}
    
export const parseDuration = (duration: string | number): number => {
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

// For later implementation
    
    // export function getAccessToken():Promise<string> {
    //     //     try{
    //         //         await fetch(`https://www.reddit.com/api/v1/access_token`,{ 
    //             //             method: 'GET', 
    //             //             headers: { 
    //                 //                 'Content-Type': 'application/json',
    //                 //                 User-Agent
                    
    //                 //             } 
    //                 //         });
    //                 //     } catch(error:any){
    //                     //         throw new Error('Error while getting token',error)
    //                     //     }
    //                     return new Promise<string>(resolve => resolve(`Here for access token`))
    //                     .then((message:string) => message);
// }