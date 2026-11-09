import React from 'react';

interface EqualizerBarsProps {
  isPlaying?: boolean;
  size?: 'sm' | 'md';
}

export const EqualizerBars: React.FC<EqualizerBarsProps> = ({ isPlaying = true, size = 'md' }) => {
  const heights = size === 'sm' ? ['h-2', 'h-3.5', 'h-2.5', 'h-4'] : ['h-3', 'h-5', 'h-4', 'h-6'];
  const barWidth = size === 'sm' ? 'w-0.5' : 'w-1';

  return (
    <div className="flex items-end gap-0.5 h-6 px-1">
      <span
        className={`${barWidth} bg-gradient-to-t from-violet-500 to-cyan-400 rounded-full transition-all duration-300 ${
          isPlaying ? `${heights[0]} animate-pulse` : 'h-1'
        }`}
      />
      <span
        className={`${barWidth} bg-gradient-to-t from-violet-500 to-cyan-400 rounded-full transition-all duration-300 ${
          isPlaying ? `${heights[1]} animate-bounce` : 'h-2'
        }`}
        style={{ animationDelay: '0.15s' }}
      />
      <span
        className={`${barWidth} bg-gradient-to-t from-violet-500 to-cyan-400 rounded-full transition-all duration-300 ${
          isPlaying ? `${heights[2]} animate-pulse` : 'h-1.5'
        }`}
        style={{ animationDelay: '0.3s' }}
      />
      <span
        className={`${barWidth} bg-gradient-to-t from-violet-500 to-cyan-400 rounded-full transition-all duration-300 ${
          isPlaying ? `${heights[3]} animate-bounce` : 'h-1'
        }`}
        style={{ animationDelay: '0.45s' }}
      />
    </div>
  );
};
