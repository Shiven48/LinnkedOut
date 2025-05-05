import { Helper } from '@/lib/helper_data';
import { NextRequest, NextResponse } from 'next/server';
import { fetchVideoFromRedditURL } from '@/services/redditService';
import { fetchVideoFromYoutubeURL } from '@/services/youtubeService'
import { revalidatePath } from 'next/cache';

export async function GET(
    req: NextRequest
) {
    try {
        const mappedVideo = await fetchVideoFromYoutubeURL(Helper.Resources()[13].link)        // ->    For Youtube
        // const mappedVideo = await fetchVideoFromRedditURL(Helper.Resources()[7].link)             // ->    For Reddit
        revalidatePath('/'); 
        return NextResponse.json({ body:mappedVideo, status: 200});       
    } catch (error: any) {
        console.error("Caught error in GET handler:", error.message);
        return new NextResponse(
            JSON.stringify({ message: 'Error fetching videos', error: error.message }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
}