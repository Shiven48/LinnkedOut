ALTER TABLE "twitter_media" ALTER COLUMN "media_url" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "twitter_media" ADD COLUMN "tweet_media_key" text;--> statement-breakpoint
ALTER TABLE "twitter_media" ADD COLUMN "durationMS" text;--> statement-breakpoint
ALTER TABLE "twitter_media" DROP COLUMN "url";--> statement-breakpoint
ALTER TABLE "twitter_media" DROP COLUMN "author_id";--> statement-breakpoint
ALTER TABLE "twitter_media" DROP COLUMN "like_count";--> statement-breakpoint
ALTER TABLE "twitter_media" DROP COLUMN "retweet_count";--> statement-breakpoint
ALTER TABLE "twitter_media" DROP COLUMN "reply_count";