import { NextResponse } from "next/server";
import { Media } from "../../../../../../types";
import { getAllMediaFromReddit, getAllMediaFromYoutube } from "@/server/functions/media";

export async function GET(
    _request: Request,
    { params }: { params: { platform: string } }
  ) {
    const { platform } = await params;
    if (!platform) {
        return NextResponse.json({ message: 'Platform parameter is required' }, { status: 400 });
    }

    const trimmedPlatfrom = platform.toLowerCase().trim();
    let videos:Media[];    
    try {            
        if (trimmedPlatfrom === 'youtube') {
            videos = await getAllMediaFromYoutube();
        }
        else if (trimmedPlatfrom === 'reddit') {
            videos = await getAllMediaFromReddit();
        } else {
            return NextResponse.json({ error: 'Unsupported platform' }, { status: 400 });
        }

        if(videos && Array.isArray(videos) && videos.length > 0){
            return NextResponse.json({body: videos},{status:200})
        }
        return NextResponse.json({ body: [], message: 'No videos found' }, { status: 201 });
    } catch (error) {
        console.error(error)
        return NextResponse.json({ message: 'Error fetching videos', error }, { status: 500 });
    }
}
  