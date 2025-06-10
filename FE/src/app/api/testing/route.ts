import { Resources } from '@/services/common/constants';
import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import YoutubeOrchestrator from '@/services/orchestrators/YoutubeOrchestrator'
import RedditOrchestrator from '@/services/orchestrators/RedditOrchestrator';
import { FormDataType } from '@/app/_components/shared/PostInputForm';
import { HelperFunctions } from '@/lib/helper_funcs';
import { SummaryService } from '@/services/content/summaryService';

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

// {
// "url":[
//  "https://www.youtube.com/live/j79G5Be8Q4Y?si=TAXkOp_HZamZBFmJ"
// ],
// "category":"Learning & Skills",
// "customTags":[
//  "#tokyospliff",
//  "#programming",
//  "#opengl",
//  "#vulkan",
//  "#graphics",
//  "#game",
//  "#gameengine"
// ],
// "fetchSimilar":true,
// "similarityLevel":"high",
// }


export async function POST(
    request: NextRequest
) {
    try{
        const body:FormDataType = await request.json();
        const { url, category, customTags, fetchSimilar, similarityLevel} = body;
        const summaryService = new SummaryService();
        const result:string = await summaryService.generateSearchQuery(category, customTags, similarityLevel);
        // await HelperFunctions.parseLinksForPlatform(url);
        return NextResponse.json({
            body: {
                url,
                category, 
                customTags, 
                fetchSimilar, 
                similarityLevel, 
            }, 
            status: 200
        })
    } catch(error: any){
        console.error("Caught error in POST handler:", error.message);
        return new NextResponse(
            JSON.stringify({ message: 'Error saving videos', error: error.message }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
}