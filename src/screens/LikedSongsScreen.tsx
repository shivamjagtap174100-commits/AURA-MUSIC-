import React from 'react';
import { Heart, Play, Shuffle } from 'lucide-react';
import { Song } from '../types';
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
    <div className="space-y-6 pb-32 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 p-6 sm:p-8 rounded-3xl bg-gradient-to-tr from-pink-950/80 via-purple-950/40 to-slate-900 border border-pink-500/20 shadow-2xl">
        <div className="w-36 h-36 sm:w-44 sm:h-44 rounded-2xl bg-gradient-to-tr from-rose-500 via-pink-600 to-violet-600 flex items-center justify-center shadow-2xl shrink-0">
          <Heart className="w-20 h-20 text-white fill-white animate-pulse" />
        </div>

        <div className="text-center sm:text-left space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-pink-400">
            Playlist
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Liked Songs
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            {likedSongs.length} favorite songs • Curated by you
          </p>

          <div className="flex items-center justify-center sm:justify-start gap-3 pt-3">
            <button
              onClick={handlePlayAll}
              disabled={likedSongs.length === 0}
              className="px-6 py-3 rounded-full bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-400 hover:to-rose-500 text-white font-bold text-sm shadow-xl shadow-pink-600/30 flex items-center gap-2 hover:scale-105 active:scale-95 transition-all disabled:opacity-40"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Play All</span>
            </button>

            <button
              onClick={handleShuffle}
              disabled={likedSongs.length === 0}
              className="p-3 rounded-full glass-pill hover:bg-white/10 text-white transition-colors disabled:opacity-40"
              title="Shuffle Liked Songs"
            >
              <Shuffle className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Song List */}
      {likedSongs.length === 0 ? (
        <div className="text-center py-20 text-slate-500">
          <Heart className="w-16 h-16 mx-auto mb-3 opacity-20 text-pink-400" />
          <h3 className="text-lg font-bold text-slate-300">No favorite songs saved yet</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Explore songs across Aura Music and tap the heart icon to save your favorite tracks here.
          </p>
        </div>
      ) : (
        <div className="glass-panel p-2 sm:p-3 rounded-3xl space-y-1">
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
