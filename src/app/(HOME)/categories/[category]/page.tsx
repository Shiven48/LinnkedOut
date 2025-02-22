'use client'
import React from "react";
import { useSidebarState } from "../../../../../hooks/useSideBarState";

export default function Category({params} : {params : Promise<{
    category: string;
  }>}) {
    const isOpen = useSidebarState(state => state.isOpen)
    const param = React.use(params)
    const category = decodeURIComponent(param.category)
    return (
        <div className="h-screen w-full mt-12 bg-[#181818]">
            <span className="text-white">
                This is the {category} page
            </span>
        </div>
    );
}