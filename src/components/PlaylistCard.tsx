import React from 'react';
import { Play } from 'lucide-react';
import type { Playlist } from '../types/index.ts';
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
      className="group p-3 rounded-xl bg-[#171819] hover:bg-[#202123] border border-[#292929] hover:border-[#383838] transition-all duration-200 cursor-pointer flex flex-col select-none shadow-sm"
    >
      <div className="relative aspect-square w-full rounded-lg overflow-hidden mb-3 bg-[#101112]">
        <img
          src={playlist.coverUrl}
          alt={playlist.title}
          className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
          loading="lazy"
        />

        <button
          onClick={handlePlayDirect}
          title="Play Playlist"
          className="absolute bottom-2.5 right-2.5 w-10 h-10 rounded-full bg-[#C5A66B] hover:bg-[#D8BF91] text-[#08090A] flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-200 shadow-lg hover:scale-105 active:scale-95"
        >
          <Play className="w-4 h-4 fill-[#08090A] ml-0.5" />
        </button>
      </div>

      <h4 className="font-semibold text-[#F3F0E9] text-sm truncate group-hover:text-[#D8BF91] transition-colors font-['Manrope']">
        {playlist.title}
      </h4>
      <p className="text-xs text-[#929292] line-clamp-2 mt-1 leading-relaxed">
        {playlist.description || `Curated by ${playlist.creatorName}`}
      </p>
    </div>
  );
};
