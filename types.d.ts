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