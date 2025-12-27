// LinnkedOut Content Script - Three Modes: Focus, Personalized, Chill

type Mode = "focus" | "personalized" | "chill";

const STORAGE_KEY_MODE = "linnkedout_mode";

let currentMode: Mode = "focus";
let isProcessing = false;

// Inject base styles immediately
const styleSheet = document.createElement("style");
styleSheet.id = "linnkedout-styles";
styleSheet.textContent = `
  /* Skeleton loader for personalized mode */
  .linnkedout-skeleton {
    background: linear-gradient(90deg, #1a1a1a 25%, #2a2a2a 50%, #1a1a1a 75%);
    background-size: 200% 100%;
    animation: linnkedout-shimmer 1.5s infinite;
    border-radius: 12px;
    min-height: 94px;
    margin-bottom: 8px;
  }

  @keyframes linnkedout-shimmer {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }

  .linnkedout-skeleton-container {
    padding: 12px;
  }

  .linnkedout-processing-banner {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 12px 16px;
    border-radius: 12px;
    margin-bottom: 16px;
    font-family: 'YouTube Sans', 'Roboto', sans-serif;
    font-size: 14px;
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .linnkedout-spinner {
    width: 20px;
    height: 20px;
    border: 2px solid rgba(255,255,255,0.3);
    border-top-color: white;
    border-radius: 50%;
    animation: linnkedout-spin 1s linear infinite;
  }

  @keyframes linnkedout-spin {
    to { transform: rotate(360deg); }
  }

  /* Focus mode - hide everything */
  .linnkedout-focus-mode #secondary,
  .linnkedout-focus-mode #related,
  .linnkedout-focus-mode ytd-watch-next-secondary-results-renderer,
  .linnkedout-focus-mode #comments,
  .linnkedout-focus-mode ytd-comments,
  .linnkedout-focus-mode #comment-teaser,
  .linnkedout-focus-mode ytd-rich-grid-renderer,
  .linnkedout-focus-mode #contents.ytd-rich-grid-renderer {
    display: none !important;
  }

  /* Chill mode delay overlay */
  .linnkedout-chill-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0,0,0,0.95);
    z-index: 9999;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: white;
    font-family: 'YouTube Sans', 'Roboto', sans-serif;
  }

  .linnkedout-chill-timer {
    font-size: 72px;
    font-weight: bold;
    margin-bottom: 24px;
    color: #ff6b6b;
  }

  .linnkedout-chill-message {
    font-size: 18px;
    color: #888;
    max-width: 400px;
    text-align: center;
    line-height: 1.6;
  }

  /* Hide filtered videos */
  [data-linnkedout-hidden="true"] {
    display: none !important;
  }
`;
document.head.appendChild(styleSheet);

// Initialize
async function init() {
  const stored = await chrome.storage.local.get([STORAGE_KEY_MODE]);
  currentMode = (stored[STORAGE_KEY_MODE] as Mode) || "focus";

  console.log("LinnkedOut: Initialized in", currentMode, "mode");

  applyMode();
  observePageChanges();
}

function applyMode() {
  // Remove previous mode classes
  document.body.classList.remove(
    "linnkedout-focus-mode",
    "linnkedout-personalized-mode",
    "linnkedout-chill-mode"
  );

  switch (currentMode) {
    case "focus":
      applyFocusMode();
      break;
    case "personalized":
      applyPersonalizedMode();
      break;
    case "chill":
      applyChillMode();
      break;
  }
}

// ==================== FOCUS MODE ====================
function applyFocusMode() {
  document.body.classList.add("linnkedout-focus-mode");

  // Redirect homepage to Watch Later
  if (isHomePage()) {
    window.location.href = "https://www.youtube.com/playlist?list=WL";
  }
}

// ==================== PERSONALIZED MODE ====================
function applyPersonalizedMode() {
  document.body.classList.add("linnkedout-personalized-mode");

  // Don't redirect homepage, but filter it
  if (isVideoPage()) {
    showSkeletonAndProcess();
  }
}

