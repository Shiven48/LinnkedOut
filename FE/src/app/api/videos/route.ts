import { getAllMedia } from "../../../server/functions/media";
import { NextResponse } from 'next/server';

export async function GET(
) {
        try {
            const videos = await getAllMedia();
            return NextResponse.json({body:videos},{status:200})
        } catch (error) {
            console.error(error)
            return NextResponse.json({ message: 'Error fetching videos',error}, {status:500});
        }
}