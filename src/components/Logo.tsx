import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ size = 'md', showTagline = false }) => {
  const iconHeights = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  const textSizes = {
    sm: 'text-sm tracking-[0.2em]',
    md: 'text-base tracking-[0.22em]',
    lg: 'text-xl tracking-[0.25em]',
  };

  return (
    <div className="flex flex-col select-none">
      <div className="flex items-center gap-2.5">
        {/* Minimal geometric audio wave glyph */}
        <div className={`flex items-center justify-between ${iconHeights[size]} shrink-0`} aria-hidden="true">
          <span className="w-1 h-3/5 bg-[#B7A0FF] rounded-full" />
          <span className="w-1 h-full bg-[#F5F5F5] rounded-full" />
          <span className="w-1 h-4/5 bg-[#B7A0FF] rounded-full" />
          <span className="w-1 h-2/5 bg-[#A1A1A1] rounded-full" />
        </div>

        <div className="flex items-center">
          <span className={`font-semibold uppercase text-[#F5F5F5] ${textSizes[size]}`}>
            AURA
          </span>
          <span className={`font-light uppercase text-[#A1A1A1] ml-1.5 ${textSizes[size]}`}>
            MUSIC
          </span>
        </div>
      </div>

      {showTagline && (
        <span className="text-[10px] tracking-[0.16em] uppercase text-[#737373] mt-1.5 font-medium">
          Your Music. Your Mood. Your World.
        </span>
      )}
    </div>
  );
};
