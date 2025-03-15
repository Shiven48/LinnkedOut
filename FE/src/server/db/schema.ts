import { relations} from "drizzle-orm";
import { integer, jsonb, pgEnum, pgTable, real, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";

// The enum for the type of media
export const mediaTypeEnum = pgEnum('type', ['short', 'image', 'video', 'photo']);

// The schema definition of the media (generalised schema for all the platforms)
export const media = pgTable('media', {
  id: serial('id').primaryKey(),
  type: mediaTypeEnum('type').notNull(),
  platform: varchar('platform', { length: 30 }).notNull(),
  thumbnailUrl: varchar('thumbnail_url', { length: 200 }),
  postUrl: varchar('post_url', { length: 500 }).notNull(),
  title: text('title').notNull(),
  durationMs: integer('duration_ms').default(0),
  postId: varchar('post_id', { length: 100 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// The schema definition of the reddit platform (This schema has basic reddit specific properties)
export const redditMedia = pgTable('reddit_media', {
  id: serial('id').primaryKey(),
  mediaId: integer('media_id').references(() => media.id).notNull().unique(),
  subreddit: text('subreddit').notNull(),
  author: text('author').notNull(),
  postLink: varchar('post_link', { length: 500 }).notNull(),
  comments: jsonb('comments')
});

// The schema definition of the youtube platform (This schema has basic youtube specific properties)
export const youtubeMedia = pgTable('youtube_media', {
  id: serial('id').primaryKey(),
  mediaId: integer('media_id').references(() => media.id).notNull().unique(),
  description: text('description'),
  definition: varchar('definition', { length: 10 }),
  englishCaptions: jsonb('english_captions')
});

export const mediaRelations = relations(media, ({ one }) => ({
    youtubeDetails: one(youtubeMedia,{
        fields: [media.id],
        references: [youtubeMedia.mediaId]
    }),
    redditDetails: one(redditMedia, {
      fields: [media.id],
      references: [redditMedia.mediaId],
    })
}));


