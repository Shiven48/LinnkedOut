import Home from "@/app/_components/shared/Home";
import { getYoutubeMediaCount, getAllMediaWherePlatformYoutube } from "@/server/functions/media";
import { MEDIA_PER_PAGE } from "@/services/common/constants";
import { Media, PaginationInfo } from "@/services/common/types";

export default async function Youtube({ searchParams }: { searchParams : { page: string | undefined } }) {
    const { page } = await searchParams;
    const currentPage = page ? parseInt(page) : 1;
    const offset = MEDIA_PER_PAGE * (currentPage - 1);

    const media:Media[] = await getAllMediaWherePlatformYoutube(offset);
    const totalMedia:number = await getYoutubeMediaCount(); 
    const totalPages = Math.ceil(totalMedia / MEDIA_PER_PAGE)

    const paginationInfo:PaginationInfo = {
        currentPage,
        totalPages
    }

    return(
        <Home 
            media={media} 
            pagination={paginationInfo} 
            pageHeader="Result for YouTube Media" 
        />
    );
}