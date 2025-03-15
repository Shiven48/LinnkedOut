CREATE TYPE "public"."type" AS ENUM('short', 'image', 'video', 'photo');--> statement-breakpoint
CREATE TABLE "media" (
	"id" serial PRIMARY KEY NOT NULL,
	"type" "type" NOT NULL,
	"platform" varchar(30) NOT NULL,
	"thumbnail_url" varchar(200),
	"post_url" varchar(500) NOT NULL,
	"title" text NOT NULL,
	"duration_ms" integer DEFAULT 0,
	"post_id" varchar(100) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reddit_media" (
	"id" serial PRIMARY KEY NOT NULL,
	"media_id" integer NOT NULL,
	"subreddit" text NOT NULL,
	"author" text NOT NULL,
	"post_link" varchar(500) NOT NULL,
	"comments" jsonb,
	CONSTRAINT "reddit_media_media_id_unique" UNIQUE("media_id")
);
--> statement-breakpoint
CREATE TABLE "youtube_media" (
	"id" serial PRIMARY KEY NOT NULL,
	"media_id" integer NOT NULL,
	"description" text,
	"definition" varchar(10),
	"english_captions" jsonb,
	CONSTRAINT "youtube_media_media_id_unique" UNIQUE("media_id")
);
--> statement-breakpoint
ALTER TABLE "reddit_media" ADD CONSTRAINT "reddit_media_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "youtube_media" ADD CONSTRAINT "youtube_media_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE no action ON UPDATE no action;