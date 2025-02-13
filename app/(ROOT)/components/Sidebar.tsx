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
import { MouseEvent, useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export default function AppSidebar() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
    const pathname = usePathname()

    useEffect(() => {
        const currentNav = Helper.navComponents().find(
            category => category.url === pathname
        )
        console.log(pathname)
        currentNav ? setActiveCategory(currentNav.title) : setActiveCategory('')
    }, [pathname])

    const handleCategoryClick = (categoryTitle: string, e:MouseEvent<HTMLButtonElement>) => {
        setActiveCategory(categoryTitle)
    }

    return ( 
      <Sidebar className="bg-white fixed">
        <SidebarContent className="bg-[#252525] text-white ">
          <SidebarGroup>
            <SidebarGroupLabel className="text-md text-white"> Categories </SidebarGroupLabel>
            <SidebarGroupContent className="py-4 pl-4">
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
                    src={`${Helper.basePath}/${category.icon}.svg`} 
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
    );
}

  