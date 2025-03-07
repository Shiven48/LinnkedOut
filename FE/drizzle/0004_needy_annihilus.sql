CREATE TABLE "reddit" (
	"id" serial PRIMARY KEY NOT NULL,
	"mediaId" integer NOT NULL,
	"subreddit" text,
	"title" text NOT NULL,
	"type" varchar(20),
	"redditPostId" varchar(30),
	"author" text NOT NULL,
	"imageUrl" text NOT NULL,
	"imageWidth" integer,
	"imageHeight" integer,
	"videoUrl" text NOT NULL,
	"videoWidth" integer,
	CONSTRAINT "reddit_mediaId_unique" UNIQUE("mediaId")
);
--> statement-breakpoint
ALTER TABLE "reddit" ADD CONSTRAINT "reddit_mediaId_media_id_fk" FOREIGN KEY ("mediaId") REFERENCES "public"."media"("id") ON DELETE no action ON UPDATE no action;