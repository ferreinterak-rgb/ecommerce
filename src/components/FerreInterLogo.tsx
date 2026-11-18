import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'dark' | 'light';
}

export const FerreInterLogo: React.FC<LogoProps> = ({ 
  size = 'md', 
  className = '', 
  variant = 'dark' 
}) => {
  const isLight = variant === 'light';

  // Tamaños proporcionales según el contexto
  const heights = {
    sm: 'h-8 sm:h-9',
    md: 'h-10 sm:h-11 lg:h-12',
    lg: 'h-14 sm:h-16',
    xl: 'h-20 sm:h-24'
  }[size];

  const logoSrc = isLight 
    ? '/logo-ferreinter-white.png' 
    : '/logo-ferreinter.png';

  return (
    <div className={`inline-flex items-center select-none ${className}`}>
      <img
        src={logoSrc}
        alt="FERREINTER"
        className={`${heights} w-auto object-contain transition-transform duration-200 hover:scale-[1.02]`}
        loading="eager"
      />
    </div>
  );
};
