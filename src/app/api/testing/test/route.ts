import { YoutubeAPIService } from "@/services/platform/youtube/YoutubeAPIService";
import { NextResponse } from "next/server";

export async function GET() {
  const service = new YoutubeAPIService();
  const result = await service.fetchVideoMetadata(`VQALybIKQ4U`);
  return NextResponse.json(result);
}
