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
      <div className="text-center py-20 text-[#666666]">
        <p className="text-sm font-medium text-[#929292]">Album not found</p>
        <button
          onClick={() => onNavigate('home')}
          className="mt-3 px-3 py-1.5 bg-[#171819] text-xs font-medium text-[#F3F0E9] rounded-lg border border-[#292929]"
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
    <div className="space-y-6 pb-36 select-none animate-in fade-in duration-150">
      <button
        onClick={() => onNavigate('home')}
        className="inline-flex items-center gap-1.5 text-xs text-[#929292] hover:text-[#C5A66B] transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to browse</span>
      </button>

      {/* Album Header Banner */}
      <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 p-6 rounded-2xl bg-[#171819] border border-[#292929] shadow-xl">
        <div className="relative w-36 h-36 sm:w-44 sm:h-44 rounded-xl overflow-hidden shrink-0 bg-[#101112] border border-[#292929] shadow-2xl">
          <img
            src={album.coverUrl}
            alt={album.title}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="text-center sm:text-left space-y-2 flex-1">
          <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#C5A66B] font-semibold">
            Album • {album.genre} {album.language ? `• ${album.language}` : ''}
          </span>

          <div className="flex items-center justify-center sm:justify-start gap-2">
            <h1 className="text-2xl sm:text-4xl font-extrabold text-[#F3F0E9] tracking-tight font-['Manrope']">
              {album.title}
            </h1>
            {album.titleNative && (
              <span className="text-sm px-2.5 py-0.5 rounded-full bg-[#101112] text-[#C5A66B] border border-[#292929]">
                {album.titleNative}
              </span>
            )}
          </div>

          <p className="text-xs sm:text-sm text-[#929292]">
            By{' '}
            <span
              onClick={() => onNavigate('artist-detail', { artistId: album.artistId })}
              className="text-[#F3F0E9] font-medium hover:text-[#D8BF91] hover:underline cursor-pointer transition-colors"
            >
              {album.artistName}
            </span>{' '}
            • {album.releaseYear} • {songs.length} tracks
          </p>

          <div className="flex items-center justify-center sm:justify-start gap-2.5 pt-2">
            <button
              onClick={handlePlayAll}
              disabled={songs.length === 0}
              className="px-6 py-2.5 rounded-full bg-[#C5A66B] hover:bg-[#D8BF91] text-[#08090A] font-bold text-xs flex items-center gap-1.5 shadow-md disabled:opacity-40"
            >
              <Play className="w-3.5 h-3.5 fill-[#08090A]" />
              <span>Play Album</span>
            </button>

            <button
              onClick={handleShuffle}
              disabled={songs.length === 0}
              className="p-2.5 rounded-full bg-[#202123] hover:bg-[#28292c] text-[#F3F0E9] hover:text-[#C5A66B] transition-colors border border-[#292929] disabled:opacity-40"
              title="Shuffle Album"
            >
              <Shuffle className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Album Tracks */}
      <div className="rounded-2xl bg-[#171819] border border-[#292929] p-3 space-y-1 shadow-sm">
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
