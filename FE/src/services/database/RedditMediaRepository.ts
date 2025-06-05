import { insertMedia, insertRedditMedia } from "@/server/functions/media";
import { Media, RedditMedia } from "../common/types";

export class RedditMediaRepository {

    saveRedditPostToDatabase = async (mediaData: Media, redditData: RedditMedia): Promise<number> => {
        try {
            const { id: redditId } = await this.insert_RedditMedia(redditData);
            if (redditId === undefined || redditId === null || isNaN(redditId) || redditId <= 0) throw new Error('RedditMediaRepository: Error saving metadata to the database');
            mediaData.redditId = redditId;

            const { id: mediaId } = await this.insert_Media(mediaData);
            if (mediaId === undefined || mediaId === null || isNaN(mediaId) || mediaId <= 0) throw new Error('RedditMediaRepository: Error saving metadata to the database');
            return mediaId;

        } catch (error) {
            console.error('Error saving media data to database:', error);
            throw error;
        }
    }

    private insert_RedditMedia = async (redditData: RedditMedia): Promise<{ id: number }> => {
        try {
            return await insertRedditMedia(redditData);
        } catch (error) {
            console.error('Error inserting Reddit media data:', error);
            throw error;
        }
    }

    private insert_Media = async (mediaData: Media): Promise<{ id: number }> => {
        try {
            return await insertMedia(mediaData);
        } catch (error) {
            console.error('Error inserting Reddit media data:', error);
            throw error;
        }
    }

}