import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ size = 'md', showTagline = false }) => {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-2.5">
        <div className={`relative flex items-center justify-center rounded-xl bg-gradient-to-tr from-violet-600 via-purple-600 to-cyan-400 p-0.5 shadow-lg shadow-violet-500/25 ${iconSizes[size]}`}>
          <div className="w-full h-full bg-[#090a10] rounded-[10px] flex items-center justify-center overflow-hidden">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="w-3/5 h-3/5 text-transparent"
              stroke="url(#auraGrad)"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <defs>
                <linearGradient id="auraGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#c084fc" />
                  <stop offset="50%" stopColor="#8b5cf6" />
                  <stop offset="100%" stopColor="#06b6d4" />
                </linearGradient>
              </defs>
              <path d="M9 18V5l12-2v13" />
              <circle cx="6" cy="18" r="3" fill="#8b5cf6" fillOpacity="0.4" />
              <circle cx="18" cy="16" r="3" fill="#06b6d4" fillOpacity="0.4" />
            </svg>
          </div>
          {/* Subtle pulsating aura ring */}
          <span className="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-400 opacity-20 blur-sm pointer-events-none animate-pulse" />
        </div>
        <div className="flex flex-col">
          <div className="flex items-center">
            <span className={`font-black tracking-wider uppercase bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-violet-200 ${textSizes[size]}`}>
              Aura
            </span>
            <span className={`ml-1 font-light tracking-widest text-cyan-400 uppercase ${textSizes[size]}`}>
              Music
            </span>
          </div>
        </div>
      </div>
      {showTagline && (
        <span className="text-[10px] uppercase tracking-widest text-slate-400 mt-1 font-medium">
          Your Music. Your Mood. Your World.
        </span>
      )}
    </div>
  );
};
