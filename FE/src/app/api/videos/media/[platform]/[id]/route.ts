import { getMediaFromRedditById, getMediaFromYoutubeById } from "@/server/functions/media"
import { NextResponse } from "next/server"
import { RedditMedia, YoutubeMedia } from "@/../../types";

// Union type for either media type
type YoutubeOrReddit = YoutubeMedia | RedditMedia;

function isYoutubeMedia(media: YoutubeOrReddit): media is YoutubeMedia {
    return (media as YoutubeMedia).id !== undefined;
}

function isRedditMedia(media: YoutubeOrReddit): media is RedditMedia {
    return (media as RedditMedia).id !== undefined;
}

export async function GET(
    { params } : { params : {
        platform: string,
        id: string;
    }}
): Promise<NextResponse> {
    const { id, platform } = await(params);
    const videoId = parseInt(id);
    const trimmedPlatform = platform.toLowerCase().trim();
    
    try {
        if (!platform) {
            throw new Error('Invalid platform!');
        }
        
        let fetchedVideo: YoutubeOrReddit | null = null;
        
        if (trimmedPlatform === 'youtube') {
            fetchedVideo = await getMediaFromYoutubeById(videoId);
            if (fetchedVideo && isYoutubeMedia(fetchedVideo)) {
                console.log(fetchedVideo)
                return NextResponse.json(fetchedVideo, { status: 200 });
            }
        }
        else if (trimmedPlatform === 'reddit') {
            fetchedVideo = await getMediaFromRedditById(videoId);
            if(fetchedVideo && isRedditMedia(fetchedVideo)){
                console.log(fetchedVideo)
                return NextResponse.json(fetchedVideo, { status: 200 });
            }
        }
        
        if (!fetchedVideo) {
            throw new Error(`Cannot get video from ${trimmedPlatform} with ID ${videoId}!`);
        }

        throw new Error(`Video doesnt belong to youtube nor reddit!`); 
    } catch (error) {
        console.error(error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        
        return NextResponse.json(
            { message: 'Error fetching videos', error: errorMessage },
            { status: 500 }
        );
    }
}