import React, { useState } from 'react';
import {
  ChevronDown,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  Heart,
  Download,
  Check,
  Volume2,
  VolumeX,
  ListMusic,
  FileText,
  Music,
} from 'lucide-react';
import { useAudio } from '../context/AudioContext';
import { useDownloads } from '../context/DownloadContext';
import { catalogService } from '../services/catalogService';
import { AudioQualityBadge } from './AudioQualityBadge';

export const FullScreenPlayer: React.FC = () => {
  const {
    currentSong,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    shuffle,
    repeat,
    queue,
    togglePlayPause,
    seek,
    setVolume,
    toggleMute,
    next,
    previous,
    toggleShuffle,
    cycleRepeat,
    isFullScreen,
    setFullScreen,
  } = useAudio();

  const { isDownloaded, downloadSong, removeDownload } = useDownloads();
  const [activeTab, setActiveTab] = useState<'art' | 'lyrics' | 'queue'>('art');
  const [isLiked, setIsLiked] = useState<boolean>(() =>
    currentSong ? catalogService.isSongLiked(currentSong.id) : false
  );

  if (!isFullScreen || !currentSong) return null;

  const downloaded = isDownloaded(currentSong.id);

  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    seek(parseFloat(e.target.value));
  };

  const handleVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
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
    <div className="fixed inset-0 z-50 bg-[#101010] flex flex-col justify-between overflow-hidden animate-in fade-in duration-200 select-none">
      {/* Top Header Navigation */}
      <div className="max-w-4xl w-full mx-auto px-6 py-4 flex items-center justify-between border-b border-[#202020]">
        <button
          onClick={() => setFullScreen(false)}
          className="p-2 text-[#A1A1A1] hover:text-white rounded-lg hover:bg-[#1f1f1f] transition-colors"
          title="Minimize player"
        >
          <ChevronDown className="w-5 h-5" />
        </button>

        <div className="text-center">
          <span className="text-[11px] uppercase tracking-wider text-[#737373] font-medium">
            Playing from {currentSong.albumTitle ? `Album • ${currentSong.albumTitle}` : 'Aura Catalog'}
          </span>
        </div>

        {/* Minimal Tab Switcher (Art, Lyrics, Queue) */}
        <div className="flex items-center gap-1 bg-[#181818] p-1 rounded-lg border border-[#282828]">
          <button
            onClick={() => setActiveTab('art')}
            className={`p-1.5 rounded text-xs transition-colors ${
              activeTab === 'art' ? 'bg-[#262626] text-[#F5F5F5]' : 'text-[#737373] hover:text-white'
            }`}
            title="Artwork"
          >
            <Music className="w-4 h-4" />
          </button>
          <button
            onClick={() => setActiveTab('lyrics')}
            className={`p-1.5 rounded text-xs transition-colors ${
              activeTab === 'lyrics' ? 'bg-[#262626] text-[#F5F5F5]' : 'text-[#737373] hover:text-white'
            }`}
            title="Lyrics"
          >
            <FileText className="w-4 h-4" />
          </button>
          <button
            onClick={() => setActiveTab('queue')}
            className={`p-1.5 rounded text-xs transition-colors ${
              activeTab === 'queue' ? 'bg-[#262626] text-[#F5F5F5]' : 'text-[#737373] hover:text-white'
            }`}
            title="Queue"
          >
            <ListMusic className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Center Area: Artwork, Lyrics, or Queue */}
      <div className="flex-1 flex items-center justify-center px-6 py-4 max-w-xl w-full mx-auto">
        {activeTab === 'art' && (
          <div className="w-full flex flex-col items-center">
            {/* Crisp, large square album artwork */}
            <div className="relative w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 rounded-xl overflow-hidden shadow-2xl bg-[#181818] border border-[#262626]">
              <img
                src={currentSong.coverUrl}
                alt={currentSong.title}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        )}

        {activeTab === 'lyrics' && (
          <div className="w-full h-[360px] sm:h-[440px] overflow-y-auto px-6 py-8 rounded-xl bg-[#181818] border border-[#262626] text-center">
            <h4 className="text-xs uppercase tracking-widest text-[#737373] font-mono mb-6">
              Track Lyrics
            </h4>
            {currentSong.lyrics ? (
              <pre className="font-sans text-sm sm:text-base leading-loose text-[#D4D4D4] whitespace-pre-wrap select-text">
                {currentSong.lyrics}
              </pre>
            ) : (
              <div className="flex flex-col items-center justify-center h-48 text-[#737373] text-sm">
                <FileText className="w-8 h-8 mb-2 opacity-30" />
                <p>Instrumental track or lyrics unavailable.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'queue' && (
          <div className="w-full h-[360px] sm:h-[440px] overflow-y-auto p-4 rounded-xl bg-[#181818] border border-[#262626]">
            <h4 className="text-xs uppercase tracking-wider text-[#737373] font-mono mb-3 px-2">
              Playback Queue ({queue.length})
            </h4>
            <div className="space-y-1">
              {queue.map((qSong, idx) => {
                const isItemCurrent = qSong.id === currentSong.id;
                return (
                  <div
                    key={`${qSong.id}-${idx}`}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                      isItemCurrent
                        ? 'bg-[#242033] text-[#B7A0FF] font-medium'
                        : 'text-[#D4D4D4] hover:bg-[#202020]'
                    }`}
                  >
                    <span className="w-4 text-xs font-mono text-[#737373]">{idx + 1}</span>
                    <img
                      src={qSong.coverUrl}
                      alt={qSong.title}
                      className="w-8 h-8 rounded object-cover bg-[#242424]"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-xs">{qSong.title}</p>
                      <p className="text-[11px] text-[#737373] truncate">{qSong.artistName}</p>
                    </div>
                    <span className="text-xs text-[#737373] font-mono">
                      {formatTime(qSong.duration)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Controls Area */}
      <div className="max-w-xl w-full mx-auto px-6 pb-8 pt-2">
        {/* Track Title & Artist */}
        <div className="flex items-center justify-between mb-4">
          <div className="min-w-0 flex-1 pr-4">
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-bold text-[#F5F5F5] truncate tracking-tight">
                {currentSong.title}
              </h2>
              <AudioQualityBadge quality={currentSong.audioQuality} />
            </div>
            <p className="text-sm text-[#A1A1A1] truncate mt-0.5">
              {currentSong.artistName}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleLikeToggle}
              title={isLiked ? 'Remove from Liked' : 'Save to Liked'}
              className="p-2.5 rounded-full hover:bg-[#202020] text-[#737373] hover:text-white transition-colors"
            >
              <Heart
                className={`w-5 h-5 ${isLiked ? 'text-[#B7A0FF] fill-[#B7A0FF]' : ''}`}
              />
            </button>

            <button
              onClick={handleDownloadToggle}
              title={downloaded ? 'Saved offline' : 'Download'}
              className="p-2.5 rounded-full hover:bg-[#202020] text-[#737373] hover:text-white transition-colors"
            >
              {downloaded ? (
                <Check className="w-5 h-5 text-[#B7A0FF]" />
              ) : (
                <Download className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Clean Progress Slider */}
        <div className="space-y-1.5 mb-5">
          <div className="relative w-full h-1.5 bg-[#262626] rounded-full overflow-hidden cursor-pointer group">
            <div
              className="h-full bg-[#F5F5F5] group-hover:bg-[#B7A0FF] transition-colors rounded-full relative"
              style={{ width: `${progressPercent}%` }}
            />
            <input
              type="range"
              min="0"
              max={duration || 100}
              value={currentTime}
              onChange={handleSeek}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>
          <div className="flex justify-between text-xs font-mono text-[#737373]">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Transport Controls (Shuffle, Prev, Play/Pause, Next, Repeat) */}
        <div className="flex items-center justify-between px-2 mb-6">
          <button
            onClick={toggleShuffle}
            title={`Shuffle: ${shuffle ? 'On' : 'Off'}`}
            className={`p-2.5 rounded transition-colors ${
              shuffle ? 'text-[#B7A0FF]' : 'text-[#737373] hover:text-white'
            }`}
          >
            <Shuffle className="w-5 h-5" />
          </button>

          <button
            onClick={previous}
            title="Previous track"
            className="p-2.5 text-[#D4D4D4] hover:text-white active:scale-95 transition-transform"
          >
            <SkipBack className="w-6 h-6" />
          </button>

          {/* Large Solid Play/Pause Button */}
          <button
            onClick={togglePlayPause}
            title={isPlaying ? 'Pause' : 'Play'}
            className="w-14 h-14 rounded-full bg-[#F5F5F5] hover:bg-white text-black flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-lg"
          >
            {isPlaying ? (
              <Pause className="w-6 h-6 fill-black" />
            ) : (
              <Play className="w-6 h-6 fill-black ml-1" />
            )}
          </button>

          <button
            onClick={next}
            title="Next track"
            className="p-2.5 text-[#D4D4D4] hover:text-white active:scale-95 transition-transform"
          >
            <SkipForward className="w-6 h-6" />
          </button>

          <button
            onClick={cycleRepeat}
            title={`Repeat: ${repeat}`}
            className={`p-2.5 rounded transition-colors ${
              repeat !== 'off' ? 'text-[#B7A0FF]' : 'text-[#737373] hover:text-white'
            }`}
          >
            {repeat === 'one' ? <Repeat1 className="w-5 h-5" /> : <Repeat className="w-5 h-5" />}
          </button>
        </div>

        {/* Volume & Bitrate Footer */}
        <div className="flex items-center justify-between text-[#737373] pt-3 border-t border-[#202020]">
          <div className="flex items-center gap-3">
            <button
              onClick={toggleMute}
              className="hover:text-white transition-colors"
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-4 h-4" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>
            <div className="relative w-24 h-1 bg-[#282828] rounded-full overflow-hidden cursor-pointer">
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
                onChange={handleVolume}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>
          </div>

          <span className="text-xs font-mono text-[#737373]">
            {currentSong.bitrate || '320 kbps'} • {currentSong.genre}
          </span>
        </div>
      </div>
    </div>
  );
};
