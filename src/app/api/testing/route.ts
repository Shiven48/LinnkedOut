// import { NextApiRequest, NextApiResponse } from 'next';
import { fetchVideoFromYoutubeURL } from '@/src/services/youtubeService';
import { Helper } from '../../(ROOT)/_lib/helper_data';
import { NextRequest, NextResponse } from 'next/server';
import { fetchVideoFromTwitterURL } from '@/src/services/twitterService';
import { fetchVideoFromRedditURL } from '@/src/services/redditService';

export async function GET(
    req: NextRequest
) {
    try {
        // const mappedVideo = await fetchVideoFromYoutubeURL(Helper.Resources()[0].link)   ->    For Youtube
        // const mappedVideo = await fetchVideoFromTwitterURL(Helper.Resources()[4].link)   ->    For Twitter
        const mappedVideo = await fetchVideoFromRedditURL(Helper.Resources()[5].link)    // ->    For Reddit
        return NextResponse.json(mappedVideo);
    } catch (error: any) {
        console.error("Caught error in GET handler:", error.message);
        return new NextResponse(
            JSON.stringify({ message: 'Error fetching videos', error: error.message }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
}