import { Resources } from '@/services/common/constants';
import { NextRequest, NextResponse } from 'next/server';
import { FormDataType } from '@/app/_components/shared/PostInputForm';
import { SummaryService } from '@/services/content/summaryService';
import YoutubeOrchestrator from '@/services/orchestrators/YoutubeOrchestrator'
import RedditOrchestrator from '@/services/orchestrators/RedditOrchestrator';
import { RedditMetadataSevice } from '@/services/Platform/reddit/RedditMetadataService';
import { RedditAPIService } from '@/services/Platform/reddit/RedditAPIService';
import { CommentData, RedditComment } from '@/services/common/types';
import { forEach } from 'lodash';

export async function GET(
) {
    try {
        const youtubeOrchestrator = new YoutubeOrchestrator(); 
        const redditOrchestrator = new RedditOrchestrator();
        const apiService = new RedditAPIService();
        const redditMetadataService = new RedditMetadataSevice();

        const mappedVideo = await youtubeOrchestrator.mainYoutubeOrchestrator(Resources()[13].link)
        // const mappedVideo = await redditOrchestrator.mainRedditOrchestrator(Resources()[14].link)
        
        const query = `learning skills graphics programming game engine development opengl vulkan technical skills programming tutorials code implementation software development advanced learning learning skills graphics programming game engine development opengl vulkan technical skills programming tutorials career development technology software development`;
        const redditVideos = await apiService.fetchMultipleRDTVideosFromQuery(query);
        const ids:string[] = redditMetadataService.extractAllIds(redditVideos)
        
        // here fetching comments of 20 videos by their ids 
        const comments:any[] = await apiService.fetchCommentsFromIds(ids);
        const result:CommentData[][] = comments.map((videoComment:any) => {
            // This gives comments of every single video
            return redditMetadataService.extractTopComments(videoComment);
        })

        result.forEach((comment:CommentData[], index) => {
            console.log({index: index, comment: comment})
        })
        
        // This actually lets you fetch the comments of the video -> for e.g 64 comments
        // comments[0].data.children.length
        // fullRedditResponse[1]?.data?.children
        return NextResponse.json(result);
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
        return NextResponse.json({
            body: {
                result
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