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
  CheckCircle2,
  Volume2,
  VolumeX,
  ListMusic,
  FileText,
  Share2,
  Sparkles,
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
    <div className="fixed inset-0 z-50 bg-[#08090e]/95 backdrop-blur-2xl flex flex-col justify-between overflow-hidden animate-in fade-in slide-in-from-bottom-10 duration-300">
      {/* Background Ambient Glow matching violet/teal aura */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-violet-600/20 blur-[130px] transition-all duration-1000"
          style={{ transform: isPlaying ? 'scale(1.1)' : 'scale(0.95)' }}
        />
        <div
          className="absolute -bottom-40 -right-40 w-[600px] h-[600px] rounded-full bg-cyan-600/20 blur-[130px] transition-all duration-1000"
          style={{ transform: isPlaying ? 'scale(1.15)' : 'scale(0.95)' }}
        />
      </div>

      {/* Top Header */}
      <div className="relative z-10 max-w-4xl w-full mx-auto px-6 py-5 flex items-center justify-between">
        <button
          onClick={() => setFullScreen(false)}
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.08] transition-colors"
          title="Minimize player"
        >
          <ChevronDown className="w-6 h-6" />
        </button>

        <div className="text-center">
          <span className="text-[11px] uppercase tracking-widest text-violet-400 font-bold">
            Playing From {currentSong.albumTitle ? `Album • ${currentSong.albumTitle}` : 'Aura Catalog'}
          </span>
          <h3 className="text-sm font-semibold text-slate-200 mt-0.5">AURA High Fidelity Audio</h3>
        </div>

        {/* Tab switcher: Art / Lyrics / Queue */}
        <div className="flex items-center gap-1 bg-white/[0.05] p-1 rounded-xl border border-white/[0.08]">
          <button
            onClick={() => setActiveTab('art')}
            className={`p-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeTab === 'art' ? 'bg-violet-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
            title="Artwork"
          >
            <Sparkles className="w-4 h-4" />
          </button>
          <button
            onClick={() => setActiveTab('lyrics')}
            className={`p-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeTab === 'lyrics' ? 'bg-violet-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
            title="Lyrics"
          >
            <FileText className="w-4 h-4" />
          </button>
          <button
            onClick={() => setActiveTab('queue')}
            className={`p-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeTab === 'queue' ? 'bg-violet-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
            title="Queue"
          >
            <ListMusic className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Center Area: Artwork, Lyrics, or Queue */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-6 py-4 max-w-2xl w-full mx-auto">
        {activeTab === 'art' && (
          <div className="flex flex-col items-center">
            {/* Animated Album Art Container */}
            <div className="relative group">
              <div
                className={`relative w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 rounded-3xl overflow-hidden shadow-2xl transition-transform duration-700 ease-out border border-white/10 ${
                  isPlaying ? 'scale-100 shadow-violet-500/20' : 'scale-95 shadow-black/80'
                }`}
              >
                <img
                  src={currentSong.coverUrl}
                  alt={currentSong.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Glowing Aura Ring */}
              <div
                className={`absolute -inset-4 rounded-3xl bg-gradient-to-tr from-violet-600/30 via-transparent to-cyan-500/30 blur-2xl -z-10 transition-opacity duration-1000 ${
                  isPlaying ? 'opacity-100' : 'opacity-30'
                }`}
              />
            </div>
          </div>
        )}

        {activeTab === 'lyrics' && (
          <div className="w-full h-[380px] sm:h-[460px] overflow-y-auto px-4 py-6 rounded-2xl glass-panel text-center">
            <h4 className="text-xs uppercase tracking-widest text-cyan-400 font-bold mb-4">
              Lyrics & Vocal Flow
            </h4>
            {currentSong.lyrics ? (
              <pre className="font-sans text-sm sm:text-base leading-loose text-slate-200 whitespace-pre-wrap select-text">
                {currentSong.lyrics}
              </pre>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 text-sm">
                <FileText className="w-10 h-10 mb-2 opacity-30 text-violet-400" />
                <p>Instrumental or licensed ambient track.</p>
                <p className="text-xs text-slate-500 mt-1">Enjoy the acoustic vibes!</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'queue' && (
          <div className="w-full h-[380px] sm:h-[460px] overflow-y-auto px-2 py-4 rounded-2xl glass-panel">
            <h4 className="text-xs uppercase tracking-widest text-cyan-400 font-bold mb-3 px-3">
              Up Next ({queue.length} songs)
            </h4>
            <div className="space-y-1">
              {queue.map((qSong, idx) => {
                const isItemCurrent = qSong.id === currentSong.id;
                return (
                  <div
                    key={`${qSong.id}-${idx}`}
                    className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm ${
                      isItemCurrent
                        ? 'bg-violet-950/50 border border-violet-500/30 text-cyan-300 font-semibold'
                        : 'text-slate-300 hover:bg-white/[0.04]'
                    }`}
                  >
                    <span className="w-5 text-xs text-slate-500">{idx + 1}</span>
                    <img
                      src={qSong.coverUrl}
                      alt={qSong.title}
                      className="w-9 h-9 rounded-lg object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="truncate">{qSong.title}</p>
                      <p className="text-xs text-slate-400 truncate">{qSong.artistName}</p>
                    </div>
                    <span className="text-xs text-slate-500 font-mono">
                      {formatTime(qSong.duration)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Controls Section */}
      <div className="relative z-10 max-w-2xl w-full mx-auto px-6 pb-8 pt-2">
        {/* Track Title, Artist & Quality Badge */}
        <div className="flex items-center justify-between mb-4">
          <div className="min-w-0 flex-1 pr-4">
            <div className="flex items-center gap-2.5">
              <h2 className="text-xl sm:text-2xl font-bold text-white truncate">
                {currentSong.title}
              </h2>
              <AudioQualityBadge quality={currentSong.audioQuality} />
            </div>
            <p className="text-sm sm:text-base text-slate-400 truncate mt-0.5">
              {currentSong.artistName}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleLikeToggle}
              title={isLiked ? 'Liked' : 'Like'}
              className="p-2.5 rounded-full glass-pill hover:bg-white/10 transition-colors"
            >
              <Heart
                className={`w-5 h-5 transition-transform active:scale-75 ${
                  isLiked ? 'text-pink-500 fill-pink-500' : 'text-slate-300'
                }`}
              />
            </button>

            <button
              onClick={handleDownloadToggle}
              title={downloaded ? 'Downloaded (Offline ready)' : 'Download for offline'}
              className="p-2.5 rounded-full glass-pill hover:bg-white/10 transition-colors"
            >
              {downloaded ? (
                <CheckCircle2 className="w-5 h-5 text-cyan-400" />
              ) : (
                <Download className="w-5 h-5 text-slate-300" />
              )}
            </button>
          </div>
        </div>

        {/* Scrubbing Seek Bar */}
        <div className="space-y-1 mb-5">
          <div className="relative w-full h-2 bg-white/10 rounded-full overflow-hidden cursor-pointer group">
            <div
              className="h-full bg-gradient-to-r from-violet-500 via-purple-500 to-cyan-400 rounded-full relative"
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
          <div className="flex justify-between text-xs font-mono text-slate-400">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Playback Controls (Shuffle, Prev, Play/Pause, Next, Repeat) */}
        <div className="flex items-center justify-between px-4 mb-6">
          <button
            onClick={toggleShuffle}
            title={`Shuffle: ${shuffle ? 'On' : 'Off'}`}
            className={`p-3 rounded-full transition-colors ${
              shuffle ? 'text-cyan-400 bg-cyan-950/50' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Shuffle className="w-5 h-5" />
          </button>

          <button
            onClick={previous}
            title="Previous track"
            className="p-3 text-slate-200 hover:text-white hover:scale-110 active:scale-90 transition-transform"
          >
            <SkipBack className="w-7 h-7" />
          </button>

          <button
            onClick={togglePlayPause}
            title={isPlaying ? 'Pause' : 'Play'}
            className="w-16 h-16 rounded-full bg-gradient-to-tr from-violet-500 to-cyan-400 hover:from-violet-400 hover:to-cyan-300 text-black flex items-center justify-center shadow-xl shadow-violet-500/30 hover:scale-105 active:scale-95 transition-all"
          >
            {isPlaying ? (
              <Pause className="w-7 h-7 fill-black" />
            ) : (
              <Play className="w-7 h-7 fill-black ml-1" />
            )}
          </button>

          <button
            onClick={next}
            title="Next track"
            className="p-3 text-slate-200 hover:text-white hover:scale-110 active:scale-90 transition-transform"
          >
            <SkipForward className="w-7 h-7" />
          </button>

          <button
            onClick={cycleRepeat}
            title={`Repeat mode: ${repeat}`}
            className={`p-3 rounded-full transition-colors ${
              repeat !== 'off' ? 'text-cyan-400 bg-cyan-950/50' : 'text-slate-400 hover:text-white'
            }`}
          >
            {repeat === 'one' ? <Repeat1 className="w-5 h-5" /> : <Repeat className="w-5 h-5" />}
          </button>
        </div>

        {/* Volume & Details Footer */}
        <div className="flex items-center justify-between text-slate-400 pt-2 border-t border-white/[0.06]">
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
            <div className="relative w-24 h-1.5 bg-white/10 rounded-full overflow-hidden cursor-pointer">
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
                onChange={handleVolume}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500 font-mono">
              {currentSong.bitrate || '320 kbps'} • {currentSong.genre}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
