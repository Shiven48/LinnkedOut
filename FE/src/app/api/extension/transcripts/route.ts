import { YtDlp } from "ytdlp-nodejs";
import * as https from "https";
import { NextRequest, NextResponse } from "next/server";

interface TranscriptRequest {
  videoIds: string[];
}

interface TranscriptResult {
  videoId: string;
  transcript: string;
  error?: string;
}

function downloadFromUrl(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    https
      .get(url, (response) => {
        let data = "";

        response.on("data", (chunk) => {
          data += chunk;
        });

        response.on("end", () => {
          resolve(data);
        });
      })
      .on("error", (error) => {
        reject(error);
      });
  });
}

function extractTextFromJson3(json3Data: any): string {
  const transcriptTexts: string[] = [];

  if (json3Data.events) {
    for (const event of json3Data.events) {
      if (event.segs) {
        const eventText = event.segs
          .map((seg: any) => seg.utf8 || "")
          .join("")
          .trim();

        if (eventText) {
          transcriptTexts.push(eventText);
        }
      }
    }
  }

  // Join all text into a single string
  return transcriptTexts.join(" ");
}

async function fetchSingleTranscript(
  videoId: string
): Promise<TranscriptResult> {
  try {
    const ytdlp = new YtDlp();
    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

    console.log(`[Transcript API] Fetching metadata for ${videoId}...`);
    const metadata: any = await ytdlp.getInfoAsync(videoUrl);

    // Try English captions first (auto-generated or manual)
    const subtitleInfo =
      metadata.automatic_captions?.en || metadata.subtitles?.en;

    if (!subtitleInfo) {
      console.log(`[Transcript API] No English captions for ${videoId}`);
      return { videoId, transcript: "", error: "No English captions" };
    }

    // Find the json3 format URL
    const json3Subtitle = subtitleInfo.find((sub: any) => sub.ext === "json3");

    if (!json3Subtitle || !json3Subtitle.url) {
      console.log(`[Transcript API] No json3 format for ${videoId}`);
      return { videoId, transcript: "", error: "No json3 format available" };
    }

    console.log(`[Transcript API] Downloading transcript for ${videoId}...`);
    const rawResponse = await downloadFromUrl(json3Subtitle.url);
    const json3Data = JSON.parse(rawResponse);
    const fullTranscript = extractTextFromJson3(json3Data);

    // Limit to 1000 characters
    const transcript = fullTranscript.slice(0, 1000);

    console.log(
      `[Transcript API] Got ${transcript.length} chars for ${videoId}`
    );

    return { videoId, transcript };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error(`[Transcript API] Failed for ${videoId}:`, errorMessage);
    return { videoId, transcript: "", error: errorMessage };
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: TranscriptRequest = await request.json();
    const { videoIds } = body;

    if (!videoIds || !Array.isArray(videoIds) || videoIds.length === 0) {
      return NextResponse.json(
        { error: "videoIds array is required" },
        { status: 400 }
      );
    }

    // Limit to 20 videos max
    const limitedIds = videoIds.slice(0, 20);

    console.log(
      `[Transcript API] Fetching transcripts for ${limitedIds.length} videos`
    );

    // Fetch all transcripts in parallel
    const results = await Promise.all(
      limitedIds.map((id) => fetchSingleTranscript(id))
    );

    // Convert to Record<videoId, transcript>
    const transcripts: Record<string, string> = {};
    for (const result of results) {
      transcripts[result.videoId] = result.transcript;
    }

    const successCount = Object.values(transcripts).filter((t) => t).length;
    console.log(
      `[Transcript API] Successfully fetched ${successCount}/${limitedIds.length} transcripts`
    );

    return NextResponse.json({ transcripts });
  } catch (error) {
    console.error("[Transcript API] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Health check
export async function GET() {
  return NextResponse.json({ status: "ok", service: "transcript-api" });
}
