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
    type: 'short' | 'image' | 'video';
    platform: string;
    createdAt: string;
    updatedAt: string;
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
    duration: string | null;
    definition: string | null;
    hasCaption: boolean | null;
    tags: string[] | null;
}

export interface MediaRelations {
    youtubeDetails?: YoutubeMedia;  
    twitterDetails?: TwitterMedia;  
    instagramDetails?: InstagramMedia;
  }