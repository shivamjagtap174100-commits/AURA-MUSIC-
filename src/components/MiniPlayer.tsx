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
  CheckCircle2,
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
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#0d0f18]/95 backdrop-blur-xl border-t border-white/[0.08] shadow-2xl transition-all">
      {/* Top micro progress bar for quick scrub */}
      <div className="relative w-full h-1 group cursor-pointer bg-white/[0.06]">
        <div
          className="h-full bg-gradient-to-r from-violet-500 via-purple-500 to-cyan-400 relative"
          style={{ width: `${progressPercent}%` }}
        >
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-cyan-300 rounded-full shadow-md shadow-cyan-400/50 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        <input
          type="range"
          min="0"
          max={duration || 100}
          value={currentTime}
          onChange={handleSeekChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          title="Seek playback"
        />
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2 sm:py-2.5 flex items-center justify-between gap-2 sm:gap-4">
        {/* Left: Track Info & Artwork */}
        <div className="flex items-center gap-3 min-w-0 max-w-[280px] sm:max-w-[340px] flex-1">
          <div
            onClick={() => setFullScreen(true)}
            className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 shadow-lg cursor-pointer group border border-white/10"
          >
            <img
              src={currentSong.coverUrl}
              alt={currentSong.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
              <Maximize2 className="w-4 h-4 text-white" />
            </div>
          </div>

          <div className="min-w-0 flex-1 cursor-pointer" onClick={() => setFullScreen(true)}>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-white truncate hover:text-cyan-400 transition-colors">
                {currentSong.title}
              </h4>
              <AudioQualityBadge quality={currentSong.audioQuality} />
            </div>
            <p className="text-xs text-slate-400 truncate hover:text-violet-300 transition-colors">
              {currentSong.artistName}
            </p>
          </div>

          {/* Quick Heart & Download action */}
          <div className="hidden sm:flex items-center gap-1">
            <button
              onClick={handleLikeToggle}
              title={isLiked ? 'Liked' : 'Like'}
              className="p-1.5 text-slate-400 hover:text-pink-500 rounded-lg hover:bg-white/[0.06] transition-colors"
            >
              <Heart className={`w-4 h-4 ${isLiked ? 'text-pink-500 fill-pink-500' : ''}`} />
            </button>
            <button
              onClick={handleDownloadToggle}
              title={downloaded ? 'Downloaded offline' : 'Download for offline'}
              className="p-1.5 text-slate-400 hover:text-cyan-400 rounded-lg hover:bg-white/[0.06] transition-colors"
            >
              {downloaded ? (
                <CheckCircle2 className="w-4 h-4 text-cyan-400" />
              ) : (
                <Download className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Center: Controls & Timeline */}
        <div className="flex flex-col items-center gap-1 max-w-[480px] flex-1">
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={toggleShuffle}
              title={`Shuffle: ${shuffle ? 'On' : 'Off'}`}
              className={`p-1.5 rounded-lg transition-colors hidden sm:block ${
                shuffle ? 'text-cyan-400' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Shuffle className="w-4 h-4" />
            </button>

            <button
              onClick={previous}
              title="Previous (Shift + Left)"
              className="p-1.5 text-slate-300 hover:text-white hover:scale-105 active:scale-95 transition-transform"
            >
              <SkipBack className="w-5 h-5" />
            </button>

            <button
              onClick={togglePlayPause}
              title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
              className="w-10 h-10 rounded-full bg-gradient-to-r from-violet-500 to-cyan-500 hover:from-violet-400 hover:to-cyan-400 text-black flex items-center justify-center shadow-lg shadow-violet-500/25 hover:scale-105 active:scale-95 transition-all"
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 fill-black" />
              ) : (
                <Play className="w-5 h-5 fill-black ml-0.5" />
              )}
            </button>

            <button
              onClick={next}
              title="Next (Shift + Right)"
              className="p-1.5 text-slate-300 hover:text-white hover:scale-105 active:scale-95 transition-transform"
            >
              <SkipForward className="w-5 h-5" />
            </button>

            <button
              onClick={cycleRepeat}
              title={`Repeat: ${repeat}`}
              className={`p-1.5 rounded-lg transition-colors hidden sm:block ${
                repeat !== 'off' ? 'text-cyan-400' : 'text-slate-400 hover:text-white'
              }`}
            >
              {repeat === 'one' ? <Repeat1 className="w-4 h-4" /> : <Repeat className="w-4 h-4" />}
            </button>
          </div>

          {/* Time scrubber on larger screens */}
          <div className="hidden sm:flex items-center gap-2 w-full text-[11px] font-mono text-slate-400">
            <span className="w-10 text-right">{formatTime(currentTime)}</span>
            <div className="relative flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden group cursor-pointer">
              <div
                className="h-full bg-gradient-to-r from-violet-500 to-cyan-400 rounded-full"
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
            <span className="w-10">{formatTime(duration)}</span>
          </div>
        </div>

        {/* Right: Volume, Queue & Fullscreen */}
        <div className="flex items-center justify-end gap-2 sm:gap-3 flex-1 max-w-[240px]">
          {/* Volume Control */}
          <div className="hidden md:flex items-center gap-2">
            <button
              onClick={toggleMute}
              className="text-slate-400 hover:text-white transition-colors"
              title={isMuted ? 'Unmute (M)' : 'Mute (M)'}
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-4 h-4" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>
            <div className="relative w-20 h-1.5 bg-white/10 rounded-full overflow-hidden cursor-pointer group">
              <div
                className="h-full bg-gradient-to-r from-violet-400 to-cyan-400 rounded-full"
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
            className={`p-2 rounded-xl transition-colors ${
              isQueueOpen ? 'bg-violet-600/30 text-cyan-400' : 'text-slate-400 hover:text-white hover:bg-white/[0.08]'
            }`}
          >
            <ListMusic className="w-4 h-4" />
          </button>

          {/* Full Screen Player */}
          <button
            onClick={() => setFullScreen(true)}
            title="Open Fullscreen Player"
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/[0.08] transition-colors"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
