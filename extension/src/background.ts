// LinnkedOut Background Service Worker

import {
  fetchTranscripts,
  scoreVideos,
  testAPI,
  type AIProvider,
  type VideoData,
} from "./api.js";

const STORAGE_KEY_API_KEY = "linnkedout_api_key";
const STORAGE_KEY_PROVIDER = "linnkedout_provider";
const STORAGE_KEY_PROMPT = "linnkedout_prompt";

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === "PROCESS_VIDEOS") {
    handleProcessVideos(message.videos).then(sendResponse);
    return true;
  }

  if (message.type === "TEST_API") {
    testAPI(message.provider, message.apiKey).then(sendResponse);
    return true;
  }

  return false;
});

async function handleProcessVideos(
  videos: { videoId: string; title: string; channel: string }[]
): Promise<
  | { scores: { videoId: string; score: number; reason: string }[] }
  | { error: string }
> {
  try {
    const stored = await chrome.storage.local.get([
      STORAGE_KEY_API_KEY,
      STORAGE_KEY_PROVIDER,
      STORAGE_KEY_PROMPT,
    ]);

    const apiKey = stored[STORAGE_KEY_API_KEY] as string;
    const provider = (stored[STORAGE_KEY_PROVIDER] as AIProvider) || "gemini";
    const prompt = (stored[STORAGE_KEY_PROMPT] as string) || "";

    if (!apiKey) {
      return { error: "No API key configured" };
    }

    console.log(`LinnkedOut: Processing ${videos.length} videos`);

    // 1. Fetch transcripts from backend
    console.log("LinnkedOut: Fetching transcripts from backend...");
    const videoIds = videos.map((v) => v.videoId);
    const transcripts = await fetchTranscripts(videoIds);

    // 2. Merge transcripts with video data
    const videosWithTranscripts: VideoData[] = videos.map((v) => ({
      ...v,
      transcript: transcripts[v.videoId] || "",
    }));

    // 3. Score with AI (done locally in extension)
    console.log("LinnkedOut: Scoring with AI...");
    const scores = await scoreVideos(videosWithTranscripts, {
      provider,
      apiKey,
      prompt,
    });

    console.log("LinnkedOut: Done!", scores);
    return { scores };
  } catch (err) {
    console.error("LinnkedOut: Error:", err);
    return { error: String(err) };
  }
}

console.log("LinnkedOut: Background service worker started");
