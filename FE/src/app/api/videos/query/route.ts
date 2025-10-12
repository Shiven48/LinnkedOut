import { NextResponse } from "next/server";
import { Media } from "@/services/common/types";
import { getMediaFromQuery } from "@/server/functions/media";
import { auth } from "@clerk/nextjs/server";

export async function GET(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const query: string | null = searchParams.get("query");
    if (!query) throw new Error("No query Parameter found");
    const data: Media[] = await getMediaFromQuery(userId, query);
    if (!data) throw new Error("Error Fetching data from the database");
    return NextResponse.json({ body: data }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Error fetching videos", error },
      { status: 500 }
    );
  }
}
