
export interface BaseItem{
    id: number,
    title: string;
    url: string;
    icon: any;
}

export type Category = BaseItem;
export type NavComponent = BaseItem;

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
  id?: number;
  type: 'short' | 'image' | 'video' | 'photo' | 'self';
  platform: string;
  postUrl: string;
  title: string;
  postId: string;
  category: string;        // required (not optional)
  thumbnailUrl?: string;   // optional
  durationMs?: number;     // optional
  tags?: string[] | null;
  redditId?: number | null;
  youtubeId?: number | null;
  embeddingId?: number | null;
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
    media: Media, 
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

export interface CommentData {
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
    selftext?: string;                              // This is the post that contains only text
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

export interface EmbeddingOrchestratorReturntype {
    cleanedAndProcessedContent: string;
    contentEmbeddings: number[];
    assignedCategory: string;
}

export interface EmbeddingOrchestratorInputType {
    youtubeMetadata: YoutubeMetadata,
    mediaData: Media,
    youtubeData: YoutubeMedia
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

export interface ApiResultResponse {
    message: string,
    formData: FormDataResponse,
    videos: Media[],
    totalVideos: number,
    processedAt: string
}

export interface FormDataResponse {
    urls: string[],
    category: string,
    customTags: string[],
    fetchSimilar: boolean,
    similarityLevel: string,
    contentType: string
}

export interface YTThumbnail {
  url: string;
  width: number;
  height: number;
}

export interface YTThumbnails {
  default: YTThumbnail;
  medium: YTThumbnail;
  high: YTThumbnail;
  standard: YTThumbnail;
  maxres: YTThumbnail;
}

export interface YTVideoSnippet {
  title: string;
  description: string;
  thumbnails: YTThumbnails;
  tags: string[];
  categoryId: string;
}

export interface YTContentDetails {
  duration: string;     
  definition: string;   
  caption: string;      
}

export interface YTStatistics {
    viewCount: string,
    likeCount: string,
    favoriteCount: string,
    commentCount: string
}

export interface YTTopicDetails {
  topicCategories: string[];
}

export interface YoutubeMetadata {
  id: string;
  snippet: YTVideoSnippet;
  contentDetails: YTContentDetails;
  statistics: YTStatistics;
  topicDetails: YTTopicDetails;
}

export interface YouTubeVideoResponse {
  items: YoutubeMetadata[];
}

export interface PlatformInfo { 
    platformLinkAndType: Record<string, string>, 
    length: number 
}

export interface SimilarYT {
    similarityScore: number;
    mediaData: Media;
    youtubeData: YoutubeMedia;
    embeddings: number[]
}

export interface SimilarRDT {
    similarityScore: number,
    mediaData: Media,
    redditData: RedditMedia
}

export interface YTStatsAndTopics {
    viewCount: string,
    likeCount: string,
    favoriteCount: string,
    commentCount: string
    topicCategories: string[]
}

export interface SearchQueryResult {
    searchQuery: string;
    categoryId: string;
    topicId: string;
    confidence: string;
}

export interface CategoryClassification {
  categoryId: string;
  topicId: string;
  confidence: 'high' | 'medium' | 'low';
  reasoning: string;
}

export interface AdvancedQueryResult {
  primaryQuery: string;
  alternativeQueries: string[];
  qualityIndicators: string[];
  antiAlgorithmTerms: string[];
}

export interface EnhancedSearchQueryResult extends SearchQueryResult {
  alternativeQueries?: string[];
  qualityMetrics?: {
    qualityScore: number;
    expertiseLevel: 'beginner' | 'intermediate' | 'expert';
    hasTechnicalTerms: boolean;
  };
}

export interface PipelineStageResult {
    videos: YoutubeMetadata[],
    stage: string,
    inputCount: number,
    outputCount: number,
    filteringReason: string
}

export interface QualityMetrics {
    likeToViewRatio: number;
    engagementRate: number;
    commentToLikeRatio: number;
    views: number;
    likes: number,
    comments: number,
    duration: number,
    qualityScore: number
}

export interface ScoreExtractionResult {
    metrics: QualityMetrics, 
    video: YoutubeMetadata
}

export enum FilteringStage {
    ID_DEDUPLICATION = "ID Deduplication",
    SCORE_EXTRATION = "Score Extration"
}