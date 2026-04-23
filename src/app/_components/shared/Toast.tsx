"use client";

import React, { useEffect, useState } from "react";

export type ToastType = "warning" | "error" | "success" | "info";

interface ToastProps {
  title: string;
  message: string;
  type?: ToastType;
  icon?: React.ReactNode;
  visible: boolean;
  onClose: () => void;
  duration?: number;
}

const defaultIcons: Record<ToastType, React.ReactNode> = {
  warning: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-8 h-8"
    >
      <path
        d="M12 9V14"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 21.41H5.93999C2.46999 21.41 1.01999 18.93 2.69999 15.9L5.81999 10.28L8.75999 5.00003C10.54 1.79003 13.46 1.79003 15.24 5.00003L18.18 10.29L21.3 15.91C22.98 18.94 21.52 21.42 18.06 21.42H12V21.41Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M11.9945 17H12.0035"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  error: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-8 h-8"
    >
      <path
        d="M12 22C17.5 22 22 17.5 22 12C22 6.5 17.5 2 12 2C6.5 2 2 6.5 2 12C2 17.5 6.5 22 12 22Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9.17 14.83L14.83 9.17"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14.83 14.83L9.17 9.17"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  success: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-8 h-8"
    >
      <path
        d="M12 22C17.5 22 22 17.5 22 12C22 6.5 17.5 2 12 2C6.5 2 2 6.5 2 12C2 17.5 6.5 22 12 22Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7.75 12L10.58 14.83L16.25 9.17"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  info: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-8 h-8"
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
  ),
};

const typeStyles: Record<
  ToastType,
  { iconBg: string; iconColor: string; buttonBg: string; buttonHover: string }
> = {
  warning: {
    iconBg: "bg-[var(--col-dark-golden)]/15",
    iconColor: "text-[var(--col-dark-golden)]",
    buttonBg: "bg-[var(--col-golden)]",
    buttonHover: "hover:bg-[var(--col-dark-golden)]",
  },
  error: {
    iconBg: "bg-red-500/15",
    iconColor: "text-red-400",
    buttonBg: "bg-red-500/80",
    buttonHover: "hover:bg-red-500",
  },
  success: {
    iconBg: "bg-[var(--col-special)]/15",
    iconColor: "text-[var(--col-special)]",
    buttonBg: "bg-[var(--col-special)]/80",
    buttonHover: "hover:bg-[var(--col-special)]",
  },
  info: {
    iconBg: "bg-[var(--col-golden)]/15",
    iconColor: "text-[var(--col-golden)]",
    buttonBg: "bg-[var(--col-golden)]",
    buttonHover: "hover:bg-[var(--col-dark-golden)]",
  },
};

export const Toast: React.FC<ToastProps> = ({
  title,
  message,
  type = "warning",
  icon,
  visible,
  onClose,
  duration = 4000,
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (visible) {
      setShouldRender(true);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsAnimating(true);
        });
      });

      const timer = setTimeout(() => {
        setIsAnimating(false);
        setTimeout(() => {
          setShouldRender(false);
          onClose();
        }, 400);
      }, duration);

      return () => clearTimeout(timer);
    } else {
      setIsAnimating(false);
      const exitTimer = setTimeout(() => setShouldRender(false), 400);
      return () => clearTimeout(exitTimer);
    }
  }, [visible, duration, onClose]);

  const handleDismiss = () => {
    setIsAnimating(false);
    setTimeout(() => {
      setShouldRender(false);
      onClose();
    }, 400);
  };

  if (!shouldRender) return null;

  const styles = typeStyles[type];
  const displayIcon = icon || defaultIcons[type];

  return (
    /* Backdrop overlay */
    <div
      className={`
        fixed inset-0 z-[9999] flex items-center justify-center
        transition-all duration-400 ease-out
        ${isAnimating ? "bg-black/50 backdrop-blur-sm" : "bg-black/0 backdrop-blur-none"}
      `}
      onClick={handleDismiss}
    >
      {/* Modal card */}
      <div
        className={`
          relative flex flex-col items-center
          w-[380px] max-w-[90vw]
          bg-[var(--col-dark)] 
          border border-gray-700/50
          rounded-2xl
          shadow-[0_0_40px_rgba(0,0,0,0.5)]
          overflow-hidden
          transition-all duration-400 ease-out
          ${
            isAnimating
              ? "opacity-100 scale-100 translate-y-0"
              : "opacity-0 scale-90 translate-y-6"
          }
        `}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Content area */}
        <div className="flex flex-col items-center px-8 pt-8 pb-6 w-full">
          {/* Icon circle */}
          <div
            className={`
              w-16 h-16 rounded-full flex items-center justify-center mb-5
              ${styles.iconBg} ${styles.iconColor}
            `}
          >
            {displayIcon}
          </div>

          {/* Title */}
          <h3 className="text-white text-xl font-bold mb-2 text-center">
            {title}
          </h3>

          {/* Message */}
          <p className="text-gray-400 text-sm text-center leading-relaxed max-w-[280px]">
            {message}
          </p>
        </div>

        {/* OK Button */}
        <div className="w-full px-8 pb-7">
          <button
            onClick={handleDismiss}
            className={`
              w-full py-3 rounded-xl
              ${styles.buttonBg} ${styles.buttonHover}
              text-black font-bold text-base
              transition-all duration-200
              shadow-lg
              active:scale-[0.97]
            `}
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};
