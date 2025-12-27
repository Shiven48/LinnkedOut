// API Service - Using Vercel AI SDK for structured output

import { generateObject } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { z } from "zod";
import { TRANSCRIPT_API_URL } from "./constants";

export type AIProvider = "gemini" | "claude" | "openai";

export interface VideoData {
  videoId: string;
  title: string;
  channel: string;
  transcript: string;
}

export interface VideoRank {
  videoId: string;
  keep: boolean;
}

// Simple schema: videoId and keep boolean
const RankedVideosSchema = z.object({
  rankings: z.array(
    z.object({
      videoId: z.string(),
      keep: z.boolean(),
    })
  ),
});

// ============ FETCH TRANSCRIPTS via Next.js API ============

export async function fetchTranscripts(
  videoIds: string[]
): Promise<Record<string, string>> {
  try {
    console.log(
      `LinnkedOut: Fetching transcripts from API for ${videoIds.length} videos`
    );

    const response = await fetch(TRANSCRIPT_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ videoIds }),
    });

    if (!response.ok) {
      console.error(
        `LinnkedOut: API error ${response.status}: ${response.statusText}`
      );
      return {};
    }

    const data = await response.json();

    if (data.transcripts) {
      const successCount = Object.values(data.transcripts).filter(
        (t) => t
      ).length;
      console.log(
        `LinnkedOut: Received ${successCount}/${videoIds.length} transcripts from API`
      );

      // Log first 200 chars of each transcript for debugging
      for (const [videoId, transcript] of Object.entries(data.transcripts)) {
        if (transcript) {
          console.log(
            `LinnkedOut: Transcript for ${videoId} (first 200 chars):`,
            (transcript as string).slice(0, 200)
          );
        }
      }

      return data.transcripts;
    }

    return {};
  } catch (error) {
    console.error("LinnkedOut: Failed to fetch transcripts from API:", error);
    return {};
  }
}

// ============ AI RANKING with Vercel AI SDK ============

function getModel(provider: AIProvider, apiKey: string) {
  switch (provider) {
    case "openai": {
      const openai = createOpenAI({ apiKey });
      return openai("gpt-4o-mini");
    }
    case "claude": {
      const anthropic = createAnthropic({
        apiKey,
        headers: {
          "anthropic-dangerous-direct-browser-access": "true",
        },
      });
      return anthropic("claude-3-haiku-20240307");
    }
    case "gemini": {
      const google = createGoogleGenerativeAI({ apiKey });
      return google("gemini-2.0-flash");
    }
    default:
      throw new Error(`Unknown provider: ${provider}`);
  }
}

export async function rankVideos(
  videos: VideoData[],
  config: { provider: AIProvider; apiKey: string; prompt?: string }
): Promise<VideoRank[]> {
  const customCriteria = config.prompt || "";

  const videoList = videos
    .map(
      (v) =>
        `- ID: ${v.videoId} | Title: ${v.title} | Channel: ${v.channel} | Transcript: ${v.transcript.slice(0, 1000) || "[None]"}`
    )
    .join("\n");

  const prompt = `Evaluate these ${videos.length} YouTube videos based on productivity value.
Determine if each video should be KEPT (genuinely educational/productive) or HIDDEN (entertainment/distraction). Set 'keep' to true or false.

${customCriteria ? `Criteria: ${customCriteria}\n` : ""}
Videos:
${videoList}

Return array with videoId and keep boolean.`;

  console.log("LinnkedOut: Ranking videos...");

  try {
    const { object } = await generateObject({
      model: getModel(config.provider, config.apiKey),
      schema: RankedVideosSchema,
      prompt,
      temperature: 0.2,
    });

    console.log(
      "LinnkedOut: AI Response - Full:",
      JSON.stringify(object.rankings, null, 2)
    );
    console.log(
      "LinnkedOut: AI Response - Kept Videos:",
      object.rankings
        .filter((r) => r.keep)
        .map((r) => r.videoId)
        .join(", ")
    );

    return object.rankings;
  } catch (error) {
    console.error("LinnkedOut: Ranking error:", error);
    throw error;
  }
}

// ============ TEST API ============

export async function testAPI(
  provider: AIProvider,
  apiKey: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const TestSchema = z.object({
      message: z.string(),
    });

    const { object } = await generateObject({
      model: getModel(provider, apiKey),
      schema: TestSchema,
      prompt: "Say hello",
      temperature: 0,
    });

    return { success: object.message.length > 0 };
  } catch (err) {
    return { success: false, error: String(err) };
  }
}
