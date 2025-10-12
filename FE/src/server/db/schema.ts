// import { relations} from "drizzle-orm";
// import { integer, jsonb, pgEnum, pgTable, serial, text, timestamp, varchar, vector } from "drizzle-orm/pg-core";

// // The enum for the type of media
// export const mediaTypeEnum = pgEnum('type', ['short', 'image', 'video', 'photo']);

// // The schema definition of the media (generalised schema for all the platforms)
// export const media = pgTable('media', {
//   id: serial('id').primaryKey(),
//   type: mediaTypeEnum('type').notNull(),
//   platform: varchar('platform', { length: 30 }).notNull(),
//   thumbnailUrl: varchar('thumbnail_url', { length: 200 }),
//   postUrl: varchar('post_url', { length: 500 }).notNull(),
//   title: text('title').notNull(),
//   durationMs: integer('duration_ms').default(0),
//   postId: varchar('post_id', { length: 100 }).notNull(),
//   createdAt: timestamp('created_at').defaultNow().notNull(),
//   updatedAt: timestamp('updated_at').defaultNow().notNull()
// });

// // The schema definition of the reddit platform (This schema has basic reddit specific properties)
// export const redditMedia = pgTable('reddit_media', {
//   id: serial('id').primaryKey(),
//   mediaId: integer('media_id').references(() => media.id).notNull().unique(),
//   subreddit: text('subreddit').notNull(),
//   author: text('author').notNull(),
//   postLink: varchar('post_link', { length: 500 }).notNull(),
//   comments: jsonb('comments')
// });

// // The schema definition of the youtube platform (This schema has basic youtube specific properties)
// export const youtubeMedia = pgTable('youtube_media', {
//   id: serial('id').primaryKey(),
//   mediaId: integer('media_id').references(() => media.id).notNull().unique(),
//   description: text('description'),
//   definition: varchar('definition', { length: 10 }),
//   englishCaptions: jsonb('english_captions')
// });

// export const contentVectors = pgTable("embeddings", {
//   id: serial("id").primaryKey(),
//   content: text("content").notNull(),
//   contentEmbedding: jsonb("embedding").notNull(),
//   categories: text("category").notNull(),
// });

// export const mediaRelations = relations(media, ({ one }) => ({
//     youtubeDetails: one(youtubeMedia,{
//         fields: [media.id],
//         references: [youtubeMedia.mediaId]
//     }),
//     redditDetails: one(redditMedia, {
//       fields: [media.id],
//       references: [redditMedia.mediaId],
//     })
// }));

// export const schema = { media, redditMedia, youtubeMedia };

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

export const users = pgTable("users", {
  id: varchar("id", { length: 256 }).primaryKey(),
});

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
  userId: varchar("user_id", { length: 256 })
    .references(() => users.id)
    .notNull(),
  type: mediaTypeEnum("type").notNull(),
  platform: varchar("platform", { length: 30 }).notNull(),
  thumbnailUrl: varchar("thumbnail_url", { length: 200 }),
  postUrl: varchar("post_url", { length: 500 }).notNull(),
  title: text("title").notNull(),
  durationMs: integer("duration_ms").default(0),
  postId: varchar("post_id", { length: 100 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  category: text("category").notNull(),
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

export const usersRelations = relations(users, ({ many }) => ({
  media: many(media),
}));

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
  contentEmbedding: vector("embedding", { dimensions: 1024 }).notNull(),
});

// Corrected relations
export const mediaRelations = relations(media, ({ one }) => ({
  user: one(users, {
    fields: [media.userId],
    references: [users.id],
  }),
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
  users,
};
