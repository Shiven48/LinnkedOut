'use client'
import React, { useEffect, useState } from "react";
import { Link } from "@heroui/react";
import { Helper } from "../_lib/helper_data";
import { usePathname } from "next/navigation";
import Image from "next/image";

export default function App() {
    const [activeNavComponent, setActiveNavComponent] = useState<string | null>(null);
    const pathname = usePathname();

    useEffect(() => {
        const currentCategory = Helper.navComponents().find(
            category => category.url === pathname
        );
        setActiveNavComponent(currentCategory ? currentCategory.title : '');
    }, [pathname]);

    return (
        <nav className="h-12 bg-[#181818] fixed top-0 w-full flex items-center justify-between px-4 border border-white">
            <div className="flex items-center h-full">
                <a
                    href="/"
                    className="flex items-center hover:bg-white/10 p-1 transition-colors duration-200 bg-white rounded-xl nav-hover hover:border hover:border-white"
                >
                    <Image
                        src='/home.svg'
                        alt='home'
                        width={25}
                        height={25}
                        className="min-w-[25px] nav-hover"
                    />
                </a>
            </div>

            <div className="flex items-center gap-4">
                {Helper.navComponents()?.map((nav) => (
                    <div key={nav.title} className="h-8 flex items-center bg-[#858795] rounded-xl text-black shadow shadow-[#d4d450] border border-[#d4d450]">
                        <Link 
                            href={nav.url}
                            className={`px-4 py-2 rounded-lg
                                hover-nav hover:text-black
                                ${activeNavComponent === nav.title 
                                    ? 'bg-white text-black' 
                                    : 'text-black'
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