'use server'

// import { Media, PaginationInfo } from '@/services/common/types';;
// import { MEDIA_PER_PAGE } from '@/services/common/constants';
// import { getRedditMediaCount, getAllMediaWherePlatformReddit } from '@/server/functions/media';
// import Home from '@/app/_components/shared/Home';

// export default async function Reddit({searchParams} : {searchParams: {page: string | undefined }}) {
//     const { page } = await searchParams;
//     const currentPage = page ? parseInt(page) : 1;
//     const offset = MEDIA_PER_PAGE * (currentPage - 1);
    
//     const media:Media[] = await getAllMediaWherePlatformReddit(offset);
//     const totalMedia:number = await getRedditMediaCount(); 
//     const totalPages = Math.ceil(totalMedia / MEDIA_PER_PAGE)

//     console.log(totalMedia)
//     const paginationInfo:PaginationInfo = {
//         currentPage,
//         totalPages
//     }
    
//     return(
//         <Home 
//             media={media} 
//             pagination={paginationInfo} 
//             pageHeader="Result for Reddit Media" 
//         />
//     );
// }

import Home from "@/app/_components/shared/Home"

export default async function Reddit(){
    return <Home />
}