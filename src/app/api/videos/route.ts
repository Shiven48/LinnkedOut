import { getAllMedia } from "../../../server/functions/media";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId)
      return NextResponse.json(
        { message: "Error fetching videos", error: "unauthorised" },
        { status: 401 }
      );

    const videos = await getAllMedia(0, userId);
    return NextResponse.json({ body: videos }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Error fetching videos", error },
      { status: 500 }
    );
  }
}
