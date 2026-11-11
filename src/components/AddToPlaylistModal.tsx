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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150 select-none">
      <div className="relative w-full max-w-sm p-5 rounded-2xl bg-[#171819] border border-[#292929] shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-[#666666] hover:text-[#F3F0E9] rounded-md hover:bg-[#202123] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <h3 className="text-sm font-bold text-[#F3F0E9] mb-0.5 font-['Manrope']">Add to Playlist</h3>
        <p className="text-xs text-[#929292] truncate mb-3">
          Select playlist for <span className="text-[#C5A66B] font-medium">{song.title}</span>
        </p>

        <button
          onClick={() => {
            onClose();
            onOpenCreatePlaylist();
          }}
          className="w-full flex items-center justify-center gap-2 py-2 mb-3 rounded-lg bg-[#202123] hover:bg-[#28292c] border border-[#292929] text-[#F3F0E9] font-medium text-xs transition-colors"
        >
          <Plus className="w-3.5 h-3.5 text-[#C5A66B]" />
          <span>Create New Playlist</span>
        </button>

        <div className="max-h-56 overflow-y-auto space-y-1 pr-1">
          {playlists.map((pl) => {
            const hasSong = pl.songIds.includes(song.id);
            return (
              <div
                key={pl.id}
                onClick={() => handleToggleSongInPlaylist(pl)}
                className={`flex items-center justify-between p-2 rounded-xl cursor-pointer transition-colors ${
                  hasSong
                    ? 'bg-[#202123] text-[#C5A66B] border border-[#C5A66B]/20'
                    : 'hover:bg-[#202123] text-[#F3F0E9]'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <img
                    src={pl.coverUrl}
                    alt=""
                    className="w-8 h-8 rounded-lg object-cover bg-[#101112]"
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-medium truncate">{pl.title}</p>
                    <p className="text-[10px] text-[#666666]">{pl.songIds.length} tracks</p>
                  </div>
                </div>

                <div
                  className={`w-4 h-4 rounded-full flex items-center justify-center border ${
                    hasSong
                      ? 'bg-[#C5A66B] border-[#C5A66B] text-[#08090A]'
                      : 'border-[#444444] text-transparent'
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