async function showSkeletonAndProcess() {
  if (isProcessing) return;
  isProcessing = true;

  const sidebarContainer = document.querySelector(
    "ytd-watch-next-secondary-results-renderer #items, #secondary-inner #items, #related #items"
  );

  if (!sidebarContainer) {
    // Retry after DOM loads
    setTimeout(() => {
      isProcessing = false;
      showSkeletonAndProcess();
    }, 1000);
    return;
  }

  // Hide real recommendations
  const realItems = sidebarContainer.querySelectorAll(
    "ytd-compact-video-renderer, yt-lockup-view-model"
  );
  realItems.forEach((item) => {
    (item as HTMLElement).style.display = "none";
  });

  // Show skeleton loader
  const skeletonContainer = document.createElement("div");
  skeletonContainer.className = "linnkedout-skeleton-container";
  skeletonContainer.id = "linnkedout-skeleton";
  skeletonContainer.innerHTML = `
    <div class="linnkedout-processing-banner">
      <div class="linnkedout-spinner"></div>
      <span>Analyzing recommendations...</span>
    </div>
    ${Array(7).fill('<div class="linnkedout-skeleton"></div>').join("")}
  `;
  sidebarContainer.parentElement?.insertBefore(
    skeletonContainer,
    sidebarContainer
  );

  try {
    // Extract videos
    const videos = extractVideos();
    console.log("LinnkedOut: Found", videos.length, "videos to analyze");

    if (videos.length === 0) {
      removeSkeleton();
      realItems.forEach((item) => {
        (item as HTMLElement).style.display = "";
      });
      isProcessing = false;
      return;
    }

    // Send to background for processing
    const response = await chrome.runtime.sendMessage({
      type: "PROCESS_VIDEOS",
      videos: videos.slice(0, 20), // Max 20 videos
    });

    removeSkeleton();

    if (response?.scores) {
      // Filter based on scores - keep top 7
      const sortedScores = [...response.scores].sort(
        (a: { score: number }, b: { score: number }) => b.score - a.score
      );
      const topVideoIds = new Set(
        sortedScores.slice(0, 7).map((s: { videoId: string }) => s.videoId)
      );

      realItems.forEach((item) => {
        const videoId = extractVideoId(item);
        if (videoId && topVideoIds.has(videoId)) {
          (item as HTMLElement).style.display = "";
          item.removeAttribute("data-linnkedout-hidden");
        } else {
          (item as HTMLElement).style.display = "none";
          item.setAttribute("data-linnkedout-hidden", "true");
        }
      });

      console.log("LinnkedOut: Showing top 7 videos:", [...topVideoIds]);
    } else {
      // Fallback: show all
      realItems.forEach((item) => {
        (item as HTMLElement).style.display = "";
      });
    }
  } catch (err) {
    console.error("LinnkedOut: Processing error", err);
    removeSkeleton();
    realItems.forEach((item) => {
      (item as HTMLElement).style.display = "";
    });
  }

  isProcessing = false;
}

function removeSkeleton() {
  document.getElementById("linnkedout-skeleton")?.remove();
}

function extractVideos(): {
  videoId: string;
  title: string;
  channel: string;
}[] {
  const videos: { videoId: string; title: string; channel: string }[] = [];
  const seenIds = new Set<string>();

  // New YouTube structure
  const lockupItems = document.querySelectorAll("yt-lockup-view-model");
  lockupItems.forEach((item) => {
    const innerDiv = item.querySelector(".yt-lockup-view-model");
    if (!innerDiv) return;

    const classList = innerDiv.className;
    const videoIdMatch = classList.match(/content-id-([a-zA-Z0-9_-]+)/);
    const videoId = videoIdMatch ? videoIdMatch[1] : "";

    if (!videoId || seenIds.has(videoId)) return;
    seenIds.add(videoId);

    const titleElement = item.querySelector("h3");
    const title = titleElement?.textContent?.trim() || "";

    const channelElement = item.querySelector(
      ".yt-content-metadata-view-model__metadata-text"
    );
    const channel = channelElement?.textContent?.trim() || "";

    if (title) videos.push({ videoId, title, channel });
  });

  // Legacy structure
  const compactItems = document.querySelectorAll("ytd-compact-video-renderer");
  compactItems.forEach((item) => {
    const linkElement = item.querySelector("a#thumbnail");
    const href = linkElement?.getAttribute("href") || "";
    const videoIdMatch = href.match(/[?&]v=([^&]+)/);
    const videoId = videoIdMatch ? videoIdMatch[1] : "";

    if (!videoId || seenIds.has(videoId)) return;
    seenIds.add(videoId);

    const titleElement = item.querySelector("#video-title");
    const title = titleElement?.textContent?.trim() || "";

    const channelElement = item.querySelector("#channel-name");
    const channel = channelElement?.textContent?.trim() || "";

    if (title) videos.push({ videoId, title, channel });
  });

  return videos;
}

