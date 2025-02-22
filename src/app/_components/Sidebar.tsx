'use client'
import {
    Sidebar,
    // SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem
  } from "../../../components/ui/sidebar"
  import { Helper } from "../_lib/helper_data";
  import { Category } from "../../../types";
import Image from "next/image";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export default function AppSidebar() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [isSideBarOpen,setIsSideBarOpen] = useState<boolean>(true)
  const pathname = usePathname()

    useEffect(() => {
        const currentNav = Helper.categories().find(category => {
          return category.url === pathname;
        });
        setActiveCategory(currentNav ? currentNav.title : '');
    }, [pathname]);

    return ( 
      <Sidebar className="h-full">
        <div className={`bg-[#252525] text-white relative
            ${isSideBarOpen ? 'w-64 transition duration-200 border': 'w-20 transition duration-200 text-opacity-0 border'}`
          }>
          <SidebarGroup>
            <SidebarGroupLabel className="text-md text-white relative"> 
              <span>{!isSideBarOpen?'':'Categories'}</span>
              <div className="bg-white border w-6 rounded-xl absolute -right-5 bottom-1 cursor-pointer">  
                <Image
                src='/arrow-lef.svg'
                alt="sidebar_rigth_arrow"
                width={30}
                height={30}
                className={`rounded-full ${!isSideBarOpen ? 'rotate-180 transition duration-200 mr-5':''}`}
                onClick={() => setIsSideBarOpen(!isSideBarOpen)}
                />
              </div>
            </SidebarGroupLabel>
            <SidebarGroupContent className="py-4 pl-4">
              <SidebarMenu>
              {Helper.categories().map((category:Category) => (
                <SidebarMenuItem key={category.title}>
                  <SidebarMenuButton asChild 
                    className={`hover-styles py-6 justify-start flex items-center w-full transition-all duration-200 ease-in-out
                      ${isSideBarOpen ? 'px-4' : 'px-2'}
                      ${activeCategory === category.title ?
                        'nav-styles-active rounded-xl py-2'
                        :''}
                    `}
                    >
                  <a href={category.url}>
                  <div className="border-2 border-black w-7 h-7 rounded-xl flex justify-center items-center bg-white">
                    <Image 
                      src={`${Helper.basePath}/${category.icon}.svg`} 
                      alt={`${category.title}`}
                      width={ 22 }
                      height={ 22 }
                      priority
                    />
                  </div>
                  { isSideBarOpen && (
                    <span className="ml-6 whitespace-nowrap">{category.title}</span>
                  )}
                  </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              </SidebarMenu>
            </SidebarGroupContent>
            <hr/>
          </SidebarGroup>
        </div>
      </Sidebar>
    );
}

  