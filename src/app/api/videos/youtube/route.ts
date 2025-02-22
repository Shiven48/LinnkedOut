// import { NextRequest, NextResponse } from "next/server"

// export async function GET(
//     request: NextRequest,
//     { params } : { params : {videoId : string}}
// ) {
//     try {
//         const fetchedVideo = await fetch(`https://www.googleapis.com/youtube/v3/videos?id=${params.videoId}&key=${process.env.YOUTUBE_API_KEY}`, {
//             method: 'GET',
//             headers: {
//               'Content-Type': 'application/json',
//             },
//           });
//         return await fetchedVideo.json();
//     } catch (error) {
//         console.error(error);
//         return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
//     }
// }

// export async function POST(
//     request: NextRequest, 
// ) {
//     try{
        
//     } catch(error){
//         console.error(error)
//         return NextResponse.json({ error: 'Internal Server Error' }, { status:500 });
//     }
// }