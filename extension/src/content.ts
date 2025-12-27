// LinnkedOut Content Script - Three Modes: Focus, Personalized, Chill

type Mode = "focus" | "personalized" | "chill";

const STORAGE_KEY_MODE = "linnkedout_mode";

let currentMode: Mode = "focus";
let isProcessing = false;
let stylesInjected = false;

// CSS styles as a string
const CSS_STYLES = `
  /* IMMEDIATE: Hide sidebar by default until we know the mode */
  html:not(.linnkedout-ready) #secondary,
  html:not(.linnkedout-ready) #related,
  html:not(.linnkedout-ready) ytd-watch-next-secondary-results-renderer {
    visibility: hidden !important;
  }

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

  /* BLOCK INFINITE SCROLL - Hide continuation/loader elements */
  #secondary ytd-continuation-item-renderer,
  #secondary #continuations,
  #related ytd-continuation-item-renderer,
  #related #continuations,
  ytd-watch-next-secondary-results-renderer ytd-continuation-item-renderer,
  ytd-watch-next-secondary-results-renderer #continuations,
  .ytd-watch-next-secondary-results-renderer ytd-continuation-item-renderer {
    display: none !important;
  }

  /* Personalized mode - hide sidebar until processed */
  .linnkedout-personalized-mode.linnkedout-loading #secondary,
  .linnkedout-personalized-mode.linnkedout-loading #related,
  .linnkedout-personalized-mode.linnkedout-loading ytd-watch-next-secondary-results-renderer {
    visibility: hidden !important;
  }

  /* Loading overlay for personalized mode */
  .linnkedout-loading-overlay {
    position: fixed;
    top: 0;
    right: 0;
    width: 420px;
    height: 100%;
    background: linear-gradient(180deg, #0f0f0f 0%, #1a1a1a 100%);
    z-index: 9998;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 24px;
    font-family: 'YouTube Sans', 'Roboto', sans-serif;
  }

  .linnkedout-loading-logo {
    width: 64px;
    height: 64px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 32px;
    font-weight: bold;
    color: white;
    animation: linnkedout-pulse 2s ease-in-out infinite;
  }

  @keyframes linnkedout-pulse {
    0%, 100% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.05); opacity: 0.8; }
  }

  .linnkedout-loading-text {
    color: #fff;
    font-size: 18px;
    font-weight: 500;
  }

  .linnkedout-loading-subtext {
    color: #888;
    font-size: 14px;
    text-align: center;
    max-width: 300px;
    line-height: 1.5;
  }

  .linnkedout-loading-progress {
    width: 200px;
    height: 4px;
    background: #333;
    border-radius: 2px;
    overflow: hidden;
  }

  .linnkedout-loading-progress-bar {
    height: 100%;
    background: linear-gradient(90deg, #667eea, #764ba2);
    border-radius: 2px;
    animation: linnkedout-progress 3s ease-in-out infinite;
  }

  @keyframes linnkedout-progress {
    0% { width: 0%; }
    50% { width: 70%; }
    100% { width: 100%; }
  }
`;

// Inject styles - robust method that works at document_start
function injectStyles() {
  if (stylesInjected) return;

  // If head exists, inject there
  if (document.head) {
    const styleSheet = document.createElement("style");
    styleSheet.id = "linnkedout-styles";
    styleSheet.textContent = CSS_STYLES;
    document.head.insertBefore(styleSheet, document.head.firstChild);
    stylesInjected = true;
    console.log("LinnkedOut: Styles injected into <head>");
    return;
  }

  // If documentElement exists but not head, we can still inject
  if (document.documentElement) {
    const styleSheet = document.createElement("style");
    styleSheet.id = "linnkedout-styles";
    styleSheet.textContent = CSS_STYLES;
    document.documentElement.appendChild(styleSheet);
    stylesInjected = true;
    console.log("LinnkedOut: Styles injected into <html>");
    return;
  }

  // Nothing exists yet, retry on next frame
  requestAnimationFrame(injectStyles);
}

// Try to inject immediately
try {
  injectStyles();
} catch (e) {
  console.error("LinnkedOut: Style injection error, retrying...", e);
  requestAnimationFrame(injectStyles);
}

// Initialize - called when DOM is ready
async function init() {
  // Ensure styles are injected
  injectStyles();

  const stored = await chrome.storage.local.get([STORAGE_KEY_MODE]);
  currentMode = (stored[STORAGE_KEY_MODE] as Mode) || "focus";

  console.log("LinnkedOut: Initialized in", currentMode, "mode");

  applyMode();
  observePageChanges();
}

function applyMode() {
  // Ensure body exists
  if (!document.body) {
    requestAnimationFrame(applyMode);
    return;
  }

  // Remove previous mode classes
  document.body.classList.remove(
    "linnkedout-focus-mode",
    "linnkedout-personalized-mode",
    "linnkedout-chill-mode"
  );

  // Remove any existing overlays
  document.getElementById("linnkedout-loading-overlay")?.remove();
  document.getElementById("linnkedout-chill-overlay")?.remove();

  switch (currentMode) {
    case "focus":
      applyFocusMode();
      // Mark ready - sidebar stays hidden via focus-mode CSS
      document.documentElement.classList.add("linnkedout-ready");
      break;
    case "personalized":
      applyPersonalizedMode();
      // DON'T mark ready yet - sidebar stays hidden until processing completes
      break;
    case "chill":
      applyChillMode();
      // Mark ready - chill mode shows sidebar after delay
      document.documentElement.classList.add("linnkedout-ready");
      break;
  }

  // Always limit to 20 videos max
  limitVideos();
}

