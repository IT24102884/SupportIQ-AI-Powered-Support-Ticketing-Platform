import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showWordmark?: boolean;
  subtitle?: string;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  showWordmark = true,
  subtitle,
  className = '',
}) => {
  const sizeMap = {
    sm: { box: 'w-7 h-7', text: 'text-sm', sub: 'text-[9px]' },
    md: { box: 'w-9 h-9', text: 'text-base', sub: 'text-[11px]' },
    lg: { box: 'w-12 h-12', text: 'text-2xl', sub: 'text-xs' },
    xl: { box: 'w-16 h-16', text: 'text-3xl', sub: 'text-sm' },
  };

  const currentSize = sizeMap[size];

  return (
    <div className={`flex items-center space-x-2.5 ${className}`}>
      {/* Icon Mark */}
      <div
        className={`${currentSize.box} relative flex-shrink-0 flex items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-600 shadow-sm shadow-indigo-200/50 p-1.5`}
      >
        <svg
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full text-white"
        >
          {/* Subtle Ambient Support Chat Bubble */}
          <path
            d="M6 9C6 6.79086 7.79086 5 10 5H22C24.2091 5 26 6.79086 26 9V18C26 20.2091 24.2091 22 22 22H14L8 26.5V22H10C8.89543 22 8 21.1046 8 20V9H6Z"
            fill="white"
            fillOpacity="0.22"
          />
          {/* Primary Speech Core */}
          <path
            d="M9 8C9 6.89543 9.89543 6 11 6H21C22.1046 6 23 6.89543 23 8V16C23 17.1046 22.1046 18 21 18H14.5L10 21.5V18H11C9.89543 18 9 17.1046 9 16V8Z"
            fill="white"
          />
          {/* IQ Connected Neural Logic Nodes */}
          <circle cx="13.5" cy="12" r="1.5" fill="#4f46e5" />
          <circle cx="18.5" cy="12" r="1.5" fill="#7c3aed" />
          <path
            d="M14.5 12H17.5"
            stroke="#6366f1"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
          {/* AI Intellect Sparkle Accent */}
          <path
            d="M24 3C24 4.5 25 5.5 26.5 5.5C25 5.5 24 6.5 24 8C24 6.5 23 5.5 21.5 5.5C23 5.5 24 4.5 24 3Z"
            fill="#38bdf8"
          />
        </svg>
      </div>

      {/* Wordmark */}
      {showWordmark && (
        <div className="flex flex-col text-left">
          <div className="flex items-center space-x-1 leading-tight">
            <span className={`font-bold tracking-tight text-slate-900 ${currentSize.text}`}>
              Support
            </span>
            <span
              className={`font-extrabold tracking-tight bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent ${currentSize.text}`}
            >
              IQ
            </span>
          </div>
          {subtitle && (
            <p className={`text-slate-400 font-medium tracking-normal mt-0.5 leading-none ${currentSize.sub}`}>
              {subtitle}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

