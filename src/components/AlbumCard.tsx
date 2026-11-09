import React from 'react';
import { Play } from 'lucide-react';
import type { Album } from '../types/index.ts';
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
      className="group p-3 rounded-lg bg-[#181818] hover:bg-[#202020] border border-[#242424] hover:border-[#333333] transition-all duration-200 cursor-pointer flex flex-col select-none"
    >
      <div className="relative aspect-square w-full rounded-md overflow-hidden mb-3 bg-[#242424]">
        <img
          src={album.coverUrl}
          alt={album.title}
          className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
          loading="lazy"
        />

        {/* Minimal White Circular Play Button on Hover */}
        <button
          onClick={handlePlayDirect}
          title="Play Album"
          className="absolute bottom-2.5 right-2.5 w-9 h-9 rounded-full bg-[#F5F5F5] hover:bg-white text-black flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-200 shadow-md hover:scale-105 active:scale-95"
        >
          <Play className="w-4 h-4 fill-black ml-0.5" />
        </button>
      </div>

      <h4 className="font-medium text-[#F5F5F5] text-sm truncate group-hover:text-white transition-colors">
        {album.title}
      </h4>
      <p className="text-xs text-[#A1A1A1] truncate mt-1">
        {album.artistName}
      </p>
    </div>
  );
};
