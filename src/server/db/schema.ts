import { relations } from "drizzle-orm";
import {
  integer,
  jsonb,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
  vector,
} from "drizzle-orm/pg-core";

// Media type enum
export const mediaTypeEnum = pgEnum("type", [
  "short",
  "image",
  "video",
  "photo",
  "self",
]);

// Generalized media table
export const media = pgTable("media", {
  id: serial("id").primaryKey(),
  type: mediaTypeEnum("type").notNull(),
  platform: varchar("platform", { length: 30 }).notNull(),
  thumbnailUrl: varchar("thumbnail_url", { length: 200 }).notNull().default(""),
  postUrl: varchar("post_url", { length: 500 }).notNull(),
  title: text("title").notNull(),
  durationMs: integer("duration_ms").notNull().default(0),
  postId: varchar("post_id", { length: 100 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  category: text("category").notNull(),
  userId: varchar("user_id", { length: 256 }).notNull(),
  // tags: text('tags').array().default([]),
  redditId: integer("reddit_id")
    .references(() => redditMedia.id)
    .unique(),
  youtubeId: integer("youtube_id")
    .references(() => youtubeMedia.id)
    .unique(),
  embeddingId: integer("embedding_id")
    .references(() => contentVectors.id)
    .unique(),
});

// Reddit-specific table
export const redditMedia = pgTable("reddit_media", {
  id: serial("id").primaryKey(),
  subreddit: text("subreddit").notNull(),
  author: text("author").notNull(),
  postLink: varchar("post_link", { length: 500 }).notNull(),
  comments: jsonb("comments"),
});

// YouTube-specific table
export const youtubeMedia = pgTable("youtube_media", {
  id: serial("id").primaryKey(),
  description: text("description"),
  definition: varchar("definition", { length: 10 }),
  englishCaptions: jsonb("english_captions"),
});

// Embeddings table (using vector type for efficiency)
export const contentVectors = pgTable("media_embeddings", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  contentEmbedding: vector("embedding", { dimensions: 1024 }),
});

// Corrected relations
export const mediaRelations = relations(media, ({ one }) => ({
  youtubeDetails: one(youtubeMedia, {
    fields: [media.youtubeId],
    references: [youtubeMedia.id],
  }),
  redditDetails: one(redditMedia, {
    fields: [media.redditId],
    references: [redditMedia.id],
  }),
  embeddingDetails: one(contentVectors, {
    fields: [media.embeddingId],
    references: [contentVectors.id],
  }),
}));

export const schema = {
  media,
  redditMedia,
  youtubeMedia,
  contentVectors,
};
