import React from 'react';
import { X, Check, Plus } from 'lucide-react';
import type { Song, Playlist } from '../types/index.ts';
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
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150 select-none">
      <div className="relative w-full max-w-sm p-5 rounded-xl bg-[#181818] border border-[#2b2b2b] shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-[#737373] hover:text-white rounded-md hover:bg-[#242424] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <h3 className="text-sm font-semibold text-[#F5F5F5] mb-0.5">Add to Playlist</h3>
        <p className="text-xs text-[#737373] truncate mb-3">
          Select playlist for <span className="text-[#D4D4D4] font-medium">{song.title}</span>
        </p>

        <button
          onClick={() => {
            onClose();
            onOpenCreatePlaylist();
          }}
          className="w-full flex items-center justify-center gap-2 py-2 mb-3 rounded-lg bg-[#202020] hover:bg-[#262626] border border-[#2b2b2b] text-[#F5F5F5] font-medium text-xs transition-colors"
        >
          <Plus className="w-3.5 h-3.5 text-[#B7A0FF]" />
          <span>New Playlist</span>
        </button>

        <div className="max-h-56 overflow-y-auto space-y-1 pr-1">
          {playlists.map((pl) => {
            const hasSong = pl.songIds.includes(song.id);
            return (
              <div
                key={pl.id}
                onClick={() => handleToggleSongInPlaylist(pl)}
                className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
                  hasSong
                    ? 'bg-[#221f2d] text-[#B7A0FF]'
                    : 'hover:bg-[#202020] text-[#D4D4D4]'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <img
                    src={pl.coverUrl}
                    alt=""
                    className="w-8 h-8 rounded object-cover bg-[#242424]"
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-medium truncate">{pl.title}</p>
                    <p className="text-[10px] text-[#737373]">{pl.songIds.length} tracks</p>
                  </div>
                </div>

                <div
                  className={`w-4 h-4 rounded-full flex items-center justify-center border ${
                    hasSong
                      ? 'bg-[#B7A0FF] border-[#B7A0FF] text-black'
                      : 'border-[#404040] text-transparent'
                  }`}
                >
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
