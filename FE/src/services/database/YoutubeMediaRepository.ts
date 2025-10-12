import { Media, YoutubeMedia } from "@/services/common/types";
import { insertMedia, insertYoutubeMedia } from "@/server/functions/media";

export class YoutubeMediaRepository {
  public async saveYoutubeMediaData(
    mediaData: Media,
    youtubeData: YoutubeMedia,
    userId: string
  ): Promise<void> {
    try {
      const { id: youtubeId } = await this.insert_YoutubeMedia(youtubeData);
      if (
        youtubeId === undefined ||
        youtubeId === null ||
        isNaN(youtubeId) ||
        youtubeId <= 0
      )
        throw new Error("Error saving metadata to the database");
      mediaData.youtubeId = youtubeId;

      const { id: mediaId } = await this.insert_Media(mediaData, userId);
      if (
        mediaId === undefined ||
        mediaId === null ||
        isNaN(mediaId) ||
        mediaId <= 0
      )
        throw new Error("Error saving metadata to the database");
      mediaData.id = mediaId;
      console.log(`Stored media and YT data: ${mediaId} : ${youtubeId}`);
    } catch (error) {
      console.error("Error saving media data to database:", error);
      throw error;
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
