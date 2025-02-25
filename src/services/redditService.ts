import { Media, RedditMedia } from "../../types";
import { HelperFunctions } from "../../src/app/_lib/helper_funcs"
import { insertMedia, insertRedditMedia } from "../server/functions/media";

export const fetchVideoFromRedditURL = async (embeddedLink:string) => {
    try {
        const redditId = HelperFunctions.parseRedditEmbeddedLink(embeddedLink);
        if(!process.env.REDDIT_BEARER_TOKEN){
            return new Error(' Unable to fetch reddit bearer token ') 
        }
        const redditAuthToken = process.env.REDDIT_BEARER_TOKEN;
        const fetchedRedditPost = await fetch(`https://oauth.reddit.com/comments/${redditId}.json?limit=1`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${redditAuthToken}`,
            },
          });

        if (!fetchedRedditPost.ok) {
            const errorBody = await fetchedRedditPost.text()
            .catch(e => 'Failed to parse error response');
            
            console.error('Reddit API error details:', {
                status: fetchedRedditPost.status,
                statusText: fetchedRedditPost.statusText,
                body: errorBody
            });
            throw new Error(`Reddit API error: ${fetchedRedditPost.status} ${fetchedRedditPost.statusText}. Details: ${errorBody}`)
        }
        console.log(`Reddit Post Fetched Successfully: ${fetchedRedditPost}`)
        const redditPostMetaData = await fetchedRedditPost.json();
        return saveRedditPostToDatabase(redditPostMetaData)
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export const saveRedditPostToDatabase = async (redditPostMetaData:any) => {
    const postData = redditPostMetaData[0].data.children[0].data;  
    const { subreddit, title, post_hint, id, author, media, preview } = postData
    const { source } = preview?.images[0] || {};  
    const { url: imageUrl, width: imageWidth, height: imageHeight } = source || {};
    const { fallback_url, width: videoWidth, height: videoHeight } = media?.reddit_video || {};

    const currentTimestamp = new Date().toISOString();
    const type = post_hint === 'hosted:video' ? 'video' 
                : post_hint === 'hosted:image' ? 'image'
                : 'photo';

    const parsedImageUrl = parseImage(imageUrl);

    const generalisedMedia:Media = {
        type: type,
        platform: 'reddit',
        createdAt: currentTimestamp,
        updatedAt: currentTimestamp,
        thumbnailUrl: parsedImageUrl
    }
    console.log(generalisedMedia)
    const returnedMedia = await insertMedia(generalisedMedia);
    console.log(`inserted Media`)
    const mediaId = returnedMedia[0].id; 

    const RedditMedia:RedditMedia = {
        mediaId: mediaId,
        subreddit: subreddit,
        title: title,
        type: type,
        redditPostId: id,
        author: author,
        imageUrl: imageUrl,
        imageWidth: imageWidth, 
        imageHeight: imageHeight,
        videoUrl: fallback_url,
        videoWidth: videoWidth,
        videoHeight: videoHeight,
    } 

    const returnedRedditMedia = await insertRedditMedia(RedditMedia);
    console.log(`inserted reddit media`)
    return returnedRedditMedia;
}

export function parseImage(unParsedImageUrl: string): string {
    try {
        return decodeURIComponent(unParsedImageUrl).replace(/&amp;/g, '&');
    } catch (error) {
        console.error("Error parsing image:", error);
        return '';
    }
}
