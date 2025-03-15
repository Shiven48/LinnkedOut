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

export interface Platfrom {
    name: string, 
    url: string,
    icon: string
}

// The extra data for platform schemas(YT, Reddit etc)
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

// The below types are for database schema objects
export interface Media {
    id?: number;                                     // This is the id of the media in the database (This id is acting FK in other schemas)
    type: 'short' | 'image' | 'video' | 'photo';
    platform: string;                                // This will be any of reddit | youtube | or any other platform
    thumbnailUrl?: string;                           // This is the thumbnail url
    postUrl: string;                                 // This is the video | image url
    title: string;                      
    durationMs: number;                             
    postId: string;                                  // The id of the post on that platform
}

export interface RedditMedia {
    id?: number;                                    // This is the id of the media in the database
    mediaId?: number;                               // This ID is referring to the Media schema
    subreddit: string;                  
    author: string;                                 // Author of the post
    postLink: string;                               // This is the link to the thread on reddit
    comments?: CommentData[];                       // High level comments and the nested ones
}

export interface YoutubeMedia {
    id?: number;                                    // This is the id of the media in the database
    mediaId?: number;                               // This is referring to the Media schema
    description?: string | null;                    // Description of the video
    definition?: string | null;                     // The definition of the video
    englishCaptions?: CaptionItem[];                // Link to the captions
}

export interface MediaRelations {
    youtubeDetails?: YoutubeMedia;  
}