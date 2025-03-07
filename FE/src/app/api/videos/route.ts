import { getLatestVideos } from "../../../server/functions/media";
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
    request:NextRequest
) {
        try {
            const videos = await getLatestVideos();
            return NextResponse.json({body:videos},{status:200})
        } catch (error) {
            console.error(error)
            return NextResponse.json({ message: 'Error fetching videos',error}, {status:500});
        }
}