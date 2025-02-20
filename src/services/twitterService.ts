import { NextResponse } from "next/server";
import { HelperFunctions } from "../app/(ROOT)/_lib/helper_funcs";
import { Media, TwitterMedia} from "@/types";
import { insertMedia, insertTwitterMedia } from "../server/functions/media";

export const fetchVideoFromTwitterURL = async (link:string) => {
    try {
        const tweetId = HelperFunctions.parseTwitterEmbeddedLink(link);
        if(!process.env.TWITTER_API_KEY){
            return NextResponse.json({message:'Unable to fetch twitter environment keys'},{status:400}) 
        }
        const youtubeKey = process.env.TWITTER_API_KEY;
        const fetchedTweet = await fetch(`https://api.twitter.com/2/tweets/${tweetId}?tweet.fields=text,created_at,attachments&expansions=attachments.media_keys,author_id&media.fields=url,type,preview_image_url&user.fields=username,profile_image_url`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${youtubeKey}`,
            },
          });
        if (!fetchedTweet.ok) {
            return NextResponse.json({message:'Unable to fetch video metadata'},{status:400}) 
        }
        const tweetMetadata = await fetchedTweet.json();
        // if (!videoData || !videoData.items || videoData.items.length === 0) {
        //     return NextResponse.json({ message: 'No video data found' }, { status: 404 });
        // }
        // const savedVideo = await saveYoutubeVideoToDatabase(videoMetaData);
        // return NextResponse.json({ message: 'Video saved successfully', video: videoMetaData },  { status: 200 });
        return saveTweetToDatabase(fetchedTweet)
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export const saveTweetToDatabase = async (tweetMetaData:any) => {
    const { data, includes } =  tweetMetaData
    const { text,id } = data
    const { media_key, type, url, duration_ms } = includes.media[0]
    const { username } = includes.users[0]

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

    const ytMedia:TwitterMedia = {
        mediaId: mediaId,
        tweetId: id,
        text: text,
        tweet_media_key: media_key, 
        media_url: url,
        username: username,
        duration_ms: duration_ms,
    }

    const returnedYoutubeMedia = await insertTwitterMedia(ytMedia);
    console.group(`inserted youtube media`)
    return returnedYoutubeMedia;
}