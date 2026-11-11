import React, { useState } from 'react';
import { Play, Shuffle, Edit2, Trash2, Check, X, ArrowLeft, Plus } from 'lucide-react';
import type { Song } from '../types/index.ts';
import { catalogService } from '../services/catalogService';
import { useAudio } from '../context/AudioContext';
import { SongRow } from '../components/SongRow';

interface PlaylistDetailScreenProps {
  playlistId: string;
  onNavigate: (tab: string, meta?: any) => void;
  onOpenPlaylistModal: (song: Song) => void;
}

export const PlaylistDetailScreen: React.FC<PlaylistDetailScreenProps> = ({
  playlistId,
  onNavigate,
  onOpenPlaylistModal,
}) => {
  const { playSong } = useAudio();
  const playlist = catalogService.getPlaylistById(playlistId);

  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(playlist?.title || '');
  const [description, setDescription] = useState(playlist?.description || '');

  if (!playlist) {
    return (
      <div className="text-center py-20 text-[#666666]">
        <p className="text-sm font-medium text-[#929292]">Playlist not found</p>
        <button
          onClick={() => onNavigate('library')}
          className="mt-3 px-3 py-1.5 bg-[#171819] text-xs font-medium text-[#F3F0E9] rounded-lg border border-[#292929]"
        >
          Return to Library
        </button>
      </div>
    );
  }

  const songs = playlist.songIds
    .map((id) => catalogService.getSongById(id))
    .filter((s): s is Song => Boolean(s));

  const totalDuration = songs.reduce((sum, s) => sum + s.duration, 0);
  const mins = Math.floor(totalDuration / 60);

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

  const handleSaveEdit = () => {
    if (!title.trim()) return;
    catalogService.renamePlaylist(playlist.id, title.trim(), description.trim());
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (window.confirm(`Delete playlist "${playlist.title}"?`)) {
      catalogService.deletePlaylist(playlist.id);
      onNavigate('library');
    }
  };

  return (
    <div className="space-y-6 pb-36 select-none animate-in fade-in duration-150">
      <button
        onClick={() => onNavigate('library')}
        className="inline-flex items-center gap-1.5 text-xs text-[#929292] hover:text-[#C5A66B] transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to library</span>
      </button>

      {/* Playlist Header */}
      <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 p-6 rounded-2xl bg-[#171819] border border-[#292929] shadow-xl">
        <div className="relative w-36 h-36 sm:w-44 sm:h-44 rounded-xl overflow-hidden shrink-0 bg-[#101112] border border-[#292929] shadow-2xl">
          <img
            src={playlist.coverUrl}
            alt={playlist.title}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="text-center sm:text-left space-y-2 flex-1">
          <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#C5A66B] font-semibold">
            Curated Playlist
          </span>

          {isEditing ? (
            <div className="space-y-2">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-1.5 bg-[#101112] border border-[#C5A66B] rounded-lg text-xl font-bold text-[#F3F0E9] focus:outline-none"
              />
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="w-full px-3 py-1.5 bg-[#101112] border border-[#292929] rounded-lg text-xs text-[#929292] focus:outline-none resize-none"
              />
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSaveEdit}
                  className="px-3.5 py-1 bg-[#C5A66B] hover:bg-[#D8BF91] text-[#08090A] rounded-lg text-xs font-semibold flex items-center gap-1 shadow-sm"
                >
                  <Check className="w-3 h-3" /> Save
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1 bg-[#202123] hover:bg-[#28292c] text-[#F3F0E9] rounded-lg text-xs flex items-center gap-1"
                >
                  <X className="w-3 h-3" /> Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <h1 className="text-2xl sm:text-4xl font-extrabold text-[#F3F0E9] tracking-tight font-['Manrope']">
                {playlist.title}
              </h1>
              {playlist.description && (
                <p className="text-xs text-[#929292] max-w-lg leading-relaxed">
                  {playlist.description}
                </p>
              )}
            </>
          )}

          <div className="flex items-center justify-center sm:justify-start gap-2 text-xs text-[#666666] font-mono">
            <span>By {playlist.creatorName}</span>
            <span>•</span>
            <span>{songs.length} songs, {mins} mins</span>
          </div>

          <div className="flex items-center justify-center sm:justify-start gap-2.5 pt-2">
            <button
              onClick={handlePlayAll}
              disabled={songs.length === 0}
              className="px-6 py-2.5 rounded-full bg-[#C5A66B] hover:bg-[#D8BF91] text-[#08090A] font-bold text-xs flex items-center gap-1.5 shadow-md disabled:opacity-40"
            >
              <Play className="w-3.5 h-3.5 fill-[#08090A]" />
              <span>Play</span>
            </button>

            <button
              onClick={handleShuffle}
              disabled={songs.length === 0}
              className="p-2.5 rounded-full bg-[#202123] hover:bg-[#28292c] text-[#F3F0E9] hover:text-[#C5A66B] transition-colors border border-[#292929] disabled:opacity-40"
              title="Shuffle Playlist"
            >
              <Shuffle className="w-4 h-4" />
            </button>

            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="p-2.5 rounded-full bg-[#202123] hover:bg-[#28292c] text-[#929292] hover:text-[#F3F0E9] transition-colors border border-[#292929]"
                title="Edit Playlist"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              onClick={handleDelete}
              className="p-2.5 rounded-full bg-[#202123] hover:bg-rose-950/40 text-[#666666] hover:text-rose-400 transition-colors border border-[#292929]"
              title="Delete Playlist"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Playlist Tracks */}
      {songs.length === 0 ? (
        <div className="text-center py-16 text-[#666666] rounded-2xl bg-[#171819] border border-[#292929]">
          <p className="text-sm font-medium text-[#F3F0E9]">Playlist is empty</p>
          <p className="text-xs text-[#929292] mt-1">Search for music to add tracks to this collection.</p>
        </div>
      ) : (
        <div className="rounded-2xl bg-[#171819] border border-[#292929] p-3 space-y-1 shadow-sm">
          {songs.map((song, idx) => (
            <SongRow
              key={`${song.id}-${idx}`}
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
