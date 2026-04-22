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
  }, [pathname, navComponent]);

  return (
    <nav className="h-14 mt-4 mx-auto w-[95%] bg-white/5 backdrop-blur-xl sticky top-4 flex items-center justify-between px-6 border border-white/10 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.3)] z-50 transition-all">
      <div className="flex items-center h-full">
        <button
          className={`bg-golden rounded-xl w-10 h-10 absolute border border-white/5 shadow-md transition-all duration-200 ease-in-out flex items-center justify-center hover-side hover:shadow-accentHi hover:shadow-lg`}
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
              className={`p-[4px] rounded-xl duration-300 ease-out hover:scale-105 ${
                activeNavComponent === nav.title
                  ? "bg-dark-golden text-white shadow-[0_0_15px_rgba(139,92,246,0.3)] border border-white/10"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
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
