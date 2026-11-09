import React from 'react';
import { X, Check, Plus, Music } from 'lucide-react';
import { Song, Playlist } from '../types';
import { catalogService } from '../services/catalogService';

interface AddToPlaylistModalProps {
  song: Song | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenCreatePlaylist: () => void;
}

export const AddToPlaylistModal: React.FC<AddToPlaylistModalProps> = ({
  song,
  isOpen,
  onClose,
  onOpenCreatePlaylist,
}) => {
  if (!isOpen || !song) return null;

  const playlists = catalogService.getPlaylists();

  const handleToggleSongInPlaylist = (playlist: Playlist) => {
    if (playlist.songIds.includes(song.id)) {
      catalogService.removeSongFromPlaylist(playlist.id, song.id);
    } else {
      catalogService.addSongToPlaylist(playlist.id, song.id);
    }
    // Re-render
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm p-6 rounded-3xl glass-dropdown border border-white/10 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full hover:bg-white/[0.08]"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-base font-bold text-white mb-1">Add to Playlist</h3>
        <p className="text-xs text-slate-400 truncate mb-4">
          Choose a playlist for <span className="text-cyan-400 font-semibold">{song.title}</span>
        </p>

        <button
          onClick={() => {
            onClose();
            onOpenCreatePlaylist();
          }}
          className="w-full flex items-center justify-center gap-2 py-2.5 mb-3 rounded-xl bg-violet-600/30 hover:bg-violet-600/50 border border-violet-500/40 text-violet-300 font-semibold text-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>New Playlist</span>
        </button>

        <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1">
          {playlists.map((pl) => {
            const hasSong = pl.songIds.includes(song.id);
            return (
              <div
                key={pl.id}
                onClick={() => handleToggleSongInPlaylist(pl)}
                className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-colors ${
                  hasSong
                    ? 'bg-cyan-950/40 border border-cyan-500/30'
                    : 'hover:bg-white/[0.05] border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <img
                    src={pl.coverUrl}
                    alt={pl.title}
                    className="w-9 h-9 rounded-lg object-cover"
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-200 truncate">{pl.title}</p>
                    <p className="text-[10px] text-slate-500">{pl.songIds.length} songs</p>
                  </div>
                </div>

                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center border ${
                    hasSong
                      ? 'bg-cyan-400 border-cyan-400 text-black'
                      : 'border-white/20 text-transparent'
                  }`}
                >
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
