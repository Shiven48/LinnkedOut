// import Trial from "";
'use client'
import { useSidebarState } from "../../../hooks/useSideBarState";

export default function Home() {
    const isOpen = useSidebarState(state => state.isOpen) 

    return (
        <div className="h-screen w-full mt-12 bg-[#181818]">
            <div>
                // Fetch items
            </div>
        </div>

    );
}