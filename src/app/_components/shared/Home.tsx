"use client";
import { useEffect, useState } from "react";
import { Media, PaginationInfo } from "@/services/common/types";
import { Pagination } from "@/app/_components/Server/Pagination";
import { usePlayingState } from "@/hooks/useIsPlaying";
import Loading from "./Loading";
import NoContent from "./NoContent";
import Card from "./Card";
import { useSearchParams } from "next/navigation";
import { SERVER_BASE_URL } from "@/services/common/constants";

interface ExtendedMedia extends Media {
  platformId?: number;
}

interface HomeProps {
  media: ExtendedMedia[];
  pagination: PaginationInfo;
  pageHeader?: string;
}

console.log(`SERVER BASE URL: ${SERVER_BASE_URL}`);

export default function Home({ media, pagination, pageHeader }: HomeProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [displayMedia, setDisplayMedia] = useState<ExtendedMedia[]>(media);
  const [currentPageHeader, setCurrentPageHeader] = useState<
    string | undefined
  >(pageHeader);

  const { currentPage, totalPages } = pagination;
  const isPlaying = usePlayingState((state) => state.isPlaying);
  const searchParams = useSearchParams();

  useEffect(() => {
    // Check if we have new content from form submission
    const hasNewContent = searchParams.get("newContent") === "true";

    if (hasNewContent) {
      const processedVideos = sessionStorage.getItem("processedVideos");
      const formData = sessionStorage.getItem("formSubmissionData");

      if (processedVideos) {
        try {
          const parsedData = JSON.parse(processedVideos);

          // Helper to extract media data if it's in the SimilarYT format
          const videos: ExtendedMedia[] = Array.isArray(parsedData)
            ? parsedData.map((item: any) => {
                // Check if it's the SimilarYT structure (has mediaData)
                if (item && typeof item === "object" && "mediaData" in item) {
                  return {
                    ...item.mediaData,
                    similarityScore: item.similarityScore,
                  };
                }
                // Otherwise assume it's already Media/ExtendedMedia
                return item;
              })
            : [];

          const submissionData = formData ? JSON.parse(formData) : null;

          // Update display with processed videos
          setDisplayMedia(videos);

          // Update header based on submission data
          if (submissionData?.category) {
            setCurrentPageHeader(
              `AI-Curated ${submissionData.category} Content`
            );
          } else {
            setCurrentPageHeader("AI-Curated Content Based on Your Submission");
          }

          // Clear the session storage after use
          sessionStorage.removeItem("processedVideos");
          sessionStorage.removeItem("formSubmissionData");

          // Optional: Update URL to remove the query parameter
          window.history.replaceState({}, "", "/?page=1");
        } catch (error) {
          console.error("Error parsing processed videos:", error);
          setDisplayMedia(media); // Fallback to original media
        }
      }
    } else {
      setDisplayMedia(media);
      setCurrentPageHeader(pageHeader);
    }
  }, [searchParams, media, pageHeader]);

  if (isLoading) return <Loading />;

  return (
    <div
      className={`h-[calc(100vh-48px)] overflow-y-auto flex-1 w-full bg-dark scrollbar-hide
            ${
              isPlaying
                ? "bg-blend-darken brightness-50 bg-darker transition-all duration-500"
                : "bg-dark transition-all duration-500"
            }
        `}
    >
      {/* The title on top/starting of the page */}
      {currentPageHeader && displayMedia?.length > 0 && (
        <span className="MainHeaderTitle">{currentPageHeader}</span>
      )}

      {/* This is for displaying Card of each media */}
      <div className="flex justify-evenly mt-2 flex-wrap">
        {displayMedia.length > 0 ? (
          displayMedia.map((video: any, index) => (
            <div
              key={video.id || index}
              className={`card-green-glass h-64 mt-4 mb-16 mediumScreenCard smallScreenCard w-[32%]`}
            >
              <Card video={video} />
            </div>
          ))
        ) : (
          <NoContent />
        )}
      </div>

      {/* Pagination Component */}
      <Pagination currentPage={currentPage} totalPages={totalPages} />
    </div>
  );
}
