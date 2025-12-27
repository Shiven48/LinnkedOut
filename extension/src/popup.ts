// LinnkedOut Popup - Mode Selector, API Config & Prompt Editor

type Mode = "focus" | "personalized" | "chill";
type Provider = "gemini" | "claude" | "openai";

const STORAGE_KEY_MODE = "linnkedout_mode";
const STORAGE_KEY_API_KEY = "linnkedout_api_key";
const STORAGE_KEY_PROVIDER = "linnkedout_provider";
const STORAGE_KEY_PROMPT = "linnkedout_prompt";
const STORAGE_KEY_CHILL_UNLOCKED = "linnkedout_chill_unlocked";

const CHILL_PHRASE =
  "I am choosing to take a break and will return to focused work after.";

import { DEFAULT_PROMPT } from "./constants";

// DOM Elements
const modeCards = document.querySelectorAll(
  ".mode-card"
) as NodeListOf<HTMLElement>;
const chillUnlock = document.getElementById("chill-unlock") as HTMLElement;
const chillInput = document.getElementById(
  "chill-input"
) as HTMLTextAreaElement;
const chillProgress = document.getElementById("chill-progress") as HTMLElement;
const chillPhraseEl = document.getElementById("chill-phrase") as HTMLElement;
const apiSection = document.getElementById("api-section") as HTMLElement;
const promptSection = document.getElementById("prompt-section") as HTMLElement;
const providerSelect = document.getElementById(
  "provider-select"
) as HTMLSelectElement;
const apiKeyInput = document.getElementById(
  "api-key-input"
) as HTMLInputElement;
const testApiBtn = document.getElementById("test-api-btn") as HTMLButtonElement;
const saveApiBtn = document.getElementById("save-api-btn") as HTMLButtonElement;
const apiStatus = document.getElementById("api-status") as HTMLElement;
const apiStatusIcon = document.getElementById("api-status-icon") as HTMLElement;
const apiStatusText = document.getElementById("api-status-text") as HTMLElement;
const promptEditor = document.getElementById(
  "prompt-editor"
) as HTMLTextAreaElement;
const savePromptBtn = document.getElementById(
  "save-prompt-btn"
) as HTMLButtonElement;
const resetPromptBtn = document.getElementById(
  "reset-prompt-btn"
) as HTMLButtonElement;
const infoBtn = document.getElementById("info-btn") as HTMLButtonElement;
const infoLink = document.getElementById("info-link") as HTMLAnchorElement;

let currentMode: Mode = "focus";
let chillUnlocked = false;

// Initialize
async function init() {
  const stored = await chrome.storage.local.get([
    STORAGE_KEY_MODE,
    STORAGE_KEY_API_KEY,
    STORAGE_KEY_PROVIDER,
    STORAGE_KEY_PROMPT,
    STORAGE_KEY_CHILL_UNLOCKED,
  ]);

  currentMode = (stored[STORAGE_KEY_MODE] as Mode) || "focus";
  chillUnlocked = stored[STORAGE_KEY_CHILL_UNLOCKED] === true;

  const savedProvider = (stored[STORAGE_KEY_PROVIDER] as Provider) || "gemini";
  const savedApiKey = (stored[STORAGE_KEY_API_KEY] as string) || "";
  const savedPrompt = (stored[STORAGE_KEY_PROMPT] as string) || DEFAULT_PROMPT;

  providerSelect.value = savedProvider;
  promptEditor.value = savedPrompt;

  if (savedApiKey) {
    apiKeyInput.value = "••••••••••••";
    apiKeyInput.dataset.hasKey = "true";
  }

  chillPhraseEl.textContent = `"${CHILL_PHRASE}"`;

  updateModeUI();
  updateSectionVisibility();
}

function updateModeUI() {
  modeCards.forEach((card) => {
    const mode = card.dataset.mode as Mode;
    card.classList.toggle("active", mode === currentMode);
  });

  chillUnlock.classList.toggle(
    "visible",
    currentMode === "chill" && !chillUnlocked
  );
}

function updateSectionVisibility() {
  const isPersonalized = currentMode === "personalized";
  apiSection.style.display = isPersonalized ? "block" : "none";
  promptSection.style.display = isPersonalized ? "block" : "none";
}

// Mode selection
modeCards.forEach((card) => {
  card.addEventListener("click", async () => {
    const mode = card.dataset.mode as Mode;

    if (mode === "chill" && !chillUnlocked) {
      currentMode = "chill";
      updateModeUI();
      updateSectionVisibility();
      chillInput.focus();
      return;
    }

    if (mode === "personalized") {
      const stored = await chrome.storage.local.get(STORAGE_KEY_API_KEY);
      if (!stored[STORAGE_KEY_API_KEY]) {
        currentMode = "personalized";
        updateModeUI();
        updateSectionVisibility();
        showApiStatus("Configure API key to use this mode", false);
        return;
      }
    }

    await setMode(mode);
  });
});

