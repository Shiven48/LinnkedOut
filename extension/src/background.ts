// LinnkedOut Background Service Worker

import {
  fetchTranscripts,
  rankVideos,
  testAPI,
  type AIProvider,
  type VideoData,
} from "./api.js";
import { DEFAULT_PROMPT } from "./constants";

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
  { rankings: { videoId: string; keep: boolean }[] } | { error: string }
> {
  try {
    const stored = await chrome.storage.local.get([
      STORAGE_KEY_API_KEY,
      STORAGE_KEY_PROVIDER,
      STORAGE_KEY_PROMPT,
    ]);

    const apiKey = stored[STORAGE_KEY_API_KEY] as string;
    const provider = (stored[STORAGE_KEY_PROVIDER] as AIProvider) || "gemini";
    const prompt = (stored[STORAGE_KEY_PROMPT] as string) || DEFAULT_PROMPT;

    if (!apiKey) {
      return { error: "No API key configured" };
    }

    console.log(`LinnkedOut: Processing ${videos.length} videos`);

    // 1. Fetch transcripts
    console.log("LinnkedOut: Fetching transcripts...");
    const videoIds = videos.map((v) => v.videoId);
    const transcripts = await fetchTranscripts(videoIds);

    // 2. Separate videos with transcripts from those without
    const videosToProcess: VideoData[] = [];
    const videosToBlock: { videoId: string; keep: boolean }[] = [];

    videos.forEach((v) => {
      const transcript = transcripts[v.videoId];
      if (transcript) {
        videosToProcess.push({ ...v, transcript });
      } else {
        console.log(`LinnkedOut: Blocking ${v.videoId} (no transcript found)`);
        videosToBlock.push({ videoId: v.videoId, keep: false });
      }
    });

    if (videosToProcess.length === 0) {
      console.log("LinnkedOut: No videos with transcripts found.");
      // Return all blocked videos so the frontend explicitly hides them
      return { rankings: videosToBlock };
    }

    // 3. Rank with AI
    console.log("LinnkedOut: Ranking with AI...");
    const aiRankings = await rankVideos(videosToProcess, {
      provider,
      apiKey,
      prompt,
    });

    // 4. Merge AI results with blocked videos
    const finalRankings = [...aiRankings, ...videosToBlock];

    console.log("LinnkedOut: Done!", finalRankings);
    return { rankings: finalRankings };
  } catch (err) {
    console.error("LinnkedOut: Error:", err);
    return { error: String(err) };
  }
}

console.log("LinnkedOut: Background service worker started");
