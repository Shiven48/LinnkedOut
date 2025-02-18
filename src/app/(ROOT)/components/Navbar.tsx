'use client'
import React, { useEffect, useState } from "react";
import {
    Navbar,
    NavbarContent,
    NavbarItem,
    NavbarMenuToggle,
    Link,
} from "@heroui/react";
import { Helper } from "../_lib/helper_data";
import { usePathname } from "next/navigation";
import Image from "next/image";

export default function App() {
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);
    const [activeNavComponent, setActiveNavComponent] = useState<string | null>(null)

    const pathname = usePathname()

    useEffect(() => {
        const currentCategory = Helper.navComponents().find(
            category => {
                return category.url === pathname
            });
            setActiveNavComponent(currentCategory ? currentCategory.title : '')
    },[pathname])

    return (
        <Navbar 
            onMenuOpenChange={setIsMenuOpen}
            className="bg-[#2b2b2b] border border-white h-12 rounded-lg w-full"
        >
            <NavbarContent className="text-white">
                <a
                    href="/"
                    className="mb-5"
                >
                <Image
                    src='/home.svg'
                    alt='home'
                    width={25}
                    height={25}
                    className="absolute left-0 -ml-60"
                />
                </a>
            </NavbarContent>
            <NavbarContent className="hidden sm:flex gap-4 text-white" justify="center">
                {
                    Helper.navComponents() ?
                    Helper.navComponents().map( (nav) => (
                        <NavbarItem key={nav.title}>
                        <span className={`hover-styles hover:bg-white hover:text-black 
                            ${activeNavComponent === nav.title? 'nav-styles-active':''}`
                        }>
                            <Link color="foreground" href={nav.url}>
                                {nav.title}
                            </Link>
                        </span>
                    </NavbarItem>
                    )) : null
                }
            </NavbarContent>
        </Navbar>
    );
}