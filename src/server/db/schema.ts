import { pgEnum, pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";

export const mediaTypeEnum = pgEnum('type', ['short', 'image', 'videos']);

export const media = pgTable('media', {
    id: serial('id').primaryKey(),
    videoId: varchar('videoId', { length: 30 }).notNull().unique(),
    url: text('url').notNull(),
    type: mediaTypeEnum('type'),
    category: varchar('category', { length: 30 }),
    platform: varchar('platform', { length: 30 }).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
updatedAt: timestamp('updated_at').defaultNow().notNull(),
});