"use client";
import Image from "next/image";
import { Category, Platfrom } from "@/services/common/types";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useSidebarState } from "@/hooks/useSideBarState";
import { usePlayingState } from "@/hooks/useIsPlaying";
import {
  categories,
  Platforms,
  SERVER_BASE_URL,
} from "@/services/common/constants";
import { DESKTOPSIZE } from "@/services/common/constants";
import Link from "next/link";

export default function AppSidebar() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activePlatform, setActivePlatform] = useState<string | null>(null);
  const [isPlatformAccordianActive, setIsPlatfromAccordianActive] =
    useState<boolean>(false);
  const [windowSize, setWindowSize] = useState<number>(DESKTOPSIZE);
  const isOpen = useSidebarState((state) => state.isOpen);
  const pathname = usePathname();
  const isPlaying = usePlayingState((state) => state.isPlaying);

  useEffect(() => {
    const currentCat = categories().find((category) => {
      return category.url === pathname;
    });
    const currentPlatform = Platforms().find((platform) => {
      return platform.url === pathname;
    });
    setActiveCategory(currentCat ? currentCat.title : "");
    setActivePlatform(currentPlatform ? currentPlatform.name : "");
  }, [pathname]);

  // Listning to Window resize event
  useEffect(() => {
    const resizeFunc = () => {
      console.log(`Current windowSize: ${windowSize}`);
      setWindowSize(window.innerWidth);
    };

    window.addEventListener("resize", resizeFunc);
    return () => window.removeEventListener("resize", resizeFunc);
  }, [windowSize]);

  // Breakpoints for the screen
  useEffect(() => {
    windowSize <= DESKTOPSIZE
      ? useSidebarState.getState().setIsOpen(false)
      : useSidebarState.getState().setIsOpen(true);
  }, [windowSize]);

  const handlePlatformAccordianClick = () => {
    setIsPlatfromAccordianActive((prev) => !prev);
  };

  return (
    <aside
      className={`h-[calc(100vh-64px)] flex-shrink-0 overflow-y-auto p-5 ease-in-out border-r border-white/5 
        ${isOpen ? "w-72 smallScreenSidebar" : "w-16 sm:w-20"} 
        ${
          isPlaying
            ? "bg-blend-darken brightness-50 bg-darker transition-all duration-500"
            : "bg-dark/40 backdrop-blur-md transition-all duration-500"
        }
      `}
    >
      {/* Home Link */}
      <Link
        href="/?page=1"
        className="px-3 sm:px-4 flex items-center py-2 transition duration-200 bg-white/5 rounded-xl hover:bg-white/10 border border-white/5 shadow-md group"
      >
        <div
          className={`w-8 h-8 rounded-xl flex items-center justify-center relative bg-dark-golden border border-white/10 flex-shrink-0 shadow-[0_0_10px_rgba(139,92,246,0.2)] group-hover:shadow-[0_0_15px_rgba(139,92,246,0.5)] transition-all
          ${!isOpen ? "right-1" : ""}`}
        >
          <Image
            src="/home.svg"
            alt="home"
            width={20}
            height={20}
            className="brightness-200"
          />
        </div>
        {isOpen && (
          <span className="ml-3 whitespace-nowrap overflow-hidden transition-opacity duration-200">
            Home
          </span>
        )}
      </Link>

      <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent my-6" />

      {/* Categories Link */}
      <nav className="mt-6 space-y-2 bg-inherit">
        {categories().map((category: Category) => (
          <div
            key={category.title}
            className={`rounded-xl w-full transition ease-out 0.3s
          `}
          >
            <Link
              href={`${category.url}?page=1`}
              className={`flex items-center py-2 px-3 sm:px-4 rounded-xl transition-all duration-200 ease-in-out relative hover:-translate-y-1 text-gray-300 border border-transparent hover:bg-white/5 group
                ${
                  activeCategory === category.title
                    ? "bg-white/10 shadow-[0_4px_15px_rgba(0,0,0,0.2)] border-white/10 text-white"
                    : ""
                }`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center relative flex-shrink-0 transition-all bg-dark-golden/20
              ${activeCategory === category.title ? "bg-dark-golden shadow-[0_0_10px_rgba(139,92,246,0.4)] border border-white/20" : "border border-white/5 group-hover:bg-dark-golden/40"}
              ${!isOpen ? "right-1" : ""}`}
              >
                <Image
                  src={`${SERVER_BASE_URL}/${category.icon}.svg`}
                  alt={category.title}
                  width={20}
                  height={20}
                  priority
                  className="transition-transform duration-200 brightness-200"
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

      <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent my-6" />

      {/* Accordian to hide some shit */}
      <div
        className={`mt-2 flex justify-start items-center hover:bg-[#2C2C2C] cursor-pointer p-1 rounded-small 
          ${!isOpen ? "h-8 w-9" : ""}
        `}
        onClick={handlePlatformAccordianClick}
      >
        {isOpen && <span className="text-md text-white">Platform</span>}
        <div
          className={`rounded-full w-5 h-5 bg-white ml-4 
          ${!isOpen ? "absolute start-3 w-6 h-6" : ""}
          `}
        >
          <Image
            src={isPlatformAccordianActive ? "/right.svg" : "/down.svg"}
            alt="platform_toggle_arrow_right"
            width={24}
            height={24}
            className={`transition-all duration-200 ease-in-out`}
          />
        </div>
      </div>

      {/* Platoforms Link */}
      <nav
        className="mt-6 space-y-2 transition-transform duration-200"
        hidden={isPlatformAccordianActive}
      >
        {Platforms().map((platform: Platfrom) => (
          <div
            key={platform.name}
            className={`rounded-xl w-full transition ease-out 0.3s
          `}
          >
            <a
              href={decodeURIComponent(platform.url)}
              className={`flex items-center py-2 px-3 sm:px-4 rounded-xl transition-all duration-200 ease-in-out relative hover:-translate-y-1 text-gray-300 border border-transparent hover:bg-white/5 group
                ${
                  activePlatform === platform.name
                    ? "bg-white/10 shadow-[0_4px_15px_rgba(0,0,0,0.2)] border-white/10 text-white"
                    : ""
                }`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center relative flex-shrink-0 transition-all bg-dark-golden/20
              ${activePlatform === platform.name ? "bg-dark-golden shadow-[0_0_10px_rgba(139,92,246,0.4)] border border-white/20" : "border border-white/5 group-hover:bg-dark-golden/40"}
              ${!isOpen ? "right-1" : ""}`}
              >
                <Image
                  src={`${SERVER_BASE_URL}/${platform.icon}.svg`}
                  alt={platform.name}
                  width={20}
                  height={20}
                  priority
                  className="transition-transform duration-200 brightness-200"
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

      <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent my-6" />
    </aside>
  );
}
