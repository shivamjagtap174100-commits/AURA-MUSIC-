import React, { useState } from 'react';
import { Play, Pause, Heart, Download, Check, MoreHorizontal, Plus, Loader2 } from 'lucide-react';
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
      className={`group relative flex items-center gap-3 px-3 py-2 rounded-lg transition-colors duration-150 cursor-pointer select-none ${
        isCurrent
          ? 'bg-[#1a1726] border border-[#B7A0FF]/20 text-[#F5F5F5]'
          : 'hover:bg-[#181818] border border-transparent'
      }`}
    >
      {/* Index or Play / Equalizer indicator */}
      <div className="w-7 flex items-center justify-center text-xs font-mono text-[#737373] shrink-0">
        {isCurrent ? (
          isPlaying ? (
            <EqualizerBars size="sm" isPlaying={true} />
          ) : (
            <Play className="w-3.5 h-3.5 text-[#B7A0FF] fill-[#B7A0FF]" />
          )
        ) : (
          <>
            <span className="group-hover:hidden">{index + 1}</span>
            <Play className="w-3.5 h-3.5 text-[#F5F5F5] fill-[#F5F5F5] hidden group-hover:block" />
          </>
        )}
      </div>

      {/* Album Artwork */}
      <div className="relative w-10 h-10 rounded-md overflow-hidden shrink-0 bg-[#202020] border border-[#282828]">
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
            className={`text-sm font-medium truncate ${
              isCurrent ? 'text-[#B7A0FF]' : 'text-[#F5F5F5] group-hover:text-white'
            }`}
          >
            {song.title}
          </p>
          <AudioQualityBadge quality={song.audioQuality} />
        </div>
        <p className="text-xs text-[#A1A1A1] truncate mt-0.5">
          <span
            onClick={(e) => {
              if (onSelectArtist) {
                e.stopPropagation();
                onSelectArtist(song.artistId);
              }
            }}
            className="hover:text-[#F5F5F5] hover:underline cursor-pointer"
          >
            {song.artistName}
          </span>
          {showAlbum && song.albumTitle && (
            <span className="hidden md:inline text-[#737373]"> • {song.albumTitle}</span>
          )}
        </p>
      </div>

      {/* Actions: Download, Like, Duration, Menu */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Download Status / Action */}
        <button
          onClick={handleDownloadClick}
          title={downloaded ? 'Saved offline' : 'Download for offline playback'}
          className={`p-1.5 rounded transition-colors ${
            downloaded
              ? 'text-[#B7A0FF]'
              : isDownloading
              ? 'text-[#B7A0FF]'
              : 'text-[#737373] hover:text-[#F5F5F5] opacity-0 group-hover:opacity-100'
          }`}
        >
          {isDownloading ? (
            <div className="flex items-center gap-1">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#B7A0FF]" />
              <span className="text-[10px] font-mono text-[#B7A0FF]">{progressInfo.progress}%</span>
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
          className={`p-1.5 rounded transition-colors ${
            isLiked
              ? 'text-[#B7A0FF]'
              : 'text-[#737373] hover:text-[#F5F5F5] opacity-0 group-hover:opacity-100'
          }`}
        >
          <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-[#B7A0FF]' : ''}`} />
        </button>

        {/* Duration */}
        <span className="text-xs text-[#737373] font-mono w-10 text-right hidden sm:inline-block">
          {formatDuration(song.duration)}
        </span>

        {/* More Actions Menu */}
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            className="p-1.5 text-[#737373] hover:text-[#F5F5F5] rounded hover:bg-[#262626] transition-colors"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>

          {showMenu && (
            <div
              onClick={(e) => e.stopPropagation()}
              className="absolute right-0 top-8 z-30 w-44 py-1 rounded-lg bg-[#181818] border border-[#303030] shadow-xl animate-in fade-in duration-100"
            >
              <button
                onClick={() => {
                  setShowMenu(false);
                  if (onOpenPlaylistModal) onOpenPlaylistModal(song);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-[#D4D4D4] hover:bg-[#262626] hover:text-white transition-colors"
              >
                <Plus className="w-3.5 h-3.5 text-[#B7A0FF]" />
                Add to Playlist
              </button>
              <button
                onClick={(e) => {
                  setShowMenu(false);
                  handleDownloadClick(e);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-[#D4D4D4] hover:bg-[#262626] hover:text-white transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-[#B7A0FF]" />
                {downloaded ? 'Remove Download' : 'Save for Offline'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
