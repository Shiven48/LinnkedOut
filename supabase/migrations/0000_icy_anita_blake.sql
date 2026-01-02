CREATE EXTENSION IF NOT EXISTS vector;
CREATE TYPE "public"."type" AS ENUM('short', 'image', 'video', 'photo', 'self');
CREATE TABLE "youtube_media" (
	"id" serial PRIMARY KEY NOT NULL,
	"description" text,
	"definition" varchar(10),
	"english_captions" jsonb
);

CREATE TABLE "media_embeddings" (
	"id" serial PRIMARY KEY NOT NULL,
	"content" text NOT NULL,
	"embedding" vector(1024)
);

CREATE TABLE "reddit_media" (
	"id" serial PRIMARY KEY NOT NULL,
	"subreddit" text NOT NULL,
	"author" text NOT NULL,
	"post_link" varchar(500) NOT NULL,
	"comments" jsonb
);

CREATE TABLE "media" (
	"id" serial PRIMARY KEY NOT NULL,
	"type" "type" NOT NULL,
	"platform" varchar(30) NOT NULL,
	"thumbnail_url" varchar(200) DEFAULT '' NOT NULL,
	"post_url" varchar(500) NOT NULL,
	"title" text NOT NULL,
	"duration_ms" integer DEFAULT 0 NOT NULL,
	"post_id" varchar(100) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"category" text NOT NULL,
	"user_id" varchar(256) NOT NULL,
	"reddit_id" integer,
	"youtube_id" integer,
	"embedding_id" integer,
	CONSTRAINT "media_reddit_id_unique" UNIQUE("reddit_id"),
	CONSTRAINT "media_youtube_id_unique" UNIQUE("youtube_id"),
	CONSTRAINT "media_embedding_id_unique" UNIQUE("embedding_id")
);

ALTER TABLE "media" ADD CONSTRAINT "media_embedding_id_media_embeddings_id_fk" FOREIGN KEY ("embedding_id") REFERENCES "public"."media_embeddings"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "media" ADD CONSTRAINT "media_reddit_id_reddit_media_id_fk" FOREIGN KEY ("reddit_id") REFERENCES "public"."reddit_media"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "media" ADD CONSTRAINT "media_youtube_id_youtube_media_id_fk" FOREIGN KEY ("youtube_id") REFERENCES "public"."youtube_media"("id") ON DELETE no action ON UPDATE no action;