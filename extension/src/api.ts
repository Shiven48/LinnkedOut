// API Service - Backend for transcripts, local AI scoring

export type AIProvider = "gemini" | "claude" | "openai";

export interface VideoData {
  videoId: string;
  title: string;
  channel: string;
  transcript: string;
}

export interface VideoScore {
  videoId: string;
  score: number;
  reason: string;
}

// Backend URL - update when deployed
const BACKEND_URL = "https://your-app.vercel.app"; // TODO: Update after deploy

// ============ BACKEND: Fetch Transcripts ============

export async function fetchTranscripts(
  videoIds: string[]
): Promise<Record<string, string>> {
  const res = await fetch(`${BACKEND_URL}/transcripts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ videoIds }),
  });

  if (!res.ok) {
    throw new Error(`Backend error: ${await res.text()}`);
  }

  const data = await res.json();
  return data.transcripts || {};
}

// ============ LOCAL: AI Scoring ============

const DEFAULT_SYSTEM_PROMPT = `You are a productivity assistant that evaluates YouTube videos.
Given a list of videos with their titles, channels, and transcripts, rate each video from 1-10 based on productivity value.

Return a JSON array with objects containing: videoId, score (1-10), reason (brief explanation).
Only return valid JSON, no markdown or extra text.`;

export async function scoreVideos(
  videos: VideoData[],
  config: { provider: AIProvider; apiKey: string; prompt?: string }
): Promise<VideoScore[]> {
  const scoringCriteria = config.prompt || "";
  const systemPrompt =
    DEFAULT_SYSTEM_PROMPT +
    (scoringCriteria ? `\n\nScoring criteria:\n${scoringCriteria}` : "");

  const userPrompt = `Rate these ${videos.length} videos:

${videos
  .map(
    (v, i) => `
[Video ${i + 1}]
ID: ${v.videoId}
Title: ${v.title}
Channel: ${v.channel}
Transcript: ${v.transcript.slice(0, 500)}
`
  )
  .join("\n")}

Return JSON array with videoId, score (1-10), and reason for each.`;

  let response: string;

  switch (config.provider) {
    case "gemini":
      response = await callGemini(config.apiKey, systemPrompt, userPrompt);
      break;
    case "claude":
      response = await callClaude(config.apiKey, systemPrompt, userPrompt);
      break;
    case "openai":
      response = await callOpenAI(config.apiKey, systemPrompt, userPrompt);
      break;
    default:
      throw new Error(`Unknown provider: ${config.provider}`);
  }

  return parseResponse(response);
}

async function callGemini(
  apiKey: string,
  system: string,
  prompt: string
): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: system + "\n\n" + prompt }] }],
      generationConfig: { temperature: 0.1, maxOutputTokens: 2048 },
    }),
  });

  if (!res.ok) throw new Error(`Gemini error: ${await res.text()}`);
  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
}

async function callClaude(
  apiKey: string,
  system: string,
  prompt: string
): Promise<string> {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({
      model: "claude-3-haiku-20240307",
      max_tokens: 2048,
      system,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!res.ok) throw new Error(`Claude error: ${await res.text()}`);
  const data = await res.json();
  return data.content?.[0]?.text || "";
}

async function callOpenAI(
  apiKey: string,
  system: string,
  prompt: string
): Promise<string> {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: system },
        { role: "user", content: prompt },
      ],
      temperature: 0.1,
      max_tokens: 2048,
    }),
  });

  if (!res.ok) throw new Error(`OpenAI error: ${await res.text()}`);
  const data = await res.json();
  return data.choices?.[0]?.message?.content || "";
}

function parseResponse(response: string): VideoScore[] {
  let jsonStr = response.trim();
  if (jsonStr.startsWith("```")) {
    jsonStr = jsonStr
      .replace(/```json?\n?/g, "")
      .replace(/```$/g, "")
      .trim();
  }

  try {
    const parsed = JSON.parse(jsonStr);
    if (Array.isArray(parsed)) {
      return parsed.map(
        (item: { videoId: string; score: number; reason?: string }) => ({
          videoId: item.videoId,
          score: Math.min(10, Math.max(1, item.score)),
          reason: item.reason || "",
        })
      );
    }
  } catch (e) {
    console.error("Parse error:", e);
  }
  return [];
}

// ============ TEST API ============

export async function testAPI(
  provider: AIProvider,
  apiKey: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const testPrompt = "Say OK";
    let response: string;

    switch (provider) {
      case "gemini":
        response = await callGemini(apiKey, "", testPrompt);
        break;
      case "claude":
        response = await callClaude(apiKey, "", testPrompt);
        break;
      case "openai":
        response = await callOpenAI(apiKey, "", testPrompt);
        break;
      default:
        throw new Error("Unknown provider");
    }

    return { success: response.length > 0 };
  } catch (err) {
    return { success: false, error: String(err) };
  }
}
