'use client'
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem
  } from "@/components/ui/sidebar"
  import { Helper } from "../utils/helper_data";
  import { Category } from "../utils/helper_data";
import Image from "next/image";
import { MouseEvent, useState } from "react";

export default function AppSidebar() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const handleCategoryClick = (categoryTitle: string, e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setActiveCategory(categoryTitle);
  };

    return ( 
        <aside>
           <Sidebar>
      <SidebarContent className="bg-[#252525] text-white">
        <SidebarGroup>
          <SidebarGroupLabel
            className="text-md text-white"
          >Categories</SidebarGroupLabel>
          <SidebarGroupContent className="py-2 pl-4">
            <SidebarMenu>
              {Helper.categories().map((category:Category) => (
                <SidebarMenuItem key={category.title}>
                  <SidebarMenuButton asChild 
                    className= {`py-5 hover:bg-[#d6ac5f] hover:text-white ${activeCategory === category.title ? 'bg-[#cf9e45] rounded-xl text-black border border-white' : ''}
                      hover:rounded-xl justify-between`}
                      onClick={(e) => handleCategoryClick(category.title,e)}
                    >
                    <a href={category.url}>
                      <span>{category.title}</span>
                      <Image 
                        src={`http://localhost:3000/${category.icon}.svg`} 
                        alt={`${category.title}`}
                        width={22}
                        height={22}
                      />
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
          <hr/>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
        </aside>
    );
}

  