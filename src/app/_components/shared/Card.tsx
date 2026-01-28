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
      <div className="flex gap-4 justify-center">
        <div className="aspect-video -z-90 rounded-2xl overflow-hidden">
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
      <div className="span-prop relative flex top-68 rounded-[5px] text-white">
        <div className="w-10 h-6 absolute -top-14 end-2 bg-black bg-opacity-80 rounded text-center text-sm">
          <span className="text-white flex items-center justify-center pt-1">
            {utility.viewTime(video.durationMs!)}
          </span>
        </div>

        {/* For Showing if the video is HD or not */}
        <div className="w-10 h-6 absolute -top-64 start-2 bg-darker rounded text-center text-sm">
          <span className="text-golden flex items-center justify-center pt-1">
            HD
          </span>
        </div>

        {/* Title and Video type */}
        <div className="flex flex-col justify-evenly">
          <span className="md:text-medium sm:text-large smallScreenFont text-white line-clamp-2 -mt-2">
            {utility.getTitle(video.title)}
          </span>
          <div className="flex items-center mb-1.5 justify-evenly">
            <div className="flex items-center justify-evently bg-opacity-70 bg-gray-800 rounded-full px-2 py-0.5 border border-white absolute -top-14 start-2">
              <Image
                src={utility.getPlatformIcon(video.platform)}
                width={16}
                height={16}
                alt={video.platform}
                className="mr-1"
              />
              <span className="text-xs smallScreenFont text-gray-300">
                {video.platform}
              </span>
            </div>
          </div>
          <span className="text-medium text-gray-400">{video.type}</span>
        </div>
      </div>
    </div>
  );
}
