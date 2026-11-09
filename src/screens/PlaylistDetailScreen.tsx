import React, { useState } from 'react';
import { Play, Shuffle, Edit3, Trash2, Music, Check, X, ArrowUp, ArrowDown } from 'lucide-react';
import { Song, Playlist } from '../types';
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
      <div className="text-center py-24 text-slate-500">
        <Music className="w-16 h-16 mx-auto mb-3 opacity-30 text-violet-400" />
        <h3 className="text-lg font-bold text-slate-300">Playlist not found</h3>
        <button
          onClick={() => onNavigate('library')}
          className="mt-4 px-4 py-2 bg-violet-600 text-white text-xs font-semibold rounded-xl"
        >
          Return to Library
        </button>
      </div>
    );
  }

  // Resolve playlist songs
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
    if (window.confirm(`Are you sure you want to delete "${playlist.title}"?`)) {
      catalogService.deletePlaylist(playlist.id);
      onNavigate('library');
    }
  };

  const handleRemoveSong = (songId: string) => {
    catalogService.removeSongFromPlaylist(playlist.id, songId);
    // Force re-render by updating local state
    setTitle((t) => t);
  };

  return (
    <div className="space-y-6 pb-32 animate-in fade-in duration-200">
      {/* Playlist Header */}
      <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 p-6 sm:p-8 rounded-3xl bg-gradient-to-tr from-violet-950/80 via-slate-900 to-cyan-950/40 border border-white/10 shadow-2xl">
        <div className="relative w-40 h-40 sm:w-48 sm:h-48 rounded-2xl overflow-hidden shadow-2xl shrink-0 border border-white/10">
          <img
            src={playlist.coverUrl}
            alt={playlist.title}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="text-center sm:text-left space-y-2 flex-1">
          <span className="text-xs font-bold uppercase tracking-widest text-violet-400">
            Playlist
          </span>

          {isEditing ? (
            <div className="space-y-2">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-1.5 bg-black/60 border border-violet-500 rounded-lg text-xl sm:text-2xl font-bold text-white focus:outline-none"
              />
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="w-full px-3 py-1 bg-black/60 border border-white/20 rounded-lg text-xs text-slate-300 focus:outline-none resize-none"
              />
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSaveEdit}
                  className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1"
                >
                  <Check className="w-3.5 h-3.5" /> Save
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs flex items-center gap-1"
                >
                  <X className="w-3.5 h-3.5" /> Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                {playlist.title}
              </h1>
              {playlist.description && (
                <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
                  {playlist.description}
                </p>
              )}
            </>
          )}

          <div className="flex items-center justify-center sm:justify-start gap-2 text-xs text-slate-400">
            <span>By {playlist.creatorName}</span>
            <span>•</span>
            <span>{songs.length} songs, {mins} mins</span>
          </div>

          <div className="flex items-center justify-center sm:justify-start gap-3 pt-3">
            <button
              onClick={handlePlayAll}
              disabled={songs.length === 0}
              className="px-6 py-3 rounded-full bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 text-white font-bold text-sm shadow-xl shadow-violet-600/30 flex items-center gap-2 hover:scale-105 active:scale-95 transition-all disabled:opacity-40"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Play All</span>
            </button>

            <button
              onClick={handleShuffle}
              disabled={songs.length === 0}
              className="p-3 rounded-full glass-pill hover:bg-white/10 text-white transition-colors disabled:opacity-40"
              title="Shuffle Playlist"
            >
              <Shuffle className="w-4 h-4" />
            </button>

            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="p-3 rounded-full glass-pill hover:bg-white/10 text-white transition-colors"
                title="Edit Playlist"
              >
                <Edit3 className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={handleDelete}
              className="p-3 rounded-full glass-pill hover:bg-rose-500/20 text-rose-400 transition-colors"
              title="Delete Playlist"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Songs in Playlist */}
      {songs.length === 0 ? (
        <div className="text-center py-20 text-slate-500">
          <Music className="w-16 h-16 mx-auto mb-3 opacity-20 text-violet-400" />
          <h3 className="text-lg font-bold text-slate-300">This playlist is empty</h3>
          <p className="text-xs text-slate-500 mt-1">
            Search for songs and click the three dots or 'Add to Playlist' to build this mix.
          </p>
        </div>
      ) : (
        <div className="glass-panel p-2 sm:p-3 rounded-3xl space-y-1">
          {songs.map((song, idx) => (
            <div key={`${song.id}-${idx}`} className="relative group">
              <SongRow
                song={song}
                index={idx}
                queueContext={songs}
                onOpenPlaylistModal={onOpenPlaylistModal}
                onSelectArtist={(artistId) => onNavigate('artist-detail', { artistId })}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
