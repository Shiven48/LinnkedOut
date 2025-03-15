'use client'
import { useEffect } from "react"
import { usePlayingState } from "../../../hooks/useIsPlaying"
import { usePathname } from "next/navigation"
import { useSidebarState } from "../../../hooks/useSideBarState"

export default function SideVideo(){
    const isPlaying = usePlayingState((state) => state.isPlaying)
    const pathname = usePathname();

    // Correct this
    useEffect(() => {
        // let platform:string = getPlatformFromUrl(pathname);
        const fetchDataById = async (id: number) => {
            try {
                // if(!platform) throw new Error('Something went wrong!')
                // if (isOpen) {
                //     useSidebarState.getState().setIsOpen(false);
                // }
                // const res = await fetch(`/api/videos/media/${id}/youtube`);
                // if (!res.ok) {
                //     throw new Error(`Error: ${res.statusText}`);
                // }
                // const data = await res.json();
                // setVideo(data);
            } catch (error: any) {
                throw new Error('Error fetching media:', error);
            }
        }
        // fetchDataById(id)
    },[])

    return(
        <div className={`m-20 w-[25%] h-[80%] bg-dark border-golden rounded-large relative z-5
            ${isPlaying ? 'blur-[1px] bg-blend-darken  brightness-50 transition-all duration-500' : ''}
        `}>
            <p className="text-white font-mono mt-5 text-center">This part will be handled by ai for suggesting videos</p>
        </div>
    )
}