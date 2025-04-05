import { NextResponse } from "next/server";
import { HelperFunctions } from "../lib/helper_funcs";
import { Media, TwitterMedia} from "../../types";
import { insertMedia, insertTwitterMedia } from "../server/functions/media";

export const fetchVideoFromTwitterURL = async (link:string) => {
    try {
        const tweetId = HelperFunctions.parseTwitterEmbeddedLink(link);
        if(!process.env.TWITTER_BEARER_TOKEN){
            return new Error('Unable to fetch twitter environment keys') 
        }
        const twitterAuthToken = process.env.TWITTER_BEARER_TOKEN;
        const fetchedTweet = await fetch(`https://api.twitter.com/2/tweets/${tweetId}?tweet.fields=text,attachments&expansions=attachments.media_keys,author_id&media.fields=url,type,duration_ms&user.fields=username`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${twitterAuthToken}`,
            },
          });

        if (!fetchedTweet.ok) {
            const errorBody = await fetchedTweet.text()
            .catch(e => 'Failed to parse error response');
            
            console.error('Twitter API error details:', {
                status: fetchedTweet.status,
                statusText: fetchedTweet.statusText,
                body: errorBody
            });
            throw new Error(`Twitter API error: ${fetchedTweet.status} ${fetchedTweet.statusText}. Details: ${errorBody}`)
        }
        console.log(`Tweet Fetched Successfully: ${fetchedTweet}`)
        const tweetMetadata = await fetchedTweet.json();

        const savedData = saveTweetToDatabase(tweetMetadata)
        if (!savedData) { 
            return NextResponse.json({ message: 'Error saving to the database' }, { status: 500 }); 
        }
        return savedData
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export const saveTweetToDatabase = async (tweetMetaData:any) => {
    const { data, includes } =  tweetMetaData
    const { text,id } = data
    
    const mediaItem = includes?.media?.[0];
        if (!mediaItem) {
            throw new Error('No media found in tweet');
        }    
    const { media_key, type, url } = mediaItem;
    const { duration_ms } = mediaItem
    const duration = duration_ms || ''
    const username = includes?.users?.[0]?.username || 'unknown_user';

    if (!data) {
        throw new Error('No video data found in the twitter response')
    };

    const currentTimestamp = new Date().toISOString();

    const media:Media = {
        type: type,
        platform: 'twitter',
        createdAt: currentTimestamp,
        updatedAt: currentTimestamp,
        thumbnailUrl: url,
        title: text,
        duration_ms: duration || ''
    }

    const returnedMedia = await insertMedia(media);
    console.log(`inserted Media : ${returnedMedia}`)
    const mediaId = returnedMedia[0].id;  

    const tMedia:TwitterMedia = {
        mediaId: mediaId,
        tweetId: id,
        text: text,
        tweet_media_key: media_key, 
        media_url: url,
        username: username,
        duration_ms: duration || '',
    }

    const returnedTwitterMedia = await insertTwitterMedia(tMedia);
    console.group(`inserted twitter media`)
    return returnedTwitterMedia;
}