async function setMode(mode: Mode) {
  currentMode = mode;
  await chrome.storage.local.set({ [STORAGE_KEY_MODE]: mode });
  updateModeUI();
  updateSectionVisibility();

  try {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    if (tab.id && tab.url?.includes("youtube.com")) {
      await chrome.tabs.sendMessage(tab.id, { type: "MODE_CHANGED", mode });
    }
  } catch (e) {
    console.log("Could not notify content script:", e);
  }
}

// Chill mode unlock
chillInput.addEventListener("input", () => {
  const typed = chillInput.value.trim().toLowerCase();
  const target = CHILL_PHRASE.toLowerCase();

  let matchCount = 0;
  for (let i = 0; i < Math.min(typed.length, target.length); i++) {
    if (typed[i] === target[i]) matchCount++;
  }

  const progress = Math.min(100, (matchCount / target.length) * 100);
  chillProgress.style.width = `${progress}%`;

  if (typed === target) {
    chillUnlocked = true;
    chrome.storage.local.set({ [STORAGE_KEY_CHILL_UNLOCKED]: true });
    setMode("chill");
    chillUnlock.classList.remove("visible");
    chillInput.value = "";
  }
});

// API Configuration
saveApiBtn.addEventListener("click", async () => {
  const provider = providerSelect.value as Provider;
  const apiKey = apiKeyInput.value;

  if (apiKey === "••••••••••••") {
    showApiStatus("Enter a new API key", false);
    return;
  }

  if (!apiKey.trim()) {
    showApiStatus("Enter an API key", false);
    return;
  }

  await chrome.storage.local.set({
    [STORAGE_KEY_PROVIDER]: provider,
    [STORAGE_KEY_API_KEY]: apiKey,
  });

  apiKeyInput.value = "••••••••••••";
  apiKeyInput.dataset.hasKey = "true";
  showApiStatus("Saved", true);
});

testApiBtn.addEventListener("click", async () => {
  const provider = providerSelect.value as Provider;
  let apiKey = apiKeyInput.value;

  if (apiKey === "••••••••••••") {
    const stored = await chrome.storage.local.get(STORAGE_KEY_API_KEY);
    apiKey = stored[STORAGE_KEY_API_KEY] as string;
  }

  if (!apiKey) {
    showApiStatus("Enter an API key first", false);
    return;
  }

  testApiBtn.textContent = "...";
  testApiBtn.disabled = true;

  try {
    const response = await chrome.runtime.sendMessage({
      type: "TEST_API",
      provider,
      apiKey,
    });

    if (response?.success) {
      showApiStatus("Connection OK", true);
    } else {
      showApiStatus(response?.error?.slice(0, 40) || "Failed", false);
    }
  } catch (e) {
    showApiStatus("Error: " + String(e).slice(0, 30), false);
  }

  testApiBtn.textContent = "Test";
  testApiBtn.disabled = false;
});

apiKeyInput.addEventListener("focus", () => {
  if (apiKeyInput.dataset.hasKey === "true") {
    apiKeyInput.value = "";
    apiKeyInput.type = "text";
  }
});

apiKeyInput.addEventListener("blur", async () => {
  apiKeyInput.type = "password";
  if (!apiKeyInput.value && apiKeyInput.dataset.hasKey === "true") {
    apiKeyInput.value = "••••••••••••";
  }
});

function showApiStatus(message: string, success: boolean) {
  apiStatus.classList.remove("hidden", "success", "error");
  apiStatus.classList.add(success ? "success" : "error");
  apiStatusIcon.textContent = success ? "✓" : "✕";
  apiStatusText.textContent = message;

  setTimeout(() => {
    apiStatus.classList.add("hidden");
  }, 3000);
}

// Prompt Editor
savePromptBtn.addEventListener("click", async () => {
  await chrome.storage.local.set({ [STORAGE_KEY_PROMPT]: promptEditor.value });
  savePromptBtn.textContent = "✓";
  setTimeout(() => {
    savePromptBtn.textContent = "Save";
  }, 1000);
});

resetPromptBtn.addEventListener("click", () => {
  promptEditor.value = DEFAULT_PROMPT;
});

// Info
infoBtn.addEventListener("click", () => {
  chrome.tabs.create({ url: chrome.runtime.getURL("info.html") });
});

infoLink.addEventListener("click", (e) => {
  e.preventDefault();
  chrome.tabs.create({ url: chrome.runtime.getURL("info.html") });
});

providerSelect.addEventListener("change", () => {
  const provider = providerSelect.value as Provider;
  const hints: Record<Provider, string> = {
    gemini: "AIzaSy...",
    openai: "sk-...",
    claude: "sk-ant-...",
  };
  apiKeyInput.placeholder = hints[provider];
});

init();

export {};
