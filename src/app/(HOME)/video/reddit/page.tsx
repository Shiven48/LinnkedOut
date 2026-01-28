"use server";
import { Media, PaginationInfo } from "@/services/common/types";
import { MEDIA_PER_PAGE } from "@/services/common/constants";
import {
  getRedditMediaCount,
  getAllMediaWherePlatformReddit,
} from "@/server/functions/media";
import Home from "@/app/_components/shared/Home";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function Reddit({
  searchParams,
}: {
  searchParams: Promise<{ page: string | undefined }>;
}) {
  const { page } = await searchParams;

  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  const currentPage = page ? parseInt(page) : 1;
  const offset = MEDIA_PER_PAGE * (currentPage - 1);

  const media: Media[] = await getAllMediaWherePlatformReddit(offset, userId);
  const totalMedia: number = await getRedditMediaCount(userId);
  const totalPages = Math.ceil(totalMedia / MEDIA_PER_PAGE);

  console.log(totalMedia);
  const paginationInfo: PaginationInfo = {
    currentPage,
    totalPages,
  };

  return (
    <Home
      media={media}
      pagination={paginationInfo}
      pageHeader="Result for Reddit Media"
    />
  );
}
