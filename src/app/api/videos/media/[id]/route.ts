import { getMediaById } from "@/server/functions/media";
import { NextRequest, NextResponse } from "next/server"

export async function GET(
    request: NextRequest,
    { params } : { params : {id :string}}
) {
    const { id } = await(params)
    const videoId = parseInt(id) 
    try {
        const fetchedVideobyId = await getMediaById(videoId)
        return NextResponse.json(fetchedVideobyId[0])
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}