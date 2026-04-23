"use client";

import React, { useEffect, useState, useRef } from "react";

interface EventLogsToastProps {
  title: string;
  logs: string[];
  visible: boolean;
  onClose: () => void;
}

export const EventLogsToast: React.FC<EventLogsToastProps> = ({
  title,
  logs,
  visible,
  onClose,
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (visible) {
      setShouldRender(true);
      const timer = setTimeout(() => setIsAnimating(true), 10);
      return () => clearTimeout(timer);
    } else {
      setIsAnimating(false);
      const timer = setTimeout(() => setShouldRender(false), 400);
      return () => clearTimeout(timer);
    }
  }, [visible]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [logs]);

  if (!shouldRender) return null;

  return (
    <div
      className={`
        fixed inset-0 z-[9999] flex items-center justify-center
        transition-all duration-500 ease-out
        ${isAnimating ? "bg-black/70 backdrop-blur-md" : "bg-black/0 backdrop-blur-none"}
      `}
      onClick={onClose}
    >
      <style>{`
        @keyframes floatIcon {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        
        @keyframes spinBorder {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes shimmer {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
        
        .scrollbar-custom::-webkit-scrollbar {
          width: 8px;
        }
        
        .scrollbar-custom::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .scrollbar-custom::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, var(--col-golden), var(--col-dark-golden));
          border-radius: 10px;
          border: 2px solid transparent;
          background-clip: padding-box;
          transition: background 0.2s;
        }
        
        .scrollbar-custom::-webkit-scrollbar-thumb:hover {
          background: var(--col-dark-golden);
          background-clip: padding-box;
        }

        .log-item {
          animation: slideIn 0.3s ease-out forwards;
          opacity: 0;
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-8px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>

      <div
        className={`
          relative flex flex-col items-center
          w-[820px] max-w-[95vw]
          bg-gradient-to-br from-[var(--col-darker)] via-[var(--col-dark)] to-[var(--col-darker)]
          border border-[var(--col-golden)]/30
          rounded-2xl
          overflow-hidden
          transition-all duration-500 ease-out
          shadow-[0_0_60px_rgba(157,157,57,0.15),inset_0_1px_0_rgba(255,255,255,0.05)]
          ${
            isAnimating
              ? "opacity-100 scale-100 translate-y-0"
              : "opacity-0 scale-95 translate-y-8"
          }
        `}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Gradient top accent */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--col-dark-golden)]/40 to-transparent" />

        <div className="flex flex-col items-center px-8 pt-8 pb-6 w-full relative z-10">
          {/* Icon Section */}
          <div
            className="relative w-20 h-20 rounded-full flex items-center justify-center mb-6"
            style={{ animation: "floatIcon 3s ease-in-out infinite" }}
          >
            {/* Outer glow */}
            <div className="absolute inset-0 rounded-full bg-[var(--col-golden)]/10 blur-xl" />

            {/* Spinning border */}
            <div
              className="absolute inset-0 rounded-full border border-transparent border-t-[var(--col-dark-golden)] border-r-[var(--col-dark-golden)]/50"
              style={{ animation: "spinBorder 2s linear infinite" }}
            />

            {/* Static inner ring */}
            <div className="absolute inset-2 rounded-full border border-[var(--col-golden)]/30" />

            {/* Icon */}
            <svg
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-10 h-10 text-[var(--col-dark-golden)] relative z-10"
            >
              <path
                d="M12 22C17.5 22 22 17.5 22 12C22 6.5 17.5 2 12 2C6.5 2 2 6.5 2 12C2 17.5 6.5 22 12 22Z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M12 8V13"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M11.9945 16H12.0035"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          {/* Title */}
          <h3 className="text-white text-2xl font-bold mb-2 text-center tracking-tight">
            {title}
          </h3>

          {/* Subtitle */}
          <p className="text-[var(--col-dark-golden)]/60 text-sm mb-6 font-medium tracking-wide">
            Processing pipeline active
          </p>

          {/* The Log Area */}
          <div
            ref={scrollRef}
            className="w-full bg-gradient-to-b from-black/60 to-black/40 border border-[var(--col-golden)]/15 rounded-xl p-4 h-72 overflow-y-auto font-mono text-xs leading-relaxed scroll-smooth scrollbar-custom relative"
          >
            {/* Background accent line */}
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[var(--col-golden)]/20 via-[var(--col-golden)]/5 to-transparent rounded-full" />

            {logs.length > 0 ? (
              logs.map((log, index) => (
                <div
                  key={index}
                  className="log-item flex gap-3 mb-2 items-start"
                  style={{
                    animationDelay: `${Math.min(index * 0.05, 0.2)}s`,
                    color:
                      index === logs.length - 1
                        ? "var(--col-dark-golden)"
                        : "#d1d5db",
                  }}
                >
                  <span className="shrink-0 opacity-40 font-semibold text-[var(--col-golden)]/60">
                    [{String(index + 1).padStart(2, "0")}]
                  </span>
                  <span
                    className={index === logs.length - 1 ? "font-semibold" : ""}
                  >
                    {log}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-[var(--col-golden)]/40 italic flex items-center gap-2 h-full justify-center">
                <span
                  className="w-1.5 h-1.5 bg-[var(--col-golden)] rounded-full"
                  style={{ animation: "shimmer 1.5s ease-in-out infinite" }}
                />
                Establishing connection...
              </div>
            )}
          </div>
        </div>

        <div className="w-full px-8 pb-7 relative z-10">
          <button
            onClick={onClose}
            className={`
              w-full py-3.5 rounded-xl
              bg-gradient-to-r from-[var(--col-golden)] to-[var(--col-dark-golden)]
              hover:opacity-90
              active:scale-95
              text-black font-bold text-base
              transition-all duration-200
              shadow-lg hover:shadow-[0_0_20px_rgba(157,157,57,0.3)]
              border border-[var(--col-dark-golden)]/20
              tracking-wide
            `}
          >
            Hide Pipeline
          </button>
        </div>

        {/* Gradient bottom accent */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/20 to-transparent" />
      </div>
    </div>
  );
};
