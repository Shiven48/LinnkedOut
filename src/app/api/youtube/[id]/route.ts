import { HelperFunctions } from "@/src/app/(ROOT)/_lib/helper_funcs";
import { NextRequest, NextResponse } from "next/server"

export async function GET(
    request: NextRequest,
    { params } : { params : {id : string}}
) {
    try {
        const { id } = HelperFunctions.fetchURL();
        const fetchedVideo = await fetch(`https://www.googleapis.com/youtube/v3/videos?id=${id}&key=${process.env.YOUTUBE_API_KEY}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          });
        const data = await fetchedVideo.json();
        return NextResponse.json(data)
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}