import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const FerreInterLogo: React.FC<LogoProps> = ({ size = 'md', className = '' }) => {
  const iconDimensions = {
    sm: 'w-7 h-7 sm:w-8 sm:h-8',
    md: 'w-7 h-7 sm:w-10 sm:h-10 lg:w-11 lg:h-11',
    lg: 'w-12 h-12 sm:w-16 sm:h-16'
  }[size];

  const textSizes = {
    sm: 'text-base sm:text-lg',
    md: 'text-lg sm:text-xl lg:text-2xl',
    lg: 'text-2xl sm:text-4xl'
  }[size];

  return (
    <div className={`flex items-center gap-2 sm:gap-3 select-none ${className}`}>
      {/* Saw blade logo icon matching media_1789792260022.png */}
      <div className={`relative ${iconDimensions} flex items-center justify-center shrink-0`}>
        <svg viewBox="0 0 100 100" className="w-full h-full">
          {/* Top Half Saw Blade - Black */}
          <path
            d="M 50 10 A 40 40 0 0 1 90 50 L 70 50 A 20 20 0 0 0 50 30 L 50 10 Z"
            fill="#111111"
          />
          <path
            d="M 10 50 L 0 50 L 12 35 L 20 40 L 25 25 L 35 32 L 42 18 L 50 25 L 50 10 A 40 40 0 0 0 10 50 Z"
            fill="#111111"
          />
          {/* Bottom Half Saw Blade - Orange */}
          <path
            d="M 90 50 L 100 50 L 88 65 L 80 60 L 75 75 L 65 68 L 58 82 L 50 75 L 50 90 A 40 40 0 0 0 90 50 Z"
            fill="#f48f25"
          />
          <path
            d="M 50 90 A 40 40 0 0 1 10 50 L 30 50 A 20 20 0 0 0 50 70 L 50 90 Z"
            fill="#f48f25"
          />
          {/* Inner Circle hole */}
          <circle cx="50" cy="50" r="16" fill="#f8fafc" />
        </svg>
      </div>

      {/* Brand Text: FERRE in black, INTER in orange */}
      <div className="flex flex-col">
        <span className={`font-black italic tracking-tighter ${textSizes} leading-none text-[#111111]`}>
          FERRE<span className="text-[#f48f25]">INTER</span>
        </span>
        <span className="hidden sm:block text-[9px] font-mono tracking-widest uppercase text-gray-500 font-semibold mt-0.5">
          Ferretería & Soluciones
        </span>
      </div>
    </div>
  );
};
