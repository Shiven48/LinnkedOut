'use client'
import { ReactNode } from "react";
import { SidebarProvider } from "@/components/ui/sidebar"
import AppSidebar from "../(ROOT)/components/Sidebar"
import Navbar from "../(ROOT)/components/Navbar";
import "../globals.css"

export default function Layout({ children }: { children: ReactNode }) {
    console.log(`Hello Am i visible`)
    return (
        <SidebarProvider>
            <div className="min-h-screen w-screen bg-[#181818] flex-1 fixed">
                <Navbar/>
                <aside className="flex">
                    <AppSidebar/>
                    <main className="flex-1 overflow-auto">
                        {children}
                    </main>
                </aside>
            </div>
        </SidebarProvider>
    );
}