export interface BaseItem{
    title: string;
    url: string;
    icon: any;
}

export interface Category extends BaseItem {}
export interface NavComponent extends BaseItem {}

export interface Resource {
    id: number,
    link: string
}

export interface Media {
    id?: number;
    type: 'short' | 'image' | 'video' | 'photo';
    platform: string;
    createdAt: string;
    updatedAt: string;
    thumbnailUrl: string;
    hdThumbnailUrl?: string;
    title: string;
    duration_ms?: string;
}

export interface YoutubeMedia {
    id?: number;
    mediaId?: number;
    videoId: string;
    title: string,
    description: string | null;
    thumbnailUrl: string | null;
    thumbnailMediumUrl: string | null;
    thumbnailHighUrl: string | null;
    thumbnailMaxRes?: string | null;
    duration_ms?: string | null;
    definition: string | null;
    hasCaption: boolean | null;
    tags: string[] | null;
}

export interface TwitterMedia {
    id?:number;
    mediaId?: number;
    tweetId: string;
    text: string | null;
    tweet_media_key: string; 
    media_url: string;
    username: string | null;
    duration_ms: string;
    // varients: Varient
}

export interface RedditMedia{
    id?: number;
    mediaId?: number;
    subreddit: string;
    title: string;
    type: string;
    redditPostId: string;
    author: string;
    imageUrl: string;
    hdImageUrl: string | null;
    imageWidth: number | null;
    imageHeight: number | null;
    videoUrl: string;
    videoWidth: number | null;
    videoHeight: number | null;
    duration_ms?: string | null
} 

export interface Varient {
    type: string;
    url: string;
    bitrate: number;
}

export interface MediaRelations {
    youtubeDetails?: YoutubeMedia;  
    twitterDetails?: TwitterMedia;  
    instagramDetails?: InstagramMedia;
  }

export interface Urls {
    sdUrl?: string;
    hdUrl?: string;
}

export interface Platfrom {
    name: string, 
    url: string,
    icon: string
}