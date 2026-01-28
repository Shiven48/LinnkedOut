import { Dashboard } from "@/app/_components/shared/Dashboard";
import { PostInputForm } from "@/app/_components/shared/PostInputForm";
import React from "react";

type ComponentMapType = {
    [ navType:string ]: React.ReactElement
}

const page = async (
    { params }: { params: Promise<{ nav: string }> }
) => {
    const { nav } = await params;

    const componentMap:ComponentMapType = {
        insert: <PostInputForm />,
        dashboard: <Dashboard />,
    };

    return (
        <div className="w-screen bg-dark scrollbar-hide overflow-y-auto max-h-[calc(100vh-2rem)]">
            { componentMap[nav] }
        </div>
    )
}
export default page;