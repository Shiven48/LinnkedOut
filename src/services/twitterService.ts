import { HelperFunctions } from "../../src/app/_lib/helper_funcs";
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
        return saveTweetToDatabase(tweetMetadata)
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
    const { media_key, type, url, duration_ms } = mediaItem;
    const username = includes?.users?.[0]?.username || 'unknown_user';

    if (!data) {
        throw new Error('No video data found in the YouTube response')
    };

    const currentTimestamp = new Date().toISOString();

    const media:Media = {
        type: type,
        platform: 'twitter',
        createdAt: currentTimestamp,
        updatedAt: currentTimestamp
    }

    const returnedMedia = await insertMedia(media);
    console.log(`inserted Media`)
    const mediaId = returnedMedia[0].id;  

    const tMedia:TwitterMedia = {
        mediaId: mediaId,
        tweetId: id,
        text: text,
        tweet_media_key: media_key, 
        media_url: url,
        username: username,
        duration_ms: duration_ms,
    }

    const returnedTwitterMedia = await insertTwitterMedia(tMedia);
    console.group(`inserted twitter media`)
    return returnedTwitterMedia;
}


// if (!videoData || !videoData.items || videoData.items.length === 0) {
        //     return NextResponse.json({ message: 'No video data found' }, { status: 404 });
        // }
        // const savedVideo = await saveYoutubeVideoToDatabase(videoMetaData);
        // return NextResponse.json({ message: 'Video saved successfully', video: videoMetaData },  { status: 200 });