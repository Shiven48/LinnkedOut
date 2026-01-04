import { NextRequest, NextResponse } from "next/server";
import { YoutubeTranscriptService } from "@/services/platform/youtube/YoutubeTranscriptionService";
import { CaptionItem } from "@/services/common/types";
import { ProcessingService } from "@/services/vector/PreprocessingService";
import { YoutubeAPIService } from "@/services/platform/youtube/YoutubeAPIService";

/**
 * POST /api/transcribe
 * 
 * Fetches transcripts for a given video ID and platform.
 * This endpoint is exposed for use by different services.
 * 
 * Request body:
 * {
 *   videoUrl: string;      // The video URL (e.g., YouTube video URL)
 *   platform?: string;    // Platform type (default: "youtube")
 * }
 * 
 * Response:
 * {
 *   success: boolean;
 *   cleanedTranscripts: string;
 *   metadata?: {
 *     videoId: string;
 *     captionCount: number;
 *     totalDuration: number;
 *   }
 * }
 */

export async function POST(request: NextRequest) {
  const transctiptionService = new YoutubeTranscriptService()
  const processingService = new ProcessingService()
  const youtubeAPIService = new YoutubeAPIService()
  try {
    // Parse request body
    const body = await request.json();
    const { videoUrl, platform = "youtube" } = body;

    // Validate required fields
    if (!videoUrl || typeof videoUrl !== "string" || videoUrl.trim().length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "videoUrl is required and must be a non-empty string",
        },
        { status: 400 }
      );
    }

    const videoId = youtubeAPIService.parseVideoId(videoUrl);

    // Validate YouTube video ID format (should be 11 characters)
    if (platform === "youtube" && videoId.length !== 11) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid YouTube video ID. Expected 11 characters, got ${videoId.length}. VideoId: "${videoId}"`,
        },
        { status: 400 }
      );
    }

    // Currently only YouTube is supported
    if (platform !== "youtube") {
      return NextResponse.json(
        {
          success: false,
          error: `Platform "${platform}" is not supported. Currently only "youtube" is supported.`,
        },
        { status: 400 }
      );
    }

    console.log(`[API /transcribe] Fetching transcripts for video: ${videoId}`);

    // Fetch transcripts
    const captions: CaptionItem[] = await transctiptionService.fetchTranscript(
      videoId
    );

    // Calculate metadata
    const totalDuration = captions.reduce((sum, caption) => sum + caption.duration, 0);

    // Get only teansripts in single string
    const transcript = captions.map((caption) => caption.text).join(" ");
    const cleanedTranscripts = processingService.cleanText(transcript);

    console.log(`[API /transcribe] Successfully fetched ${captions.length} caption segments`);

    return NextResponse.json(
      {
        success: true,
        cleanedTranscripts,
        metadata: {
          videoId,
          captionCount: captions.length,
          totalDuration,
        },
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    console.error("[API /transcribe] Error fetching transcripts:", error);

    // Handle specific error types
    if (error instanceof Error && error.message.includes("Transcript is disabled")) {
      return NextResponse.json(
        {
          success: false,
          error: "Transcripts are disabled for this video",
          details: error.message,
        },
        { status: 404 }
      );
    }

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid JSON format in request body",
        },
        { status: 400 }
      );
    }

    // Generic error handling
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch transcripts",
        details: errorMessage,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
