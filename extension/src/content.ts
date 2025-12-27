// Content script for YouTube - extracts video metadata and filters recommendations

// Check if we're on the homepage
function isHomePage(): boolean {
  const path = window.location.pathname;
  return path === "/" || path === "/feed/subscriptions";
}

// Redirect homepage to Watch Later playlist
function handleHomePage() {
  if (isHomePage() && !window.location.search.includes("list=WL")) {
    console.log("LinnkedOut: Redirecting to Watch Later");
    window.location.href = "https://www.youtube.com/playlist?list=WL";
  }
}

// Initial redirect check
handleHomePage();

// Inject CSS to block infinite scroll in SIDEBAR ONLY (not comments)
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  /* Hide YouTube's infinite scroll loader/spinner in sidebar only */
  ytd-watch-next-secondary-results-renderer ytd-continuation-item-renderer,
  #secondary ytd-continuation-item-renderer,
  #related ytd-continuation-item-renderer {
    display: none !important;
  }

  /* Block scroll-triggered loading in sidebar only */
  ytd-watch-next-secondary-results-renderer[continuation] {
    --ytd-watch-next-secondary-results-renderer-continuation: none;
  }
`;
document.head.appendChild(styleSheet);

// Limit sidebar videos to first N items (removes extras that somehow load)
const MAX_SIDEBAR_VIDEOS = 20;

function limitVideos() {
  // Only limit sidebar video recommendations (not comments!)
  const sidebarContainer = document.querySelector(
    "ytd-watch-next-secondary-results-renderer #items, #secondary-inner #items"
  );
  if (sidebarContainer) {
    // Only select actual video elements, NOT ytd-item-section-renderer (which includes comments)
    const items = sidebarContainer.querySelectorAll(
      ":scope > ytd-compact-video-renderer, :scope > yt-lockup-view-model"
    );
    items.forEach((item, index) => {
      if (index >= MAX_SIDEBAR_VIDEOS) {
        (item as HTMLElement).style.display = "none";
      }
    });
  }
}

interface VideoMetadata {
  element: Element;
  videoId: string;
  title: string;
  channel: string;
  viewCount: string;
  duration: string;
}

// Track already processed videos to avoid re-filtering
const processedVideoIds = new Set<string>();

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === "GET_RECOMMENDATIONS") {
    const videos = extractRecommendations();
    sendResponse({
      videos: videos.map((v) => ({
        videoId: v.videoId,
        title: v.title,
        channel: v.channel,
        viewCount: v.viewCount,
        duration: v.duration,
      })),
    });
  } else if (message.type === "FILTER_VIDEOS") {
    filterVideos(message.videoIds);
    sendResponse({ success: true });
  } else if (message.type === "RESET_FILTER") {
    resetFilter();
    sendResponse({ success: true });
  }
  return true;
});

function extractRecommendations(onlyNew = false): VideoMetadata[] {
  const videos: VideoMetadata[] = [];
  const seenIds = new Set<string>();

  // NEW YouTube structure: yt-lockup-view-model (sidebar on watch page)
  const lockupItems = document.querySelectorAll("yt-lockup-view-model");

  lockupItems.forEach((item) => {
    const innerDiv = item.querySelector(".yt-lockup-view-model");
    if (!innerDiv) return;

    // Extract video ID from class like "content-id-tfbM6vYsW9g"
    const classList = innerDiv.className;
    const videoIdMatch = classList.match(/content-id-([a-zA-Z0-9_-]+)/);
    const videoId = videoIdMatch ? videoIdMatch[1] : "";

    if (!videoId || seenIds.has(videoId)) return;
    // Skip already processed videos if onlyNew is true
    if (onlyNew && processedVideoIds.has(videoId)) return;
    seenIds.add(videoId);

    // Title from h3 title attribute or inner text
    const titleElement = item.querySelector(
      "h3.yt-lockup-metadata-view-model__heading-reset"
    );
    const title =
      titleElement?.getAttribute("title") ||
      titleElement?.textContent?.trim() ||
      "";

    // Channel from first metadata row
    const metadataRows = item.querySelectorAll(
      ".yt-content-metadata-view-model__metadata-row"
    );
    let channel = "";
    let viewCount = "";

    if (metadataRows.length > 0) {
      // First row is usually channel name
      const channelSpan = metadataRows[0].querySelector(
        ".yt-content-metadata-view-model__metadata-text"
      );
      channel = channelSpan?.textContent?.trim() || "";
    }

    if (metadataRows.length > 1) {
      // Second row is views and time
      const viewSpan = metadataRows[1].querySelector(
        ".yt-content-metadata-view-model__metadata-text"
      );
      viewCount = viewSpan?.textContent?.trim() || "";
    }

    // Duration from badge
    const durationElement = item.querySelector(".yt-badge-shape__text");
    const duration = durationElement?.textContent?.trim() || "";

    if (title) {
      videos.push({
        element: item,
        videoId,
        title,
        channel,
        viewCount,
        duration,
      });
    }
  });

  // LEGACY: ytd-compact-video-renderer (older YouTube sidebar)
  const compactItems = document.querySelectorAll("ytd-compact-video-renderer");

  compactItems.forEach((item) => {
    const titleElement = item.querySelector("#video-title");
    const channelElement = item.querySelector(
      "#channel-name a, .ytd-channel-name a, #text.ytd-channel-name"
    );
    const viewsElement = item.querySelector("#metadata-line span:first-child");
    const durationElement = item.querySelector(
      "ytd-thumbnail-overlay-time-status-renderer span"
    );
    const linkElement = item.querySelector("a#thumbnail");

    const href = linkElement?.getAttribute("href") || "";
    const videoIdMatch = href.match(/[?&]v=([^&]+)/);
    const videoId = videoIdMatch ? videoIdMatch[1] : "";

    if (!videoId || seenIds.has(videoId)) return;
    if (onlyNew && processedVideoIds.has(videoId)) return;
    seenIds.add(videoId);

    if (videoId && titleElement) {
      videos.push({
        element: item,
        videoId,
        title: titleElement.textContent?.trim() || "",
        channel: channelElement?.textContent?.trim() || "Unknown",
        viewCount: viewsElement?.textContent?.trim() || "",
        duration: durationElement?.textContent?.trim() || "",
      });
    }
  });

  // NOTE: Homepage videos (ytd-rich-item-renderer) are NOT filtered
  // Homepage redirects to Watch Later playlist instead

  return videos;
}

function filterVideos(videoIdsToRemove: string[]) {
  // New structure: yt-lockup-view-model (sidebar)
  const lockupItems = document.querySelectorAll("yt-lockup-view-model");

  lockupItems.forEach((item) => {
    const innerDiv = item.querySelector(".yt-lockup-view-model");
    if (!innerDiv) return;

    const classList = innerDiv.className;
    const videoIdMatch = classList.match(/content-id-([a-zA-Z0-9_-]+)/);
    const videoId = videoIdMatch ? videoIdMatch[1] : "";

    if (videoIdsToRemove.includes(videoId)) {
      (item as HTMLElement).style.display = "none";
      item.setAttribute("data-linnkedout-filtered", "true");
    }
  });

  // Legacy sidebar structure: ytd-compact-video-renderer
  const compactItems = document.querySelectorAll("ytd-compact-video-renderer");

  compactItems.forEach((item) => {
    const linkElement = item.querySelector("a#thumbnail");
    const href = linkElement?.getAttribute("href") || "";
    const videoIdMatch = href.match(/[?&]v=([^&]+)/);
    const videoId = videoIdMatch ? videoIdMatch[1] : "";

    if (videoIdsToRemove.includes(videoId)) {
      (item as HTMLElement).style.display = "none";
      item.setAttribute("data-linnkedout-filtered", "true");
    }
  });
}

function resetFilter() {
  const filteredItems = document.querySelectorAll(
    "[data-linnkedout-filtered='true']"
  );
  filteredItems.forEach((item) => {
    (item as HTMLElement).style.display = "";
    item.removeAttribute("data-linnkedout-filtered");
  });
}

// Auto-filter using background script
let isFiltering = false;
const BATCH_SIZE = 2;

async function autoFilter() {
  // Skip filtering on homepage (it redirects to Watch Later)
  if (isHomePage()) return;

  if (isFiltering) return;
  isFiltering = true;

  try {
    // Only get NEW sidebar videos that haven't been processed yet
    const videos = extractRecommendations(true);
    if (videos.length === 0) {
      isFiltering = false;
      return;
    }

    console.log("LinnkedOut: Auto-filtering", videos.length, "NEW videos");

    // Process in batches
    for (let i = 0; i < videos.length; i += BATCH_SIZE) {
      const batch = videos.slice(i, i + BATCH_SIZE);
      const batchData = batch.map((v) => ({
        videoId: v.videoId,
        title: v.title,
        channel: v.channel,
      }));

      // Mark as processed before sending (to avoid re-processing on next mutation)
      batch.forEach((v) => processedVideoIds.add(v.videoId));

      const response = await chrome.runtime.sendMessage({
        type: "FILTER_VIDEOS_BG",
        videos: batchData,
      });

      if (response?.toBlock?.length > 0) {
        filterVideos(response.toBlock);
      }
    }
  } catch (err) {
    console.log("LinnkedOut: Filter error", err);
  }

  isFiltering = false;
}

// Debounce filter calls (1 second for faster response on scroll)
let filterTimeout: number | null = null;
function scheduleFilter() {
  if (filterTimeout) clearTimeout(filterTimeout);
  filterTimeout = setTimeout(() => autoFilter(), 1000) as unknown as number;
}

// Watch for new videos and limit them
const observer = new MutationObserver(() => {
  limitVideos(); // Immediately hide excess videos
  scheduleFilter();
});

// Track which containers we're already observing
const observedContainers = new WeakSet<Element>();

function startObserver() {
  const containerSelectors = [
    "#secondary",
    "#contents",
    "ytd-watch-next-secondary-results-renderer",
    "#items",
    "ytd-browse",
    "#related", // Additional sidebar container
    "ytd-watch-flexy #secondary-inner", // Video page sidebar
  ];

  containerSelectors.forEach((selector) => {
    const containers = document.querySelectorAll(selector);
    containers.forEach((container) => {
      if (!observedContainers.has(container)) {
        observer.observe(container, { childList: true, subtree: true });
        observedContainers.add(container);
        console.log("LinnkedOut: Observing container", selector);
      }
    });
  });
}

// Retry observer setup for dynamically loaded containers (like sidebar)
function ensureObserversAttached() {
  startObserver();
  // Retry a few times as sidebar loads asynchronously
  setTimeout(startObserver, 500);
  setTimeout(startObserver, 1500);
  setTimeout(startObserver, 3000);
}

// URL change detection - clear processed videos on navigation
let lastUrl = location.href;
const urlObserver = new MutationObserver(() => {
  if (location.href !== lastUrl) {
    lastUrl = location.href;
    console.log("LinnkedOut: URL changed to", location.pathname);

    // Check if navigated to homepage - redirect to Watch Later
    handleHomePage();

    processedVideoIds.clear();
    limitVideos();
    // Re-attach observers for new page containers (especially sidebar)
    ensureObserversAttached();
    scheduleFilter();
  }
});

// Init
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    ensureObserversAttached();
    urlObserver.observe(document.body, { childList: true, subtree: true });
  });
} else {
  ensureObserversAttached();
  urlObserver.observe(document.body, { childList: true, subtree: true });
}

// Initial limit and filter
limitVideos();
scheduleFilter();

console.log(
  "LinnkedOut: Content script loaded (auto-filter mode, infinite scroll blocked)"
);
