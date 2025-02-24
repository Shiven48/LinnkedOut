'use client'
import { ReactNode, useState } from "react";
import AppSidebar from "../_components/Suidebar"
import Navbar from "../_components/Navbar";
import "../globals.css"

export default function Layout({ children }: { children: ReactNode }) {

    return (
          // root
        <main className="flex min-h-screen w-full flex-col fixed">  
            <Navbar/>
             <div className="flex flex-1 overflow-hidden">
                <AppSidebar/>
                {children}
            </div>       
        </main>
    );
}