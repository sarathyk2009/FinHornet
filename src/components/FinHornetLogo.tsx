import React from 'react';

interface Props {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
  className?: string;
  imageOnly?: boolean;
}

export const FinHornetLogo: React.FC<Props> = ({
  size = 'md',
  className = '',
  imageOnly = false,
}) => {
  const imageSizeClasses = {
    sm: 'w-7 h-7 sm:w-8 sm:h-8 rounded-lg',
    md: 'w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-xl',
    lg: 'w-11 h-11 sm:w-13 sm:h-13 rounded-2xl',
    xl: 'w-14 h-14 sm:w-18 sm:h-18 rounded-3xl',
  }[size];

  const textSizeClasses = {
    sm: 'text-sm font-black',
    md: 'text-base sm:text-lg font-black',
    lg: 'text-xl sm:text-2xl font-black',
    xl: 'text-2xl sm:text-3xl font-black',
  }[size];

  return (
    <div className={`flex items-center gap-2 sm:gap-2.5 select-none shrink-0 ${className}`}>
      {/* FinHornet Official Logo Image (Yellow Hornet icon) */}
      <div className="relative shrink-0 transition-transform duration-200 hover:scale-105">
        <img
          src="./assets/aistudio/WhatsApp_Image_2026-10-26_at_1.37.51_AM_bdac2704.jpeg"
          alt="FinHornet Logo"
          className={`${imageSizeClasses} object-cover ring-2 ring-amber-400/50 dark:ring-amber-400/30 shadow-md shadow-amber-500/10`}
          loading="eager"
        />
        <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 sm:w-2.5 sm:h-2.5 bg-amber-400 rounded-full border-2 border-white dark:border-slate-900 shadow-2xs" />
      </div>

      {!imageOnly && (
        <div className="flex items-center leading-none">
          <span className={`tracking-tight text-slate-900 dark:text-slate-100 ${textSizeClasses}`}>
            Fin<span className="text-amber-500 dark:text-amber-400">Hornet</span>
          </span>
        </div>
      )}
    </div>
  );
};

// Re-export as FinNerdLogo for backward compatibility
export const FinNerdLogo = FinHornetLogo;
