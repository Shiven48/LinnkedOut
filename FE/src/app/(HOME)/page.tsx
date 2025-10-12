"use server";
import { Media } from "@/services/common/types";
import Home from "../_components/shared/Home";
import { getAllMedia, getMediaCount } from "@/server/functions/media";
import { MEDIA_PER_PAGE } from "@/services/common/constants";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function HomePage({
  searchParams,
}: {
  searchParams: { page: string | undefined };
}) {
  const { userId } = await auth();
  if (!userId) {
    return redirect("/sign-in");
  }

  const { page } = await searchParams;

  const currentPage = page ? parseInt(page) : 1;
  const totalMedia = await getMediaCount(userId);
  const totalPages = Math.ceil(totalMedia / MEDIA_PER_PAGE);
  const offset = MEDIA_PER_PAGE * (currentPage - 1);
  const paginationInfo = {
    currentPage,
    totalPages,
  };

  const media: Media[] = await getAllMedia(userId, offset);
  return <Home media={media} pagination={paginationInfo} />;
}
