'use client'
import Image from "next/image";
import { Helper } from "../_lib/helper_data";
import { Category } from "../../../types";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useSidebarState } from "../../../hooks/useSideBarState";

export default function AppSidebar() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const isOpen = useSidebarState((state) => (state.isOpen))
  const toggle = useSidebarState((state) => state.toggle)
  const pathname = usePathname();

  useEffect(() => {
    const currentNav = Helper.categories().find(category => {
      return category.url === pathname;
    });
    setActiveCategory(currentNav ? currentNav.title : '');
  }, [pathname]);

  return (
    <aside 
      className={`h-screen bg-[#181818] p-5 left-0 transition-all duration-200 ease-in-out
        ${isOpen ? 'w-72' : 'w-20'} mt-12 border border-white`}
    >
      <div className="relative flex items-center h-8 mb-4">
        {isOpen && (
          <span className="text-md text-white">Categories</span>
        )}
        <button
          className={`bg-white rounded-xl w-8 h-8 absolute transition-all duration-200 ease-in-out flex items-center justify-center hover-side
            ${isOpen ? 'right-0' : 'left-1 '}`}
          onClick={toggle}
        >
          <Image
            src='/arrow-lef.svg'
            alt="sidebar_toggle_arrow"
            width={24}
            height={24}
            className={`transition-transform duration-200 ${!isOpen ? 'rotate-180' : ''}`}
          />
        </button>
      </div>
      <hr/>

      <nav className="mt-6 space-y-2">
        {Helper.categories().map((category: Category) => (
          <div key={category.title} className="bg-[#858795] rounded-xl border border-[#d4d450] w-full shadow shadow-gray-400 hover-side">
            <a
              href={category.url}
              className={`flex items-center py-1 px-4 rounded-xl transition-all duration-200 ease-in-out relative text-black
                ${activeCategory === category.title ? '' : ''}`}
            >
              <div className={`w-7 h-7 rounded-xl flex justify-center relative bg-white border-2 border-black flex-shrink-0
              ${!isOpen ? 'right-3' : ''}`}>
                <Image
                  src={`${Helper.basePath}/${category.icon}.svg`}
                  alt={category.title}
                  width={22}
                  height={22}
                  priority
                  className="transition-transform duration-200"
                />
              </div>
              {isOpen && (
                <span className="ml-3 whitespace-nowrap overflow-hidden transition-opacity duration-200">
                  {category.title}
                </span>
              )}
            </a>
          </div>
        ))}
      </nav>
      <hr className="mt-6" />
    </aside>
  );
}