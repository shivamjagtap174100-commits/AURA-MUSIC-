import React, { useState } from 'react';
import { Play, Heart, Download, Check, MoreHorizontal, Plus, Loader2 } from 'lucide-react';
import type { Song } from '../types/index.ts';
import { useAudio } from '../context/AudioContext';
import { useDownloads } from '../context/DownloadContext';
import { catalogService } from '../services/catalogService';
import { EqualizerBars } from './EqualizerBars';
import { AudioQualityBadge } from './AudioQualityBadge';

interface SongRowProps {
  song: Song;
  index: number;
  queueContext?: Song[];
  showAlbum?: boolean;
  onOpenPlaylistModal?: (song: Song) => void;
  onSelectArtist?: (artistId: string) => void;
}

export const SongRow: React.FC<SongRowProps> = ({
  song,
  index,
  queueContext,
  showAlbum = true,
  onOpenPlaylistModal,
  onSelectArtist,
}) => {
  const { currentSong, isPlaying, playSong, togglePlayPause } = useAudio();
  const { isDownloaded, downloadSong, removeDownload, downloadProgress } = useDownloads();
  const [isLiked, setIsLiked] = useState<boolean>(() => catalogService.isSongLiked(song.id));
  const [showMenu, setShowMenu] = useState(false);

  const isCurrent = currentSong?.id === song.id;
  const progressInfo = downloadProgress[song.id];
  const isDownloading = progressInfo?.status === 'downloading';
  const downloaded = isDownloaded(song.id);

  const formatDuration = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const remainingSecs = Math.floor(sec % 60);
    return `${mins}:${remainingSecs < 10 ? '0' : ''}${remainingSecs}`;
  };

  const handleRowClick = () => {
    if (isCurrent) {
      togglePlayPause();
    } else {
      playSong(song, queueContext || [song], index);
    }
  };

  const handleLikeToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    const liked = catalogService.toggleLikeSong(song.id);
    setIsLiked(liked);
  };

  const handleDownloadClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (downloaded) {
      await removeDownload(song.id);
    } else {
      await downloadSong(song);
    }
  };

  return (
    <div
      onClick={handleRowClick}
      className={`group relative flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-150 cursor-pointer select-none ${isCurrent
        ? 'bg-[#171819] border border-[#C5A66B]/30 text-[#F3F0E9] shadow-sm'
        : 'hover:bg-[#101112] border border-transparent'
        }`}
    >
      {/* Index or Play / Equalizer indicator */}
      <div className="w-7 flex items-center justify-center text-xs font-mono text-[#666666] shrink-0">
        {isCurrent ? (
          isPlaying ? (
            <EqualizerBars size="sm" isPlaying={true} />
          ) : (
            <Play className="w-3.5 h-3.5 text-[#C5A66B] fill-[#C5A66B]" />
          )
        ) : (
          <>
            <span className="group-hover:hidden">{index + 1}</span>
            <Play className="w-3.5 h-3.5 text-[#C5A66B] fill-[#C5A66B] hidden group-hover:block" />
          </>
        )}
      </div>

      {/* Album Artwork */}
      <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-[#171819] border border-[#292929]">
        <img
          src={song.coverUrl}
          alt={song.title}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>

      {/* Title & Artist */}
      <div className="flex-1 min-w-0 pr-2">
        <div className="flex items-center gap-2">
          <p
            className={`text-sm font-medium truncate ${isCurrent ? 'text-[#C5A66B]' : 'text-[#F3F0E9] group-hover:text-white'
              }`}
          >
            {song.title}
          </p>
          {song.titleNative && (
            <span className="hidden sm:inline-block text-[10px] px-1.5 py-0.5 rounded bg-[#101112] text-[#C5A66B] border border-[#292929]">
              {song.titleNative}
            </span>
          )}
          {song.playbackAvailability === 'unavailable' && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#1DB954]/10 text-[#1DB954] border border-[#1DB954]/20 hidden sm:inline">
              Spotify Master
            </span>
          )}
          {song.playbackMode === 'preview' && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#C5A66B]/15 text-[#D8BF91] border border-[#C5A66B]/30 font-mono">
              Preview 30s
            </span>
          )}
          {song.playbackMode === 'full-length' && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono hidden sm:inline">
              Full Track
            </span>
          )}
          <AudioQualityBadge quality={song.audioQuality} />
          {song.language && (
            <span className="text-[10px] text-[#666666] font-mono hidden lg:inline">
              {song.language}
            </span>
          )}
        </div>
        <p className="text-xs text-[#929292] truncate mt-0.5">
          <span
            onClick={(e) => {
              if (onSelectArtist) {
                e.stopPropagation();
                onSelectArtist(song.artistId);
              }
            }}
            className="hover:text-[#D8BF91] hover:underline cursor-pointer transition-colors"
          >
            {song.artistName} {song.artistNative && `(${song.artistNative})`}
          </span>
          {showAlbum && song.albumTitle && (
            <span className="hidden md:inline text-[#666666]"> • {song.albumTitle}</span>
          )}
        </p>
      </div>

      {/* Actions: Download, Like, Duration, Menu */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Download Status / Action */}
        <button
          onClick={handleDownloadClick}
          title={downloaded ? 'Saved offline' : 'Download for offline playback'}
          className={`p-1.5 rounded transition-colors ${downloaded
            ? 'text-[#C5A66B]'
            : isDownloading
              ? 'text-[#C5A66B]'
              : 'text-[#666666] hover:text-[#F3F0E9] opacity-0 group-hover:opacity-100'
            }`}
        >
          {isDownloading ? (
            <div className="flex items-center gap-1">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#C5A66B]" />
              <span className="text-[10px] font-mono text-[#C5A66B]">{progressInfo.progress}%</span>
            </div>
          ) : downloaded ? (
            <Check className="w-3.5 h-3.5" />
          ) : (
            <Download className="w-3.5 h-3.5" />
          )}
        </button>

        {/* Like Button */}
        <button
          onClick={handleLikeToggle}
          title={isLiked ? 'Remove from Liked' : 'Save to Liked Songs'}
          className={`p-1.5 rounded transition-colors ${isLiked
            ? 'text-[#C5A66B]'
            : 'text-[#666666] hover:text-[#F3F0E9] opacity-0 group-hover:opacity-100'
            }`}
        >
          <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-[#C5A66B]' : ''}`} />
        </button>

        {/* Duration */}
        <span className="text-xs text-[#666666] font-mono w-10 text-right hidden sm:inline-block">
          {formatDuration(song.duration)}
        </span>

        {/* More Actions Menu */}
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            className="p-1.5 text-[#666666] hover:text-[#F3F0E9] rounded hover:bg-[#171819] transition-colors"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>

          {showMenu && (
            <div
              onClick={(e) => e.stopPropagation()}
              className="absolute right-0 top-8 z-30 w-44 py-1.5 rounded-xl bg-[#171819] border border-[#292929] shadow-2xl animate-in fade-in duration-100"
            >
              <button
                onClick={() => {
                  setShowMenu(false);
                  if (onOpenPlaylistModal) onOpenPlaylistModal(song);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-[#F3F0E9] hover:bg-[#202123] hover:text-[#C5A66B] transition-colors"
              >
                <Plus className="w-3.5 h-3.5 text-[#C5A66B]" />
                Add to Playlist
              </button>
              <button
                onClick={(e) => {
                  setShowMenu(false);
                  handleDownloadClick(e);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-[#F3F0E9] hover:bg-[#202123] hover:text-[#C5A66B] transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-[#C5A66B]" />
                {downloaded ? 'Remove Download' : 'Save for Offline'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
