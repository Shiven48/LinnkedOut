'use server';

import { Media, PaginationInfo } from '@/services/common/types';
import { MEDIA_PER_PAGE } from "@/services/common/constants";
import Home from "@/app/_components/shared/Home";
import { getCategoryCount, getMediaByCategory } from '@/server/functions/media';

export default async function Category({
    searchParams, 
    params
}: {
    searchParams: {
        page: string
    }
    params: { 
        category: string 
    }
}) {

    // Destructuring the slugs or the dynamic params
    const decodedCategory = decodeURIComponent(params.category);
    
    // Destructuring the page info to render the correct page
    const page:string = await searchParams.page;
    const currentPage:number = page ? parseInt(page) : 1;
    const offset = MEDIA_PER_PAGE * (currentPage - 1);
    
    // Fetching category data from the database 
    const media:Media[] = await getMediaByCategory(decodedCategory, offset);
    const totalMedia:number = await getCategoryCount(decodedCategory); 
    const totalPages = Math.ceil(totalMedia / MEDIA_PER_PAGE)
    console.log({ decodedCategory, currentPage, totalMedia })

    const paginationInfo:PaginationInfo = {
        currentPage,
        totalPages
    }
    
    return(
        <Home 
            media={media} 
            pagination={paginationInfo} 
            pageHeader={`Results for ${decodedCategory} category`} 
        />
    );
}
