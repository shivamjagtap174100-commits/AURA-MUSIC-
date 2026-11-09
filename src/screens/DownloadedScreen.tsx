import React from 'react';
import { Download, Play, Shuffle, HardDrive, CheckCircle2, Trash2 } from 'lucide-react';
import { Song } from '../types';
import { useDownloads } from '../context/DownloadContext';
import { useAudio } from '../context/AudioContext';
import { SongRow } from '../components/SongRow';

interface DownloadedScreenProps {
  onNavigate: (tab: string, meta?: any) => void;
  onOpenPlaylistModal: (song: Song) => void;
}

export const DownloadedScreen: React.FC<DownloadedScreenProps> = ({
  onNavigate,
  onOpenPlaylistModal,
}) => {
  const { playSong } = useAudio();
  const { downloadedSongs, storageUsed, removeDownload } = useDownloads();

  const songs = downloadedSongs.map((d) => d.song);

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
    <div className="space-y-6 pb-32 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 p-6 sm:p-8 rounded-3xl bg-gradient-to-tr from-teal-950/80 via-cyan-950/40 to-slate-900 border border-teal-500/20 shadow-2xl">
        <div className="w-36 h-36 sm:w-44 sm:h-44 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-600 to-cyan-600 flex items-center justify-center shadow-2xl shrink-0">
          <Download className="w-20 h-20 text-white" />
        </div>

        <div className="text-center sm:text-left space-y-2 flex-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 text-xs font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>OFFLINE LOCAL STORAGE READY</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Downloaded Music
          </h1>

          <div className="flex items-center justify-center sm:justify-start gap-3 text-xs sm:text-sm text-slate-300">
            <span>{songs.length} Authorized tracks</span>
            <span>•</span>
            <span className="flex items-center gap-1 text-cyan-400 font-mono">
              <HardDrive className="w-3.5 h-3.5" />
              {storageUsed} local storage
            </span>
          </div>

          <div className="flex items-center justify-center sm:justify-start gap-3 pt-3">
            <button
              onClick={handlePlayAll}
              disabled={songs.length === 0}
              className="px-6 py-3 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-black font-bold text-sm shadow-xl shadow-cyan-600/30 flex items-center gap-2 hover:scale-105 active:scale-95 transition-all disabled:opacity-40"
            >
              <Play className="w-4 h-4 fill-black" />
              <span>Play Offline</span>
            </button>

            <button
              onClick={handleShuffle}
              disabled={songs.length === 0}
              className="p-3 rounded-full glass-pill hover:bg-white/10 text-white transition-colors disabled:opacity-40"
              title="Shuffle Offline Tracks"
            >
              <Shuffle className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Song List */}
      {songs.length === 0 ? (
        <div className="text-center py-20 text-slate-500">
          <Download className="w-16 h-16 mx-auto mb-3 opacity-20 text-cyan-400" />
          <h3 className="text-lg font-bold text-slate-300">No offline downloads yet</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Click the download button next to any song to store it locally for high quality offline listening with zero internet usage.
          </p>
        </div>
      ) : (
        <div className="glass-panel p-2 sm:p-3 rounded-3xl space-y-1">
          {songs.map((song, idx) => (
            <SongRow
              key={song.id}
              song={song}
              index={idx}
              queueContext={songs}
              onOpenPlaylistModal={onOpenPlaylistModal}
              onSelectArtist={(artistId) => onNavigate('artist-detail', { artistId })}
            />
          ))}
        </div>
      )}
    </div>
  );
};
