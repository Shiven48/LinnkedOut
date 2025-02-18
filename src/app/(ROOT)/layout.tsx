'use client'
import { ReactNode } from "react";
import { SidebarProvider } from "@/components/ui/sidebar"
import AppSidebar from "./components/Sidebar"
import Navbar from "./components/Navbar";
import "../globals.css"

export default function Layout({ children }: { children: ReactNode }) {
    return (
        <SidebarProvider>
            <div className="min-h-screen w-full bg-[#181818] fixed">
                <Navbar/>
                <aside className="flex">
                    <AppSidebar/>
                    <main className="w-full">
                        {children}
                    </main>
                </aside>
            </div>
        </SidebarProvider>
    );
}