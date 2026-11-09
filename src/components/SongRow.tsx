import React, { useState } from 'react';
import { Play, Pause, Heart, Download, CheckCircle2, MoreVertical, Plus, Loader2 } from 'lucide-react';
import { Song } from '../types';
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
      className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 cursor-pointer select-none ${
        isCurrent
          ? 'bg-violet-950/30 border border-violet-500/20 shadow-sm'
          : 'hover:bg-white/[0.04] border border-transparent'
      }`}
    >
      {/* Index or Play / Equalizer indicator */}
      <div className="w-7 flex items-center justify-center text-xs font-semibold text-slate-400">
        {isCurrent ? (
          isPlaying ? (
            <EqualizerBars size="sm" isPlaying={true} />
          ) : (
            <Play className="w-4 h-4 text-violet-400 fill-violet-400" />
          )
        ) : (
          <>
            <span className="group-hover:hidden">{index + 1}</span>
            <Play className="w-4 h-4 text-white hidden group-hover:block" />
          </>
        )}
      </div>

      {/* Album Artwork */}
      <div className="relative w-11 h-11 rounded-lg overflow-hidden shrink-0 bg-slate-900 border border-white/10 shadow-sm">
        <img
          src={song.coverUrl}
          alt={song.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        {isCurrent && isPlaying && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          </div>
        )}
      </div>

      {/* Title & Artist */}
      <div className="flex-1 min-w-0 pr-2">
        <div className="flex items-center gap-2">
          <p
            className={`text-sm font-semibold truncate ${
              isCurrent ? 'text-cyan-400' : 'text-slate-100 group-hover:text-white'
            }`}
          >
            {song.title}
          </p>
          <AudioQualityBadge quality={song.audioQuality} />
        </div>
        <p className="text-xs text-slate-400 truncate mt-0.5">
          <span
            onClick={(e) => {
              if (onSelectArtist) {
                e.stopPropagation();
                onSelectArtist(song.artistId);
              }
            }}
            className="hover:text-violet-300 hover:underline cursor-pointer"
          >
            {song.artistName}
          </span>
          {showAlbum && song.albumTitle && (
            <span className="hidden md:inline text-slate-500"> • {song.albumTitle}</span>
          )}
        </p>
      </div>

      {/* Actions: Download Button */}
      <div className="flex items-center gap-1.5 shrink-0">
        <button
          onClick={handleDownloadClick}
          title={downloaded ? 'Downloaded (Play offline) - Click to remove' : 'Download for offline playback'}
          className={`p-1.5 rounded-lg transition-colors ${
            downloaded
              ? 'text-cyan-400 hover:text-cyan-300 bg-cyan-950/40'
              : isDownloading
              ? 'text-violet-400'
              : 'text-slate-500 hover:text-slate-200 hover:bg-white/[0.08] opacity-0 group-hover:opacity-100'
          }`}
        >
          {isDownloading ? (
            <div className="flex items-center gap-1">
              <Loader2 className="w-4 h-4 animate-spin text-violet-400" />
              <span className="text-[10px] text-violet-300 font-mono">
                {progressInfo.progress}%
              </span>
            </div>
          ) : downloaded ? (
            <CheckCircle2 className="w-4 h-4" />
          ) : (
            <Download className="w-4 h-4" />
          )}
        </button>

        {/* Like Button */}
        <button
          onClick={handleLikeToggle}
          title={isLiked ? 'Unlike' : 'Like'}
          className={`p-1.5 rounded-lg transition-transform active:scale-90 ${
            isLiked
              ? 'text-pink-500 hover:text-pink-400 fill-pink-500'
              : 'text-slate-500 hover:text-slate-200 hover:bg-white/[0.08] opacity-0 group-hover:opacity-100'
          }`}
        >
          <Heart className={`w-4 h-4 ${isLiked ? 'fill-pink-500' : ''}`} />
        </button>

        {/* Duration */}
        <span className="text-xs text-slate-400 font-mono w-12 text-right hidden sm:inline-block">
          {formatDuration(song.duration)}
        </span>

        {/* More Actions / Playlist Menu */}
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/[0.08]"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {showMenu && (
            <div
              onClick={(e) => e.stopPropagation()}
              className="absolute right-0 top-8 z-30 w-48 py-1 rounded-xl glass-dropdown shadow-2xl animate-in fade-in zoom-in-95 duration-150"
            >
              <button
                onClick={() => {
                  setShowMenu(false);
                  if (onOpenPlaylistModal) onOpenPlaylistModal(song);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-200 hover:bg-violet-600/30 hover:text-white transition-colors"
              >
                <Plus className="w-3.5 h-3.5 text-violet-400" />
                Add to Playlist
              </button>
              <button
                onClick={(e) => {
                  setShowMenu(false);
                  handleDownloadClick(e);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-200 hover:bg-violet-600/30 hover:text-white transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-cyan-400" />
                {downloaded ? 'Remove Download' : 'Save for Offline'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
