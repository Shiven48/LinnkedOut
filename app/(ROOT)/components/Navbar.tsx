'use client'
import React, { useEffect, useState } from "react";
import {
    Navbar,
    NavbarContent,
    NavbarItem,
    NavbarMenuToggle,
    Link,
} from "@heroui/react";
import { Helper } from "../utils/helper_data";
import { usePathname } from "next/navigation";

export default function App() {
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);
    const [activeNavComponent, setActiveNavComponent] = useState<string | null>(null)

    const pathname = usePathname()

    useEffect(() => {
        const currentCategory = Helper.navComponents().find(
            category => category.url === pathname
        )
        console.log(pathname)
        currentCategory ? setActiveNavComponent(currentCategory.title) : setActiveNavComponent('')
    },[activeNavComponent])

    return (
        <Navbar 
            onMenuOpenChange={setIsMenuOpen}
            className="bg-[#2b2b2b] border border-white h-12 rounded-xl w-full flex"
        >
            <NavbarContent className="text-white">
                <NavbarMenuToggle
                    aria-label={isMenuOpen ? "Close menu" : "Open menu"}
                    className="sm:hidden"
                />
            </NavbarContent>
            <NavbarContent className="hidden sm:flex gap-4 text-white" justify="center">
                {
                    Helper.navComponents() ?
                    Helper.navComponents().map( (nav) => (
                        <NavbarItem key={nav.title}>
                        <span className="hover-styles navbar-active-styles">
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