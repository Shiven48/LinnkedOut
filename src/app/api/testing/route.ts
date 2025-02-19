import { NextApiRequest, NextApiResponse } from 'next';
// import { getLatestVideos } from "@/src/server/functions/media";
import { fetchVideoFromYoutubeURL } from '@/src/services/youtubeService';
import { Helper } from '../../(ROOT)/_lib/helper_data';
import { NextResponse } from 'next/server';

export async function GET(
    req: NextApiRequest
) {
    try {
        // just for testing purpose 
        const mappedVideo = await fetchVideoFromYoutubeURL(Helper.Resources()[0].link)
        return NextResponse.json(mappedVideo);
    } catch (error) {
        NextResponse.json({ message: 'Error fetching videos' },{ status: 500});
    }
}