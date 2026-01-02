"use server";

import { Media, PaginationInfo } from "@/services/common/types";
import { MEDIA_PER_PAGE } from "@/services/common/constants";
import Home from "@/app/_components/shared/Home";
import { getCategoryCount, getMediaByCategory } from "@/server/functions/media";
import { auth } from "@clerk/nextjs/server";

export default async function Category({
  searchParams,
  params,
}: {
  searchParams: Promise<{
    page: string;
  }>;
  params: Promise<{
    category: string;
  }>;
}) {
  const { userId } = await auth();
  if (!userId) return <div>Not logged in</div>;

  // Destructuring the slugs or the dynamic params
  const { category } = await params;
  const decodedCategory = decodeURIComponent(category);

  // Destructuring the page info to render the correct page
  const { page } = await searchParams;
  const currentPage: number = page ? parseInt(page) : 1;
  const offset = MEDIA_PER_PAGE * (currentPage - 1);

  // Fetching category data from the database
  const media: Media[] = await getMediaByCategory(
    decodedCategory,
    offset,
    userId
  );
  const totalMedia: number = await getCategoryCount(decodedCategory, userId);
  const totalPages = Math.ceil(totalMedia / MEDIA_PER_PAGE);
  console.log({ decodedCategory, currentPage, totalMedia });

  const paginationInfo: PaginationInfo = {
    currentPage,
    totalPages,
  };

  return (
    <Home
      media={media}
      pagination={paginationInfo}
      pageHeader={`Results for ${decodedCategory} category`}
    />
  );
}
