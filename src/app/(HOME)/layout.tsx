"use client";
import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import AppSidebar from "../_components/shared/Sidebar";
import Navbar from "../_components/shared/Navbar";
import VideoNavBar from "../_components/shared/VideoNavbar";
import "../globals.css";

export default function Layout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <main className="flex min-h-screen w-full flex-col fixed">
      {pathname.startsWith("/video") ? <VideoNavBar /> : <Navbar />}
      <div className={`flex flex-1 overflow-hidden`}>
        <AppSidebar />
        {children}
      </div>
    </main>
  );
}
