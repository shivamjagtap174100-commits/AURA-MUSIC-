import React, { useState } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Shuffle,
  Repeat,
  Repeat1,
  Maximize2,
  ListMusic,
  Heart,
  Download,
  Check,
} from 'lucide-react';
import { useAudio } from '../context/AudioContext';
import { useDownloads } from '../context/DownloadContext';
import { catalogService } from '../services/catalogService';
import { AudioQualityBadge } from './AudioQualityBadge';

export const MiniPlayer: React.FC = () => {
  const {
    currentSong,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    shuffle,
    repeat,
    togglePlayPause,
    seek,
    setVolume,
    toggleMute,
    next,
    previous,
    toggleShuffle,
    cycleRepeat,
    setFullScreen,
    setQueueOpen,
    isQueueOpen,
  } = useAudio();

  const { isDownloaded, downloadSong, removeDownload } = useDownloads();
  const [isLiked, setIsLiked] = useState<boolean>(() =>
    currentSong ? catalogService.isSongLiked(currentSong.id) : false
  );

  if (!currentSong) return null;

  const downloaded = isDownloaded(currentSong.id);

  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    seek(parseFloat(e.target.value));
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVolume(parseFloat(e.target.value));
  };

  const handleLikeToggle = () => {
    if (!currentSong) return;
    const liked = catalogService.toggleLikeSong(currentSong.id);
    setIsLiked(liked);
  };

  const handleDownloadToggle = async () => {
    if (!currentSong) return;
    if (downloaded) {
      await removeDownload(currentSong.id);
    } else {
      await downloadSong(currentSong);
    }
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#181818] border-t border-[#262626] select-none">
      {/* Top micro progress line for quick touch/click scrub */}
      <div className="relative w-full h-[3px] bg-[#282828] group cursor-pointer">
        <div
          className="h-full bg-[#B7A0FF] relative"
          style={{ width: `${progressPercent}%` }}
        >
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        <input
          type="range"
          min="0"
          max={duration || 100}
          value={currentTime}
          onChange={handleSeekChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          title="Seek track"
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 py-2 sm:py-2.5 flex items-center justify-between gap-4">
        {/* Left: Track Artwork & Info */}
        <div className="flex items-center gap-3 min-w-0 max-w-[260px] sm:max-w-[320px] flex-1">
          <div
            onClick={() => setFullScreen(true)}
            className="relative w-11 h-11 rounded-md overflow-hidden shrink-0 bg-[#202020] border border-[#282828] cursor-pointer group"
          >
            <img
              src={currentSong.coverUrl}
              alt={currentSong.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
              <Maximize2 className="w-3.5 h-3.5 text-white" />
            </div>
          </div>

          <div className="min-w-0 flex-1 cursor-pointer" onClick={() => setFullScreen(true)}>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-medium text-[#F5F5F5] truncate hover:text-[#B7A0FF] transition-colors">
                {currentSong.title}
              </h4>
              <AudioQualityBadge quality={currentSong.audioQuality} />
            </div>
            <p className="text-xs text-[#A1A1A1] truncate hover:text-white transition-colors">
              {currentSong.artistName}
            </p>
          </div>

          {/* Quick Like & Download Actions */}
          <div className="hidden sm:flex items-center gap-0.5 shrink-0">
            <button
              onClick={handleLikeToggle}
              title={isLiked ? 'Remove from Liked' : 'Save to Liked'}
              className="p-1.5 text-[#737373] hover:text-[#F5F5F5] transition-colors rounded"
            >
              <Heart className={`w-3.5 h-3.5 ${isLiked ? 'text-[#B7A0FF] fill-[#B7A0FF]' : ''}`} />
            </button>
            <button
              onClick={handleDownloadToggle}
              title={downloaded ? 'Downloaded offline' : 'Download'}
              className="p-1.5 text-[#737373] hover:text-[#F5F5F5] transition-colors rounded"
            >
              {downloaded ? (
                <Check className="w-3.5 h-3.5 text-[#B7A0FF]" />
              ) : (
                <Download className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>

        {/* Center: Clean Transport Controls & Timeline */}
        <div className="flex flex-col items-center gap-1 max-w-[440px] flex-1">
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={toggleShuffle}
              title={`Shuffle: ${shuffle ? 'On' : 'Off'}`}
              className={`p-1.5 rounded transition-colors hidden sm:block ${
                shuffle ? 'text-[#B7A0FF]' : 'text-[#737373] hover:text-white'
              }`}
            >
              <Shuffle className="w-4 h-4" />
            </button>

            <button
              onClick={previous}
              title="Previous track"
              className="p-1.5 text-[#D4D4D4] hover:text-white active:scale-95 transition-transform"
            >
              <SkipBack className="w-4 h-4" />
            </button>

            {/* Premium Solid White Play Button */}
            <button
              onClick={togglePlayPause}
              title={isPlaying ? 'Pause' : 'Play'}
              className="w-9 h-9 rounded-full bg-[#F5F5F5] hover:bg-white text-black flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-md"
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 fill-black" />
              ) : (
                <Play className="w-4 h-4 fill-black ml-0.5" />
              )}
            </button>

            <button
              onClick={next}
              title="Next track"
              className="p-1.5 text-[#D4D4D4] hover:text-white active:scale-95 transition-transform"
            >
              <SkipForward className="w-4 h-4" />
            </button>

            <button
              onClick={cycleRepeat}
              title={`Repeat: ${repeat}`}
              className={`p-1.5 rounded transition-colors hidden sm:block ${
                repeat !== 'off' ? 'text-[#B7A0FF]' : 'text-[#737373] hover:text-white'
              }`}
            >
              {repeat === 'one' ? <Repeat1 className="w-4 h-4" /> : <Repeat className="w-4 h-4" />}
            </button>
          </div>

          {/* Desktop Timeline */}
          <div className="hidden sm:flex items-center gap-2 w-full text-[11px] font-mono text-[#737373]">
            <span className="w-9 text-right">{formatTime(currentTime)}</span>
            <div className="relative flex-1 h-1 bg-[#282828] rounded-full overflow-hidden cursor-pointer group">
              <div
                className="h-full bg-[#F5F5F5] group-hover:bg-[#B7A0FF] transition-colors"
                style={{ width: `${progressPercent}%` }}
              />
              <input
                type="range"
                min="0"
                max={duration || 100}
                value={currentTime}
                onChange={handleSeekChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>
            <span className="w-9">{formatTime(duration)}</span>
          </div>
        </div>

        {/* Right: Volume & Queue */}
        <div className="flex items-center justify-end gap-3 flex-1 max-w-[220px]">
          {/* Volume Control */}
          <div className="hidden md:flex items-center gap-2">
            <button
              onClick={toggleMute}
              className="text-[#737373] hover:text-white transition-colors"
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-4 h-4" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>
            <div className="relative w-20 h-1 bg-[#282828] rounded-full overflow-hidden cursor-pointer">
              <div
                className="h-full bg-[#A1A1A1] hover:bg-white transition-colors"
                style={{ width: `${isMuted ? 0 : volume * 100}%` }}
              />
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                title="Volume"
              />
            </div>
          </div>

          {/* Queue toggle */}
          <button
            onClick={() => setQueueOpen(!isQueueOpen)}
            title="Queue"
            className={`p-2 rounded-md transition-colors ${
              isQueueOpen ? 'bg-[#262626] text-[#B7A0FF]' : 'text-[#737373] hover:text-white hover:bg-[#202020]'
            }`}
          >
            <ListMusic className="w-4 h-4" />
          </button>

          {/* Full Screen Expander */}
          <button
            onClick={() => setFullScreen(true)}
            title="Open Fullscreen View"
            className="p-2 text-[#737373] hover:text-white rounded-md hover:bg-[#202020] transition-colors"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
