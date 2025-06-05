// import { NextResponse } from 'next/server';
// import { Media, YoutubeMedia } from '@/services/common/types';
// import { getMediaFromRedditById, getAllMediaWherePlatformReddit } from '@/server/functions/media';

// export interface MytempData { mediaData: Media | null, youtubeData: YoutubeMedia | null }
// export async function GET(
// ) {
//     try {
//         const response = await getAllMediaWherePlatformReddit();
//         const response = await getMediaFromRedditById(8);
//         return NextResponse.json({ body:response, status: 200});       
//     } catch (error: any) {
//         console.error("Caught error in GET handler:", error.message);
//         return new NextResponse(
//             JSON.stringify({ message: 'Error fetching videos', error: error.message }),
//             { status: 500, headers: { 'Content-Type': 'application/json' } }
//         );
//     }
// }

// import { getAllMedia } from '@/server/functions/media';
// import { Media } from '@/services/common/types';
// import { NextResponse } from 'next/server';
// export async function GET() {
//     try {
//         const response:Media[] = await getAllMedia();
//         return NextResponse.json({ body:response, status: 200});       
//     } catch (error: any) {
//         console.error("Caught error in GET handler:", error.message);
//         return new NextResponse(
//             JSON.stringify({ message: 'Error fetching videos', error: error.message }),
//             { status: 500, headers: { 'Content-Type': 'application/json' } }
//         );
//     }
// }

// import { getPaginatedMedia } from '@/app/_components/Server/GetPaginatedMedia';
// import { Media } from '@/services/common/types';
// import { NextRequest, NextResponse } from 'next/server';
// export async function GET(request:NextRequest) {
//     try {
//         const response:Media[] = await getPaginatedMedia();
//         const titles:string[] = response.map(media => {
//             return media.title;
//         })
//         return NextResponse.json({ body:titles, status: 200});       
//     } catch (error: any) {
//         console.error("Caught error in GET handler:", error.message);
//         return new NextResponse(
//             JSON.stringify({ message: 'Error fetching videos', error: error.message }),
//             { status: 500, headers: { 'Content-Type': 'application/json' } }
//         );
//     }
// }