import { getFromMediaById } from '@/server/functions/media'
import { NextRequest, NextResponse } from "next/server"
import { Media } from '../../../../../types';

export async function GET(
    request: NextRequest,
    { params } : { params : {
        id :string;
    }}
) {
    const { id } = await(params)
    const videoId = parseInt(id) 
    try {
        let fetchedVideo:Media = await getFromMediaById(videoId); 
        if(!fetchedVideo){
            throw new Error(`Cannot get video from media by ${videoId}!`)
        }
        return NextResponse.json({ body:fetchedVideo, status: 200})
    } catch (error) {
        console.error(error)
        return NextResponse.json({ message: 'Error fetching videos', error }, { status: 500 });
    }
}