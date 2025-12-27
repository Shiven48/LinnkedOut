  // Background script - manages offscreen document for persistent WebLLM

const STORAGE_KEY_PROMPT = "yt_filter_prompt";
const STORAGE_KEY_MODEL = "yt_selected_model";
const DEFAULT_MODEL = "Qwen2.5-1.5B-Instruct-q4f16_1-MLC";

let offscreenCreated = false;

async function ensureOffscreen() {
  if (offscreenCreated) return;

  try {
    const existingContexts = await chrome.runtime.getContexts({
      contextTypes: [chrome.runtime.ContextType.OFFSCREEN_DOCUMENT],
    });

    if (existingContexts.length > 0) {
      offscreenCreated = true;
      return;
    }

    await chrome.offscreen.createDocument({
      url: "offscreen.html",
      reasons: [chrome.offscreen.Reason.WORKERS],
      justification: "Run WebLLM for YouTube filtering",
    });

    offscreenCreated = true;
    console.log("LinnkedOut BG: Offscreen document created");

    // Initialize with stored settings
    const stored = await chrome.storage.local.get([
      STORAGE_KEY_MODEL,
      STORAGE_KEY_PROMPT,
    ]);
    const modelId = (stored[STORAGE_KEY_MODEL] as string) || DEFAULT_MODEL;
    const prompt = stored[STORAGE_KEY_PROMPT] as string | undefined;

    // Send init message to offscreen
    await chrome.runtime.sendMessage({
      target: "offscreen",
      type: "OFFSCREEN_INIT",
      modelId,
      prompt,
    });
  } catch (err) {
    console.error("LinnkedOut BG: Failed to create offscreen", err);
  }
}

// Listen for messages from content script
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.target === "offscreen") return false;
  if (message.target === "background") return false;

  if (message.type === "CHECK_STATUS") {
    (async () => {
      await ensureOffscreen();
      const response = await chrome.runtime.sendMessage({
        target: "offscreen",
        type: "OFFSCREEN_STATUS",
      });
      sendResponse(response);
    })();
    return true;
  }

  if (message.type === "INIT_ENGINE") {
    (async () => {
      await ensureOffscreen();
      const stored = await chrome.storage.local.get([
        STORAGE_KEY_MODEL,
        STORAGE_KEY_PROMPT,
      ]);
      const response = await chrome.runtime.sendMessage({
        target: "offscreen",
        type: "OFFSCREEN_INIT",
        modelId: stored[STORAGE_KEY_MODEL] || DEFAULT_MODEL,
        prompt: stored[STORAGE_KEY_PROMPT],
      });
      sendResponse(response);
    })();
    return true;
  }

  if (message.type === "FILTER_VIDEOS_BG") {
    (async () => {
      await ensureOffscreen();
      // Get current prompt from storage and pass to offscreen
      const stored = await chrome.storage.local.get(STORAGE_KEY_PROMPT);
      const response = await chrome.runtime.sendMessage({
        target: "offscreen",
        type: "OFFSCREEN_FILTER",
        videos: message.videos,
        prompt: stored[STORAGE_KEY_PROMPT],
      });
      sendResponse(response);
    })();
    return true;
  }

  return false;
});

// Auto-create offscreen on install
chrome.runtime.onInstalled.addListener(() => {
  console.log("LinnkedOut: Installed");
  ensureOffscreen();
});

// Auto-create offscreen on startup
chrome.runtime.onStartup.addListener(() => {
  console.log("LinnkedOut: Startup");
  ensureOffscreen();
});

console.log("LinnkedOut: Background script loaded");
ensureOffscreen();
