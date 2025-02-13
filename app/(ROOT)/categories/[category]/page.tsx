export default async function Page({params}:{params:{category:string}}){
    const category = decodeURIComponent(params.category);
    console.log(`category : ${category}`)
    return(
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <span> Hello this is {category} </span>
        </div>
    )
}