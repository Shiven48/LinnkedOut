export default async function Page({params}: {params: {category: string}}) {
    const { category } = await params;
    const decodedCategory = decodeURIComponent(category);

    return (
        <div className="bg-red-950 w-full h-full flex justify-center items-center">
            <div className="text-black w-1/2 h-1/2 text-center content-center bg-white"> This is {decodedCategory} page </div>
        </div>
    );
}
