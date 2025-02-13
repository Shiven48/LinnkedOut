export default async function Page({params}:{params:{nav:string}}){
    const nav = decodeURIComponent(params.nav);
    console.log(`nav : ${nav}`)
    return(
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <span className="bg-red-300 text-black"> Hello this is Nav:{nav} </span>
        </div>
    )
}