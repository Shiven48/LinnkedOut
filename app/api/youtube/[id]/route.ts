import { NextRequest, NextResponse } from "next/server"
import { Helper } from "@/app/(ROOT)/_lib/helper_data";

export async function GET(
    request: NextRequest,
    {params} : { params : { id:string } }
) {
    const { id } = await (params);
    const obj = Helper.Resources()[0]
    console.log(obj)
    // try {
    //     const fetchedData = await fetch('', {
    //         method: 'GET',
    //         headers: {
    //           'Authorization': `Bearer ${process.env.YOUTUBE_API_KEY}`,
    //           'Content-Type': 'application/json',
    //         },
    //       });
        
    //     if (!fetchedData.ok) return NextResponse.json({ error: 'Data not found' }, { status: 404 });
        
    //     const singleData = await fetchedData.json()
    //     return NextResponse.json({
    //         'response' : singleData
    //     }); 
    // } catch (error) {
    //     console.error(error);
        // return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    // }
    return NextResponse.json({'res' : 'ok'})
}