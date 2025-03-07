// API Route to fetch video metadata from YouTube
import { HelperFunctions } from "../../src/app/_lib/helper_funcs"; 
import { Media, YoutubeMedia } from "../../types"; 
import { NextResponse } from "next/server"; 
import { insertMedia, insertYoutubeMedia } from "../server/functions/media"; 
import { revalidatePath } from "next/cache"; 

export const fetchVideoFromYoutubeURL = async (link: string) => { 
    try { 
        const videoId = HelperFunctions.parseYoutubeEmbeddedLink(link); 
        if (!videoId) { 
            return NextResponse.json({ message: 'Unable to fetch videoId' }, { status: 500 }); 
        }
        
        if (!process.env.YOUTUBE_API_KEY) { 
            return NextResponse.json({ message: 'Unable to fetch environment keys' }, { status: 400 }); 
        }
        
        const youtubeKey = process.env.YOUTUBE_API_KEY;
        const fetchedVideo = await fetch(
            `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&key=${youtubeKey}&part=snippet,contentDetails,statistics,status`,
            { method: 'GET', headers: { 'Content-Type': 'application/json' } }
        );
        
        if (!fetchedVideo.ok) { 
            return NextResponse.json({ message: 'Unable to fetch video metadata' }, { status: 400 }); 
        }
        
        const videoMetaData = await fetchedVideo.json();
        
        const savedData = await saveToDatabase(videoMetaData)
        if (!savedData) { 
            return NextResponse.json({ message: 'Error saving to the database' }, { status: 500 }); 
        }
        
        revalidatePath('/'); 
        return savedData
    } catch (error) { 
        console.error(error); 
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 }); 
    } 
};

export const saveToDatabase = async (videoMetaData:any) => {
    const { items } = videoMetaData;
    const video = items[0]
    
    if (!video || video.length === 0) {
        throw new Error('No video data found in the YouTube response');
    }

    // Destructure the video data
    const { id } = video
    const { title, description, thumbnails, tags } = video.snippet
    const { duration, definition, caption } = video.contentDetails

    // Map the data to YoutubeMedia object
    const mappedData:YoutubeMedia = {
        videoId:id,
        title: title,
        description: description,
        thumbnailUrl: thumbnails.default.url,
        thumbnailMediumUrl: thumbnails.medium.url,
        thumbnailHighUrl: thumbnails.high.url,
        thumbnailMaxRes: thumbnails.maxres.url,
        duration: duration,
        definition: definition,
        hasCaption: caption,
        tags: tags
    }
    
    // Map the data to Media object
    const media:Media = {
        type: 'video', // temporary
        platform: 'youtube',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        thumbnailUrl: mappedData.thumbnailUrl || '',
        hdThumbnailUrl: mappedData.thumbnailMaxRes || ''
    }

    const returnedMedia = await insertMedia(media);
    console.log(`inserted Media`)
    const mediaId = returnedMedia[0].id;  

    // Mapping the data from mappedData to ytMedia
    const ytMedia:YoutubeMedia = {
        mediaId: mediaId,
        videoId: mappedData.videoId,
        title: mappedData.title,
        description: mappedData.description,
        thumbnailUrl: mappedData.thumbnailUrl,
        thumbnailMediumUrl: mappedData.thumbnailMediumUrl,
        thumbnailHighUrl: mappedData.thumbnailHighUrl,
        thumbnailMaxRes: mappedData.thumbnailMaxRes,
        duration: mappedData.duration,
        definition: mappedData.definition,
        hasCaption: mappedData.hasCaption,
        tags: mappedData.tags || [],
    }

    const returnedYoutubeMedia = await insertYoutubeMedia(ytMedia);
    console.group(`inserted youtube media`)
    return returnedYoutubeMedia;
}