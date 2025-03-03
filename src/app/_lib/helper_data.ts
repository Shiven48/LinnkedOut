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
            }
        ];
        return categories as Category[];
    }

    public static Platforms():Platfrom[] {
        const platforms: Platfrom[] = [
            {
                name: 'Youtube', 
                url: `/platforms/${encodeURIComponent('Youtube')}`,
                icon: `youtube`
            },
            {
                name: 'Reddit', 
                url: `/platforms/${encodeURIComponent('Reddit')}`,
                icon: `reddit`
            },
            {
                name: 'Twitter', 
                url: `/platforms/${encodeURIComponent('Twitter')}`,
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
                'link':'https://youtube.com/shorts/wu2pi8R277M?si=ugLHu4PVwGcYFnnb'
            },
            {
                'id':4,
                'link':'https://youtu.be/xirQ7AMyTM8?si=GOyz0tQkYhC7QmNQ'
            },
            {
                'id':5,
                'link':'https://x.com/ayshriv/status/1891376873831100475?ref_url=https%3A%2F%2Fpublish.twitter.com%2F%3Furl%3Dhttps%3A%2F%2Ftwitter.com%2Fayshriv%2Fstatus%2F1891376873831100475'
            },
            {
                'id':6,
                'link':'https://www.reddit.com/r/Azoozkie/comments/1htzxhh/ab_iski_gnd_maregi/?utm_source=share&utm_medium=web3x&utm_name=web3xcss&utm_term=1&utm_content=share_button'
            },
            {
                'id':7,
                'link':`https://x.com/memelordtech/status/1878228778561786021?ref_src=twsrc%5Etfw%7Ctwcamp%5Etweetembed%7Ctwterm%5E1878228778561786021%7Ctwgr%5E3b9c6fe184f5747f952b3ed09a6de8f8f78796f1%7Ctwcon%5Es1_c10&ref_url=https%3A%2F%2Fpublish.twitter.com%2F%3Furl%3Dhttps%3A%2F%2Ftwitter.com%2Fmemelordtech%2Fstatus%2F1878228778561786021`
            },
            {
                'id':8,
                'link':'https://www.reddit.com/r/beastboyshub/comments/1izxl2m/omg_shinchan_is_finally_in_india/?utm_source=share&utm_medium=mweb3x&utm_name=post_embed&utm_term=1&utm_content=1'
            },
            {
                'id':9,
                'link':'https://www.youtube.com/watch?v=XeGsq5yQOXw'
            },
            {
                'id':10,
                'link':'https://youtu.be/6YzGOq42zLk?si=3TS6QIvk4dKQPYLs'
            },
            {
                'id':11,
                'link':'https://youtu.be/Fj6cr3FO2JI?si=7lL3nGGUa7UcCqJw'
            },
            {
                'id':12,
                'link':'https://www.reddit.com/r/cartoons/comments/1j269lv/flow_has_won_best_animated_film_at_the_oscars/?utm_source=share&utm_medium=mweb3x&utm_name=post_embed&utm_term=1&utm_content=1'
            },
            {
                'id':9,
                'link':'https://x.com/TheCartoonBase/status/1896398374439694547?ref_src=twsrc%5Etfw%7Ctwcamp%5Etweetembed%7Ctwterm%5E1896398374439694547%7Ctwgr%5E2c9c3aa1729a9690d8699fc3b6c38ca15ddfc53d%7Ctwcon%5Es1_c10&ref_url=https%3A%2F%2Fpublish.twitter.com%2F%3Furl%3Dhttps%3A%2F%2Ftwitter.com%2FTheCartoonBase%2Fstatus%2F1896398374439694547'
            }
        ]
        return resos as Resource[];
    }
}