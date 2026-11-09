import React from 'react';
import type { AudioQuality } from '../types/index.ts';

interface AudioQualityBadgeProps {
  quality: AudioQuality;
}

export const AudioQualityBadge: React.FC<AudioQualityBadgeProps> = ({ quality }) => {
  const isLossless = quality.includes('Ultra HD') || quality.includes('FLAC');
  const isHigh = quality.includes('320');

  return (
    <span
      className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-medium tracking-wider uppercase border select-none ${
        isLossless
          ? 'bg-[#181818] text-[#B7A0FF] border-[#B7A0FF]/30'
          : isHigh
          ? 'bg-[#181818] text-[#D4D4D4] border-[#303030]'
          : 'bg-[#181818] text-[#737373] border-[#262626]'
      }`}
      title={`Audio Quality: ${quality}`}
    >
      {isLossless ? 'LOSSLESS' : isHigh ? '320K' : '128K'}
    </span>
  );
};
