'use client'

import React from "react";

export default function Home({params} : {
    params : Promise<{platform: string;}>
}) {
    const param = React.use(params)
    const platform = decodeURIComponent(param.platform)
    return (
        <div>
            <p className="text-white">This is ${platform}</p>
        </div>
    );
}