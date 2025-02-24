// import { NextApiRequest, NextApiResponse } from 'next';
import { fetchVideoFromYoutubeURL } from '../../../services/youtubeService';
import { Helper } from '../../_lib/helper_data';
import { NextRequest, NextResponse } from 'next/server';
import { fetchVideoFromTwitterURL } from '../../../services/twitterService';
import { fetchVideoFromRedditURL } from '../../../services/redditService';

export async function GET(
    req: NextRequest
) {
    try {
        const mappedVideo = await fetchVideoFromYoutubeURL(Helper.Resources()[2].link)   // ->    For Youtube
        // const mappedVideo = await fetchVideoFromTwitterURL(Helper.Resources()[6].link)      // ->    For Twitter
        // const mappedVideo = await fetchVideoFromRedditURL(Helper.Resources()[5].link)    // ->    For Reddit
        console.log(mappedVideo)
        return NextResponse.json(mappedVideo);
    } catch (error: any) {
        console.error("Caught error in GET handler:", error.message);
        return new NextResponse(
            JSON.stringify({ message: 'Error fetching videos', error: error.message }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
}