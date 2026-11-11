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
          ? 'bg-[#171819] text-[#C5A66B] border-[#C5A66B]/30'
          : isHigh
          ? 'bg-[#171819] text-[#F3F0E9] border-[#292929]'
          : 'bg-[#171819] text-[#666666] border-[#292929]'
      }`}
      title={`Audio Quality: ${quality}`}
    >
      {isLossless ? 'LOSSLESS' : isHigh ? '320K' : '128K'}
    </span>
  );
};
