import { YoutubeAPIService } from '@/services/Platform/youtube/YoutubeAPIService';
import { YoutubeMetadataSevice } from '@/services/Platform/youtube/YoutubeMetadataService';
import { NextResponse } from 'next/server';

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

export async function GET() {
    try{
        const youtubeAPIService = new YoutubeAPIService();
        const youtubeMetadataService = new YoutubeMetadataSevice();
        
        const link = 'https://youtu.be/Ko6yct5To40?si=ZTZtJUZGpJ4_Ksu7'; 
        const videoId = youtubeAPIService.parseVideoId(link);
        const fetchedYoutubeMetadata = await youtubeAPIService.fetchVideoMetadata(videoId);
        const mediaData = youtubeMetadataService.extractMediaData(fetchedYoutubeMetadata);
        const youtubeData = await youtubeMetadataService.extractYoutubeData(fetchedYoutubeMetadata);
        mediaData.tags = await youtubeMetadataService.extractTags(fetchedYoutubeMetadata, mediaData, youtubeData);
        return NextResponse.json({body: { mediaData, youtubeData }, status: 200})
    } catch(error:any) {
        console.error("Caught error in GET handler:", error.message);
        return new NextResponse(
            JSON.stringify({ message: 'Error fetching videos', error: error.message }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
}