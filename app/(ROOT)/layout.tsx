import { ReactNode } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import AppSidebar from "../components/Sidebar"
import Navbar from "../components/Navbar";
import "../globals.css"


export default function Layout({ children }: { children: ReactNode }) {
    return (
        <main className="h-screen w-screen bg-[#181818] fixed">
        <SidebarProvider>
            <Navbar />
            <AppSidebar />
            <div>
                <SidebarTrigger />
                {children}
            </div>
        </SidebarProvider>
        </main>
    );
}