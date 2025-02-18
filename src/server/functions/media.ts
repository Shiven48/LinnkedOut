import { db } from '../db/index'
import { media } from '../db/schema' 

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
