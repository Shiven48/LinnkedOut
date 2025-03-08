import React from "react";

const page = (
    {params} : {params: Promise<{nav:string}>}
) => {
    const param = React.use(params)
    const nav =param.nav  
    return(
        <>
        <div className="h-screen w-full bg-[#181818]">                
            <span className="text-white">Will start working on {nav} soon</span>
        </div>
        </>
    )
}
export default page;