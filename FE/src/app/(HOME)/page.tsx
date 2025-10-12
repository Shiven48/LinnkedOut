'use server'
import { Media } from "@/services/common/types";
import Home from "../_components/shared/Home";
import { getAllMedia, getMediaCount } from "@/server/functions/media";
import { MEDIA_PER_PAGE } from "@/services/common/constants";

export default async function HomePage({ searchParams }: { searchParams : Promise<{ page: string | undefined }> }) {
  const { page } = await searchParams;

  const currentPage = page ? parseInt(page) : 1;
  const totalMedia = await getMediaCount();
  const totalPages = Math.ceil(totalMedia / MEDIA_PER_PAGE)
  const offset = MEDIA_PER_PAGE * (currentPage - 1);
  const paginationInfo = {
    currentPage,
    totalPages
  }

  const media:Media[] = await getAllMedia(offset);
  return <Home media={media} pagination={paginationInfo}/>;
}