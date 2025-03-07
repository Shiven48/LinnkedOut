CREATE TABLE "instagram_media" (
	"id" serial PRIMARY KEY NOT NULL,
	"media_id" integer NOT NULL,
	"instagram_id" varchar(50) NOT NULL,
	"caption" text,
	"url" text NOT NULL,
	"media_url" text,
	"thumbnail_url" text,
	"like_count" integer,
	"comment_count" integer,
	"author_username" varchar(50),
	"location" varchar(100),
	CONSTRAINT "instagram_media_media_id_unique" UNIQUE("media_id"),
	CONSTRAINT "instagram_media_instagram_id_unique" UNIQUE("instagram_id")
);
--> statement-breakpoint
CREATE TABLE "twitter_media" (
	"id" serial PRIMARY KEY NOT NULL,
	"media_id" integer NOT NULL,
	"tweet_id" varchar(30) NOT NULL,
	"text" text,
	"url" text NOT NULL,
	"media_url" text,
	"author_id" varchar(30),
	"author_username" varchar(50),
	"like_count" integer,
	"retweet_count" integer,
	"reply_count" integer,
	CONSTRAINT "twitter_media_media_id_unique" UNIQUE("media_id"),
	CONSTRAINT "twitter_media_tweet_id_unique" UNIQUE("tweet_id")
);
--> statement-breakpoint
CREATE TABLE "youtube_media" (
	"id" serial PRIMARY KEY NOT NULL,
	"media_id" integer NOT NULL,
	"videoId" varchar(30) NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"thumbnailUrl" text,
	"thumbnailMediumUrl" text,
	"thumbnailHighUrl" text,
	"duration" varchar(20),
	"definition" varchar(10),
	"hasCaption" boolean,
	"tags" text[],
	CONSTRAINT "youtube_media_media_id_unique" UNIQUE("media_id"),
	CONSTRAINT "youtube_media_videoId_unique" UNIQUE("videoId")
);
--> statement-breakpoint
ALTER TABLE "media" DROP CONSTRAINT "media_videoId_unique";--> statement-breakpoint
ALTER TABLE "media" ALTER COLUMN "type" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "instagram_media" ADD CONSTRAINT "instagram_media_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "twitter_media" ADD CONSTRAINT "twitter_media_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "youtube_media" ADD CONSTRAINT "youtube_media_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "media" DROP COLUMN "videoId";--> statement-breakpoint
ALTER TABLE "media" DROP COLUMN "url";--> statement-breakpoint
ALTER TABLE "media" DROP COLUMN "category";--> statement-breakpoint
ALTER TABLE "public"."media" ALTER COLUMN "type" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."type";--> statement-breakpoint
CREATE TYPE "public"."type" AS ENUM('short', 'image', 'video');--> statement-breakpoint
ALTER TABLE "public"."media" ALTER COLUMN "type" SET DATA TYPE "public"."type" USING "type"::"public"."type";