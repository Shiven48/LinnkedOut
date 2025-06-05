'use client'
import { ReactNode } from "react";
import AppSidebar from "@/app/_components/shared/Suidebar"
import "@/app/globals.css"

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