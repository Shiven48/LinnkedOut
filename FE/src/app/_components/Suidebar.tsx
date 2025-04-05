'use client'
import Image from "next/image";
import { Helper } from "../../lib/helper_data";
import { Category, Platfrom } from "../../../types";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useSidebarState } from "../../../hooks/useSideBarState";
import { usePlayingState } from "../../../hooks/useIsPlaying";

export default function AppSidebar() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activePlatform, setActivePlatform] = useState<string | null>(null);
  const [isPlatformAccordianActive, setIsPlatfromAccordianActive] = useState<boolean>(false)

  const isOpen = useSidebarState((state) => (state.isOpen))
  const toggle = useSidebarState((state) => state.toggle)
  const pathname = usePathname();
  const isPlaying = usePlayingState((state) => state.isPlaying)

  useEffect(() => {
    const currentCat = Helper.categories().find(category => {
      return category.url === pathname;
    });
    const currentPlatform = Helper.Platforms().find(platform => {
      return platform.url === pathname;
    })
    setActiveCategory(currentCat ? currentCat.title : '');
    setActivePlatform(currentPlatform ? currentPlatform.name : '')
  }, [pathname]);

  const handlePlatformAccordianClick = () => {
    setIsPlatfromAccordianActive(prev => !prev)
  }

  return (
    <aside 
      className={`h-[calc(100vh-48px)] flex-shrink-0 overflow-y-auto p-5 ease-in-out border border-white
        ${isOpen ? 'w-72' : 'w-20'} 
        ${isPlaying ? 'bg-blend-darken brightness-50 bg-darker transition-all duration-500' : 'bg-dark transition-all duration-500'}
      `}
    >
      <div className="relative flex items-center h-8 mb-4 bg-inherit">
        {isOpen && (
          <span className="text-md text-white">Explore</span>
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

      <nav className="mt-6 space-y-2 bg-inherit">
        {Helper.categories().map((category: Category) => (
          <div key={category.title} className= {`rounded-xl w-full hover-side transition ease-out 0.3s shadow shadow-white
            ${activeCategory===category.title ? '' : ''}
          `}>
            <a
              href={category.url}
              className={`bg-golden flex items-center py-1 px-4 rounded-xl transition-all duration-200 ease-in-out relative hover-side text-black shadow border border-black
                ${activeCategory === category.title ? 'bg-[#e3ec58] shadow shadow-[#e3ec58]' : 'shadow-white'}`}
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

      <div 
        className={`mt-2 flex justify-start items-center hover:bg-[#2C2C2C] cursor-pointer p-1 rounded-small 
          ${!isOpen ? 'h-8 w-9' : '' }
        `}
        onClick={handlePlatformAccordianClick}
      >
        {isOpen && (
          <span 
            className="text-md text-white"
          >Platform</span>
        )}     
        <div className={`rounded-full w-5 h-5 bg-white ml-4 
          ${!isOpen ? 'absolute start-3 w-6 h-6' : '' }
          `}>   
          <Image
            src={ isPlatformAccordianActive ? '/right.svg' : '/down.svg'}
            alt="platform_toggle_arrow_right"
            width={24}
            height={24}
            className={`transition-all duration-200 ease-in-out`}
          />
        </div>
      </div>
      
      <nav className="mt-6 space-y-2 transition-transform duration-200" hidden={isPlatformAccordianActive}>
        {Helper.Platforms().map((platform: Platfrom) => (
          <div key={platform.name} className= {`rounded-xl w-full hover-side transition ease-out 0.3s shadow shadow-white
          `}>
            <a
              href={platform.url}
              className={`bg-golden flex items-center py-1 px-4 rounded-xl transition-all duration-200 ease-in-out relative hover-side text-black shadow border border-black
                ${activePlatform === platform.name ? 'bg-[#e3ec58] shadow shadow-[#e3ec58]' : 'shadow-white'}`}
            >
              <div className={`w-7 h-7 rounded-xl flex justify-center relative bg-white border-2 border-black flex-shrink-0
                ${!isOpen ? 'right-3' : ''}
              `}>
                <Image
                  src={`${Helper.basePath}/${platform.icon}.svg`}
                  alt={platform.name}
                  width={22}
                  height={22}
                  priority
                  className="transition-transform duration-200"
                />
              </div>
              {isOpen && (
                <span className="ml-3 whitespace-nowrap overflow-hidden transition-opacity duration-200">
                  {platform.name}
                </span>
              )}
            </a>
          </div>
        ))}
      </nav>

      <hr className="mt-4"/>

    </aside>
  );
}