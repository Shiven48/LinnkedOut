import { Category,NavComponent,Resource } from '../../../types'

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
            }
        ]
        return resos as Resource[];
    }
}