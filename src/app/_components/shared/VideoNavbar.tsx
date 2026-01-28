"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { navComponents, SERVER_BASE_URL } from "@/services/common/constants";
import { usePathname } from "next/navigation";
import Image from "next/image";
import SearchBar from "./SearchBar";
import { useSidebarState } from "@/hooks/useSideBarState";
import Switch from "./Switch";

export default function App() {
  const [activeNavComponent, setActiveNavComponent] = useState<string | null>(
    null
  );
  const pathname = usePathname();
  const isOpen = useSidebarState((state) => state.isOpen);
  const toggle = useSidebarState((state) => state.toggle);
  // Fetch the navigation components only once
  const navComponent = navComponents();

  useEffect(() => {
    const currentCategory = navComponent.find(
      (category) => category.url === pathname
    );
    setActiveNavComponent(currentCategory ? currentCategory.title : "");
  }, [pathname, navComponents]);

  return (
    <nav className="h-12 bg-dark sticky-top-0 w-full flex items-center justify-between px-4 border border-white z-10">
      <div className="flex items-center h-full">
        <button
          className={`bg-white rounded-xl w-8 h-8 absolute bg-golden border border-white transition-all duration-200 ease-in-out flex items-center justify-center hover-side `}
          onClick={toggle}
        >
          <Image
            src="/options.svg"
            alt="home"
            width={25}
            height={25}
            className="min-w-[25px]"
          />
        </button>
      </div>

      <div className="flex justify-center w-[40%]">
        <SearchBar />
      </div>

      <div className="flex justify-center">
        <Switch />
      </div>

      <div className="flex items-center gap-4">
        {navComponent.map((nav) => (
          <div
            key={nav.title}
            className="h-auto w-auto flex items-center justify-center rounded-xl transition-colors duration-300 ease-out"
          >
            <Link
              href={nav.url}
              className={`p-[2px] rounded-large duration-300 ease-out hover:scale-110 ${
                activeNavComponent === nav.title
                  ? "bg-[#484848] text-dark-golden border border-white"
                  : "text-gray-300 hover:text-dark-golden hover:bg-[#484848] hover:bg-opacity-25 hover:rounded-large"
              }`}
            >
              <Image
                src={`${SERVER_BASE_URL}/${nav.title}.svg`}
                width={30}
                height={30}
                alt={`${nav.title}`}
                className="object-contain"
              />
            </Link>
          </div>
        ))}
      </div>
    </nav>
  );
}
