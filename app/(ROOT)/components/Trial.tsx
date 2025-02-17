'use client'
import { useEffect, useState } from "react"
import { Helper } from "../_lib/helper_data";
import { HelperFunctions } from "../_lib/helper_funcs";

export default function Trial() {
    const [data, setData] = useState<any>(null);
    
    useEffect(() => {
        async function fetchData() {
            const videoId = HelperFunctions.parseYoutubeEmbeddedLink(Helper.Resources()[0].link)
            const response = await fetch(`/api/hello/${videoId}`);
            if (response.ok) {
                const data = await response.json();
                setData(data);
            }
        }
        fetchData();
    }, [])
    
    return (
        <>
            Trial Component
        </>
    )
}