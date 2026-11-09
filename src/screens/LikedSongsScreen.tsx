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
    <div className="space-y-6 pb-32 select-none animate-in fade-in duration-150">
      <button
        onClick={() => onNavigate('library')}
        className="inline-flex items-center gap-1.5 text-xs text-[#737373] hover:text-[#F5F5F5] transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to library</span>
      </button>

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 p-6 rounded-xl bg-[#181818] border border-[#242424]">
        <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-lg bg-[#202020] border border-[#2b2b2b] flex items-center justify-center shrink-0">
          <Heart className="w-12 h-12 text-[#B7A0FF] fill-[#B7A0FF]" />
        </div>

        <div className="text-center sm:text-left space-y-2 flex-1">
          <span className="text-[11px] font-mono uppercase tracking-widest text-[#737373]">
            Playlist
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold text-[#F5F5F5] tracking-tight">
            Liked Songs
          </h1>
          <p className="text-xs text-[#A1A1A1] font-mono">
            {likedSongs.length} tracks • Saved by you
          </p>

          <div className="flex items-center justify-center sm:justify-start gap-2.5 pt-2">
            <button
              onClick={handlePlayAll}
              disabled={likedSongs.length === 0}
              className="px-5 py-2 rounded-full bg-[#F5F5F5] hover:bg-white text-black font-semibold text-xs flex items-center gap-1.5 shadow-md disabled:opacity-40"
            >
              <Play className="w-3.5 h-3.5 fill-black" />
              <span>Play</span>
            </button>

            <button
              onClick={handleShuffle}
              disabled={likedSongs.length === 0}
              className="p-2 rounded-full bg-[#242424] hover:bg-[#2c2c2c] text-[#D4D4D4] hover:text-white transition-colors border border-[#303030] disabled:opacity-40"
              title="Shuffle"
            >
              <Shuffle className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Track List */}
      {likedSongs.length === 0 ? (
        <div className="text-center py-16 text-[#737373]">
          <p className="text-sm font-medium text-[#A1A1A1]">No liked songs</p>
          <p className="text-xs text-[#737373] mt-1">Tap the heart icon on any track to save it here.</p>
        </div>
      ) : (
        <div className="rounded-xl bg-[#181818] border border-[#242424] p-2 space-y-0.5">
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
