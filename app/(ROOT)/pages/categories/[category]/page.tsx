export default async function Page({params}:{params:{category:string}}){
    const category = decodeURIComponent((await params)['category'])
    console.log(category)
    return(
        <>
            Hello this is {category}
        </>
    )
}