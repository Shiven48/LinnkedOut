import {
  CreateWebWorkerMLCEngine,
  MLCEngineInterface,
  hasModelInCache,
} from "@mlc-ai/web-llm";

// Available models - 1.5B models for M1 Mac efficiency
const AVAILABLE_MODELS = [
  {
    id: "Qwen2.5-1.5B-Instruct-q4f16_1-MLC",
    name: "Qwen 2.5 1.5B (recommended)",
    size: "~1GB",
  },
  {
    id: "Llama-3.2-1B-Instruct-q4f16_1-MLC",
    name: "Llama 3.2 1B",
    size: "~0.7GB",
  },
];

const STORAGE_KEY_PROMPT = "yt_filter_prompt";
const STORAGE_KEY_MODEL = "yt_selected_model";
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

// Template Presets
const TEMPLATES: Record<string, { name: string; prompt: string }> = {
  strict: {
    name: "Ultra Strict",
    prompt: `You are an EXTREMELY STRICT productivity filter. 99% of YouTube is garbage. Your default is HIDE.

HIDE everything except:
- Official coding tutorials with "tutorial" in title
- University lectures (.edu channels)
- Technical documentation

HIDE ALL: comedy, gaming, reactions, vlogs, music, entertainment, drama, podcasts, news, challenges.

If unsure, HIDE. Block by default.

Title: {{title}}
Channel: {{channel}}`,
  },
  balanced: {
    name: "Balanced",
    prompt: `You filter YouTube to balance productivity with reasonable breaks. Default: evaluate fairly.

HIDE (time-wasters):
- Pure entertainment with no learning value
- Drama, gossip, celebrity news
- Clickbait reaction videos
- Random viral content, challenges
- Low-effort compilations

KEEP (valuable):
- Tutorials and educational content
- Documentaries and informative videos  
- Career and skill development
- Thoughtful analysis and reviews
- Creative content with effort (not reactions)

Be fair - not everything entertaining is bad. Quality matters.

Title: {{title}}
Channel: {{channel}}`,
  },
  gaming: {
    name: "No Gaming",
    prompt: `You specifically filter out gaming content. Non-gaming content is fine.

HIDE (gaming-related):
- Gaming streams and Let's Plays
- Game reviews and walkthroughs
- Esports, tournaments, highlights
- Gaming news and drama
- Videos featuring game titles prominently
- Gaming YouTuber content

KEEP (non-gaming):
- Everything not related to video games
- Game DEVELOPMENT tutorials (learning to code games is fine)
- Tech reviews that aren't primarily gaming

Title: {{title}}
Channel: {{channel}}`,
  },
  focus: {
    name: "Work Focus",
    prompt: `You filter for deep work and professional development. Only work-relevant content passes.

HIDE (distractions):
- Entertainment and comedy
- Personal vlogs and lifestyle content
- Gaming and music
- News, politics, current events
- Social media drama

KEEP (work-relevant):
- Programming and technical tutorials
- Business strategy and entrepreneurship
- Professional skill development
- Industry-specific education
- Productivity and workflow content
- Design and creative tools tutorials

Title: {{title}}
Channel: {{channel}}`,
  },
  learning: {
    name: "Learning Mode",
    prompt: `You curate for learning and intellectual growth. Educational content in any field is welcome.

HIDE (low-value):
- Pure comedy and memes
- Drama and gossip content
- Reaction videos without analysis
- Mindless entertainment
- Clickbait and viral nonsense

KEEP (educational):
- Science and technology explainers
- History and documentary content
- How-to guides and tutorials
- Book discussions and analysis
- Language learning
- Art, music, and creative education
- Philosophy and critical thinking
- Skill-building in any domain

Learning can be fun - entertaining AND educational is great.

Title: {{title}}
Channel: {{channel}}`,
  },
};

// DOM Elements
const statusIndicator = document.getElementById(
  "status-indicator"
) as HTMLElement;
const statusTitle = document.getElementById("status-title") as HTMLElement;
const statusSubtitle = document.getElementById(
  "status-subtitle"
) as HTMLElement;
const progressContainer = document.getElementById(
  "progress-container"
) as HTMLElement;
const progressBar = document.getElementById("progress-bar") as HTMLElement;
const progressPercent = document.getElementById(
  "progress-percent"
) as HTMLElement;
const promptEditor = document.getElementById(
  "prompt-editor"
) as HTMLTextAreaElement;
const savePromptBtn = document.getElementById(
  "save-prompt-btn"
) as HTMLButtonElement;
const resetPromptBtn = document.getElementById(
  "reset-prompt-btn"
) as HTMLButtonElement;
const totalCount = document.getElementById("total-count") as HTMLElement;
const blockedCount = document.getElementById("blocked-count") as HTMLElement;
const allowedCount = document.getElementById("allowed-count") as HTMLElement;
const resultsPanel = document.getElementById("results-panel") as HTMLElement;
const resultsList = document.getElementById("results-list") as HTMLElement;
const infoBtn = document.getElementById("info-btn") as HTMLButtonElement;
const modelSelect = document.getElementById(
  "model-select"
) as HTMLSelectElement;
const cacheStatus = document.getElementById("cache-status") as HTMLElement;

