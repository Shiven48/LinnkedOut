import { db, queryDb } from '../db/index'
import { media, redditMedia, twitterMedia, youtubeMedia } from '../db/schema' 
import { Media, RedditMedia, TwitterMedia, YoutubeMedia } from '../../../types';
import { eq } from 'drizzle-orm';

// ORM layer
export const getAllMedia = async () => {
    'use server'
    try {
        return await db.select().from(media);
    } catch (error) {
        console.error('Failed to fetch media:', error);
        throw new Error('Failed to fetch media');
    }
}

export const getLatestVideos = async () => {
    'use server'
    try{
        return await queryDb.select()
                            .from(media)
                            .orderBy(media.createdAt)
                            .limit(10)
                            .execute();
    } catch(error){
        console.error('Failed to get latest data', error);
        throw new Error('Failed to get latest data'); 
    }
}

export const insertMedia = async (sharedMedia:Media) => {
    'use server'
    try{
        const currentTimestamp = new Date();
        return await db.insert(media)
                       .values([{
                            type: sharedMedia.type as "short" | "image" | "video" | "photo",
                            platform: sharedMedia.platform,
                            createdAt: currentTimestamp,
                            updatedAt: currentTimestamp,
                            thumbnailUrl: sharedMedia.thumbnailUrl,
                            hdThumbnailUrl: sharedMedia.hdThumbnailUrl
                       }])
                       .returning({ id: media.id });
    } catch(error){
        console.error('Failed to insert media model', error);
        throw new Error('Failed to insert media model'); 
    }
}

export const insertYoutubeMedia = async (ytMedia:YoutubeMedia) => {
    'use server'
    try{
        if (!ytMedia.mediaId) {
            throw new Error('mediaId is required');
        }
        
        return await db.insert(youtubeMedia)
                       .values([{
                            mediaId: ytMedia.mediaId,
                            videoId: ytMedia.videoId,
                            title: ytMedia.title,
                            description: ytMedia.description,
                            thumbnailUrl: ytMedia.thumbnailUrl,
                            thumbnailMediumUrl: ytMedia.thumbnailMediumUrl,
                            thumbnailHighUrl: ytMedia.thumbnailHighUrl,
                            thumbnailMaxRes: ytMedia.thumbnailMaxRes,
                            duration: ytMedia.duration,
                            definition: ytMedia.definition,
                            hasCaption: ytMedia.hasCaption,
                            tags: ytMedia.tags
                       }])
                       .returning({ id: youtubeMedia.id });
    } catch(error){
        console.error('Failed to insert youtube media model', error);
        throw new Error('Failed to insert youtube media model'); 
    }
}

export const insertTwitterMedia = async (tm:TwitterMedia) => {
    'use server'
    try {
        if (!tm.mediaId) {
            throw new Error('mediaId is required');
        }
        
        return await db.insert(twitterMedia)
                       .values([{
                            mediaId: tm.mediaId,
                            tweetId: tm.tweetId,
                            text: tm.text,
                            tweetMediaKey: tm.tweet_media_key,
                            mediaUrl: tm.media_url,
                            authorUsername: tm.username,
                            durationMS: tm.duration_ms
                       }])
                       .returning({ id: twitterMedia.id });
    } catch(error) {
        console.error('Failed to insert twitter media model', error);
        throw new Error('Failed to insert twitter media model'); 
    }
}

export const insertRedditMedia = async (reddit:RedditMedia) => {
    'use server'
    try {
        if (!reddit.mediaId) {
            throw new Error('mediaId is required');
        }
        
        return await db.insert(redditMedia)
                       .values([{
                            mediaId: reddit.mediaId,
                            subreddit: reddit.subreddit,
                            title: reddit.title,
                            type: reddit.type,
                            redditPostId: reddit.redditPostId,
                            author: reddit.author,
                            imageUrl: reddit.imageUrl,
                            hdImageUrl: reddit.hdImageUrl,
                            imageWidth: reddit.imageWidth,
                            imageHeight: reddit.imageHeight,
                            videoUrl: reddit.videoUrl,
                            videoWidth: reddit.videoWidth,
                            videoHeight: reddit.videoHeight,
                       }])
                       .returning({ id: redditMedia.id });
    } catch(error) {
        console.error('Failed to insert reddit media model', error);
        throw new Error('Failed to insert reddit media model'); 
    }
}

export const getMediaFromYoutubeById = async (id: number) => {
    'use server'
    try{
        return await db.select()
                        .from(youtubeMedia)
                        .where(eq(youtubeMedia.mediaId,id))
                        .limit(1)
    } catch (error){
        console.error(`Failed to fetch media from youtube by Id :${id}`, error)
        throw new Error(`Failed to fetch media from youtube`)
    }
}

export const getMediaFromTwitterById = async (id: number) => {
    'use server'
    try{
        return await db.select()
                        .from(twitterMedia)
                        .where(eq(twitterMedia.mediaId,id))
                        .limit(1)
    } catch (error){
        console.error(`Failed to fetch media from twitter by Id :${id}`, error)
        throw new Error(`Failed to fetch media from twitter`)
    }
}

export const getMediaFromRedditById = async (id: number) => {
    'use server'
    try {
        return await db.select()
                        .from(redditMedia)
                        .where(eq(redditMedia.id, id))
                        .limit(1); 
    } catch (error) {
        console.error('Detailed fetch error:', error);
        throw new Error(`Failed to fetch media from twitter: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

export const getAllMediaFromYoutube = async () => {
    'use server'
    try{
        return await db.select()
                       .from(youtubeMedia)
                       .execute()
    } catch(error){
        console.error('Detailed fetch error:', error);
        throw new Error(`Failed to fetch media from Youtube: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

export const getAllMediaFromTwitter = async () => {
    'use server'
    try{
        return await db.select()
                       .from(twitterMedia)
                       .execute()
    } catch(error){
        console.error('Detailed fetch error:', error);
        throw new Error(`Failed to fetch media from Twitter: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

export const getAllMediaFromReddit = async () => {
    'use server'
    try{
        return await db.select()
                       .from(redditMedia)
                       .execute()
    } catch(error){
        console.error('Detailed fetch error:', error);
        throw new Error(`Failed to fetch media from Reddit: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}