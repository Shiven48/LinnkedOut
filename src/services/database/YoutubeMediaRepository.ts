import { Media, YoutubeMedia } from "@/services/common/types";
import { insertMedia, insertYoutubeMedia } from "@/server/functions/media";

export class YoutubeMediaRepository {
  public async saveYoutubeMediaData(
    mediaData: Media,
    youtubeData: YoutubeMedia,
    userId: string
  ): Promise<void> {
    try {
      console.log(`[YoutubeMediaRepository] Saving YouTube metadata for video...`);
      const { id: youtubeId } = await this.insert_YoutubeMedia(youtubeData);
      
      if (!youtubeId || isNaN(youtubeId) || youtubeId <= 0) {
        throw new Error("Failed to retrieve a valid YouTube Media ID after insertion.");
      }
      
      mediaData.youtubeId = youtubeId;
      console.log(`[YoutubeMediaRepository] YouTube metadata saved with ID: ${youtubeId}`);

      console.log(`[YoutubeMediaRepository] Saving generalized media data...`);
      const { id: mediaId } = await this.insert_Media(mediaData, userId);
      
      if (!mediaId || isNaN(mediaId) || mediaId <= 0) {
        throw new Error("Failed to retrieve a valid Media ID after insertion.");
      }
      
      mediaData.id = mediaId;
      console.log(`[YoutubeMediaRepository] Media and YT data linked successfully: Media ID ${mediaId}, YT ID ${youtubeId}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      console.error(`[YoutubeMediaRepository] Storage failed: ${errorMessage}`, error);
      throw new Error(`Database storage failed in YoutubeMediaRepository: ${errorMessage}`);
    }
  }

  private async insert_YoutubeMedia(
    youtubeData: YoutubeMedia
  ): Promise<{ id: number }> {
    try {
      return await insertYoutubeMedia(youtubeData);
    } catch (error) {
      console.error("Error inserting YouTube media data:", error);
      throw error;
    }
  }

  private async insert_Media(
    mediaData: Media,
    userId: string
  ): Promise<{ id: number }> {
    try {
      return await insertMedia(mediaData, userId);
    } catch (error) {
      console.error("Error inserting media data:", error);
      throw error;
    }
  }
}
