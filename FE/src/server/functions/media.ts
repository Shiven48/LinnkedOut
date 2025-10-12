import { db } from "../db/index";
import { media, redditMedia, youtubeMedia } from "../db/schema";
import { Media, RedditMedia, YoutubeMedia } from "@/services/common/types";
import { count, eq, sql, and, exists } from "drizzle-orm";
import { MEDIA_PER_PAGE } from "@/services/common/constants";
import * as schema from "../db/schema";

export const getAllMedia = async (
  userId: string,
  offset: number
): Promise<Media[]> => {
  try {
    return (await db
      .select()
      .from(schema.media)
      .where(eq(schema.media.userId, userId))
      .orderBy(schema.media.createdAt)
      .limit(MEDIA_PER_PAGE)
      .offset(offset)) as Media[];
  } catch (error: any) {
    console.error("Failed to fetch media:", error);
    throw error;
  }
};

export const getMediaCount = async (userId: string) => {
  try {
    const [{ mediaCount }] = await db
      .select({
        mediaCount: count(),
      })
      .from(media)
      .where(eq(media.userId, userId));
    return mediaCount;
  } catch (error: any) {
    console.error("Failed to fetch count of medias:", error);
    throw error;
  }
};

export const insertMedia = async (
  generalisedMedia: Media
): Promise<{ id: number }> => {
  // // 'use server'
  if (
    generalisedMedia.durationMs !== undefined &&
    !Number.isInteger(generalisedMedia.durationMs)
  ) {
    throw new Error("durationMs must be an integer");
  }
  try {
    const durationMs =
      generalisedMedia.durationMs !== undefined
        ? Math.floor(generalisedMedia.durationMs)
        : null;
    const [InsertedMedia] = await db
      .insert(media)
      .values({
        ...generalisedMedia,
        durationMs,
      })
      .returning({ id: media.id });
    return { id: InsertedMedia.id };
  } catch (error) {
    console.error("Failed to insert media model", error);
    throw new Error("Failed to insert media model");
  }
};

export const insertYoutubeMedia = async (
  ytMedia: YoutubeMedia
): Promise<{ id: number }> => {
  // 'use server'
  try {
    const [ReturnedMedia] = await db
      .insert(youtubeMedia)
      .values([
        {
          description: ytMedia.description,
          definition: ytMedia.definition,
          englishCaptions: ytMedia.englishCaptions,
        },
      ])
      .returning({ id: youtubeMedia.id });
    return { id: ReturnedMedia.id };
  } catch (error) {
    console.error("Failed to insert youtube media model", error);
    throw new Error("Failed to insert youtube media model");
  }
};

export const insertRedditMedia = async (
  reddit: RedditMedia
): Promise<{ id: number }> => {
  // 'use server'
  try {
    const [ReturnedMedia] = await db
      .insert(redditMedia)
      .values([
        {
          subreddit: reddit.subreddit,
          author: reddit.author,
          postLink: reddit.postLink,
          comments: reddit.comments,
        },
      ])
      .returning({ id: redditMedia.id });
    return { id: ReturnedMedia.id };
  } catch (error) {
    console.error("Failed to insert reddit media model", error);
    throw new Error("Failed to insert reddit media model");
  }
};

export const getFromMediaById = async (
  id: number,
  userId: string
): Promise<Media> => {
  // 'use server'
  try {
    const [fetchedVideo] = await db
      .select()
      .from(media)
      .where(and(eq(media.id, id), eq(media.userId, userId)))
      .limit(1);
    return fetchedVideo as Media;
  } catch (error) {
    console.error(`Failed to fetch from media by Id :${id}`, error);
    throw new Error(`Failed to fetch from media`);
  }
};

// Change media id to youtube_id
export const getMediaFromYoutubeById = async (
  id: number,
  userId: string
): Promise<YoutubeMedia> => {
  // 'use server'
  try {
    const [fetchedYoutubeMedia] = await db
      .select()
      .from(youtubeMedia)
      .where(
        and(
          eq(youtubeMedia.id, id),
          exists(
            db
              .select({ n: sql`1` })
              .from(media)
              .where(
                and(
                  eq(media.youtubeId, youtubeMedia.id),
                  eq(media.userId, userId)
                )
              )
          )
        )
      )
      .limit(1);
    return fetchedYoutubeMedia as YoutubeMedia;
  } catch (error) {
    console.error(`Failed to fetch media from youtube by Id :${id}`, error);
    throw new Error(`Failed to fetch media from youtube`);
  }
};

