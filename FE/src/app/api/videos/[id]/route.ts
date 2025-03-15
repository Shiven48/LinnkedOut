import { getFromMediaById, getMediaFromRedditById, getMediaFromYoutubeById } from "@/server/functions/media"
import { NextRequest, NextResponse } from "next/server"
import { RedditMedia, YoutubeMedia } from "@/../../types";

export async function GET(
    request: NextRequest,
    { params } : { params : {
        id :string;
    }}
) {
    const { id } = await(params)
    const videoId = parseInt(id) 
    console.log(`This is the id: ${videoId}`)
    try {
        let fetchedVideobyId :any = await getFromMediaById(videoId);    
        if(!fetchedVideobyId){
            throw new Error(`Cannot get video from media by ${videoId}!`)
        }
        return NextResponse.json({ body:fetchedVideobyId[0], status: 200})
    } catch (error) {
        console.error(error)
        return NextResponse.json({ message: 'Error fetching videos', error }, { status: 500 });
    }
}