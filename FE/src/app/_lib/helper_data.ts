import { Category,NavComponent,Platfrom,Resource } from '../../../types'

export class Helper{

    public static basePath:string = 'http://localhost:3000'
    
    public static categories():Category[] {
        const categories:Category[] = [
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
            },
        ];
        return categories as Category[];
    }

    public static Platforms():Platfrom[] {
        const platforms: Platfrom[] = [
            {
                name: 'youtube', 
                url: `/video/${encodeURIComponent('youtube')}`,
                icon: `youtube`
            },
            {
                name: 'reddit', 
                url: `/video/${encodeURIComponent('reddit')}`,
                icon: `reddit`
            },
            {
                name: 'twitter', 
                url: `/video/${encodeURIComponent('twitter')}`,
                icon:`twitter`
            }
        ]
        return platforms as Platfrom[];
    }

    public static navComponents():NavComponent[] {
        const navs:NavComponent[] = [
            {
                'title': 'dashboard',
                'url': `/navs/dashboard`,
                'icon': 'dashboard'
            }
        ];
        return navs as NavComponent[];
    }

    public static Resources():Resource[] {
        const resos:Resource[] = [
            {
                'id':1,
                'link':'https://youtu.be/ECycCnPy1Qw?si=A0wGoo4e-5zpR0Hf'
            },
            {
                'id':2,
                'link':'https://youtu.be/RzRhcnN-2XQ?si=sB9zudHwOW0wPVmM'
            },
            {
                'id':3,
                'link':'https://youtu.be/xirQ7AMyTM8?si=GOyz0tQkYhC7QmNQ'
            },
            {
                'id':4,
                'link':'https://www.reddit.com/r/beastboyshub/comments/1izxl2m/omg_shinchan_is_finally_in_india/?utm_source=share&utm_medium=mweb3x&utm_name=post_embed&utm_term=1&utm_content=1'
            },
            {
                'id':5,
                'link':'https://www.youtube.com/watch?v=XeGsq5yQOXw'
            },
            {
                'id':6,
                'link':'https://youtu.be/6YzGOq42zLk?si=3TS6QIvk4dKQPYLs'
            },
            {
                'id':7,
                'link':'https://youtu.be/Fj6cr3FO2JI?si=7lL3nGGUa7UcCqJw'
            },
            {
                'id':8,
                'link':'https://www.reddit.com/r/cartoons/comments/1j269lv/flow_has_won_best_animated_film_at_the_oscars/?utm_source=share&utm_medium=mweb3x&utm_name=post_embed&utm_term=1&utm_content=1'
            },
            {
                'id':9,
                'link':'https://www.reddit.com/r/ShinChan/comments/1j46wnx/what_is_this/?utm_source=share&utm_medium=mweb3x&utm_name=post_embed&utm_term=1&utm_content=1'
            },
            {
                'id':10,
                'link':'https://youtu.be/9TdexGFlFIM?si=wQMXSNcFQCYtdiwQ'
            },
            {
                'id':11,
                'link':'https://youtu.be/TNhaISOUy6Q?si=HlOH5aHIJhyOKxdI'
            },
            {
                'id':12,
                'link':'https://youtu.be/Q4xCR20Dh1E?si=FBKeWcvv47yjPrAf'
            }
        ]
        return resos as Resource[];
    }
}