// Offscreen document for persistent WebLLM engine
// Note: chrome.storage is NOT available in offscreen documents
import { CreateMLCEngine, MLCEngineInterface } from "@mlc-ai/web-llm";

const DEFAULT_MODEL = "Qwen2.5-1.5B-Instruct-q4f16_1-MLC";

const DEFAULT_PROMPT = `You are an EXTREMELY STRICT productivity filter. You HATE time-wasting content. 95% of YouTube is garbage that steals attention. Your default is HIDE.

HIDE these (time-wasters):
- Comedy, stand-up, roasts, jokes, funny compilations
- Gaming: streams, Let's Plays, reviews, esports, highlights
- Reactions: anyone reacting to anything
- Drama/gossip: influencer beef, celebrity news
- Vlogs: day in my life, travel, lifestyle
- Entertainment: clips, compilations, satisfying videos
- Music: songs, music videos, covers, performances
- Anime/TV: episode reviews, theories, recaps
- Podcasts that are just chatting
- News commentary, political opinions
- Challenges, pranks, viral trends
- Clickbait titles with caps or sensational words

KEEP these (productive):
- Coding tutorials with "tutorial" or "course"
- University lectures
- Technical documentation
- Scientific research

If unsure, HIDE. Block by default.

Examples:
"Funny moments compilation" -> HIDE
"Gaming stream highlights" -> HIDE
"Python Tutorial for Beginners" -> KEEP
"MIT OpenCourseWare Lecture" -> KEEP

Title: {{title}}
Channel: {{channel}}`;

const SYSTEM_SUFFIX = `

Should this video be hidden? Answer HIDE or KEEP:`;

let engine: MLCEngineInterface | null = null;
let isLoading = false;
let isReady = false;
let currentModelId = DEFAULT_MODEL;
let currentPrompt = DEFAULT_PROMPT;

async function initEngine(modelId?: string) {
  if (isLoading) return;
  
  const targetModel = modelId || currentModelId;
  
  // If already ready with same model, skip
  if (isReady && engine && targetModel === currentModelId) return;
  
  isLoading = true;
  isReady = false;

  try {
    currentModelId = targetModel;
    console.log("LinnkedOut Offscreen: Loading model", currentModelId);

    engine = await CreateMLCEngine(currentModelId, {
      initProgressCallback: (report) => {
        console.log("LinnkedOut Offscreen:", report.text);
      },
    });

    isReady = true;
    isLoading = false;
    console.log("LinnkedOut Offscreen: Model ready!");
  } catch (err) {
    console.error("LinnkedOut Offscreen: Failed to load", err);
    isLoading = false;
  }
}

async function filterVideo(title: string, channel: string): Promise<boolean> {
  if (!engine || !isReady) return false;

  const prompt = currentPrompt
    .replace("{{title}}", title)
    .replace("{{channel}}", channel) + SYSTEM_SUFFIX;

  try {
    const reply = await engine.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      max_tokens: 10,
      temperature: 0,
    });

    const response = reply.choices[0]?.message?.content?.trim() || "";
    const match = response.match(/\b(HIDE|KEEP)\b/i);
    const shouldBlock = match ? match[1].toUpperCase() === "HIDE" : false;

    console.log(`LinnkedOut Offscreen: "${title}" -> ${shouldBlock ? "BLOCK" : "ALLOW"}`);
    return shouldBlock;
  } catch {
    return false;
  }
}

// Listen for messages from background script
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.target !== "offscreen") return false;

  if (message.type === "OFFSCREEN_STATUS") {
    sendResponse({ isReady, isLoading, modelId: currentModelId });
    return true;
  }

  if (message.type === "OFFSCREEN_INIT") {
    // Background passes model and prompt
    if (message.modelId) currentModelId = message.modelId;
    if (message.prompt) currentPrompt = message.prompt;
    
    initEngine(message.modelId).then(() => sendResponse({ isReady }));
    return true;
  }

  if (message.type === "OFFSCREEN_UPDATE_PROMPT") {
    currentPrompt = message.prompt || DEFAULT_PROMPT;
    sendResponse({ success: true });
    return true;
  }

  if (message.type === "OFFSCREEN_FILTER") {
    // Background passes prompt with each filter request
    if (message.prompt) currentPrompt = message.prompt;
    
    const videos = message.videos as { videoId: string; title: string; channel: string }[];
    
    (async () => {
      if (!isReady && !isLoading) {
        await initEngine();
      }
      
      // Wait for engine if still loading
      while (isLoading) {
        await new Promise(r => setTimeout(r, 500));
      }

      const toBlock: string[] = [];
      for (const video of videos) {
        const shouldBlock = await filterVideo(video.title, video.channel);
        if (shouldBlock) toBlock.push(video.videoId);
      }
      sendResponse({ toBlock });
    })();

    return true;
  }

  return false;
});

console.log("LinnkedOut Offscreen: Document loaded");
