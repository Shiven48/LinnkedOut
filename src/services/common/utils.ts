import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { ErrorObj, FilteringStage, Media } from "@/services/common/types";
import { CATEGORY_MAPPING } from "./constants";

export class utility {
  public static async apicaller(
    url: string,
    options: RequestInit = {},
    maxRetries: number = 1,
    baseTimeout: number = 1000
  ): Promise<Response> {
    if (!url || typeof url !== "string")
      throw new Error(`Error in apicaller: Invalid URL - ${url}`);
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await fetch(url, options);
      } catch (error: unknown) {
        if (attempt < maxRetries) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          console.warn(
            `Attempt ${attempt} failed. Retrying in ${baseTimeout}ms... Error: ${errorMessage}`
          );
          await new Promise((res) => setTimeout(res, baseTimeout));
        } else {
          const finalError = error instanceof Error ? error.message : String(error);
          throw new Error(
            `Failed after ${maxRetries} attempts: ${finalError}`
          );
        }
      }
    }
    throw new Error("apicaller: Unexpected termination of retry loop");
  }

  public cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
  }

  public static HandleError(error: unknown) {
    if (error instanceof Error) {
      console.error("Error fetching videos:", error);
      const errorObj: ErrorObj = {
        name: error.name,
        message: error.message,
      };
      return errorObj;
    } else {
      console.warn("Caught an unknown error type:", error);
      return {
        name: "UnknownError",
        message: String(error),
      } as ErrorObj;
    }
  }

  public static getCategoryFromId(id: string): string {
    return CATEGORY_MAPPING[id] || "General";
  }

  public static getQualityTermsForCategory(categoryId: string): string[] {
    const qualityTermsByCategory: Record<string, string[]> = {
      "10": [
        "live session",
        "acoustic version",
        "studio recording",
        "original mix",
        "unreleased",
      ],
      "28": [
        "implementation",
        "architecture",
        "deep dive",
        "production",
        "case study",
      ],
      "27": [
        "comprehensive",
        "in-depth",
        "professional",
        "expert analysis",
        "detailed",
      ],
      "25": [
        "analysis",
        "investigation",
        "documentary",
        "in-depth report",
        "expert interview",
      ],
      "17": [
        "technique",
        "training method",
        "professional",
        "coaching",
        "skill development",
      ],
      "26": [
        "step-by-step",
        "detailed process",
        "professional technique",
        "expert method",
      ],
      "19": [
        "authentic",
        "local experience",
        "cultural insight",
        "hidden gems",
        "off beaten path",
      ],
    };

    return (
      qualityTermsByCategory[categoryId] || [
        "detailed",
        "professional",
        "expert",
      ]
    );
  }

  public static getIdOfplatform(media: Media): number {
    if (!media) {
      console.warn("getIdOfplatform: Media is empty");
      return 0;
    }

    const platform = media.platform?.toLowerCase().trim();
    if (!platform) {
      console.warn("getIdOfplatform: Platform is null or empty for media:", media);
      // Fallback: search for any available ID
      const fallbackId = media.youtubeId || media.redditId || media.id || 0;
      return fallbackId as number;
    }

    let platformId: number | null | undefined = 0;

    if (platform === "youtube") {
      platformId = media.youtubeId;
    } else if (platform === "reddit") {
      platformId = media.redditId;
    } else {
      // For any other platforms, use the main media id if available
      platformId = media.id;
    }

    if (!platformId) {
      console.error(`Missing ID for platform ${platform}:`, media);
      return (media.id || 0) as number;
    }

    return platformId as number;
  }

  public static viewTime(durationMs: number | undefined): string {
    if (!durationMs) {
      console.warn("Duration is null or undefined");
      return "0:00";
    }
    const duration = durationMs / 1000;
    const hours = Math.floor(duration / 3600);
    const minutes = Math.floor((duration % 3600) / 60);
    const seconds = Math.floor(duration % 60);

    if (hours < 1) {
      return `${minutes.toString().padStart(2, "0")}:${seconds
        .toString()
        .padStart(2, "0")}`;
    }
    return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  }

  public static getPlatformIcon(platform: string) {
    switch (platform.toLowerCase()) {
      case "reddit":
        return "/reddit.svg";
      case "youtube":
        return "/youtube.svg";
      default:
        return "🎬";
    }
  }

  public static getTitle(title: string): string {
    if (title.length > 40) {
      return title.slice(0, 50).concat("...");
    }
    return title;
  }

  public static getFilteringStage(stage: FilteringStage): string {
    switch (stage) {
      case FilteringStage.ID_DEDUPLICATION:
        return "ID Deduplication";
      case FilteringStage.SCORE_EXTRATION:
        return "Score Extration";
      default:
        return "Unknown";
    }
  } 
}
