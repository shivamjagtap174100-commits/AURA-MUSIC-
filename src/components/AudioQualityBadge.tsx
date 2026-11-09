import React from 'react';
import { AudioQuality } from '../types';

interface AudioQualityBadgeProps {
  quality: AudioQuality;
  showIcon?: boolean;
}

export const AudioQualityBadge: React.FC<AudioQualityBadgeProps> = ({ quality }) => {
  const isLossless = quality.includes('Ultra HD') || quality.includes('FLAC');
  const isHigh = quality.includes('320');

  return (
    <span
      className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold tracking-wider uppercase border transition-colors ${
        isLossless
          ? 'bg-cyan-950/60 text-cyan-300 border-cyan-500/40 shadow-sm shadow-cyan-500/20'
          : isHigh
          ? 'bg-violet-950/60 text-violet-300 border-violet-500/40 shadow-sm shadow-violet-500/20'
          : 'bg-slate-800/60 text-slate-400 border-slate-700/50'
      }`}
      title={`Audio Quality: ${quality}`}
    >
      {isLossless ? 'FLAC HD' : isHigh ? '320 KBPS' : '128 KBPS'}
    </span>
  );
};
