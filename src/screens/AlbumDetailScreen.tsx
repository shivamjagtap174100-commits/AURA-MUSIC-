import React from 'react';
import { Play, Shuffle, ArrowLeft } from 'lucide-react';
import type { Song } from '../types/index.ts';
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
      <div className="text-center py-20 text-[#737373]">
        <p className="text-sm font-medium text-[#A1A1A1]">Album not found</p>
        <button
          onClick={() => onNavigate('home')}
          className="mt-3 px-3 py-1.5 bg-[#202020] text-xs font-medium text-white rounded-md"
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
    <div className="space-y-6 pb-32 select-none animate-in fade-in duration-150">
      <button
        onClick={() => onNavigate('home')}
        className="inline-flex items-center gap-1.5 text-xs text-[#737373] hover:text-[#F5F5F5] transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to browse</span>
      </button>

      {/* Album Header Banner */}
      <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 p-6 rounded-xl bg-[#181818] border border-[#242424]">
        <div className="relative w-36 h-36 sm:w-44 sm:h-44 rounded-lg overflow-hidden shrink-0 bg-[#242424] border border-[#303030] shadow-xl">
          <img
            src={album.coverUrl}
            alt={album.title}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="text-center sm:text-left space-y-2 flex-1">
          <span className="text-[11px] font-mono uppercase tracking-widest text-[#737373]">
            Album • {album.genre}
          </span>

          <h1 className="text-2xl sm:text-4xl font-bold text-[#F5F5F5] tracking-tight">
            {album.title}
          </h1>

          <p className="text-xs sm:text-sm text-[#A1A1A1]">
            By{' '}
            <span
              onClick={() => onNavigate('artist-detail', { artistId: album.artistId })}
              className="text-[#F5F5F5] font-medium hover:underline cursor-pointer"
            >
              {album.artistName}
            </span>{' '}
            • {album.releaseYear} • {songs.length} tracks
          </p>

          <div className="flex items-center justify-center sm:justify-start gap-2.5 pt-2">
            <button
              onClick={handlePlayAll}
              disabled={songs.length === 0}
              className="px-5 py-2 rounded-full bg-[#F5F5F5] hover:bg-white text-black font-semibold text-xs flex items-center gap-1.5 shadow-md disabled:opacity-40"
            >
              <Play className="w-3.5 h-3.5 fill-black" />
              <span>Play</span>
            </button>

            <button
              onClick={handleShuffle}
              disabled={songs.length === 0}
              className="p-2 rounded-full bg-[#242424] hover:bg-[#2c2c2c] text-[#D4D4D4] hover:text-white transition-colors border border-[#303030] disabled:opacity-40"
              title="Shuffle Album"
            >
              <Shuffle className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Album Tracks */}
      <div className="rounded-xl bg-[#181818] border border-[#242424] p-2 space-y-0.5">
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
