import { relations } from "drizzle-orm";
import { boolean, integer, pgEnum, pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";

export const mediaTypeEnum = pgEnum('type', ['short', 'image', 'video']);

export const youtubeMedia = pgTable('youtube_media', {
    id: serial('id').primaryKey(),
    mediaId: integer('media_id').references(() => media.id).notNull().unique(),
    videoId: varchar('videoId', { length: 30 }).notNull().unique(),
    title: text('title').notNull(),
    description: text('description'),
    thumbnailUrl: text('thumbnailUrl'),
    thumbnailMediumUrl: text('thumbnailMediumUrl'),
    thumbnailHighUrl: text('thumbnailHighUrl'),
    duration: varchar('duration', { length: 20 }),
    definition: varchar('definition', { length: 10 }),
    hasCaption: boolean('hasCaption'),
    tags: text('tags').array(),
  });

  export const instagramMedia = pgTable('instagram_media', {
    id: serial('id').primaryKey(),
    mediaId: integer('media_id').references(() => media.id).notNull().unique(),
    instagramId: varchar('instagram_id', { length: 50 }).notNull().unique(),
    caption: text('caption'),
    url: text('url').notNull(),
    mediaUrl: text('media_url'),
    thumbnailUrl: text('thumbnail_url'),
    likeCount: integer('like_count'),
    commentCount: integer('comment_count'),
    authorUsername: varchar('author_username', { length: 50 }),
    location: varchar('location', { length: 100 }),
  });

export const twitterMedia = pgTable('twitter_media', {
    id: serial('id').primaryKey(),
    mediaId: integer('media_id').references(() => media.id).notNull().unique(),
    tweetId: varchar('tweet_id', { length: 30 }).notNull().unique(),
    text: text('text'),
    url: text('url').notNull(),
    mediaUrl: text('media_url'),
    authorId: varchar('author_id', { length: 30 }),
    authorUsername: varchar('author_username', { length: 50 }),
    likeCount: integer('like_count'),
    retweetCount: integer('retweet_count'),
    replyCount: integer('reply_count'),
  });

export const media = pgTable('media', {
    id: serial('id').primaryKey(),
    type: mediaTypeEnum('type').notNull(), // short, image, video
    platform: varchar('platform', { length: 30 }).notNull(), // youtube, twitter, instagram
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const mediaRelations = relations(media, ({ one }) => ({
    youtubeDetails: one(youtubeMedia,{
        fields: [media.id],
        references: [youtubeMedia.mediaId]
    }),
    twitterDetails: one(twitterMedia, {
      fields: [media.id],
      references: [twitterMedia.mediaId],
    }),
    instagramDetails: one(instagramMedia, {
      fields: [media.id],
      references: [instagramMedia.mediaId],
    }),
  }));