import React from 'react';
import { Check } from 'lucide-react';
import type { Artist } from '../types/index.ts';

interface ArtistCardProps {
  artist: Artist;
  onClick?: () => void;
}

export const ArtistCard: React.FC<ArtistCardProps> = ({ artist, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="group p-3 rounded-xl bg-[#171819] hover:bg-[#202123] border border-[#292929] hover:border-[#383838] transition-all duration-200 cursor-pointer flex flex-col items-center text-center select-none shadow-sm"
    >
      <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden mb-3 bg-[#101112] border border-[#292929] group-hover:border-[#C5A66B]/50 transition-colors">
        <img
          src={artist.avatarUrl}
          alt={artist.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
      </div>

      <div className="flex items-center gap-1.5 justify-center max-w-full">
        <h4 className="font-semibold text-[#F3F0E9] text-sm truncate group-hover:text-[#D8BF91] transition-colors font-['Manrope']">
          {artist.name}
        </h4>
        {artist.verified && (
          <span title="Verified Artist" className="w-3.5 h-3.5 rounded-full bg-[#C5A66B]/20 flex items-center justify-center shrink-0">
            <Check className="w-2.5 h-2.5 text-[#C5A66B] stroke-[2.5]" />
          </span>
        )}
      </div>

      {artist.nameNative && (
        <span className="text-[10px] text-[#C5A66B] font-medium mt-0.5">
          {artist.nameNative}
        </span>
      )}

      <p className="text-[11px] text-[#666666] mt-1 font-mono">
        {artist.monthlyListeners
          ? `${(artist.monthlyListeners / 1000000).toFixed(1)}M listeners`
          : 'Artist'}
      </p>
    </div>
  );
};
