'use client'
import { ReactNode, useState } from "react";
// import { SidebarProvider } from "../../../components/ui/sidebar"
import AppSidebar from "../_components/Suidebar"
import Navbar from "../_components/Navbar";
import "../globals.css"

export default function Layout({ children }: { children: ReactNode }) {

    return (
          // root
        <main className="flex min-h-screen w-full flex-col">
            <Navbar/>
             <div className="flex flex-row">
                <AppSidebar/>
                {children}
            </div>       
        </main>
    );
}