// ==================== FOCUS MODE ====================
function applyFocusMode() {
  document.body.classList.add("linnkedout-focus-mode");

  // // Redirect homepage to Watch Later
  // if (isHomePage()) {
  //   window.location.href = "https://www.youtube.com/playlist?list=WL";
  // }
}

// ==================== PERSONALIZED MODE ====================
function applyPersonalizedMode() {
  document.body.classList.add("linnkedout-personalized-mode");

  // Redirect homepage to Watch Later
  // if (isHomePage()) {
  //   window.location.href = "https://www.youtube.com/playlist?list=WL";
  //   return;
  // }

  // Filter recommendations on video pages
  if (isVideoPage()) {
    showLoadingOverlay();
    showSkeletonAndProcess();
  }
}

function showLoadingOverlay() {
  // Remove existing overlay
  document.getElementById("linnkedout-loading-overlay")?.remove();

  // Add loading class to body
  document.body.classList.add("linnkedout-loading");

  // Create overlay
  const overlay = document.createElement("div");
  overlay.className = "linnkedout-loading-overlay";
  overlay.id = "linnkedout-loading-overlay";
  overlay.innerHTML = `
    <div class="linnkedout-loading-logo">L</div>
    <div class="linnkedout-loading-text">Curating your feed...</div>
    <div class="linnkedout-loading-progress">
      <div class="linnkedout-loading-progress-bar"></div>
    </div>
    <div class="linnkedout-loading-subtext">
      Fetching transcripts and analyzing with AI to find the most productive recommendations for you.
    </div>
  `;
  document.body.appendChild(overlay);
}

function removeLoadingOverlay() {
  document.body.classList.remove("linnkedout-loading");
  document.getElementById("linnkedout-loading-overlay")?.remove();
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
      removeLoadingOverlay();
      realItems.forEach((item) => {
        (item as HTMLElement).style.display = "";
      });
      document.documentElement.classList.add("linnkedout-ready");
      isProcessing = false;
      return;
    }

    // Send to background for processing
    const response = await chrome.runtime.sendMessage({
      type: "PROCESS_VIDEOS",
      videos: videos.slice(0, 20), // Max 20 videos
    });

    removeSkeleton();
    removeLoadingOverlay();
    document.documentElement.classList.add("linnkedout-ready");

    if (response?.rankings) {
      // Keep videos marked as "keep: true" (limited to top 7 found)
      const topVideoIds = new Set(
        (
          response.rankings as {
            videoId: string;
            keep: boolean;
          }[]
        )
          .filter((r) => r.keep)
          .slice(0, 7)
          .map((r) => r.videoId)
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
      console.log(
        "LinnkedOut: No rankings returned from background. Showing all (fallback)."
      );
      // Fallback: show all
      realItems.forEach((item) => {
        (item as HTMLElement).style.display = "";
      });
    }
  } catch (err) {
    console.error("LinnkedOut: Processing error", err);
    removeSkeleton();
    removeLoadingOverlay();
    document.documentElement.classList.add("linnkedout-ready");
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

// Limit sidebar to max 20 videos - block infinite scroll
function limitVideos() {
  const MAX_VIDEOS = 20;

  // Find all video items in sidebar
  const containers = document.querySelectorAll(
    "#secondary #items, #related #items, ytd-watch-next-secondary-results-renderer #items"
  );

  containers.forEach((container) => {
    const videos = container.querySelectorAll(
      "ytd-compact-video-renderer, yt-lockup-view-model"
    );

    videos.forEach((video, index) => {
      if (index >= MAX_VIDEOS) {
        (video as HTMLElement).style.display = "none";
        video.setAttribute("data-linnkedout-limited", "true");
      }
    });
  });
}

// Observe for URL changes (SPA navigation)
function observePageChanges() {
  let lastUrl = location.href;

  const observer = new MutationObserver(() => {
    // Always limit videos to prevent infinite scroll
    limitVideos();

    if (location.href !== lastUrl) {
      lastUrl = location.href;
      console.log("LinnkedOut: URL changed, reapplying mode");
      isProcessing = false;
      removeSkeleton();
      removeLoadingOverlay();

      // Reset ready state so sidebar is hidden again until mode is applied
      document.documentElement.classList.remove("linnkedout-ready");

      applyMode();
    }
  });

  // Ensure body exists before observing
  if (document.body) {
    observer.observe(document.body, { childList: true, subtree: true });
  } else {
    // Wait for body
    const waitForBody = () => {
      if (document.body) {
        observer.observe(document.body, { childList: true, subtree: true });
      } else {
        requestAnimationFrame(waitForBody);
      }
    };
    waitForBody();
  }
}

// Listen for mode changes from popup
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === "MODE_CHANGED") {
    currentMode = message.mode;
    console.log("LinnkedOut: Mode changed to", currentMode);
    isProcessing = false;
    removeSkeleton();
    removeLoadingOverlay();

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
