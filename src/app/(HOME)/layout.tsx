'use client'
import { ReactNode } from "react";
import AppSidebar from "../_components/Suidebar"
import Navbar from "../_components/Navbar";
import "../globals.css"
import { usePlayingState } from "../../../hooks/useIsPlaying";
import VideoNavBar from "../_components/VideoNavbar";
import { usePathname } from "next/navigation";

export default function Layout({ children }: { children: ReactNode }) {
    const pathname = usePathname();
    console.log(pathname)

    return (
        <main className="flex min-h-screen w-full flex-col fixed">  
            { pathname.startsWith('/video') ? <VideoNavBar/> : <Navbar/> }
             <div className="flex flex-1 overflow-hidden">
                <AppSidebar/>
                {children}
            </div>       
        </main>
    );
}