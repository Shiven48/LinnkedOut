import { FormDataType } from '@/app/_components/shared/PostInputForm';
import { HelperFunctions } from '@/lib/helper_funcs';
import { Media, YoutubeMedia } from '@/services/common/types';
import { utility } from '@/services/common/utils';
import { YoutubeAPIService } from '@/services/Platform/youtube/YoutubeAPIService';
import { YoutubeMetadataSevice } from '@/services/Platform/youtube/YoutubeMetadataService';
import { YoutubeTranscriptService } from '@/services/Platform/youtube/YoutubeTranscriptionService';
import { NextRequest, NextResponse } from 'next/server';

// export async function GET() {
//     try{
//         const scheduler = new RedditExternalSchedular(redis);
//         await scheduler.refreshToken();
        
//         const token = await scheduler.getValidToken();
//         console.log('Fetched token from Redis:', token);
        
//         return NextResponse.json({ message: token, status: 200}) 
//     } catch(error:any) {
//         console.error("Caught error in GET handler:", error.message);
//         return new NextResponse(
//             JSON.stringify({ message: 'Error fetching videos', error: error.message }),
//             { status: 500, headers: { 'Content-Type': 'application/json' } }
//         );
//     }
// }

// for Reddit tags
// export async function GET() {
//     try{
//         const youtubeAPIService = new YoutubeAPIService();
//         const youtubeMetadataService = new YoutubeMetadataSevice();
        
//         const link = 'https://youtu.be/Ko6yct5To40?si=ZTZtJUZGpJ4_Ksu7'; 
//         const videoId = youtubeAPIService.parseVideoId(link);
//         const fetchedYoutubeMetadata = await youtubeAPIService.fetchVideoMetadata(videoId);
//         const mediaData = youtubeMetadataService.extractMediaData(fetchedYoutubeMetadata);
//         const youtubeData = await youtubeMetadataService.extractYoutubeData(fetchedYoutubeMetadata);
//         mediaData.tags = await youtubeMetadataService.extractTags(fetchedYoutubeMetadata, mediaData, youtubeData);
//         return NextResponse.json({body: { mediaData, youtubeData }, status: 200})
//     } catch(error:any) {
//         console.error("Caught error in GET handler:", error.message);
//         return new NextResponse(
//             JSON.stringify({ message: 'Error fetching videos', error: error.message }),
//             { status: 500, headers: { 'Content-Type': 'application/json' } }
//         );
//     }
// }

// For reddit tags
// export async function GET() {
//     try{
//         const redditAPIService = new RedditAPIService();
        
//         const link = 'https://www.reddit.com/r/ShinChan/comments/1j46wnx/what_is_this/?utm_source=share&utm_medium=mweb3x&utm_name=post_embed&utm_term=1&utm_content=1'; 
//         const videoId = redditAPIService.parseRedditUrlForId(link);
//         const subreddit = redditAPIService.parseRedditUrlForSubreddit(link);
//         const fetchedRedditMetadata = await redditAPIService.fetchVideoMetadata(subreddit, videoId);

//         // const mediaData = youtubeMetadataService.extractMediaData(fetchedYoutubeMetadata);
//         // const youtubeData = await youtubeMetadataService.extractYoutubeData(fetchedYoutubeMetadata);
//         // mediaData.tags = await youtubeMetadataService.extractTags(fetchedYoutubeMetadata, mediaData, youtubeData);
//         return NextResponse.json({body: fetchedRedditMetadata, status: 200})
//     } catch(error:any) {
//         console.error("Caught error in GET handler:", error.message);
//         return new NextResponse(
//             JSON.stringify({ message: 'Error fetching videos', error: error.message }),
//             { status: 500, headers: { 'Content-Type': 'application/json' } }
//         );
//     }
// }

// For captions
// export async function GET() {
//     try{
//         const link = `https://youtube.com/shorts/I22DE7Hw8fY?si=pEZdvhEPVJ22_eSP`;
//         const { mediaData, youtubeData } = await tp(link);
//         return NextResponse.json({body: { mediaData, youtubeData }, status: 200})
//     } catch(error:any){
//         console.error(`Failed to transcribe the video`,error)
//         return NextResponse.json({message:`Failed to transcribe the video`, status: 500});
//     }
// }

// export async function POST(
//     request: NextRequest
// ) {
//     try{
//         const formContents:FormDataType = await request.json();
//         // const result:Media[] = await HelperFunctions.RootOrchestrator(formContents);
//         const result = await HelperFunctions.RootOrchestrator(formContents);
//         return NextResponse.json({
//             body: result,
//             length: result.length,      
//             status: 200
//         })
//     } catch(error: any){
//         console.error("Caught error in POST handler:", error);
//         return new NextResponse(
//             JSON.stringify({ message: 'Error saving videos', error: error }),
//             { status: 500, headers: { 'Content-Type': 'application/json' } }
//         );
//     }
// }

// const tp = async (link:string):Promise<{mediaData: Media, youtubeData: YoutubeMedia}> => {
//     const youtubeAPIService = new YoutubeAPIService();
//     const youtubeMetadataService = new YoutubeMetadataSevice();
//     const youtubeTranscriptionService = new YoutubeTranscriptService();

//     const videoId = youtubeAPIService.parseVideoId(link);
//     const fetchedYoutubeMetadata = await youtubeAPIService.fetchVideoMetadata(videoId);
    
//     const mediaData = youtubeMetadataService.extractMediaData(fetchedYoutubeMetadata);
//     const youtubeData = await youtubeMetadataService.extractYoutubeData(fetchedYoutubeMetadata);
//     youtubeData.englishCaptions = await youtubeTranscriptionService.fetchTranscript(videoId, mediaData.title);
//     return {
//         mediaData,
//         youtubeData
//     }
// }

export async function GET() {
    const service = new YoutubeAPIService();
    const result = await service.fetchVideoMetadata(`VQALybIKQ4U`)
    
    // TEST 1: Simple query with medium duration
    // console.log('=== TEST 1: Simple Query ===');
    // const simpleContent = await ser.testSimpleSearch("javascript event loop");
    // console.log('Simple search results:', simpleContent.length);
    
    // TEST 2: If simple works, try advanced
    // if (simpleContent.length > 0) {
    //     console.log('=== TEST 2: Advanced Query ===');
    //     const advancedContent = await ser.getHighQualityTechContent("javascript event loop");
    //     console.log('Advanced search results:', advancedContent.length);
    //     return NextResponse.json({ simple: simpleContent, advanced: advancedContent });
    // }
    
    return NextResponse.json(result);
}