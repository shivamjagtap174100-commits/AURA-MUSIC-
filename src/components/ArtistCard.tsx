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
      className="group p-3 rounded-lg bg-[#181818] hover:bg-[#202020] border border-[#242424] hover:border-[#333333] transition-all duration-200 cursor-pointer flex flex-col items-center text-center select-none"
    >
      <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden mb-3 bg-[#242424]">
        <img
          src={artist.avatarUrl}
          alt={artist.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
      </div>

      <div className="flex items-center gap-1.5 justify-center">
        <h4 className="font-medium text-[#F5F5F5] text-sm truncate group-hover:text-white transition-colors">
          {artist.name}
        </h4>
        {artist.verified && (
          <span title="Verified Artist" className="w-3.5 h-3.5 rounded-full bg-[#B7A0FF]/20 flex items-center justify-center">
            <Check className="w-2.5 h-2.5 text-[#B7A0FF] stroke-[2.5]" />
          </span>
        )}
      </div>

      <p className="text-[11px] text-[#737373] mt-1 font-mono">
        {artist.monthlyListeners
          ? `${(artist.monthlyListeners / 1000).toFixed(0)}K monthly`
          : 'Artist'}
      </p>
    </div>
  );
};
