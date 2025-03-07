CREATE TYPE "public"."type" AS ENUM('short', 'image', 'videos');--> statement-breakpoint
CREATE TABLE "media" (
	"id" serial PRIMARY KEY NOT NULL,
	"videoId" varchar(30) NOT NULL,
	"url" text NOT NULL,
	"type" "type",
	"category" varchar(30),
	"platform" varchar(30) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "media_videoId_unique" UNIQUE("videoId")
);
