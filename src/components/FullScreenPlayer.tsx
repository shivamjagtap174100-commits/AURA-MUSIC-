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
  Activity,
} from 'lucide-react';
import { useAudio } from '../context/AudioContext';
import { useDownloads } from '../context/DownloadContext';
import { catalogService } from '../services/catalogService';
import { AudioQualityBadge } from './AudioQualityBadge';
import { EqualizerBars } from './EqualizerBars';

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
    playbackError,
  } = useAudio();

  const { isDownloaded, downloadSong, removeDownload } = useDownloads();
  const [activeTab, setActiveTab] = useState<'art' | 'lyrics' | 'queue' | 'visualizer'>('art');
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
    <div className="fixed inset-0 z-50 bg-[#08090A] flex flex-col justify-between overflow-hidden animate-in fade-in duration-200 select-none">
      {/* Artwork-inspired subtle background atmosphere */}
      <div
        className="absolute inset-0 opacity-15 pointer-events-none filter blur-3xl scale-125 transition-all duration-700"
        style={{
          backgroundImage: `url(${currentSong.coverUrl})`,
          backgroundPosition: 'center',
          backgroundSize: 'cover',
        }}
      />

      {/* Top Header Navigation */}
      <div className="relative z-10 max-w-4xl w-full mx-auto px-6 py-4 flex items-center justify-between border-b border-[#292929]/70 backdrop-blur-md">
        <button
          onClick={() => setFullScreen(false)}
          className="p-2 text-[#929292] hover:text-[#F3F0E9] rounded-lg hover:bg-[#171819] transition-colors"
          title="Minimize player"
        >
          <ChevronDown className="w-5 h-5" />
        </button>

        <div className="text-center">
          <span className="text-[10px] uppercase tracking-[0.2em] text-[#C5A66B] font-semibold block">
            AURA NOW PLAYING
          </span>
          <span className="text-xs text-[#929292] truncate block max-w-xs">
            {currentSong.albumTitle ? currentSong.albumTitle : 'Aura Catalogue'}
          </span>
        </div>

        {/* Minimal Tab Switcher (Art, Visualizer, Lyrics, Queue) */}
        <div className="flex items-center gap-1 bg-[#101112] p-1 rounded-lg border border-[#292929]">
          <button
            onClick={() => setActiveTab('art')}
            className={`p-1.5 rounded text-xs transition-colors ${
              activeTab === 'art'
                ? 'bg-[#171819] text-[#C5A66B]'
                : 'text-[#666666] hover:text-[#F3F0E9]'
            }`}
            title="Artwork"
          >
            <Music className="w-4 h-4" />
          </button>
          <button
            onClick={() => setActiveTab('visualizer')}
            className={`p-1.5 rounded text-xs transition-colors ${
              activeTab === 'visualizer'
                ? 'bg-[#171819] text-[#C5A66B]'
                : 'text-[#666666] hover:text-[#F3F0E9]'
            }`}
            title="Audio Visualizer"
          >
            <Activity className="w-4 h-4" />
          </button>
          <button
            onClick={() => setActiveTab('lyrics')}
            className={`p-1.5 rounded text-xs transition-colors ${
              activeTab === 'lyrics'
                ? 'bg-[#171819] text-[#C5A66B]'
                : 'text-[#666666] hover:text-[#F3F0E9]'
            }`}
            title="Lyrics"
          >
            <FileText className="w-4 h-4" />
          </button>
          <button
            onClick={() => setActiveTab('queue')}
            className={`p-1.5 rounded text-xs transition-colors ${
              activeTab === 'queue'
                ? 'bg-[#171819] text-[#C5A66B]'
                : 'text-[#666666] hover:text-[#F3F0E9]'
            }`}
            title="Queue"
          >
            <ListMusic className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Center Area */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-6 py-4 max-w-xl w-full mx-auto">
        {activeTab === 'art' && (
          <div className="w-full flex flex-col items-center">
            {/* Crisp, large square album artwork with subtle Obsidian shadow */}
            <div className="relative w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 rounded-2xl overflow-hidden shadow-2xl bg-[#171819] border border-[#292929] group">
              <img
                src={currentSong.coverUrl}
                alt={currentSong.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
              />
              <div className="absolute top-3 right-3">
                <EqualizerBars isPlaying={isPlaying} size="md" />
              </div>
            </div>

            {playbackError && (
              <div className="mt-4 p-3.5 rounded-xl bg-[#202123]/95 border border-[#C5A66B]/40 text-center max-w-sm w-full shadow-lg">
                <p className="text-xs text-[#C5A66B] font-semibold mb-1">Commercial Streaming Rights Reserved</p>
                <p className="text-[11px] text-[#F3F0E9] mb-3 leading-relaxed">{playbackError}</p>
                {currentSong.spotifyUrl && (
                  <a
                    href={currentSong.spotifyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1DB954] text-black font-semibold text-xs hover:bg-[#1ed760] transition-colors shadow"
                  >
                    Listen on Spotify ↗
                  </a>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'visualizer' && (
          <div className="w-full h-[340px] sm:h-[400px] flex flex-col items-center justify-center p-6 rounded-2xl bg-[#101112]/90 border border-[#292929] backdrop-blur-md">
            <span className="text-[10px] uppercase tracking-[0.25em] text-[#C5A66B] font-mono mb-8">
              Acoustic Resonance Visualizer
            </span>
            <div className="flex items-end gap-1.5 sm:gap-2.5 h-44 w-full max-w-md justify-center px-4">
              {[40, 65, 85, 30, 95, 70, 50, 90, 60, 100, 80, 45, 75, 35, 90, 55].map((h, i) => (
                <div
                  key={i}
                  className="w-2.5 sm:w-3.5 bg-gradient-to-t from-[#C5A66B]/20 via-[#C5A66B] to-[#D8BF91] rounded-t-full transition-all duration-200"
                  style={{
                    height: isPlaying ? `${Math.max(12, (h * (Math.sin((currentTime * 4) + i) + 1.2)) / 2)}%` : '10%',
                  }}
                />
              ))}
            </div>
            <p className="text-xs text-[#929292] font-mono mt-8">
              {currentSong.audioQuality} • {currentSong.bitrate || '320 kbps'}
            </p>
          </div>
        )}

        {activeTab === 'lyrics' && (
          <div className="w-full h-[360px] sm:h-[440px] overflow-y-auto px-6 py-8 rounded-2xl bg-[#101112]/90 border border-[#292929] text-center backdrop-blur-md">
            <h4 className="text-xs uppercase tracking-widest text-[#C5A66B] font-mono mb-6">
              Track Lyrics & Vocals
            </h4>
            {currentSong.lyrics ? (
              <pre className="font-sans text-sm sm:text-base leading-loose text-[#F3F0E9] whitespace-pre-wrap select-text">
                {currentSong.lyrics}
              </pre>
            ) : (
              <div className="flex flex-col items-center justify-center h-48 text-[#666666] text-sm">
                <FileText className="w-8 h-8 mb-2 opacity-30 text-[#C5A66B]" />
                <p>Instrumental track or lyrics unavailable.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'queue' && (
          <div className="w-full h-[360px] sm:h-[440px] overflow-y-auto p-4 rounded-2xl bg-[#101112]/90 border border-[#292929] backdrop-blur-md">
            <h4 className="text-xs uppercase tracking-wider text-[#C5A66B] font-mono mb-3 px-2">
              Playing Queue ({queue.length} Tracks)
            </h4>
            <div className="space-y-1">
              {queue.map((qSong, idx) => {
                const isItemCurrent = qSong.id === currentSong.id;
                return (
                  <div
                    key={`${qSong.id}-${idx}`}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                      isItemCurrent
                        ? 'bg-[#171819] text-[#C5A66B] font-medium border border-[#C5A66B]/20'
                        : 'text-[#929292] hover:bg-[#171819] hover:text-[#F3F0E9]'
                    }`}
                  >
                    <span className="w-4 text-xs font-mono text-[#666666]">{idx + 1}</span>
                    <img
                      src={qSong.coverUrl}
                      alt={qSong.title}
                      className="w-8 h-8 rounded object-cover bg-[#171819]"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-xs">{qSong.title}</p>
                      <p className="text-[11px] text-[#666666] truncate">{qSong.artistName}</p>
                    </div>
                    <span className="text-xs text-[#666666] font-mono">
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
      <div className="relative z-10 max-w-xl w-full mx-auto px-6 pb-8 pt-2">
        {/* Track Title & Artist */}
        <div className="flex items-center justify-between mb-4">
          <div className="min-w-0 flex-1 pr-4">
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-bold text-[#F3F0E9] truncate tracking-tight font-['Manrope']">
                {currentSong.title}
              </h2>
              {currentSong.titleNative && (
                <span className="text-xs px-2 py-0.5 rounded bg-[#171819] text-[#C5A66B] border border-[#292929]">
                  {currentSong.titleNative}
                </span>
              )}
              <AudioQualityBadge quality={currentSong.audioQuality} />
            </div>
            <p className="text-sm text-[#929292] truncate mt-0.5">
              {currentSong.artistName} {currentSong.artistNative && `(${currentSong.artistNative})`}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleLikeToggle}
              title={isLiked ? 'Remove from Liked' : 'Save to Liked'}
              className="p-2.5 rounded-full hover:bg-[#171819] text-[#666666] hover:text-[#F3F0E9] transition-colors"
            >
              <Heart
                className={`w-5 h-5 ${isLiked ? 'text-[#C5A66B] fill-[#C5A66B]' : ''}`}
              />
            </button>

            <button
              onClick={handleDownloadToggle}
              title={downloaded ? 'Saved offline' : 'Download'}
              className="p-2.5 rounded-full hover:bg-[#171819] text-[#666666] hover:text-[#F3F0E9] transition-colors"
            >
              {downloaded ? (
                <Check className="w-5 h-5 text-[#C5A66B]" />
              ) : (
                <Download className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Obsidian Gold Progress Slider */}
        <div className="space-y-1.5 mb-5">
          <div className="relative w-full h-1.5 bg-[#202123] rounded-full overflow-hidden cursor-pointer group">
            <div
              className="h-full bg-[#C5A66B] transition-colors rounded-full relative"
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
          <div className="flex justify-between text-xs font-mono text-[#666666]">
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
              shuffle ? 'text-[#C5A66B]' : 'text-[#666666] hover:text-[#F3F0E9]'
            }`}
          >
            <Shuffle className="w-5 h-5" />
          </button>

          <button
            onClick={previous}
            title="Previous track"
            className="p-2.5 text-[#929292] hover:text-[#F3F0E9] active:scale-95 transition-transform"
          >
            <SkipBack className="w-6 h-6" />
          </button>

          {/* Large Obsidian Gold Play/Pause Button */}
          <button
            onClick={togglePlayPause}
            title={isPlaying ? 'Pause' : 'Play'}
            className="w-14 h-14 rounded-full bg-[#C5A66B] hover:bg-[#D8BF91] text-[#08090A] flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-xl"
          >
            {isPlaying ? (
              <Pause className="w-6 h-6 fill-[#08090A]" />
            ) : (
              <Play className="w-6 h-6 fill-[#08090A] ml-1" />
            )}
          </button>

          <button
            onClick={next}
            title="Next track"
            className="p-2.5 text-[#929292] hover:text-[#F3F0E9] active:scale-95 transition-transform"
          >
            <SkipForward className="w-6 h-6" />
          </button>

          <button
            onClick={cycleRepeat}
            title={`Repeat: ${repeat}`}
            className={`p-2.5 rounded transition-colors ${
              repeat !== 'off' ? 'text-[#C5A66B]' : 'text-[#666666] hover:text-[#F3F0E9]'
            }`}
          >
            {repeat === 'one' ? <Repeat1 className="w-5 h-5" /> : <Repeat className="w-5 h-5" />}
          </button>
        </div>

        {/* Volume & Details Footer */}
        <div className="flex items-center justify-between text-[#666666] pt-3 border-t border-[#292929]">
          <div className="flex items-center gap-3">
            <button
              onClick={toggleMute}
              className="hover:text-[#F3F0E9] transition-colors"
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-4 h-4" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>
            <div className="relative w-24 h-1 bg-[#202123] rounded-full overflow-hidden cursor-pointer">
              <div
                className="h-full bg-[#C5A66B]"
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

          <span className="text-xs font-mono text-[#666666]">
            {currentSong.language || 'Music'} • {currentSong.genre}
          </span>
        </div>
      </div>
    </div>
  );
};
