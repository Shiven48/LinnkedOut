import { Media } from "@/services/common/types";
import Link from "next/link";
import { useSidebarState } from "@/hooks/useSideBarState";

interface LocalMetadata {
  video: Media | null;
}

const formatDuration = (ms?: number) => {
  if (!ms) return null;
  // Fallback assuming duration might be provided in either seconds or milliseconds
  // If the number is suspiciously small (like 300), it might be seconds. 
  // We'll calculate based on ms, but if it evaluates to 0 minutes, it might just be a short video.
  const totalSeconds = Math.floor(ms / 1000);
  const seconds = totalSeconds % 60;
  const minutes = Math.floor(totalSeconds / 60) % 60;
  const hours = Math.floor(totalSeconds / 3600);
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

export const YoutubeMetadataDisplay: React.FC<LocalMetadata> = ({ video }) => {
  const isOpen = useSidebarState((state) => state.isOpen);

  if (!video) return null;

  return (
    <div className="mt-6 mb-4 pb-6 border-b border-white/5">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex flex-col gap-3 w-full md:w-[80%]">
          <h1 className="text-white text-xl md:text-2xl font-semibold leading-snug tracking-wide">
            {video.title}
          </h1>
          
          <div className="flex flex-wrap items-center gap-3 md:gap-4 text-sm text-gray-400">
            {video.category && (
              <span className="bg-white/5 px-3 py-1 rounded-full border border-white/10 text-gray-300 shadow-sm backdrop-blur-sm">
                {video.category}
              </span>
            )}
            
            {video.durationMs && (
              <span className="flex items-center gap-1.5 bg-white/5 px-3 py-1 rounded-full border border-white/10 text-gray-300 backdrop-blur-sm">
                <svg className="w-4 h-4 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {formatDuration(video.durationMs)}
              </span>
            )}

            {video.tags && video.tags.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 pl-1 md:pl-2 md:border-l border-white/10">
                {video.tags.slice(0, 3).map((tag, idx) => (
                  <span key={idx} className="text-golden/80 hover:text-golden cursor-pointer transition-colors px-1 text-[13px] font-medium tracking-wide">
                    #{tag}
                  </span>
                ))}
                {video.tags.length > 3 && (
                  <span className="text-gray-500 text-xs px-1">+{video.tags.length - 3}</span>
                )}
              </div>
            )}
          </div>
        </div>

        {video.postUrl && (
          <Link href={video.postUrl} target="_blank" rel="noopener noreferrer" className="shrink-0 mt-2 md:mt-0">
            <div className="flex items-center gap-2.5 px-5 py-2.5 bg-[#1e1e21] hover:bg-[#252529] border border-white/10 rounded-full transition-all duration-300 group shadow-[0_4px_14px_0_rgba(0,0,0,0.2)] hover:shadow-[0_6px_20px_rgba(255,215,0,0.1)]">
              <svg className="w-5 h-5 text-[#FF0000] group-hover:scale-110 transition-transform duration-300" viewBox="0 0 24 24" fill="currentColor">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
              <span className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">Watch on YouTube</span>
            </div>
          </Link>
        )}
      </div>
    </div>
  );
};
