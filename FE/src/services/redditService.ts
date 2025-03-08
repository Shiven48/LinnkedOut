import { Media, RedditMedia, Urls } from "../../types";
import { HelperFunctions } from "../../src/app/_lib/helper_funcs"
import { insertMedia, insertRedditMedia } from "../server/functions/media";
import { NextResponse } from "next/server";

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
        const savedData = await saveRedditPostToDatabase(redditPostMetaData)

        if (!savedData) { 
            return NextResponse.json({ message: 'Error saving to the database' }, { status: 500 }); 
        }
        return savedData
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export const saveRedditPostToDatabase = async (redditPostMetaData:any) => {
    // Destructuring the fetched data
    const postData = redditPostMetaData[0].data.children[0].data;  
    const { subreddit, title, post_hint, id, author, media, preview } = postData
    const { source } = preview?.images[0] || {};  

    const resolutions = preview?.images[0]?.resolutions || [];
    const previewHdUrl = resolutions.length ? resolutions[resolutions.length - 1].url : undefined;
    
    const { url: previewImageUrl, width: imageWidth, height: imageHeight } = source || {};
    const { fallback_url, width: videoWidth, height: videoHeight, duration } = media?.reddit_video || {};

    // Mapping the urls that are destructured into the url object
    const urls: Urls = {
        sdUrl: previewImageUrl,
        hdUrl: previewHdUrl
    };

    const currentTimestamp = new Date().toISOString();
    const type = post_hint === 'hosted:video' ? 'video' 
                : post_hint === 'hosted:image' ? 'image'
                : 'photo';

    const parsedImageUrl = parseImage(urls);

    // Mapping the media Object to the data we just destructured
    const generalisedMedia:Media = {
        type: type,
        platform: 'reddit',
        createdAt: currentTimestamp,
        updatedAt: currentTimestamp,
        thumbnailUrl: parsedImageUrl.sdUrl || '',
        hdThumbnailUrl: parsedImageUrl.hdUrl,
        title: title,
        duration_ms: duration
    }
    console.log(generalisedMedia)
    const returnedMedia = await insertMedia(generalisedMedia);
    console.log(`inserted Media`)
    const mediaId = returnedMedia[0].id; 

    // Mapping the Redditmedia Object to the data we just destructured
    const RedditMedia:RedditMedia = {
        mediaId: mediaId,
        subreddit: subreddit,
        title: title,
        type: type,
        redditPostId: id,
        author: author,
        imageUrl: parsedImageUrl.sdUrl || '',
        hdImageUrl: parsedImageUrl.hdUrl || '',
        imageWidth: imageWidth, 
        imageHeight: imageHeight,
        videoUrl: fallback_url,
        videoWidth: videoWidth,
        videoHeight: videoHeight,
        duration_ms: duration || ''
    } 

    const returnedRedditMedia = await insertRedditMedia(RedditMedia);
    console.log(`inserted reddit media`)
    console.log(returnedRedditMedia)
    return returnedRedditMedia;
}

export function parseImage(unParsedImageUrls: Urls): Urls {
    try {
        const parsedUrls: Urls = { ...unParsedImageUrls };
        
        if (parsedUrls.sdUrl) {
            parsedUrls.sdUrl = decodeURIComponent(parsedUrls.sdUrl).replace(/&amp;/g, '&');
        }
        if (parsedUrls.hdUrl) {
            parsedUrls.hdUrl = decodeURIComponent(parsedUrls.hdUrl).replace(/&amp;/g, '&');
        }
        return parsedUrls;
    } catch (error) {
        console.error("Error parsing image:", error);
        return unParsedImageUrls;
    }
}

// For later implementation
export function getAccessToken() {
    console.log(`Here for access token`)
}
