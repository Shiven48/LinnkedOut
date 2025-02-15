export interface Category{
    title: string;
    url: string;
    icon: any;
}

export interface NavComponent{
    title: string,
    url: string,
    icon: any
}

export class Helper{

    public static basePath:string = 'http://localhost:3000'
    
    public static categories():Category[] {
        const categories = [
            {
                title: "Learning & Skills",
                url: `/categories/${encodeURIComponent('Learning & Skills')}`,
                icon: 'skill'
            },
            {
                title: "Mindset & Focus",
                url: `/categories/${encodeURIComponent('Mindset & Focus')}`,
                icon: 'mindset'
            },
            {
                title: "Descision Making",
                url: `/categories/${encodeURIComponent('Descision Making & Strategy')}`,
                icon: 'strategy'
            },
            {
                title: "Industry Trends",
                url: `/categories/${encodeURIComponent('Industry Trends')}`,
                icon: 'trends'
            },
            {
                title: "Health & Wellness",
                url: `/categories/${encodeURIComponent('Health & Wellness')}`,
                icon: 'health'
            },
            {
                title: "Career Growth",
                url: `/categories/${encodeURIComponent('Career Growth')}`,
                icon: 'growth'
            }
        ];
        return categories as Category[];
    }

    public static navComponents():NavComponent[] {
        const navs = [
            {
                'title': 'dashboard',
                'url': `/navs/dashboard`,
                'icon': 'dashboard'
            }
        ];
        return navs as NavComponent[];
    }
}