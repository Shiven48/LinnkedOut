import { NextResponse } from "next/server";
import { Media } from "@/services/common/types";
import {
  getAllMediaWherePlatformReddit,
  getAllMediaWherePlatformYoutube,
} from "@/server/functions/media";
import { auth } from "@clerk/nextjs/server";

export async function GET(
  request: Request,
  { params }: { params: { platform: string } }
) {
  const { userId } = await auth();
  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const offset = Number(searchParams.get("offset")) || 0;

  const { platform } = await params;
  if (!platform) {
    return NextResponse.json(
      { message: "Platform parameter is required" },
      { status: 400 }
    );
  }

  const trimmedPlatfrom = platform.toLowerCase().trim();
  let videos: Media[];
  try {
    if (trimmedPlatfrom === "youtube") {
      videos = await getAllMediaWherePlatformYoutube(userId, offset);
    } else if (trimmedPlatfrom === "reddit") {
      videos = await getAllMediaWherePlatformReddit(userId, offset);
      // console.log(`Testing redditMedia: ${videos}`)
    } else {
      return NextResponse.json(
        { error: "Unsupported platform" },
        { status: 400 }
      );
    }

    if (videos && Array.isArray(videos) && videos.length > 0) {
      return NextResponse.json({ body: videos }, { status: 200 });
    }
    return NextResponse.json(
      { body: [], message: "No videos found" },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Error fetching videos", error },
      { status: 500 }
    );
  }
}
