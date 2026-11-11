import React from 'react';
import { Heart, Play, Shuffle, ArrowLeft } from 'lucide-react';
import type { Song } from '../types/index.ts';
import { catalogService } from '../services/catalogService';
import { useAudio } from '../context/AudioContext';
import { SongRow } from '../components/SongRow';

interface LikedSongsScreenProps {
  onNavigate: (tab: string, meta?: any) => void;
  onOpenPlaylistModal: (song: Song) => void;
}

export const LikedSongsScreen: React.FC<LikedSongsScreenProps> = ({
  onNavigate,
  onOpenPlaylistModal,
}) => {
  const { playSong } = useAudio();
  const likedSongs = catalogService.getLikedSongs();

  const handlePlayAll = () => {
    if (likedSongs.length > 0) {
      playSong(likedSongs[0], likedSongs, 0);
    }
  };

  const handleShuffle = () => {
    if (likedSongs.length > 0) {
      const shuffled = [...likedSongs].sort(() => Math.random() - 0.5);
      playSong(shuffled[0], shuffled, 0);
    }
  };

  return (
    <div className="space-y-6 pb-36 select-none animate-in fade-in duration-150">
      <button
        onClick={() => onNavigate('library')}
        className="inline-flex items-center gap-1.5 text-xs text-[#929292] hover:text-[#C5A66B] transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to library</span>
      </button>

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 p-6 rounded-2xl bg-[#171819] border border-[#292929] shadow-xl">
        <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-xl bg-[#101112] border border-[#292929] flex items-center justify-center shrink-0 shadow-inner">
          <Heart className="w-12 h-12 text-[#C5A66B] fill-[#C5A66B]" />
        </div>

        <div className="text-center sm:text-left space-y-2 flex-1">
          <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#C5A66B] font-semibold">
            Personal Collection
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-[#F3F0E9] tracking-tight font-['Manrope']">
            Liked Songs
          </h1>
          <p className="text-xs text-[#929292] font-mono">
            {likedSongs.length} tracks • Saved by you
          </p>

          <div className="flex items-center justify-center sm:justify-start gap-2.5 pt-2">
            <button
              onClick={handlePlayAll}
              disabled={likedSongs.length === 0}
              className="px-6 py-2.5 rounded-full bg-[#C5A66B] hover:bg-[#D8BF91] text-[#08090A] font-bold text-xs flex items-center gap-1.5 shadow-md disabled:opacity-40"
            >
              <Play className="w-3.5 h-3.5 fill-[#08090A]" />
              <span>Play</span>
            </button>

            <button
              onClick={handleShuffle}
              disabled={likedSongs.length === 0}
              className="p-2.5 rounded-full bg-[#202123] hover:bg-[#28292c] text-[#F3F0E9] hover:text-[#C5A66B] transition-colors border border-[#292929] disabled:opacity-40"
              title="Shuffle"
            >
              <Shuffle className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Track List */}
      {likedSongs.length === 0 ? (
        <div className="text-center py-16 text-[#666666] rounded-2xl bg-[#171819] border border-[#292929]">
          <p className="text-sm font-medium text-[#F3F0E9]">No liked songs yet</p>
          <p className="text-xs text-[#929292] mt-1">Tap the heart icon on any track to save it here.</p>
        </div>
      ) : (
        <div className="rounded-2xl bg-[#171819] border border-[#292929] p-3 space-y-1 shadow-sm">
          {likedSongs.map((song, idx) => (
            <SongRow
              key={song.id}
              song={song}
              index={idx}
              queueContext={likedSongs}
              onOpenPlaylistModal={onOpenPlaylistModal}
              onSelectArtist={(artistId) => onNavigate('artist-detail', { artistId })}
            />
          ))}
        </div>
      )}
    </div>
  );
};
