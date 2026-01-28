import { Media } from "@/services/common/types";
import { utility } from "@/services/common/utils";
import { SERVER_BASE_URL } from "@/services/common/constants";

export default async function getMediaWithPlatformIds() {
  try {
    const res = await fetch(`${SERVER_BASE_URL}/api/videos`, {
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error(`Error: ${res.statusText}`);
    }

    const data = await res.json();
    const media = data.body;

    // Process media items to include platformId
    const processedMedia = media.map((media: Media) => {
      try {
        const platformId = utility.getIdOfplatform(media);
        return {
          ...media,
          platformId,
        };
      } catch (error) {
        console.error(`Error processing media ${media.id}:`, error);
        return {
          ...media,
          platformId: 0,
        };
      }
    });

    return processedMedia;
  } catch (error) {
    console.error("Error fetching media:", error);
    return [];
  }
}
