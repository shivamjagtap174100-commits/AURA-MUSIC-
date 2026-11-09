import React from 'react';
import { Play, Shuffle, Disc, ArrowLeft } from 'lucide-react';
import { Song, Album } from '../types';
import { catalogService } from '../services/catalogService';
import { useAudio } from '../context/AudioContext';
import { SongRow } from '../components/SongRow';

interface AlbumDetailScreenProps {
  albumId: string;
  onNavigate: (tab: string, meta?: any) => void;
  onOpenPlaylistModal: (song: Song) => void;
}

export const AlbumDetailScreen: React.FC<AlbumDetailScreenProps> = ({
  albumId,
  onNavigate,
  onOpenPlaylistModal,
}) => {
  const { playSong } = useAudio();
  const album = catalogService.getAlbumById(albumId);
  const songs = catalogService.getAlbumSongs(albumId);

  if (!album) {
    return (
      <div className="text-center py-24 text-slate-500">
        <Disc className="w-16 h-16 mx-auto mb-3 opacity-30 text-cyan-400" />
        <h3 className="text-lg font-bold text-slate-300">Album not found</h3>
        <button
          onClick={() => onNavigate('home')}
          className="mt-4 px-4 py-2 bg-violet-600 text-white text-xs font-semibold rounded-xl"
        >
          Return Home
        </button>
      </div>
    );
  }

  const handlePlayAll = () => {
    if (songs.length > 0) {
      playSong(songs[0], songs, 0);
    }
  };

  const handleShuffle = () => {
    if (songs.length > 0) {
      const shuffled = [...songs].sort(() => Math.random() - 0.5);
      playSong(shuffled[0], shuffled, 0);
    }
  };

  return (
    <div className="space-y-6 pb-32 animate-in fade-in duration-200">
      <button
        onClick={() => onNavigate('home')}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to browse</span>
      </button>

      {/* Album Banner */}
      <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 p-6 sm:p-8 rounded-3xl bg-gradient-to-tr from-cyan-950/60 via-slate-900 to-violet-950/40 border border-white/10 shadow-2xl">
        <div className="relative w-40 h-40 sm:w-52 sm:h-52 rounded-2xl overflow-hidden shadow-2xl shrink-0 border border-white/10">
          <img
            src={album.coverUrl}
            alt={album.title}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="text-center sm:text-left space-y-2 flex-1">
          <span className="text-xs font-bold uppercase tracking-widest text-cyan-400">
            Album • {album.genre}
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            {album.title}
          </h1>

          <p className="text-sm text-slate-300">
            By{' '}
            <span
              onClick={() => onNavigate('artist-detail', { artistId: album.artistId })}
              className="text-violet-300 font-semibold hover:underline cursor-pointer"
            >
              {album.artistName}
            </span>{' '}
            • {album.releaseYear} • {songs.length} tracks
          </p>

          <div className="flex items-center justify-center sm:justify-start gap-3 pt-3">
            <button
              onClick={handlePlayAll}
              disabled={songs.length === 0}
              className="px-6 py-3 rounded-full bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 text-white font-bold text-sm shadow-xl shadow-cyan-600/30 flex items-center gap-2 hover:scale-105 active:scale-95 transition-all disabled:opacity-40"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Play Album</span>
            </button>

            <button
              onClick={handleShuffle}
              disabled={songs.length === 0}
              className="p-3 rounded-full glass-pill hover:bg-white/10 text-white transition-colors disabled:opacity-40"
              title="Shuffle Album"
            >
              <Shuffle className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Album Tracks */}
      <div className="glass-panel p-2 sm:p-3 rounded-3xl space-y-1">
        {songs.map((song, idx) => (
          <SongRow
            key={song.id}
            song={song}
            index={idx}
            queueContext={songs}
            showAlbum={false}
            onOpenPlaylistModal={onOpenPlaylistModal}
            onSelectArtist={(artistId) => onNavigate('artist-detail', { artistId })}
          />
        ))}
      </div>
    </div>
  );
};
