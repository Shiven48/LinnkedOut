import { NextRequest, NextResponse } from 'next/server';
import { Media } from '@/../../types';
import { getAllMediaFromYoutube, getAllMediaFromReddit, getMediaByCategory } from '@/server/functions/media';
import { Helper } from '@/lib/helper_data';

export async function GET(
    req: NextRequest
) {
    try {
        const category = 'Decision Making'
        const response = await getAllMediaFromReddit();
        return NextResponse.json({ body:response, status: 200});       
    } catch (error: any) {
        console.error("Caught error in GET handler:", error.message);
        return new NextResponse(
            JSON.stringify({ message: 'Error fetching videos', error: error.message }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
}