import { db } from '../db/index'
import { media, redditMedia, youtubeMedia, contentVectors } from '../db/schema'
import { Media, RedditMedia, YoutubeMedia } from '../../../types';
import { eq, sql } from 'drizzle-orm';
import * as schema from "../db/schema"

// ORM layer
export const getAllMedia = async (): Promise<Media[]> => {
    'use server'
    try {
        return await db.select()
            .from(schema.media)
            .orderBy(schema.media.createdAt)
            .limit(12)
            .execute();
    } catch (error: any) {
        console.error('Failed to fetch media:', error);
        throw error;
    }
}

export const insertMedia = async (generalisedMedia: Media): Promise<{ id: number }> => {
    'use server'
    if (generalisedMedia.durationMs !== undefined && !Number.isInteger(generalisedMedia.durationMs)) {
        throw new Error('durationMs must be an integer');
    }
    try {
        const durationMs = generalisedMedia.durationMs !== undefined
            ? Math.floor(generalisedMedia.durationMs)
            : null;
        const [InsertedMedia] = await db.insert(media)
            .values({
                type: generalisedMedia.type,
                platform: generalisedMedia.platform,
                thumbnailUrl: generalisedMedia.thumbnailUrl,
                postUrl: generalisedMedia.postUrl,
                title: generalisedMedia.title,
                durationMs: durationMs,
                postId: generalisedMedia.postId,
                category: generalisedMedia.category,
                redditId: generalisedMedia.redditId,
                youtubeId: generalisedMedia.youtubeId,
                embeddingId: generalisedMedia.embeddingId,
            })
            .returning({ id: media.id });
            return {id : InsertedMedia.id}
    } catch (error) {
        console.error('Failed to insert media model', error);
        throw new Error('Failed to insert media model');
    }
}

export const insertYoutubeMedia = async (ytMedia: YoutubeMedia): Promise<{ id: number }> => {
    'use server'
    try {
        const [ReturnedMedia] = await db.insert(youtubeMedia)
            .values([{
                description: ytMedia.description,
                definition: ytMedia.definition,
                englishCaptions: ytMedia.englishCaptions
            }])
            .returning({ id: youtubeMedia.id });
            return {id : ReturnedMedia.id} 
    } catch (error) {
        console.error('Failed to insert youtube media model', error);
        throw new Error('Failed to insert youtube media model');
    }
}

export const insertRedditMedia = async (reddit: RedditMedia): Promise<{ id: number }> => {
    'use server'
    try {
        const [ReturnedMedia] = await db.insert(redditMedia)
            .values([{
                subreddit: reddit.subreddit,
                author: reddit.author,
                postLink: reddit.postLink,
                comments: reddit.comments
            }])
            .returning({ id: redditMedia.id });
        return {id : ReturnedMedia.id} 
    } catch (error) {
        console.error('Failed to insert reddit media model', error);
        throw new Error('Failed to insert reddit media model');
    }
}

export const getFromMediaById = async (id: number) => {
    'use server'
    try {
        return await db.select()
            .from(media)
            .where(eq(media.id, id))
            .limit(1)
    } catch (error) {
        console.error(`Failed to fetch from media by Id :${id}`, error)
        throw new Error(`Failed to fetch from media`)
    }
}

// Change media id to youtube_id
export const getMediaFromYoutubeById = async (id: number):Promise<YoutubeMedia> => {
    'use server'
    try {
        return await db.select()
            .from(youtubeMedia)
            .where(eq(media.youtubeId, id))
            .limit(1)
    } catch (error) {
        console.error(`Failed to fetch media from youtube by Id :${id}`, error)
        throw new Error(`Failed to fetch media from youtube`)
    }
}

// Change media id to reddit_id
export const getMediaFromRedditById = async (id: number) => {
    'use server'
    try {
        return await db.select()
            .from(redditMedia)
            .where(eq(media.redditId, id))
            .limit(1);
    } catch (error) {
        console.error('Detailed fetch error:', error);
        throw new Error(`Failed to fetch media from twitter: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

export const getAllMediaFromYoutube = async():Promise<Media[]> => {
    'use server'
    try {
        return await db.select()
            .from(media)
            .where(eq(media.platform,'youtube'))
            .limit(12);
    } catch (error) {
        console.error('Detailed fetch error:', error);
        throw new Error(`Failed to fetch media from Youtube: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

export const getAllMediaFromReddit = async():Promise<Media[]> => {
    'use server'
    try {
        return await db.select()
            .from(media)
            .where(eq(media.platform, 'reddit'))
            .limit(12)
    } catch (error) {
        console.error('Detailed fetch error:', error);
        throw new Error(`Failed to fetch media from Reddit: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

// This is for search suggestion(SearchBar)
export const getMediaFromQuery = async (query: string): Promise<Media[]> => {
    'use server'
    try {
        return await db.select()
            .from(media)
            .where(sql`${media.title} ILIKE ${'%' + query + '%'}`)
            .limit(10)
    } catch (error) {
        console.error('Something went wrong while querying database', error)
        throw new Error(`Failed to query database: ${error instanceof Error ? error.message : "Unknown Error Occured"}`)
    }
}

export const insertEmbeddings = async (content: string, contentEmbeddings: number[], category: string): Promise<{ id: number }> => {
    try {
        const insertedRecord = await db
            .insert(schema.contentVectors)
            .values({
                content: content,
                contentEmbedding: contentEmbeddings,
                category: category
            })
            .returning({ id: schema.contentVectors.id });
        return { id: insertedRecord[0].id };
    } catch (error) {
        console.error('Something went wrong while querying database', error);
        throw new Error(`Failed to insert embeddings in the database: ${error instanceof Error ? error.message : "Unknown Error Occurred"}`);
    }
};

export const getMediaByCategory = async (category:string): Promise<Media[]> => {
    'use server'
    try {
        return await db.select()
            .from(media)
            .where(eq(media.category, category))
            .limit(10)
    } catch (error) {
        console.error('Detailed fetch error:', error);
        throw new Error(`Failed to fetch media from category: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

// export const getSimilarSearchedFromEmbeddings = async (queryEmbedding: number[], limit: number): Promise<any> => {
//     try {
//         return 1;
//     } catch (error) {
//         console.error('Something went wrong while querying database', error);
//         throw new Error(`Failed to insert embeddings in the database: ${error instanceof Error ? error.message : "Unknown Error Occurred"}`);
//     }
// }

// const { rows } = await this.client.query(`
//     SELECT
//       content,
//       categories,
//       1 - (embedding <=> $1) AS similarity
//     FROM content_vectors
//     ORDER BY similarity DESC
//     LIMIT $2
//   `, [queryEmbedding, limit]);