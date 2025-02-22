import { HelperFunctions } from "../../src/app/_lib/helper_funcs";
import { Media, YoutubeMedia } from "../../types";
import { NextResponse } from "next/server"
import { insertMedia, insertYoutubeMedia } from "../server/functions/media";

export const fetchVideoFromYoutubeURL = async (link:string) => {
    try {
        const videoId = HelperFunctions.parseYoutubeEmbeddedLink(link);
        if(!process.env.YOUTUBE_API_KEY){
            return NextResponse.json({message:'Unable to fetch environment keys'},{status:400}) 
        }
        const youtubeKey = process.env.YOUTUBE_API_KEY;
        const fetchedVideo = await fetch(`https://www.googleapis.com/youtube/v3/videos?id=${videoId}&key=${youtubeKey}&part=snippet,contentDetails,statistics,status`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          });
        if (!fetchedVideo.ok) {
            return NextResponse.json({message:'Unable to fetch video metadata'},{status:400}) 
        }
        const videoMetaData = await fetchedVideo.json();
        // if (!videoData || !videoData.items || videoData.items.length === 0) {
        //     return NextResponse.json({ message: 'No video data found' }, { status: 404 });
        // }
        // const savedVideo = await saveYoutubeVideoToDatabase(videoMetaData);
        // return NextResponse.json({ message: 'Video saved successfully', video: videoMetaData },  { status: 200 });
        return saveToDatabase(videoMetaData)
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export const saveToDatabase = async (videoMetaData:any) => {
    const { items } = videoMetaData;
    const video = items[0]
    
    if (!video || video.length === 0) {
        throw new Error('No video data found in the YouTube response');
    }

    const { id } = video
    const { title, description, thumbnails, tags } = video.snippet
    const { duration, definition, caption } = video.contentDetails

    const mappedData:YoutubeMedia = {
        videoId:id,
        title: title,
        description: description,
        thumbnailUrl: thumbnails.default.url,
        thumbnailMediumUrl: thumbnails.medium.url,
        thumbnailHighUrl: thumbnails.high.url,
        duration: duration,
        definition: definition,
        hasCaption: caption,
        tags: tags
    }

    const currentTimestamp = new Date().toISOString();
    // Insert media first 
    const media:Media = {
        type: 'video', // temporary
        platform: 'youtube',
        createdAt: currentTimestamp,
        updatedAt: currentTimestamp
    }

    const returnedMedia = await insertMedia(media);
    console.log(`inserted Media`)
    const mediaId = returnedMedia[0].id;  

    const ytMedia:YoutubeMedia = {
        mediaId: mediaId,
        videoId: mappedData.videoId,
        title: mappedData.title,
        description: mappedData.description,
        thumbnailUrl: mappedData.thumbnailUrl,
        thumbnailMediumUrl: mappedData.thumbnailMediumUrl,
        thumbnailHighUrl: mappedData.thumbnailHighUrl,
        duration: mappedData.duration,
        definition: mappedData.definition,
        hasCaption: mappedData.hasCaption,
        tags: mappedData.tags || [],
    }

    const returnedYoutubeMedia = await insertYoutubeMedia(ytMedia);
    console.group(`inserted youtube media`)
    return returnedYoutubeMedia;
}