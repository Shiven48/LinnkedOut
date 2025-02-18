'use client'
import { useEffect, useState } from "react"
import { Helper } from "../_lib/helper_data";
import { HelperFunctions } from "../_lib/helper_funcs";

export default function Trial() {
    const [data, setData] = useState<any>(null);
    
    useEffect(() => {
        setData(HelperFunctions.fetchData());
        HelperFunctions.postDataInDB(data);
    }, [])
    
    return (
        <>
            Trial Component
        </>
    )
}