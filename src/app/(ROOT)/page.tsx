import Trial from "./components/Trial";

export default function Home() {
    return ( 
        <div className="bg-red-950 w-full h-full flex justify-center items-center">
            <div className="text-black w-1/2 h-1/2 text-center content-center bg-white"> 
                <Trial />
            </div>
        </div>
     );
}