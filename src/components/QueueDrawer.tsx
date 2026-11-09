import React from 'react';
import { X, Trash2, ArrowUp, ArrowDown, ListMusic } from 'lucide-react';
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
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-88 bg-[#181818] border-l border-[#262626] shadow-2xl flex flex-col animate-in slide-in-from-right duration-150 select-none">
      {/* Header */}
      <div className="px-5 py-3.5 border-b border-[#262626] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ListMusic className="w-4 h-4 text-[#B7A0FF]" />
          <h3 className="font-semibold text-[#F5F5F5] text-sm">Playback Queue</h3>
          <span className="text-xs font-mono text-[#737373]">({queue.length})</span>
        </div>
        <div className="flex items-center gap-2">
          {queue.length > 1 && (
            <button
              onClick={clearQueue}
              className="text-xs text-[#737373] hover:text-rose-400 px-2 py-1 rounded transition-colors"
            >
              Clear
            </button>
          )}
          <button
            onClick={() => setQueueOpen(false)}
            className="p-1.5 text-[#737373] hover:text-white rounded hover:bg-[#262626] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Queue Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Currently Playing Card */}
        {currentSong && (
          <div>
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#737373] mb-2 block">
              Now Playing
            </span>
            <div className="p-3 rounded-lg bg-[#202020] border border-[#2b2b2b] flex items-center gap-3">
              <img
                src={currentSong.coverUrl}
                alt={currentSong.title}
                className="w-10 h-10 rounded object-cover bg-[#242424]"
              />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-[#F5F5F5] truncate">{currentSong.title}</p>
                <p className="text-[11px] text-[#A1A1A1] truncate">{currentSong.artistName}</p>
              </div>
              <EqualizerBars isPlaying={isPlaying} size="sm" />
            </div>
          </div>
        )}

        {/* Up Next List */}
        <div>
          <span className="text-[11px] font-mono uppercase tracking-wider text-[#737373] mb-2 block">
            Up Next
          </span>
          {queue.length <= 1 ? (
            <div className="text-center py-12 text-[#737373] text-xs">
              Queue is empty. Select songs to play next.
            </div>
          ) : (
            <div className="space-y-1">
              {queue.map((song, idx) => {
                if (idx === queueIndex) return null;
                return (
                  <div
                    key={`${song.id}-${idx}`}
                    className="group flex items-center gap-2.5 p-2 rounded-lg hover:bg-[#202020] transition-colors"
                  >
                    <img
                      src={song.coverUrl}
                      alt={song.title}
                      className="w-9 h-9 rounded object-cover bg-[#242424]"
                    />
                    <div
                      onClick={() => playSong(song, queue, idx)}
                      className="flex-1 min-w-0 cursor-pointer"
                    >
                      <p className="text-xs font-medium text-[#D4D4D4] group-hover:text-white truncate">
                        {song.title}
                      </p>
                      <p className="text-[11px] text-[#737373] truncate">{song.artistName}</p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      {idx > 0 && (
                        <button
                          onClick={() => reorderQueue(idx, idx - 1)}
                          title="Move up"
                          className="p-1 text-[#737373] hover:text-white"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {idx < queue.length - 1 && (
                        <button
                          onClick={() => reorderQueue(idx, idx + 1)}
                          title="Move down"
                          className="p-1 text-[#737373] hover:text-white"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => removeFromQueue(idx)}
                        title="Remove"
                        className="p-1 text-[#737373] hover:text-rose-400"
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
