'use client'
import { useState } from "react";

export const SideChat = () => {
    const [userInput, setUserInput] = useState("");
    const [summary, setSummary] = useState("");

    const handleuserInputQuery = (e:any) => {
        setUserInput(e.target.value);
    };

    const handleGenerateClick = () => {
        if (userInput.trim()) {
            // Simulate bot response (in a real app, this would call an API)
            const botResponse = `Response to: "${userInput}"`;
            setSummary(prev => prev + (prev ? "\n\n" : "") + `Q: ${userInput}\nA: ${botResponse}`);
            setUserInput("");
        }
    };

    const handleDownloadSummary = () => {
        if (!summary) return;
        
        const element = document.createElement("a");
        const file = new Blob([summary], {type: 'text/plain'});
        element.href = URL.createObjectURL(file);
        element.download = "chat-summary.txt";
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    };

    const handleKeyDown = (e:any) => {
        if (e.key === "Enter") {
            handleGenerateClick();
        }
    };

    return (
        <div
            className={`mt-10 w-[97%] h-[60%] bg-[#202020] border-l-1 border-l-golden rounded-medium transform transition-all duration-500 ease-in-out items-center flex flex-col
          `}
        >
            {/* Summary display area */}
            {summary && (
                <div className="w-[90%] mt-4 bg-[#252525] p-3 rounded-md max-h-40 overflow-y-auto">
                    <pre className="whitespace-pre-wrap text-white text-sm break-words">{summary}</pre>
                </div>
            )}

            {/* Input field */}
            <div className="w-[90%] flex justify-around mb-5 mt-auto">
                <input 
                    type="text" 
                    alt="QueryInput" 
                    value={userInput}
                    className="w-full bg-[#303030] rounded-medium text-white scrollbar-hide overflow-y-auto p-2" 
                    onChange={handleuserInputQuery}
                    onKeyDown={handleKeyDown}
                    placeholder="Type your message here..."
                />
            </div>
            
            {/* Buttons */}
            <div className="w-[90%] flex justify-around space-x-16 mb-2">
                <button 
                    onClick={handleDownloadSummary}
                    className="bg-dark-golden hover:bg-golden rounded-medium text-black py-1 px-2 flex-1"
                    disabled={!summary}
                >
                    Download Summary
                </button>
                <button 
                    onClick={handleGenerateClick}
                    className="bg-dark-golden hover:bg-golden rounded-medium text-black py-1 px-2 flex-1"
                >
                    Generate
                </button>
            </div>
            
        </div>
    );
};