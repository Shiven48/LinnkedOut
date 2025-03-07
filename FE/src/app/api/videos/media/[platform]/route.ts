import { getAllMediaFromReddit, getAllMediaFromTwitter, getAllMediaFromYoutube } from '@/server/functions/media';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
    request: NextRequest,
    { params }: {
        params: {
            platform: string
        }
    }
) {
    const { platform } = params
    if (!platform) {
        return NextResponse.json({ message: 'Platform parameter is required' }, { status: 400 });
    }
    const trimmedPlatfrom = platform.toLowerCase().trim();
    try {
        if (!platform) throw new Error('Invalid platform!')
            
        let videos;    
        if (trimmedPlatfrom === 'youtube') {
            videos = await getAllMediaFromYoutube();
        }
        else if (trimmedPlatfrom === 'reddit') {
            videos = await getAllMediaFromReddit();
        }
        else if (trimmedPlatfrom === 'twitter') {
            videos = await getAllMediaFromTwitter();
        }

        if(!videos || Array.isArray(videos) && Array.length === 0){
            return NextResponse.json({ body: [], message: 'No videos found' }, { status: 200 });
        }
        return NextResponse.json({body:videos},{status:200})
    } catch (error) {
        console.error(error)
        return NextResponse.json({ message: 'Error fetching videos', error }, { status: 500 });
    }
}