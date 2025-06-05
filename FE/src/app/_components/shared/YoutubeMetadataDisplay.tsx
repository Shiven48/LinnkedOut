import { Media, YoutubeMedia } from "@/services/common/types"
import Link from "next/link"
import { useSidebar } from "../../../../components/ui/sidebar";
import { useSidebarState } from "../../../../hooks/useSideBarState";

interface LocalMetadata  {
        video: Media | null;
}
export const YoutubeMetadataDisplay:React.FC<LocalMetadata> = ({ video }) => {
  
  const isOpen = useSidebarState((state) => state.isOpen)

 return (
  <div className="">
    <div className="smallTitleAndLink flex mr-4 mt-4 justify-between items-center">
      <p className="text-white mt-2 mb-2 text-xl smallVideoTitle block">{video?.title}</p>
      {video?.postUrl && (
        <Link href={video.postUrl}>
          <div className="w-24 h-8 flex justify-center bg-dark-golden border border-white rounded-xl hover:bg-golden hover-thread">
            <span className="text-black flex items-center font-serif">YouTube</span>
          </div>
        </Link>
      )}
    </div>
   
  </div>
)
}