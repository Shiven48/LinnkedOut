CREATE TABLE "media_embeddings" (
	"id" serial PRIMARY KEY NOT NULL,
	"content" text NOT NULL,
	"embedding" vector(1024) NOT NULL
);

ALTER TABLE "embeddings" DISABLE ROW LEVEL SECURITY;
DROP TABLE "embeddings" CASCADE;
ALTER TABLE "reddit_media" DROP CONSTRAINT "reddit_media_media_id_unique";
ALTER TABLE "youtube_media" DROP CONSTRAINT "youtube_media_media_id_unique";
ALTER TABLE "reddit_media" DROP CONSTRAINT "reddit_media_media_id_media_id_fk";

ALTER TABLE "youtube_media" DROP CONSTRAINT "youtube_media_media_id_media_id_fk";

ALTER TABLE "media" ADD COLUMN "category" text NOT NULL;
ALTER TABLE "media" ADD COLUMN "reddit_id" integer;
ALTER TABLE "media" ADD COLUMN "youtube_id" integer;
ALTER TABLE "media" ADD COLUMN "embedding_id" integer;
ALTER TABLE "media" ADD CONSTRAINT "media_reddit_id_reddit_media_id_fk" FOREIGN KEY ("reddit_id") REFERENCES "public"."reddit_media"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "media" ADD CONSTRAINT "media_youtube_id_youtube_media_id_fk" FOREIGN KEY ("youtube_id") REFERENCES "public"."youtube_media"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "media" ADD CONSTRAINT "media_embedding_id_media_embeddings_id_fk" FOREIGN KEY ("embedding_id") REFERENCES "public"."media_embeddings"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "reddit_media" DROP COLUMN "media_id";
ALTER TABLE "youtube_media" DROP COLUMN "media_id";
ALTER TABLE "media" ADD CONSTRAINT "media_reddit_id_unique" UNIQUE("reddit_id");
ALTER TABLE "media" ADD CONSTRAINT "media_youtube_id_unique" UNIQUE("youtube_id");
ALTER TABLE "media" ADD CONSTRAINT "media_embedding_id_unique" UNIQUE("embedding_id");