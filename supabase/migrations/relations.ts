import { relations } from "drizzle-orm/relations";
import { mediaEmbeddings, media, redditMedia, youtubeMedia } from "./schema";

export const mediaRelations = relations(media, ({one}) => ({
	mediaEmbedding: one(mediaEmbeddings, {
		fields: [media.embeddingId],
		references: [mediaEmbeddings.id]
	}),
	redditMedia: one(redditMedia, {
		fields: [media.redditId],
		references: [redditMedia.id]
	}),
	youtubeMedia: one(youtubeMedia, {
		fields: [media.youtubeId],
		references: [youtubeMedia.id]
	}),
}));

export const mediaEmbeddingsRelations = relations(mediaEmbeddings, ({many}) => ({
	media: many(media),
}));

export const redditMediaRelations = relations(redditMedia, ({many}) => ({
	media: many(media),
}));

export const youtubeMediaRelations = relations(youtubeMedia, ({many}) => ({
	media: many(media),
}));