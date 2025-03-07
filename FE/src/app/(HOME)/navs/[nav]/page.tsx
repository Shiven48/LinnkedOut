import React from "react";

const page = (
    {params} : {params: Promise<{nav:string}>}
) => {
    const param = React.use(params)
    const nav =param.nav  
    return(
        <>
        <div className="h-screen w-full mt-12 bg-[#181818]">                
            <span className="text-white">This is the current nav : {nav} </span>
        </div>
        </>
    )
}
export default page;