export interface Category{
    title: string;
    url: string;
    icon: any;
}
export class Helper{

    // Helper of categories that we are going to have
    public static categories():Category[] {
        const categories = [
            {
                title: "Learning & Skills",
                url: `/pages/categories/${encodeURIComponent('Learning & Skills')}`,
                icon: 'skill'
            },
            {
                title: "Mindset & Focus",
                url: `/pages/categories/${encodeURIComponent('Mindset & Focus')}`,
                icon: 'mindset'
            },
            {
                title: "Descision Making & Strategy",
                url: `/pages/categories/${encodeURIComponent('Descision Making & Strategy')}`,
                icon: 'strategy'
            },
            {
                title: "Industry Trends",
                url: `/pages/categories/${encodeURIComponent('Industry Trends')}`,
                icon: 'trends'
            },
            {
                title: "Health & Wellness",
                url: `/pages/categories/${encodeURIComponent('Health & Wellness')}`,
                icon: 'health',
            },
            {
                title: "Career Growth",
                url: `/pages/categories/${encodeURIComponent('Career Growth')}`,
                icon: 'growth',
            }
        ];
        return categories as Category[];
    }
}