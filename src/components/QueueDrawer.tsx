import React from 'react';
import { X, Play, Trash2, ArrowUp, ArrowDown, Music } from 'lucide-react';
import { useAudio } from '../context/AudioContext';
import { EqualizerBars } from './EqualizerBars';

export const QueueDrawer: React.FC = () => {
  const {
    queue,
    queueIndex,
    currentSong,
    isPlaying,
    isQueueOpen,
    setQueueOpen,
    playSong,
    removeFromQueue,
    reorderQueue,
    clearQueue,
  } = useAudio();

  if (!isQueueOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-96 glass-dropdown shadow-2xl flex flex-col border-l border-white/[0.1] animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="px-5 py-4 border-b border-white/[0.08] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Music className="w-5 h-5 text-violet-400" />
          <h3 className="font-bold text-white text-base">Playback Queue</h3>
          <span className="text-xs text-slate-400 font-mono">({queue.length})</span>
        </div>
        <div className="flex items-center gap-2">
          {queue.length > 1 && (
            <button
              onClick={clearQueue}
              className="text-xs text-rose-400 hover:text-rose-300 px-2 py-1 rounded-lg hover:bg-rose-500/10 transition-colors"
            >
              Clear
            </button>
          )}
          <button
            onClick={() => setQueueOpen(false)}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/[0.08]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Queue Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Currently Playing Card */}
        {currentSong && (
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400 mb-2 block">
              Now Playing
            </span>
            <div className="p-3 rounded-2xl bg-gradient-to-tr from-violet-950/60 to-cyan-950/40 border border-violet-500/30 flex items-center gap-3">
              <img
                src={currentSong.coverUrl}
                alt={currentSong.title}
                className="w-12 h-12 rounded-xl object-cover shadow-md"
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-white truncate">{currentSong.title}</p>
                <p className="text-xs text-slate-300 truncate">{currentSong.artistName}</p>
              </div>
              <EqualizerBars isPlaying={isPlaying} size="sm" />
            </div>
          </div>
        )}

        {/* Up Next List */}
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 block">
            Up Next
          </span>
          {queue.length <= 1 ? (
            <div className="text-center py-10 text-slate-500 text-xs">
              Queue is empty. Add songs to keep the music playing!
            </div>
          ) : (
            <div className="space-y-1.5">
              {queue.map((song, idx) => {
                if (idx === queueIndex) return null; // Already shown in Now Playing
                return (
                  <div
                    key={`${song.id}-${idx}`}
                    className="group flex items-center gap-2.5 p-2 rounded-xl hover:bg-white/[0.06] transition-colors"
                  >
                    <img
                      src={song.coverUrl}
                      alt={song.title}
                      className="w-10 h-10 rounded-lg object-cover"
                    />
                    <div
                      onClick={() => playSong(song, queue, idx)}
                      className="flex-1 min-w-0 cursor-pointer"
                    >
                      <p className="text-xs font-semibold text-slate-200 group-hover:text-cyan-400 truncate">
                        {song.title}
                      </p>
                      <p className="text-[11px] text-slate-400 truncate">{song.artistName}</p>
                    </div>

                    {/* Reorder and Delete actions */}
                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      {idx > 0 && (
                        <button
                          onClick={() => reorderQueue(idx, idx - 1)}
                          title="Move up"
                          className="p-1 text-slate-400 hover:text-white"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {idx < queue.length - 1 && (
                        <button
                          onClick={() => reorderQueue(idx, idx + 1)}
                          title="Move down"
                          className="p-1 text-slate-400 hover:text-white"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => removeFromQueue(idx)}
                        title="Remove from queue"
                        className="p-1 text-slate-400 hover:text-rose-400"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
