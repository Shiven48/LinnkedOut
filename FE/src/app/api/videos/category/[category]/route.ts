import { NextResponse } from "next/server";
import { Media } from "@/services/common/types";
import { getMediaByCategory } from "@/server/functions/media";
import { auth } from "@clerk/nextjs/server";

export async function GET(
  _request: Request,
  { params }: { params: { category: string } }
) {
  const { category } = await params;
  const decodedCategory = decodeURIComponent(category);
  if (!category) {
    return NextResponse.json(
      { message: "Platform parameter is required" },
      { status: 400 }
    );
  }

  try {
    const { userId } = await auth();
    if (!userId)
      return NextResponse.json(
        { message: "Error fetching videos", error: "unauthorised" },
        { status: 401 }
      );

    const videos: Media[] = await getMediaByCategory(
      decodedCategory,
      0,
      userId
    );
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
