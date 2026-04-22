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
    <div
    // key={ video.id }
    // className={`card-green-glass h-64 my-8 smallScreenCard w-[30%]`}
    >
      {/* For video thumbnail */}
      <div className="flex gap-4 justify-center group-hover:scale-[1.02] transition-transform duration-300 w-full">
        <div className="relative w-full aspect-video -z-90 rounded-2xl overflow-hidden shadow-md">
          <Link
            href={`/video/${video.platform || ""}/${utility.getIdOfplatform(
              video
            )}/${video.id}`}
          >
            <Image
              src={video.thumbnailUrl || ""}
              alt="Media thumbnail"
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              priority
              quality={95}
              className="object-cover opacity-90 rounded-2xl"
              onLoad={() => {}}
            />
          </Link>
        </div>
      </div>

      {/* For video duration and platform */}
      <div className="relative flex top-68 rounded-xl text-white px-3 mt-4">
        <div className="px-2 h-6 absolute -top-[4rem] right-2 bg-black/60 backdrop-blur-md border border-white/10 rounded overflow-hidden flex items-center justify-center text-xs font-semibold shadow-md">
          <span className="text-white drop-shadow-md">
            {utility.viewTime(video.durationMs!)}
          </span>
        </div>

        {/* For Showing if the video is HD or not */}
        <div className="px-2 h-6 absolute -top-[16rem] left-2 bg-dark/60 backdrop-blur-md border border-[var(--col-dark-golden)] rounded flex items-center justify-center text-xs shadow-[0_0_10px_rgba(139,92,246,0.2)]">
          <span className="text-[var(--col-dark-golden)] font-bold tracking-wider pt-[2px]">
            HD
          </span>
        </div>

        {/* Title and Video type */}
        <div className="flex flex-col justify-evenly w-full">
          <span className="md:text-base sm:text-lg text-sm text-gray-100 line-clamp-2 -mt-3 font-semibold tracking-wide drop-shadow-sm group-hover:text-white transition-colors">
            {utility.getTitle(video.title)}
          </span>
          <div className="flex items-center mb-1.5 justify-evenly">
            <div className="flex items-center justify-evenly bg-white/10 backdrop-blur-md rounded-full px-[8px] py-[3px] border border-white/20 absolute -top-[4rem] left-2 shadow-lg">
              <Image
                src={utility.getPlatformIcon(video.platform)}
                width={14}
                height={14}
                alt={video.platform}
                className="mr-1.5 drop-shadow-md"
              />
              <span className="text-[11px] font-medium text-gray-200 capitalize">
                {video.platform}
              </span>
            </div>
          </div>
          <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">{video.type}</span>
        </div>
      </div>
    </div>
  );
}
