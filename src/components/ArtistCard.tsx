import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { Artist } from '../types';

interface ArtistCardProps {
  artist: Artist;
  onClick?: () => void;
}

export const ArtistCard: React.FC<ArtistCardProps> = ({ artist, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="group p-3.5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.05] hover:border-violet-500/30 transition-all duration-300 cursor-pointer flex flex-col items-center text-center"
    >
      <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden mb-3 bg-slate-900 shadow-xl border-2 border-transparent group-hover:border-violet-500/50 transition-all duration-300">
        <img
          src={artist.avatarUrl}
          alt={artist.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          loading="lazy"
        />
      </div>

      <div className="flex items-center gap-1.5 justify-center">
        <h4 className="font-bold text-white text-sm truncate group-hover:text-cyan-400 transition-colors">
          {artist.name}
        </h4>
        {artist.verified && (
          <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 fill-cyan-400/20" />
        )}
      </div>

      <p className="text-[11px] text-slate-400 mt-1">
        {artist.monthlyListeners
          ? `${(artist.monthlyListeners / 1000).toFixed(0)}K monthly listeners`
          : 'Artist'}
      </p>
    </div>
  );
};
