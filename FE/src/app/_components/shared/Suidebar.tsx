'use client'
import Image from "next/image";
import { Category, Platfrom } from '@/services/common/types';;
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useSidebarState } from "../../../../hooks/useSideBarState";
import { usePlayingState } from "../../../../hooks/useIsPlaying";
import { categories, Platforms, SERVER_BASE_URL } from "@/services/common/constants";
import { DESKTOPSIZE } from '@/services/common/constants'
import Link from "next/link";

export default function AppSidebar() {

  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activePlatform, setActivePlatform] = useState<string | null>(null);
  const [isPlatformAccordianActive, setIsPlatfromAccordianActive] = useState<boolean>(false)
  const [windowSize, setWindowSize] = useState<number>(DESKTOPSIZE);
  const isOpen = useSidebarState((state) => (state.isOpen))
  const pathname = usePathname();
  const isPlaying = usePlayingState((state) => state.isPlaying)

  useEffect(() => {
    const currentCat = categories().find(category => {
      return category.url === pathname;
    });
    const currentPlatform = Platforms().find(platform => {
      return platform.url === pathname;
    })
    setActiveCategory(currentCat ? currentCat.title : '');
    setActivePlatform(currentPlatform ? currentPlatform.name : '')
  }, [pathname]);

  // Listning to Window resize event
  useEffect(() => {
    const resizeFunc = () => {
      console.log(`Current windowSize: ${windowSize}`)
      setWindowSize(window.innerWidth)
    }

    window.addEventListener('resize', resizeFunc);
    return () => window.removeEventListener('resize', resizeFunc);
  }, [windowSize])

  // Breakpoints for the screen
  useEffect(() => {
    windowSize <= DESKTOPSIZE ?
      useSidebarState.getState().setIsOpen(false) :
      useSidebarState.getState().setIsOpen(true);
  }, [windowSize])


  const handlePlatformAccordianClick = () => {
    setIsPlatfromAccordianActive(prev => !prev)
  }

  return (
    <aside
      className={`h-[calc(100vh-48px)] flex-shrink-0 overflow-y-auto p-5 ease-in-out border border-white 
        ${isOpen ? 'w-72 smallScreenSidebar' : 'w-20'} 
        ${isPlaying ? 'bg-blend-darken brightness-50 bg-darker transition-all duration-500' : 'bg-dark transition-all duration-500'}
      `}
    >

      {/* Home Link */}
      <Link
        href="/?page=1"
        className="px-4 flex items-center p-1 transition duration-200 bg-golden rounded-xl hover-nav border border-black shadow shadow-white"
      >
        <div className={`w-7 h-7 rounded-xl flex justify-center relative bg-white border-2 border-black flex-shrink-0
          ${!isOpen ? 'right-3' : ''}`}>
          <Image
          src='/home.svg'
          alt='home'
          width={25}
          height={25}
          className="min-w-[25px]"
        />
        </div>
        {isOpen && (
          <span className="ml-3 whitespace-nowrap overflow-hidden transition-opacity duration-200">
            Home
          </span>
        )}
      </Link>

      <hr className="mt-6" />

      {/* Categories Link */}
      <nav className="mt-6 space-y-2 bg-inherit">
        {categories().map((category: Category) => (
          <div key={category.title} className={`rounded-xl w-full hover-side transition ease-out 0.3s shadow shadow-white
            ${activeCategory === category.title ? '' : ''}
          `}>
            <Link
              href={`${category.url}?page=1`}
              className={`bg-golden flex items-center py-1 px-4 rounded-xl transition-all duration-200 ease-in-out relative hover-side text-black shadow border border-black
                ${activeCategory === category.title ? 'bg-[#e3ec58] shadow shadow-[#e3ec58]' : 'shadow-white'}`}
            >
              <div className={`w-7 h-7 rounded-xl flex justify-center relative bg-white border-2 border-black flex-shrink-0
              ${!isOpen ? 'right-3' : ''}`}>
                <Image
                  src={`${SERVER_BASE_URL}/${category.icon}.svg`}
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
            </Link>
          </div>
        ))}
      </nav>

      <hr className="mt-6" />

      {/* Accordian to hide some shit */}
      <div
        className={`mt-2 flex justify-start items-center hover:bg-[#2C2C2C] cursor-pointer p-1 rounded-small 
          ${!isOpen ? 'h-8 w-9' : ''}
        `}
        onClick={handlePlatformAccordianClick}
      >
        {isOpen && (
          <span
            className="text-md text-white"
          >Platform</span>
        )}
        <div className={`rounded-full w-5 h-5 bg-white ml-4 
          ${!isOpen ? 'absolute start-3 w-6 h-6' : ''}
          `}>
          <Image
            src={isPlatformAccordianActive ? '/right.svg' : '/down.svg'}
            alt="platform_toggle_arrow_right"
            width={24}
            height={24}
            className={`transition-all duration-200 ease-in-out`}
          />
        </div>
      </div>

      {/* Platoforms Link */}
      <nav className="mt-6 space-y-2 transition-transform duration-200" hidden={isPlatformAccordianActive}>
        {Platforms().map((platform: Platfrom) => (
          <div key={platform.name} className={`rounded-xl w-full hover-side transition ease-out 0.3s shadow shadow-white
          `}>
            <a
              href={decodeURIComponent(platform.url)}
              className={`bg-golden flex items-center py-1 px-4 rounded-xl transition-all duration-200 ease-in-out relative hover-side text-black shadow border border-black
                ${activePlatform === platform.name ? 'bg-[#e3ec58] shadow shadow-[#e3ec58]' : 'shadow-white'}`}
            >
              <div className={`w-7 h-7 rounded-xl flex justify-center relative bg-white border-2 border-black flex-shrink-0
                ${!isOpen ? 'right-3' : ''}
              `}>
                <Image
                  src={`${SERVER_BASE_URL}/${platform.icon}.svg`}
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

      <hr className="mt-6" />

    </aside>
  );
}