function extractVideoId(element: Element): string {
  // New structure
  const innerDiv = element.querySelector(".yt-lockup-view-model");
  if (innerDiv) {
    const match = innerDiv.className.match(/content-id-([a-zA-Z0-9_-]+)/);
    if (match) return match[1];
  }

  // Legacy
  const link = element.querySelector("a#thumbnail");
  if (link) {
    const match = link.getAttribute("href")?.match(/[?&]v=([^&]+)/);
    if (match) return match[1];
  }

  return "";
}

// ==================== CHILL MODE ====================
function applyChillMode() {
  document.body.classList.add("linnkedout-chill-mode");

  if (isVideoPage()) {
    showChillDelay();
  }
}

function showChillDelay() {
  // Random delay between 30-60 seconds
  const delaySeconds = Math.floor(Math.random() * 31) + 30;
  let remaining = delaySeconds;

  // Hide sidebar
  const sidebar = document.querySelector("#secondary, #related");
  if (sidebar) (sidebar as HTMLElement).style.visibility = "hidden";

  // Create overlay
  const overlay = document.createElement("div");
  overlay.className = "linnkedout-chill-overlay";
  overlay.id = "linnkedout-chill-overlay";
  overlay.innerHTML = `
    <div class="linnkedout-chill-timer">${remaining}s</div>
    <div class="linnkedout-chill-message">
      Taking a moment to breathe...<br><br>
      You chose chill mode. Recommendations will load shortly.<br>
      Use this time to ask yourself: do I really need to watch more?
    </div>
  `;
  document.body.appendChild(overlay);

  const timer = setInterval(() => {
    remaining--;
    const timerEl = overlay.querySelector(".linnkedout-chill-timer");
    if (timerEl) timerEl.textContent = `${remaining}s`;

    if (remaining <= 0) {
      clearInterval(timer);
      overlay.remove();
      if (sidebar) (sidebar as HTMLElement).style.visibility = "";
    }
  }, 1000);
}

// ==================== UTILITIES ====================
function isHomePage(): boolean {
  return (
    window.location.pathname === "/" ||
    window.location.pathname === "/feed/subscriptions"
  );
}

function isVideoPage(): boolean {
  return window.location.pathname === "/watch";
}

// Observe for URL changes (SPA navigation)
function observePageChanges() {
  let lastUrl = location.href;

  const observer = new MutationObserver(() => {
    if (location.href !== lastUrl) {
      lastUrl = location.href;
      console.log("LinnkedOut: URL changed, reapplying mode");
      isProcessing = false;
      removeSkeleton();
      applyMode();
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
}

// Listen for mode changes from popup
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === "MODE_CHANGED") {
    currentMode = message.mode;
    console.log("LinnkedOut: Mode changed to", currentMode);
    isProcessing = false;
    removeSkeleton();

    // Remove chill overlay if exists
    document.getElementById("linnkedout-chill-overlay")?.remove();

    applyMode();
    sendResponse({ success: true });
  }
  return true;
});

// Init when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}

console.log("LinnkedOut: Content script loaded");

// Empty export to make this file a module (fixes TS duplicate identifier errors)
export {};
