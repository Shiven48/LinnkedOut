"use client";
import { navComponents, SERVER_BASE_URL } from "@/services/common/constants";
import { usePathname } from "next/navigation";
import { useSidebarState } from "@/hooks/useSideBarState";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import SearchBar from "@/app/_components/shared/SearchBar";
import Image from "next/image";
import { UserButton } from "@clerk/nextjs";

export default function App() {
  const [activeNavComponent, setActiveNavComponent] = useState<string | null>(
    null
  );
  const pathname = usePathname();
  const toggle = useSidebarState((state) => state.toggle);
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
          className={`bg-white rounded-xl w-8 h-8 absolute bg-golden border border-white transition-all duration-200 ease-in-out flex items-center justify-center hover-side`}
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

      <div className="flex items-center gap-4">
        {navComponent.map((nav) => (
          <div
            key={nav.title}
            className="h-auto w-auto flex items-center justify-center rounded-xl transition-colors duration-300 ease-out"
          >
            <Link
              href={nav.url}
              className={`p-[2px] rounded-large duration-300 ease-out hover:scale-110 transition-all ${
                activeNavComponent === nav.title
                  ? "bg-[#484848] border border-[#e3ec58]/80 shadow-[0_0_12px_rgba(227,236,88,0.3)]"
                  : "border border-transparent hover:bg-[#e3ec58]/10 hover:border-[#e3ec58]/50 hover:shadow-[0_0_15px_rgba(227,236,88,0.4)]"
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
        <UserButton />
      </div>
    </nav>
  );
}
