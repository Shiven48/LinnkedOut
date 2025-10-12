import { getAllMedia } from "../../../server/functions/media";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export async function GET(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const offset = Number(searchParams.get("offset")) || 0;

  try {
    const videos = await getAllMedia(userId, offset);
    return NextResponse.json({ body: videos }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Error fetching videos", error },
      { status: 500 }
    );
  }
}
