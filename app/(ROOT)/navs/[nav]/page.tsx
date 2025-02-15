export default async function Page({params}:{params:{nav:string}}){
    const { nav } = await params;
    const decodedNav = decodeURIComponent(nav);
    
    return(
        <span className="bg-red-300 text-black"> Hello this is Nav:{decodedNav} </span>
    )
}