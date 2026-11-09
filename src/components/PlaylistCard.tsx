import React from 'react';
import { Play } from 'lucide-react';
import { Playlist } from '../types';
import { useAudio } from '../context/AudioContext';
import { catalogService } from '../services/catalogService';

interface PlaylistCardProps {
  playlist: Playlist;
  onClick?: () => void;
}

export const PlaylistCard: React.FC<PlaylistCardProps> = ({ playlist, onClick }) => {
  const { playSong } = useAudio();

  const handlePlayDirect = (e: React.MouseEvent) => {
    e.stopPropagation();
    const songs = playlist.songIds
      .map((id) => catalogService.getSongById(id))
      .filter((s): s is NonNullable<typeof s> => Boolean(s));
    if (songs.length > 0) {
      playSong(songs[0], songs, 0);
    }
  };

  return (
    <div
      onClick={onClick}
      className="group p-3.5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.05] hover:border-cyan-500/30 transition-all duration-300 cursor-pointer flex flex-col"
    >
      <div className="relative aspect-square w-full rounded-xl overflow-hidden mb-3 bg-slate-900 shadow-lg">
        <img
          src={playlist.coverUrl}
          alt={playlist.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

        <button
          onClick={handlePlayDirect}
          title="Play Playlist"
          className="absolute bottom-3 right-3 w-10 h-10 rounded-full bg-gradient-to-tr from-violet-500 to-cyan-400 text-black flex items-center justify-center shadow-xl shadow-cyan-500/40 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 hover:scale-105 active:scale-95"
        >
          <Play className="w-5 h-5 fill-black ml-0.5" />
        </button>
      </div>

      <h4 className="font-bold text-white text-sm truncate group-hover:text-cyan-400 transition-colors">
        {playlist.title}
      </h4>
      <p className="text-xs text-slate-400 line-clamp-2 mt-1">
        {playlist.description || `By ${playlist.creatorName} • ${playlist.songIds.length} tracks`}
      </p>
    </div>
  );
};