// Template page elements
const templatesBtn = document.getElementById(
  "templates-btn"
) as HTMLButtonElement;
const templatePage = document.getElementById("template-page") as HTMLElement;
const backBtn = document.getElementById("back-btn") as HTMLElement;
const templateEditor = document.getElementById(
  "template-editor"
) as HTMLTextAreaElement;
const templateList = document.getElementById("template-list") as HTMLElement;
const saveTemplateBtn = document.getElementById(
  "save-template-btn"
) as HTMLButtonElement;
const aiInput = document.getElementById("ai-input") as HTMLInputElement;
const aiApplyBtn = document.getElementById("ai-apply-btn") as HTMLButtonElement;
const mainContainer = document.querySelector(
  ".container:not(.template-page)"
) as HTMLElement;

let engine: MLCEngineInterface | null = null;
let isReady = false;
let isFiltering = false;
let selectedModel = DEFAULT_MODEL;

interface VideoInfo {
  videoId: string;
  title: string;
  channel: string;
  viewCount: string;
  duration: string;
}

// Initialize
async function init() {
  // Load saved prompt
  const savedPrompt = await chrome.storage.local.get(STORAGE_KEY_PROMPT);
  promptEditor.value =
    (savedPrompt[STORAGE_KEY_PROMPT] as string) || DEFAULT_PROMPT;

  // Load saved model preference
  const savedModel = await chrome.storage.local.get(STORAGE_KEY_MODEL);
  selectedModel = (savedModel[STORAGE_KEY_MODEL] as string) || DEFAULT_MODEL;
  modelSelect.value = selectedModel;

  // Check cache status for selected model
  await updateCacheStatus();

  // Initialize WebLLM
  await initEngine();
}

// Check if model is cached
async function updateCacheStatus() {
  try {
    const isCached = await hasModelInCache(selectedModel);
    if (isCached) {
      cacheStatus.textContent = "✓ cached";
      cacheStatus.className = "cache-status cached";
    } else {
      cacheStatus.textContent = "not cached";
      cacheStatus.className = "cache-status not-cached";
    }
  } catch {
    cacheStatus.textContent = "";
  }
}

// Model selection handler
modelSelect.addEventListener("change", async () => {
  const newModel = modelSelect.value;
  if (newModel !== selectedModel) {
    selectedModel = newModel;
    await chrome.storage.local.set({ [STORAGE_KEY_MODEL]: selectedModel });
    await updateCacheStatus();

    // Reload engine with new model
    if (engine) {
      engine = null;
      isReady = false;
    }
    await initEngine();
  }
});

async function initEngine() {
  try {
    // Check if cached
    const isCached = await hasModelInCache(selectedModel).catch(() => false);
    const modelInfo = AVAILABLE_MODELS.find((m) => m.id === selectedModel);
    const sizeText = modelInfo?.size || "~2GB";

    if (isCached) {
      setStatus("loading", "Loading model", "from cache...");
    } else {
      setStatus(
        "loading",
        "Downloading model",
        `${sizeText} • keep popup open`
      );
    }
    progressContainer.classList.remove("hidden");

    const initProgressCallback = (report: {
      text: string;
      progress?: number;
    }) => {
      // Extract progress percentage
      const percentMatch = report.text.match(/(\d+(?:\.\d+)?)\s*%/);
      if (percentMatch) {
        const percent = parseFloat(percentMatch[1]);
        progressBar.style.width = `${percent}%`;
        progressPercent.textContent = `${Math.round(percent)}%`;
      }

      // Simple status - just show downloading or loading
      if (report.text.includes("Fetching")) {
        statusSubtitle.textContent = "downloading(Do not close this popup)...";
      } else if (report.text.includes("Loading")) {
        statusSubtitle.textContent =
          "loading to GPU (Do not close this popup)...";
      } else if (report.text.includes("Finish")) {
        progressBar.style.width = "100%";
        progressPercent.textContent = "100%";
      }
    };

    engine = await CreateWebWorkerMLCEngine(
      new Worker(new URL("./worker.ts", import.meta.url), {
        type: "module",
      }),
      selectedModel,
      { initProgressCallback }
    );

    progressContainer.classList.add("hidden");
    isReady = true;

    // Update cache status after loading
    await updateCacheStatus();

    // Auto-filter immediately
    await autoFilter();
  } catch (err) {
    setStatus("error", "Error loading model", String(err));
    console.error(err);
  }
}

