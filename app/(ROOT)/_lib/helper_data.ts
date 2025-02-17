import { Category,NavComponent,Resource } from '../../../types.js'

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
            }
        ]
        return resos as Resource[];
    }
}