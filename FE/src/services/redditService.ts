import { CommentData, Media, RedditComment, RedditMedia } from "../../types";
import { HelperFunctions } from "../lib/helper_funcs"
import { insertMedia, insertRedditMedia } from "../server/functions/media";
import { NextResponse } from "next/server";
import { contentVectorStore } from "./contentVectorStore";
import EmbeddingGenerator from "./EmbeddingGeneratorService";
import { Helper } from "@/lib/helper_data";

export const fetchVideoFromRedditURL = async (embeddedLink: string) => {
    try {
        const redditId = HelperFunctions.parseRedditLinkForId(embeddedLink);
        const subreddit = HelperFunctions.parseRedditLinkForSubreddit(embeddedLink);

        if (!process.env.REDDIT_BEARER_TOKEN) {
            throw new Error('Unable to fetch Reddit bearer token');
        }
        const redditAuthToken = process.env.REDDIT_BEARER_TOKEN;
        const fetchedRedditPost = await fetch(`https://oauth.reddit.com/r/${subreddit}/comments/${redditId}.json`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${redditAuthToken}`,
            },
        });
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
        const mediaData:Media = await extractMediaData(fetchedRedditMetaData);
        const redditData:RedditMedia = await extractRedditData(fetchedRedditMetaData);
        redditData.comments = await extractTopComments(fetchedRedditMetaData);

        // Saving the video embeddings in the database
        const embeddingsId:number = await storeEmbeddings(mediaData, redditData)
        if (!embeddingsId) {
            return NextResponse.json({ message: 'Error saving embeddings to the database' }, { status: 500 });
        }
        mediaData.embeddingId = embeddingsId;
        
        // Saving the video metadata in the database
        const metaDataId:number = await saveRedditPostToDatabase(mediaData, redditData);
        if (metaDataId === undefined || metaDataId === null || isNaN(metaDataId) || metaDataId <= 0) {
            return NextResponse.json({ message: 'Error saving metadata to the database' }, { status: 500 });
        }
        
        console.log('Inserted all data successfully')
        return { videoMetadataId:metaDataId, embeddingsId: embeddingsId }
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
    redditData.id = mediaId;

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

export const extractComments = (comments: CommentData[], extractedCommentsArr: string[] = [], seenComments = new Set<string>()): string => {
    comments.forEach(comment => {
      if (!seenComments.has(comment.body)) {
        const body = comment.body;
        seenComments.add(body);
        extractedCommentsArr.push(body);
      }
      if (comment.replies && comment.replies.length > 0) {
        extractComments(comment.replies, extractedCommentsArr, seenComments);
      }
    });
    
    const extractedComments:string = extractedCommentsArr.reduce((accumulator, comm) => {
        return accumulator + comm.toLowerCase().trim() + ' ';
    }, '');
    return extractedComments;
  }

export const storeEmbeddings = async(mediaData:Media, redditData:RedditMedia):Promise<number> => {
    const vectorStore = new contentVectorStore();
    const embeddingGenerator = new EmbeddingGenerator();

    try{
        // initialize the category embeddings and store them in cache
        const categoryEmbeddings:Record<string, number[]> = await embeddingGenerator.initializeEmbeddings(Helper.categoryDefinitions)
        console.log("Categories available for classification:", Object.keys(categoryEmbeddings));
        
        const preprocessedContent: string = await embeddingGenerator.extractAndPreprocessData(mediaData, redditData);
        if (!preprocessedContent) throw new Error("Preprocessing failed: content is undefined or empty");

        const contentEmbeddings: number[] = await embeddingGenerator.generateEmbeddings(preprocessedContent);
        if (!Helper.categoryDefinitions || Object.keys(Helper.categoryDefinitions).length === 0) {
            throw new Error("Category definitions are empty");
        }
        console.log(`Found ${Object.keys(Helper.categoryDefinitions).length} category definitions`);
        const assignedCategory = vectorStore.classifyEmbedding(contentEmbeddings, categoryEmbeddings);
        mediaData.category = assignedCategory;

        const embeddingIdInDatabase:number = await vectorStore.storeContent(preprocessedContent, contentEmbeddings, assignedCategory)
        return embeddingIdInDatabase;
    } catch (error) {
        console.error("Error in storeEmbeddings:", error);
        throw error;
    }
}

// For later implementation
// export function getAccessToken():Promise<string> {
//     try{
//         await fetch(`https://www.reddit.com/api/v1/access_token`,{ 
//             method: 'GET', 
//             headers: { 
//                 'Content-Type': 'application/json',
//                 User-Agent                    
//             } 
//         });
//     } catch(error:any){
//         throw new Error('Error while getting token',error)
//     }
//         return new Promise<string>(resolve => resolve(`Here for access token`))
//                     .then((message:string) => message);
// }