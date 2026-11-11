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
    sm: 'text-xs tracking-[0.22em]',
    md: 'text-sm tracking-[0.24em]',
    lg: 'text-lg tracking-[0.26em]',
  };

  return (
    <div className="flex flex-col select-none">
      <div className="flex items-center gap-2.5">
        {/* Obsidian Gold Geometric Soundwave Glyph */}
        <div className={`flex items-center justify-between ${iconHeights[size]} shrink-0`} aria-hidden="true">
          <span className="w-1 h-3/5 bg-[#C5A66B] rounded-full" />
          <span className="w-1 h-full bg-[#F3F0E9] rounded-full" />
          <span className="w-1 h-4/5 bg-[#D8BF91] rounded-full" />
          <span className="w-1 h-2/5 bg-[#C5A66B] rounded-full" />
        </div>

        <div className="flex items-center">
          <span className={`font-semibold uppercase text-[#F3F0E9] font-['Manrope'] ${textSizes[size]}`}>
            AURA
          </span>
          <span className={`font-light uppercase text-[#C5A66B] ml-1.5 font-['Manrope'] ${textSizes[size]}`}>
            MUSIC
          </span>
        </div>
      </div>

      {showTagline && (
        <span className="text-[9px] tracking-[0.2em] uppercase text-[#929292] mt-1 font-medium">
          SOUND BEYOND ORDINARY.
        </span>
      )}
    </div>
  );
};
