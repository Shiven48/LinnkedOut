'use client'
import React from 'react';
import { X } from 'lucide-react';

interface SummaryPanelProps {
  isOpen: boolean;
  onClose: () => void;
  summary: string;
  isSummarizing: boolean;
}

export const SummaryPanel: React.FC<SummaryPanelProps> = ({ 
  isOpen, 
  onClose, 
  summary, 
  isSummarizing 
}) => {
  return (
    <div 
      className={`fixed right-0 top-0 h-full w-full md:w-1/3 bg-[#242424] border-l-2 border-golden 
        transform transition-all duration-500 ease-in-out z-50 overflow-hidden
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}
      `}
    >
      <div className="flex justify-between items-center p-4 border-b border-golden">
        <h2 className="text-2xl text-golden font-serif">Summary</h2>
        <button 
          onClick={onClose}
          className="text-white hover:text-golden transition-colors"
        >
          <X size={24} />
        </button>
      </div>
      
      <div className="p-4 h-[calc(100%-64px)] overflow-y-auto">
        {isSummarizing ? (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="animate-pulse mb-4">
              <div className="h-4 bg-golden/30 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-golden/30 rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-golden/30 rounded w-2/3"></div>
            </div>
            <p className="text-gray-300 mt-2">Generating summary...</p>
          </div>
        ) : summary ? (
          <div className="text-white whitespace-pre-line">
            <div className="prose prose-invert prose-sm md:prose-base max-w-none">
              {summary}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-400">Click 'Summarize' to generate a summary</p>
          </div>
        )}
      </div>
    </div>
  );
};