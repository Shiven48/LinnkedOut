
export interface BaseItem{
    id: number,
    title: string;
    url: string;
    icon: any;
}

export interface Category extends BaseItem {}
export interface NavComponent extends BaseItem {}

// Common types
export interface Resource {
    id: number,
    link: string
}

export interface Platfrom {
    name: string, 
    url: string,
    icon: string
}

export interface videoMetaData {
    id:number,
    title:string,
    category: string
}

export interface Media {
    id?: number;                                     // This is the id of the media in the database (This id is acting FK in other schemas)
    type: 'short' | 'image' | 'video' | 'photo';
    platform: string;                                // This will be any of reddit | youtube | or any other platform
    thumbnailUrl?: string;                           // This is the thumbnail url
    postUrl: string;                                 // This is the video | image url
    title: string;                      
    durationMs: number;                             
    postId: string;                                  // The id of the post on that platform
    category?: string,
    tags?: string[],
    redditId?: number | null, 
    youtubeId?: number | null,
    embeddingId?: number | null
}

export interface MediaRelations {
    youtubeDetails?: YoutubeMedia;
    redditDetails?: RedditMedia;
    embeddingDetails?: ContentEmbeddings;
}

export interface ErrorObj {
    name: string,
    message: string
}

export interface AppState {
    embeddings: Record<string,number[]>,
    watchHistory: videoMetaData[]
} 

export interface GlobalMetadata {
    media: mediaData, 
    embeddingsType: EmbeddingReturntype
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
}

export type StreamChunk = { content?: string } | string;

// Reddit related types
export interface CaptionItem {
    text: string,
    duration: number,
    offset: number,
    lang: string
}

interface CommentData {
    body: string;
    score: number;
    author: string;
    ups: number;
    downs: number;
    replies?: CommentData[];
}

export interface RedditComment {
    data: {
        body: string;
        score: number;
        author: string;
        ups: number;
        downs: number;
        replies?: any;
    };
}

export interface RedditMedia {
    id?: number;                                    // This is the id of the media in the database
    subreddit: string;                  
    author: string;                                 // Author of the post
    postLink: string;                               // This is the link to the thread on reddit
    comments?: CommentData[];                       // High level comments and the nested ones
}

export interface RedditBearerApiEndpointResponse {    
    access_token: string,
    expires_in: number,
}

// youtube related types
export interface YoutubeMedia {
    id?: number;                                    // This is the id of the media in the database
    description?: string | null;                    // Description of the video
    definition?: string | null;                     // The definition of the video
    englishCaptions?: CaptionItem[];                // Link to the captions
}

// Embedding related types
export interface ContentEmbeddings{
    id?: number,
    content: string,
    contentEmbedding: number[],
}

export interface ProcessedContent {
    id: string;
    original_text: string;
    cleaned_text: string;
    metadata: {
      source: string;
      category_candidates: string[];
      processed_at: Date;
    };
}

export interface CategoryEmbedding {
    category: string,
    categoryEmbeddings: number[]
}

export interface EmbeddingReturntype {
    embeddingId: number,
    embeddings: number[]
}

// Captions Related types (Whisper is used to generate captions)
export interface WhisperJsonFile {
    text: string,
    segments: WhisperSegment[],
    language: string
} 

export interface WhisperSegment {
  id: number;
  seek: number;
  start: number;
  end: number;
  text: string;
  tokens: number[];
  temperature: number;
  avg_logprob: number;
  compression_ratio: number;
  no_speech_prob: number;
}