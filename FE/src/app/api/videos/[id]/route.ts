import { getFromMediaById } from "@/server/functions/media";
import { NextRequest, NextResponse } from "next/server";
import { Media } from "@/services/common/types";
import { auth } from "@clerk/nextjs/server";

export async function GET(
  request: NextRequest,
  {
    params,
  }: {
    params: {
      id: string;
    };
  }
) {
  const { userId } = await auth();
  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { id } = await params;
  const videoId = parseInt(id);
  try {
    let fetchedVideo: Media = await getFromMediaById(videoId, userId);
    if (!fetchedVideo) {
      throw new Error(`Cannot get video from media by ${videoId}!`);
    }
    return NextResponse.json({ body: fetchedVideo, status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Error fetching videos", error },
      { status: 500 }
    );
  }
}
