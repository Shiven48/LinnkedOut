import { db } from '../db/index'
import { media, redditMedia, youtubeMedia } from '../db/schema' 
import { Media, RedditMedia, YoutubeMedia } from '../../../types';
import { eq, sql } from 'drizzle-orm';

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
        return await db.select()
                            .from(media)
                            .orderBy(media.createdAt)
                            .limit(10)
                            .execute();
    } catch(error){
        console.error('Failed to get latest data', error);
        throw new Error('Failed to get latest data'); 
    }
}

export const insertMedia = async (generalisedMedia: Media) => {
    'use server'      
    if (generalisedMedia.durationMs !== undefined && !Number.isInteger(generalisedMedia.durationMs)) {
        throw new Error('durationMs must be an integer');
    }                    
    try {
        const durationMs = generalisedMedia.durationMs !== undefined 
            ? Math.floor(generalisedMedia.durationMs)
            : null;
        return await db.insert(media)
                       .values({
                            type: generalisedMedia.type,
                            platform: generalisedMedia.platform,
                            thumbnailUrl: generalisedMedia.thumbnailUrl,
                            postUrl: generalisedMedia.postUrl,
                            title: generalisedMedia.title,
                            durationMs: durationMs,
                            postId: generalisedMedia.postId
                       })
                       .returning({ id: media.id });
                       
    } catch(error) {
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
                            description: ytMedia.description,
                            definition: ytMedia.definition,
                            englishCaptions: ytMedia.englishCaptions                   
                       }])
                       .returning({ id: youtubeMedia.id });
    } catch(error){
        console.error('Failed to insert youtube media model', error);
        throw new Error('Failed to insert youtube media model'); 
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
                        author: reddit.author,
                        postLink: reddit.postLink,
                        comments: reddit.comments
                       }])
                       .returning({ id: redditMedia.id });
    } catch(error) {
        console.error('Failed to insert reddit media model', error);
        throw new Error('Failed to insert reddit media model'); 
    }
}

export const getFromMediaById = async (id: number) => {
    'use server'
    try{
        return await db.select()
                        .from(media)
                        .where(eq(media.id,id))
                        .limit(1)
    } catch (error){
        console.error(`Failed to fetch from media by Id :${id}`, error)
        throw new Error(`Failed to fetch from media`)
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

export const getMediaFromRedditById = async (id: number) => {
    'use server'
    try {
        return await db.select()
                        .from(redditMedia)
                        .where(eq(redditMedia.mediaId, id))
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

export const getMediaFromQuery = async (query:string):Promise<Media[]> => {
    'use server'
    try{
        return await db.select()
                    .from(media)
                    .where(sql`${media.title} ILIKE ${'%' + query + '%'}`)
                    .limit(10)
    } catch(error){
        console.error('Something went wrong while querying database',error)
        throw new Error(`Failed to query database: ${error instanceof Error ? error.message : "Unknown Error Occured"}`)
    }
}