import React from "react";

const page = async (
    {params} : {params: Promise<{nav:string}>}
) => {
    const { nav } = await params;
    return(
        <div className="h-screen w-full bg-[#181818]">                
            <span className="text-white">Congrats on finding the easter egg! I'll be working on this soon 😊</span>
        </div>
    )
}
export default page;