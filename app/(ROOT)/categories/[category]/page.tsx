export default async function Page({params}: {params: {category: string}}) {
    const { category } = await params;
    const decodedCategory = decodeURIComponent(category);

    return (
        <span className="bg-red-300 mx-8 text-black">Hello, this is {decodedCategory}</span>
    );
}
