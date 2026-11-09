import React from 'react';
import { Play } from 'lucide-react';
import { Album, Song } from '../types';
import { useAudio } from '../context/AudioContext';
import { catalogService } from '../services/catalogService';

interface AlbumCardProps {
  album: Album;
  onClick?: () => void;
}

export const AlbumCard: React.FC<AlbumCardProps> = ({ album, onClick }) => {
  const { playSong } = useAudio();

  const handlePlayDirect = (e: React.MouseEvent) => {
    e.stopPropagation();
    const songs = catalogService.getAlbumSongs(album.id);
    if (songs.length > 0) {
      playSong(songs[0], songs, 0);
    }
  };

  return (
    <div
      onClick={onClick}
      className="group p-3.5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.05] hover:border-violet-500/30 transition-all duration-300 cursor-pointer flex flex-col"
    >
      <div className="relative aspect-square w-full rounded-xl overflow-hidden mb-3 bg-slate-900 shadow-lg">
        <img
          src={album.coverUrl}
          alt={album.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

        {/* Play Floating Button */}
        <button
          onClick={handlePlayDirect}
          title="Play Album"
          className="absolute bottom-3 right-3 w-10 h-10 rounded-full bg-gradient-to-tr from-violet-500 to-cyan-400 text-black flex items-center justify-center shadow-xl shadow-violet-500/40 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 hover:scale-105 active:scale-95"
        >
          <Play className="w-5 h-5 fill-black ml-0.5" />
        </button>
      </div>

      <h4 className="font-bold text-white text-sm truncate group-hover:text-cyan-400 transition-colors">
        {album.title}
      </h4>
      <p className="text-xs text-slate-400 truncate mt-1">
        {album.releaseYear} • {album.artistName}
      </p>
    </div>
  );
};
