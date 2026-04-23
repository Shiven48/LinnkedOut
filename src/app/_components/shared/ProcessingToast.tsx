import React from "react";

interface ProcessingToastProps {
  isSubmitting: boolean;
  currentLog: string | null;
}

export const ProcessingToast: React.FC<ProcessingToastProps> = ({
  isSubmitting,
  currentLog,
}) => {
  if (!isSubmitting) return null;

  return (
    <div className="fixed bottom-8 right-8 z-[9999] bg-[#1a1a1a] border border-golden/50 shadow-[0_0_15px_rgba(255,215,0,0.15)] rounded-2xl p-5 flex items-center gap-4 transition-all duration-300 animate-in fade-in slide-in-from-bottom-5">
      <div className="w-6 h-6 border-2 border-golden border-t-transparent rounded-full animate-spin" />
      <p className="text-white/90 font-medium text-sm">
        {currentLog || "Processing..."}
      </p>
    </div>
  );
};
