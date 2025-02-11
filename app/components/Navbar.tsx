'use client'

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

const Navbar = () => {
    const [isSideActive, setIsSideActive] = useState(false)

    return ( 
        <header className=" bg-[#212121]">
            <nav>
                <Link href="/">
                    <Image 
                        src='/options.svg' 
                        alt="Home logo" 
                        height={20} 
                        width={20}
                        className="p-2 "    
                    />
                </Link>
            </nav>
        </header>
    );
}
 
export default Navbar;