async function autoFilter() {
  try {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    if (tab.id && tab.url?.includes("youtube.com")) {
      setStatus("filtering", "Filtering", "analyzing videos...");
      await runFilter();
    } else {
      setStatus("ready", "Ready", "open YouTube to auto-filter");
    }
  } catch {
    setStatus("ready", "Ready", "open YouTube to auto-filter");
  }
}

function setStatus(
  state: "loading" | "ready" | "error" | "filtering",
  title: string,
  subtitle: string
) {
  statusIndicator.className = "status-indicator " + state;
  statusTitle.textContent = title;
  statusSubtitle.textContent = subtitle;
}

// Save prompt
savePromptBtn.addEventListener("click", async () => {
  await chrome.storage.local.set({ [STORAGE_KEY_PROMPT]: promptEditor.value });
  savePromptBtn.textContent = "✓ Saved";
  setTimeout(() => {
    savePromptBtn.textContent = "Save";
  }, 1500);
});

// Reset prompt to default
resetPromptBtn.addEventListener("click", () => {
  promptEditor.value = DEFAULT_PROMPT;
});

async function runFilter() {
  if (!isReady || !engine || isFiltering) return;

  isFiltering = true;

  try {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    if (!tab.id || !tab.url?.includes("youtube.com")) {
      setStatus("error", "Not on YouTube", "navigate to youtube.com");
      return;
    }

    // Get recommendations from content script
    const response = await chrome.tabs.sendMessage(tab.id, {
      type: "GET_RECOMMENDATIONS",
    });
    const videos: VideoInfo[] = response.videos || [];

    console.log("=== LinnkedOut Debug ===");
    console.log("Videos found:", videos.length);
    // console.log("Videos:", videos);

    if (videos.length === 0) {
      setStatus("ready", "No videos found", "try scrolling or refresh");
      totalCount.textContent = "0";
      return;
    }

    totalCount.textContent = videos.length.toString();
    setStatus("filtering", "Filtering", `0/${videos.length} analyzed`);

    const BATCH_SIZE = 2;
    const allBlockedIds: string[] = [];
    const results: { video: VideoInfo; blocked: boolean }[] = [];

    // Process videos in batches of 5
    for (let i = 0; i < videos.length; i += BATCH_SIZE) {
      const batch = videos.slice(i, i + BATCH_SIZE);
      const batchBlockIds: string[] = [];

      // Process each video in the batch
      for (let j = 0; j < batch.length; j++) {
        const video = batch[j];
        const videoIndex = i + j + 1;
        setStatus(
          "filtering",
          "Filtering",
          `${videoIndex}/${videos.length} analyzed`
        );

        const userPrompt = promptEditor.value
          .replace("{{title}}", video.title)
          .replace("{{channel}}", video.channel);

        const fullPrompt = userPrompt + SYSTEM_SUFFIX;

        console.log(`\n--- Video ${videoIndex}/${videos.length} ---`);
        console.log("Title:", video.title);
        console.log("Channel:", video.channel);
        console.log("Full Prompt:", fullPrompt);

        try {
          const reply = await engine.chat.completions.create({
            messages: [{ role: "user", content: fullPrompt }],
            max_tokens: 10,
            temperature: 0,
          });

          const rawResponse = reply.choices[0]?.message?.content?.trim() || "";

          // Use regex to find HIDE or KEEP in response
          const hideKeepMatch = rawResponse.match(/\b(HIDE|KEEP)\b/i);
          const answer = hideKeepMatch ? hideKeepMatch[1].toUpperCase() : "";
          const shouldBlock = answer === "HIDE";

          console.log("WebLLM Response:", rawResponse);
          console.log("Extracted Answer:", answer);
          console.log("Should Block:", shouldBlock);

          if (shouldBlock) {
            batchBlockIds.push(video.videoId);
          }

          results.push({ video, blocked: shouldBlock });
        } catch (err) {
          console.error(`Error analyzing video ${video.videoId}:`, err);
          results.push({ video, blocked: false });
        }
      }

      // Filter this batch immediately if any need blocking
      if (batchBlockIds.length > 0) {
        console.log(
          `\n=== Filtering batch ${Math.floor(i / BATCH_SIZE) + 1} ===`
        );
        console.log("Blocking:", batchBlockIds);

        await chrome.tabs.sendMessage(tab.id, {
          type: "FILTER_VIDEOS",
          videoIds: batchBlockIds,
        });

        allBlockedIds.push(...batchBlockIds);

        // Update UI after each batch
        blockedCount.textContent = allBlockedIds.length.toString();
        allowedCount.textContent = (
          results.length - allBlockedIds.length
        ).toString();
        displayResults(results);
      }
    }

    console.log("\n=== Filter Summary ===");
    console.log("Total blocked:", allBlockedIds.length);
    console.log("Blocked IDs:", allBlockedIds);

    // Final UI update
    blockedCount.textContent = allBlockedIds.length.toString();
    allowedCount.textContent = (
      videos.length - allBlockedIds.length
    ).toString();
    displayResults(results);

    setStatus(
      "ready",
      "Filtered",
      `${allBlockedIds.length} blocked, ${videos.length - allBlockedIds.length} allowed`
    );
  } catch (err) {
    console.error(err);
    setStatus("error", "Error", String(err));
  } finally {
    isFiltering = false;
  }
}

