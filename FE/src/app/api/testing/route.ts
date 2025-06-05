import { Resources } from '@/services/common/constants';
import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import YoutubeOrchestrator from '@/services/orchestrators/YoutubeOrchestrator'
import RedditOrchestrator from '@/services/orchestrators/RedditOrchestrator';

export async function GET(
) {
    try {
        const youtubeOrchestrator = new YoutubeOrchestrator(); 
        const redditOrchestrator = new RedditOrchestrator();

        // const mappedVideo = await youtubeOrchestrator.mainYoutubeOrchestrator(Resources()[13].link)
        const mappedVideo = await redditOrchestrator.mainRedditOrchestrator(Resources()[3].link)
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