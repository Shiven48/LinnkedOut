"use client";

import Link from "next/link";
import Image from "next/image";
import { Media } from "@/services/common/types";
import { utility } from "@/services/common/utils";

interface CardProps {
  video: Media;
}

export default function Card({ video }: CardProps) {
  return (
    <div className="flex flex-col h-full w-full">
      {/* For video thumbnail */}
      <div className="relative aspect-video w-full overflow-hidden">
        <Link
          href={`/video/${video.platform || ""}/${utility.getIdOfplatform(
            video
          )}/${video.id}`}
          className="relative block w-full h-full group"
        >
          {/* Gradient Overlay for better contrast */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent z-10 transition-all duration-300 group-hover:from-black/60 group-hover:via-black/10" />

          <Image
            src={video.thumbnailUrl || ""}
            alt="Media thumbnail"
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority
            quality={95}
            className="object-cover z-0 transition-transform duration-500 group-hover:scale-105"
            onLoad={() => {}}
          />

          {/* Play Icon Overlay for Videos */}
          {(video.type === "video" || video.type === "short") && (
            <div className="absolute inset-0 flex items-center justify-center z-30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
              <div className="bg-[#e3ec58]/90 rounded-full p-3 shadow-[0_0_20px_rgba(227,236,88,0.5)] backdrop-blur-sm transform transition-transform duration-300 group-hover:scale-110">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-black ml-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>
          )}
        </Link>

        {/* Top Metadata Bar */}
        <div className="absolute top-0 left-0 right-0 p-2 flex justify-between items-start z-20 bg-gradient-to-b from-black/80 via-black/40 to-transparent pointer-events-none">
          <div className="flex flex-col gap-1.5 pointer-events-auto">
            {/* Platform Badge */}
            <div className="flex items-center bg-gray-900/80 backdrop-blur-sm rounded-full px-2 py-0.5 border border-white/20 shadow-sm w-max">
              <Image
                src={utility.getPlatformIcon(video.platform)}
                width={14}
                height={14}
                alt={video.platform}
                className="mr-1.5"
              />
              <span className="text-[10px] smallScreenFont text-gray-200 uppercase font-bold tracking-wider">
                {video.platform}
              </span>
            </div>
            
            {/* Type Indicator Badge */}
            <div className="flex items-center bg-white/10 backdrop-blur-sm rounded-full px-2 py-0.5 border border-white/10 shadow-sm w-max">
              <span className="text-[9px] uppercase font-bold text-gray-200 tracking-wider">
                {video.type}
              </span>
            </div>
          </div>

          <div className="flex flex-col items-end gap-1.5 pointer-events-auto">
            {/* HD Badge */}
            <div className="bg-black/70 backdrop-blur-sm rounded px-1.5 py-0.5 border border-[#e3ec58]/40 shadow-[0_0_8px_rgba(227,236,88,0.4)]">
              <span className="text-[10px] font-bold text-dark-golden drop-shadow-[0_0_5px_rgba(227,236,88,0.8)]">
                HD
              </span>
            </div>
          </div>
        </div>

        {/* Bottom-Right: Duration */}
        {video.durationMs && (
          <div className="absolute bottom-2 right-2 z-20 bg-black/80 backdrop-blur-sm rounded px-1.5 py-0.5 text-xs text-white border border-white/10">
            {utility.viewTime(video.durationMs)}
          </div>
        )}
      </div>

      {/* Title and Metadata Content */}
      <div className="flex p-3 flex-grow justify-between items-center bg-black/40 border-t border-white/5 relative z-20 gap-3">
        <span className="md:text-base sm:text-lg smallScreenFont text-white line-clamp-2 drop-shadow-[0_2px_2px_rgba(0,0,0,1)] font-medium leading-tight flex-1">
          {utility.getTitle(video.title)}
        </span>
        
        {/* Golden Category Badge */}
        {video.category && (
          <div className="bg-gradient-to-r from-[#9d9d39]/20 to-[#e3ec58]/20 border border-[#e3ec58]/60 rounded px-2 py-0.5 shadow-[0_0_10px_rgba(227,236,88,0.15)] shrink-0">
            <span className="text-[10px] text-[#e3ec58] font-semibold drop-shadow-md capitalize whitespace-nowrap">
              {video.category}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