// Change media id to reddit_id
export const getMediaFromRedditById = async (
  id: number,
  userId: string
): Promise<RedditMedia | null> => {
  // 'use server'
  try {
    const [fetchedRedditMedia]: RedditMedia[] = await db
      .select()
      .from(redditMedia)
      .where(
        and(
          eq(redditMedia.id, id),
          exists(
            db
              .select({ n: sql`1` })
              .from(media)
              .where(
                and(
                  eq(media.redditId, redditMedia.id),
                  eq(media.userId, userId)
                )
              )
          )
        )
      )
      .limit(1);
    return (fetchedRedditMedia ?? null) as RedditMedia | null;
  } catch (error) {
    console.error("Detailed fetch error:", error);
    throw new Error(
      `Failed to fetch media from reddit: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
};

export const getAllMediaWherePlatformYoutube = async (
  userId: string,
  offset: number = 1
): Promise<Media[]> => {
  try {
    return (await db
      .select()
      .from(media)
      .where(and(eq(media.platform, "youtube"), eq(media.userId, userId)))
      .limit(MEDIA_PER_PAGE)
      .offset(offset)) as Media[];
  } catch (error) {
    console.error("Detailed fetch error:", error);
    throw new Error(
      `Failed to fetch media from Youtube: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
};

export const getAllMediaWherePlatformReddit = async (
  userId: string,
  offset: number = 1
): Promise<Media[]> => {
  // 'use server'
  try {
    return (await db
      .select()
      .from(media)
      .where(and(eq(media.platform, "reddit"), eq(media.userId, userId)))
      .limit(MEDIA_PER_PAGE)
      .offset(offset)) as Media[];
  } catch (error) {
    console.error("Detailed fetch error:", error);
    throw new Error(
      `Failed to fetch media from Reddit: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
};

export const getYoutubeMediaCount = async (userId: string): Promise<number> => {
  try {
    const [{ ytMediaCount }] = await db
      .select({ ytMediaCount: count() })
      .from(media)
      .where(and(eq(media.platform, "youtube"), eq(media.userId, userId)));
    return ytMediaCount;
  } catch (error: any) {
    console.error("Detailed fetch error:", error);
    throw new Error(
      `Failed to fetch media count of Youtube: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
};

export const getRedditMediaCount = async (userId: string): Promise<number> => {
  try {
    const [{ rdtMediaCount }] = await db
      .select({ rdtMediaCount: count() })
      .from(media)
      .where(and(eq(media.platform, "reddit"), eq(media.userId, userId)));
    return rdtMediaCount;
  } catch (error: any) {
    console.error("Detailed fetch error:", error);
    throw new Error(
      `Failed to fetch media count of Reddit: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
};

// This is for search suggestion(SearchBar)
export const getMediaFromQuery = async (
  userId: string,
  query: string
): Promise<Media[]> => {
  // 'use server'
  try {
    return (await db
      .select()
      .from(media)
      .where(
        and(
          sql`${media.title} ILIKE ${"%" + query + "%"}`,
          eq(media.userId, userId)
        )
      )
      .limit(MEDIA_PER_PAGE)) as Media[];
  } catch (error) {
    console.error("Something went wrong while querying database", error);
    throw new Error(
      `Failed to query database: ${
        error instanceof Error ? error.message : "Unknown Error Occured"
      }`
    );
  }
};

export const insertEmbeddings = async (
  content: string,
  contentEmbeddings: number[]
): Promise<{ id: number }> => {
  try {
    const insertedRecord = await db
      .insert(schema.contentVectors)
      .values({
        content: content,
        contentEmbedding: contentEmbeddings,
      })
      .returning({ id: schema.contentVectors.id });
    return { id: insertedRecord[0].id };
  } catch (error) {
    console.error("Something went wrong while querying database", error);
    throw new Error(
      `Failed to insert embeddings in the database: ${
        error instanceof Error ? error.message : "Unknown Error Occurred"
      }`
    );
  }
};

export const getMediaByCategory = async (
  userId: string,
  category: string,
  offset: number
): Promise<Media[]> => {
  try {
    return (await db
      .select()
      .from(media)
      .where(and(eq(media.category, category), eq(media.userId, userId)))
      .limit(MEDIA_PER_PAGE)
      .offset(offset)) as Media[];
  } catch (error) {
    console.error("Detailed fetch error:", error);
    throw new Error(
      `Failed to fetch media from given category: ${category}: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
};

export const getCategoryCount = async (
  userId: string,
  category: string
): Promise<number> => {
  try {
    const [{ categoryCount }] = await db
      .select({ categoryCount: count() })
      .from(media)
      .where(and(eq(media.category, category), eq(media.userId, userId)))
      .limit(MEDIA_PER_PAGE);
    return categoryCount;
  } catch (error) {
    console.error("Detailed fetch error:", error);
    throw new Error(
      `Failed to fetch media count of given category ${category}: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
};

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
