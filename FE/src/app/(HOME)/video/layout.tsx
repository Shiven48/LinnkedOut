'use client'
import { ReactNode } from "react";
import AppSidebar from "@/app/_components/Suidebar"
import VideoNavBar from "@/app/_components/VideoNavbar";
import "@/app/globals.css"
import { usePathname } from "next/navigation";
// import { usePlayingState } from "../../../hooks/useIsPlaying";

export default function Layout({ children }: { children: ReactNode }) {
    return (
        <main className="flex min-h-screen w-full flex-col fixed">  
             <div className="flex flex-1 overflow-hidden">
                <AppSidebar/>
                {children}
            </div>       
        </main>
    );
}