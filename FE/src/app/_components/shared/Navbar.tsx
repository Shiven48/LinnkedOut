'use client'
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { navComponents } from "@/services/common/constants";
import { usePathname } from "next/navigation";
import Image from "next/image";
import SearchBar from "../shared/SearchBar";
import { useSidebarState } from "../../../../hooks/useSideBarState";

export default function App() {
    const [activeNavComponent, setActiveNavComponent] = useState<string | null>(null);
    const pathname = usePathname();
    const isOpen = useSidebarState((state) => (state.isOpen))
    const toggle = useSidebarState((state) => state.toggle)    
    // Fetch the navigation components only once
    const navComponent = navComponents();

    useEffect(() => {
        const currentCategory = navComponent.find(
            category => category.url === pathname
        );
        setActiveNavComponent(currentCategory ? currentCategory.title : '');
    }, [pathname, navComponents]);

    return (
        <nav className="h-12 bg-dark sticky-top-0 w-full flex items-center justify-between px-4 border border-white z-10">

            <div className="flex items-center h-full">
                <button
                    className={`bg-white rounded-xl w-8 h-8 absolute bg-golden border border-white transition-all duration-200 ease-in-out flex items-center justify-center hover-side`}
                    onClick={toggle}
                >
                    <Image
                        src='/options.svg'
                        alt='home'
                        width={25}
                        height={25}
                        className="min-w-[25px]"
                    />
                </button>
            </div>

            <div className="flex justify-center w-[40%]">
                <SearchBar />
            </div>

            <div className="flex items-center gap-4 bg-golden rounded-xl hover-side">
                {navComponent.map((nav) => (
                    <div key={nav.title} className="h-8 flex items-center bg-gray-color rounded-xl border border-black text-black shadow shadow-white transition ease-out 0.3">
                        <Link 
                            href={nav.url}
                            className={`px-2 py-1 rounded-lg
                                hover-nav hover:text-black
                                ${activeNavComponent === nav.title 
                                    ? ' bg-dark-golden h-8 rounded-xl border-2 border-black shadow shadow-[#d4d450]' 
                                    : ''
                                }`
                            }
                        >
                            {nav.title}
                        </Link>
                    </div>
                ))}
            </div>
        </nav>
    );
}