function displayResults(results: { video: VideoInfo; blocked: boolean }[]) {
  resultsPanel.classList.remove("hidden");
  resultsList.innerHTML = "";

  // Sort: blocked first
  const sorted = [...results].sort(
    (a, b) => (b.blocked ? 1 : 0) - (a.blocked ? 1 : 0)
  );

  sorted.forEach(({ video, blocked }) => {
    const item = document.createElement("div");
    item.className = "result-item";
    item.innerHTML = `
      <div class="result-icon ${blocked ? "blocked" : "allowed"}">${blocked ? "✕" : "✓"}</div>
      <div style="flex:1;min-width:0;">
        <div class="result-title" title="${video.title}">${video.title}</div>
        <div class="result-channel">${video.channel}</div>
      </div>
    `;
    resultsList.appendChild(item);
  });
}

// Info button
infoBtn.addEventListener("click", () => {
  chrome.tabs.create({ url: chrome.runtime.getURL("info.html") });
});

// Listen for messages from content script - auto filter
chrome.runtime.onMessage.addListener((message) => {
  if (!isReady || isFiltering) return;

  if (
    message.type === "NEW_VIDEOS_LOADED" ||
    message.type === "URL_CHANGED" ||
    message.type === "PAGE_LOADED"
  ) {
    console.log("LinnkedOut: Received", message.type, "- triggering filter");
    runFilter();
  }
});

// ========== TEMPLATE PAGE ==========

// Open template page
templatesBtn.addEventListener("click", () => {
  templateEditor.value = promptEditor.value;
  mainContainer.classList.add("hidden");
  templatePage.classList.remove("hidden");
});

// Back to main page
backBtn.addEventListener("click", () => {
  templatePage.classList.add("hidden");
  mainContainer.classList.remove("hidden");
});

// Template selection
templateList.addEventListener("click", (e) => {
  const card = (e.target as HTMLElement).closest(
    ".template-card"
  ) as HTMLElement;
  if (!card) return;

  const templateKey = card.dataset.template;
  if (!templateKey || !TEMPLATES[templateKey]) return;

  // Update active state
  templateList
    .querySelectorAll(".template-card")
    .forEach((c) => c.classList.remove("active"));
  card.classList.add("active");

  // Set template content
  templateEditor.value = TEMPLATES[templateKey].prompt;
});

// Save template and go back
saveTemplateBtn.addEventListener("click", async () => {
  promptEditor.value = templateEditor.value;
  await chrome.storage.local.set({
    [STORAGE_KEY_PROMPT]: templateEditor.value,
  });

  templatePage.classList.add("hidden");
  mainContainer.classList.remove("hidden");

  savePromptBtn.textContent = "✓ Saved";
  setTimeout(() => {
    savePromptBtn.textContent = "Save";
  }, 1500);
});

// AI Assist - modify prompt based on user input
aiApplyBtn.addEventListener("click", async () => {
  const instruction = aiInput.value.trim();
  if (!instruction || !engine || !isReady) return;

  aiApplyBtn.textContent = "...";
  aiApplyBtn.disabled = true;

  try {
    const currentPrompt = templateEditor.value;
    const aiPrompt = `You are a prompt editor. Modify the following filter prompt based on the user's instruction.

Current prompt:
"""
${currentPrompt}
"""

User instruction: "${instruction}"

Output ONLY the modified prompt, nothing else. Keep the same format with Title: {{title}} and Channel: {{channel}} at the end.`;

    const reply = await engine.chat.completions.create({
      messages: [{ role: "user", content: aiPrompt }],
      max_tokens: 500,
      temperature: 0.3,
    });

    const newPrompt =
      reply.choices[0]?.message?.content?.trim() || currentPrompt;
    templateEditor.value = newPrompt;
    aiInput.value = "";
  } catch (err) {
    console.error("AI assist error:", err);
  }

  aiApplyBtn.textContent = "Apply";
  aiApplyBtn.disabled = false;
});

// Enter key for AI input
aiInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    aiApplyBtn.click();
  }
});

init();
