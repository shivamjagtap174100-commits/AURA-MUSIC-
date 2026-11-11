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
      className="group p-3 rounded-xl bg-[#171819] hover:bg-[#202123] border border-[#292929] hover:border-[#383838] transition-all duration-200 cursor-pointer flex flex-col select-none shadow-sm"
    >
      <div className="relative aspect-square w-full rounded-lg overflow-hidden mb-3 bg-[#101112]">
        <img
          src={album.coverUrl}
          alt={album.title}
          className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
          loading="lazy"
        />

        {/* Champagne Gold Circular Play Button on Hover */}
        <button
          onClick={handlePlayDirect}
          title="Play Album"
          className="absolute bottom-2.5 right-2.5 w-10 h-10 rounded-full bg-[#C5A66B] hover:bg-[#D8BF91] text-[#08090A] flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-200 shadow-lg hover:scale-105 active:scale-95"
        >
          <Play className="w-4 h-4 fill-[#08090A] ml-0.5" />
        </button>
      </div>

      <div className="flex items-center justify-between gap-1">
        <h4 className="font-semibold text-[#F3F0E9] text-sm truncate group-hover:text-[#D8BF91] transition-colors font-['Manrope']">
          {album.title}
        </h4>
        {album.language && (
          <span className="text-[10px] text-[#666666] font-mono shrink-0">
            {album.language}
          </span>
        )}
      </div>
      <p className="text-xs text-[#929292] truncate mt-1">
        {album.artistName} {album.releaseYear ? `• ${album.releaseYear}` : ''}
      </p>
    </div>
  );
};
