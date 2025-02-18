export default async function Page({params}:{params:{nav:string}}){
    const { nav } = await params;
    const decodedNav = decodeURIComponent(nav);
    
    return(
        <div className="bg-red-950 w-full h-full flex justify-center items-center">
            <div className="text-black w-1/2 h-1/2 text-center content-center bg-white"> This is {decodedNav} page </div>
        </div>
    )
}