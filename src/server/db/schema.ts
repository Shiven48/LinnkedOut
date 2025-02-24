import { relations} from "drizzle-orm";
import { boolean, integer, pgEnum, pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";

export const mediaTypeEnum = pgEnum('type', ['short', 'image', 'video', 'photo']);

// export const twitterVarients = pgTable('twitter_varients', {
//     id: serial('id').primaryKey(),
//     mediaId: integer('media_id').references(() => twitterMedia.id),
//     type: varchar('type', { length: 30 }).notNull(),
//     url: text('url').notNull(),
//     bitrate: integer('bitrate')
// });

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
    tweetMediaKey: text('tweet_media_key'),
    mediaUrl: text('media_url').notNull(),
    authorUsername: varchar('author_username', { length: 50 }),
    durationMS: text('durationMS')
});

export const redditMedia = pgTable('reddit', {
  id: serial('id').primaryKey(),
  mediaId: integer('mediaId').references(() => media.id).notNull().unique(),
  subreddit: text('subreddit'),
  title: text('title').notNull(),
  type: varchar('type', { length : 20 }),
  redditPostId: varchar('redditPostId', { length : 30 }),
  author: text('author').notNull(),
  imageUrl: text('imageUrl').notNull(),
  imageWidth: integer('imageWidth'),
  imageHeight: integer('imageHeight'),
  videoUrl: text('videoUrl').notNull(),
  videoWidth: integer('videoWidth'),
  videoHeight: integer('videoHeight'),
})

export const media = pgTable('media', {
    id: serial('id').primaryKey(),
    type: mediaTypeEnum('type').notNull(),
    platform: varchar('platform', { length: 30 }).notNull(), // youtube, twitter, instagram
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
    thumbnailUrl: varchar('ImageUrl', { length: 200 })
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
    redditDetails: one(redditMedia, {
      fields: [media.id],
      references: [redditMedia.mediaId],
    })
  }));

// Add separate relations for Twitter media
// export const twitterMediaRelations = relations(twitterMedia, ({ many }) => ({
//     variants: many(twitterVarients)
// }));