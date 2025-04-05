'use client'
import React, { useEffect, useState } from "react";
import Link from "next/link";  // Use Next.js Link component
import { Helper } from "../../lib/helper_data";
import { usePathname } from "next/navigation";
import Image from "next/image";
import Switch from "./Switch";
import SearchBar from "./SearchBar";

export default function VideoNavBar() {
    const [activeNavComponent, setActiveNavComponent] = useState<string | null>(null);
    const pathname = usePathname();
    
    // Fetch the navigation components only once
    const navComponents = Helper.navComponents();

    useEffect(() => {
        const currentCategory = navComponents.find(
            category => category.url === pathname
        );
        setActiveNavComponent(currentCategory ? currentCategory.title : '');
    }, [pathname, navComponents]);

    return (
        <nav className="h-12 bg-dark sticky-top-0 w-full flex items-center justify-between px-4 border border-white z-10">
            <div className="flex items-center h-full">
                <a
                    href="/"
                    className="flex items-center p-1 transition duration-200 bg-golden rounded-xl hover-nav border border-white"
                >
                    <Image
                        src='/home.svg'
                        alt='home'
                        width={25}
                        height={25}
                        className="min-w-[25px]"
                    />
                </a>
            </div>

            <div className="flex justify-center w-[40%]">
                <SearchBar />
            </div>

            <div className="flex absolute end-40">
                <Switch/>
            </div>

            <div className="flex items-center gap-4 bg-golden rounded-xl hover-side">
                {navComponents.map((nav) => (
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
