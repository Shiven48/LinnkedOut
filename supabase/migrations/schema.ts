import { pgTable, serial, text, varchar, jsonb, vector, foreignKey, unique, integer, timestamp, pgEnum } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const type = pgEnum("type", ['short', 'image', 'video', 'photo', 'self'])


export const youtubeMedia = pgTable("youtube_media", {
	id: serial().primaryKey().notNull(),
	description: text(),
	definition: varchar({ length: 10 }),
	englishCaptions: jsonb("english_captions"),
});

export const mediaEmbeddings = pgTable("media_embeddings", {
	id: serial().primaryKey().notNull(),
	content: text().notNull(),
	embedding: vector({ dimensions: 1024 }),
});

export const redditMedia = pgTable("reddit_media", {
	id: serial().primaryKey().notNull(),
	subreddit: text().notNull(),
	author: text().notNull(),
	postLink: varchar("post_link", { length: 500 }).notNull(),
	comments: jsonb(),
});

export const media = pgTable("media", {
	id: serial().primaryKey().notNull(),
	type: type().notNull(),
	platform: varchar({ length: 30 }).notNull(),
	thumbnailUrl: varchar("thumbnail_url", { length: 200 }).default(').notNull(),
	postUrl: varchar("post_url", { length: 500 }).notNull(),
	title: text().notNull(),
	durationMs: integer("duration_ms").default(0).notNull(),
	postId: varchar("post_id", { length: 100 }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	category: text().notNull(),
	userId: varchar("user_id", { length: 256 }).notNull(),
	redditId: integer("reddit_id"),
	youtubeId: integer("youtube_id"),
	embeddingId: integer("embedding_id"),
}, (table) => [
	foreignKey({
			columns: [table.embeddingId],
			foreignColumns: [mediaEmbeddings.id],
			name: "media_embedding_id_media_embeddings_id_fk"
		}),
	foreignKey({
			columns: [table.redditId],
			foreignColumns: [redditMedia.id],
			name: "media_reddit_id_reddit_media_id_fk"
		}),
	foreignKey({
			columns: [table.youtubeId],
			foreignColumns: [youtubeMedia.id],
			name: "media_youtube_id_youtube_media_id_fk"
		}),
	unique("media_reddit_id_unique").on(table.redditId),
	unique("media_youtube_id_unique").on(table.youtubeId),
	unique("media_embedding_id_unique").on(table.embeddingId),
]);
