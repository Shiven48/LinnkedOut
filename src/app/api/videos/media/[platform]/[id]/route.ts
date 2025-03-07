import { getMediaFromRedditById, getMediaFromTwitterById, getMediaFromYoutubeById } from "@/server/functions/media"
import { NextRequest, NextResponse } from "next/server"
import { RedditMedia, TwitterMedia, YoutubeMedia } from "../../../../../../../types";

export async function GET(
    request: NextRequest,
    { params } : { params : {
        platform :string,
        id :string;
    }}
) {
    const { platform,id } = await(params)
    const videoId = parseInt(id) 
    const trimmedPlatfrom = platform.toLowerCase().trim();
    try {
        if (!platform) throw new Error('Invalid platform!')
            
        let fetchedVideobyId :any;    
        if (trimmedPlatfrom === 'youtube') {
            fetchedVideobyId = await getMediaFromYoutubeById(videoId);
        }
        else if (trimmedPlatfrom === 'reddit') {
            fetchedVideobyId = await getMediaFromRedditById(videoId);
        }
        else if (trimmedPlatfrom === 'twitter') {
            fetchedVideobyId = await getMediaFromTwitterById(videoId);
        }
        if(!fetchedVideobyId){
            throw new Error(`Cannot get video from ${trimmedPlatfrom} by ${videoId}!`)
        }
        console.log(`The video from ${videoId} is ${fetchedVideobyId}`)
        return NextResponse.json({ body:fetchedVideobyId[0], status: 200})
    } catch (error) {
        console.error(error)
        return NextResponse.json({ message: 'Error fetching videos', error }, { status: 500 });
    }
}