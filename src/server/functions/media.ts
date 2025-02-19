import { drizzle } from 'drizzle-orm/postgres-js';
import { db, queryDb } from '../db/index'
import { media, youtubeMedia } from '../db/schema' 
import { Media, YoutubeMedia } from '@/types';

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
                            type: sharedMedia.type as "short" | "image" | "video",
                            platform: sharedMedia.platform,
                            createdAt: currentTimestamp,
                            updatedAt: currentTimestamp
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