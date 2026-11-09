import React, { useState } from 'react';
import {
  Music,
  Heart,
  Download,
  ListMusic,
  Disc,
  User,
  Clock,
  Plus,
  Play,
} from 'lucide-react';
import { Song, Album, Artist, Playlist } from '../types';
import { catalogService } from '../services/catalogService';
import { useDownloads } from '../context/DownloadContext';
import { useAudio } from '../context/AudioContext';
import { SongRow } from '../components/SongRow';
import { AlbumCard } from '../components/AlbumCard';
import { ArtistCard } from '../components/ArtistCard';
import { PlaylistCard } from '../components/PlaylistCard';

interface LibraryScreenProps {
  onNavigate: (tab: string, meta?: any) => void;
  onOpenPlaylistModal: (song: Song) => void;
  onCreatePlaylist: () => void;
}

type LibraryTab = 'all' | 'liked' | 'downloaded' | 'playlists' | 'albums' | 'artists' | 'recent';

export const LibraryScreen: React.FC<LibraryScreenProps> = ({
  onNavigate,
  onOpenPlaylistModal,
  onCreatePlaylist,
}) => {
  const [activeTab, setActiveTab] = useState<LibraryTab>('all');
  const { playSong } = useAudio();
  const { downloadedSongs, storageUsed } = useDownloads();

  const allSongs = catalogService.getSongs();
  const likedSongs = catalogService.getLikedSongs();
  const playlists = catalogService.getPlaylists();
  const albums = catalogService.getAlbums();
  const artists = catalogService.getArtists();
  const recent = catalogService.getRecentlyPlayed();

  const tabs = [
    { id: 'all', label: 'All Songs', icon: Music, count: allSongs.length },
    { id: 'liked', label: 'Liked Songs', icon: Heart, count: likedSongs.length },
    { id: 'downloaded', label: 'Downloaded', icon: Download, count: downloadedSongs.length },
    { id: 'playlists', label: 'Playlists', icon: ListMusic, count: playlists.length },
    { id: 'albums', label: 'Albums', icon: Disc, count: albums.length },
    { id: 'artists', label: 'Artists', icon: User, count: artists.length },
    { id: 'recent', label: 'Recently Played', icon: Clock, count: recent.length },
  ];

  const handlePlayAll = (songs: Song[]) => {
    if (songs.length > 0) {
      playSong(songs[0], songs, 0);
    }
  };

  return (
    <div className="space-y-6 pb-32 animate-in fade-in duration-200">
      {/* Library Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Your Music Library</h1>
          <p className="text-xs text-slate-400 mt-1">
            Browse and manage your saved songs, playlists, downloads, and favorites
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onCreatePlaylist}
            className="px-4 py-2 rounded-xl bg-violet-600/30 hover:bg-violet-600/50 border border-violet-500/40 text-violet-300 text-xs font-semibold flex items-center gap-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>New Playlist</span>
          </button>
        </div>
      </div>

      {/* Tab Pills */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as LibraryTab)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-violet-600 to-cyan-500 text-white shadow-md shadow-violet-600/30'
                  : 'bg-white/[0.04] text-slate-400 hover:text-white hover:bg-white/[0.08]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  isActive ? 'bg-black/20 text-white' : 'bg-white/10 text-slate-400'
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Content for Active Tab */}
      <div>
        {activeTab === 'all' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium">
                {allSongs.length} Tracks Available
              </span>
              <button
                onClick={() => handlePlayAll(allSongs)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-xs font-semibold hover:bg-cyan-900/40"
              >
                <Play className="w-3.5 h-3.5 fill-cyan-300" />
                <span>Play All</span>
              </button>
            </div>
            <div className="glass-panel p-2 rounded-2xl space-y-1">
              {allSongs.map((song, idx) => (
                <SongRow
                  key={song.id}
                  song={song}
                  index={idx}
                  queueContext={allSongs}
                  onOpenPlaylistModal={onOpenPlaylistModal}
                  onSelectArtist={(artistId) => onNavigate('artist-detail', { artistId })}
                />
              ))}
            </div>
          </div>
        )}

        {activeTab === 'liked' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium">
                {likedSongs.length} Liked Tracks
              </span>
              {likedSongs.length > 0 && (
                <button
                  onClick={() => handlePlayAll(likedSongs)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-pink-950/60 border border-pink-500/30 text-pink-300 text-xs font-semibold hover:bg-pink-900/40"
                >
                  <Play className="w-3.5 h-3.5 fill-pink-300" />
                  <span>Play Liked</span>
                </button>
              )}
            </div>
            {likedSongs.length === 0 ? (
              <div className="text-center py-16 text-slate-500">
                <Heart className="w-12 h-12 mx-auto mb-3 opacity-30 text-pink-400" />
                <p className="font-semibold text-slate-400">No liked songs yet</p>
                <p className="text-xs text-slate-500 mt-1">
                  Click the heart icon on any song to save it here!
                </p>
              </div>
            ) : (
              <div className="glass-panel p-2 rounded-2xl space-y-1">
                {likedSongs.map((song, idx) => (
                  <SongRow
                    key={song.id}
                    song={song}
                    index={idx}
                    queueContext={likedSongs}
                    onOpenPlaylistModal={onOpenPlaylistModal}
                    onSelectArtist={(artistId) => onNavigate('artist-detail', { artistId })}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'downloaded' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium">
                {downloadedSongs.length} Tracks Offline • Storage Used: {storageUsed}
              </span>
              {downloadedSongs.length > 0 && (
                <button
                  onClick={() => handlePlayAll(downloadedSongs.map((d) => d.song))}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-950/60 border border-teal-500/30 text-teal-300 text-xs font-semibold hover:bg-teal-900/40"
                >
                  <Play className="w-3.5 h-3.5 fill-teal-300" />
                  <span>Play Offline</span>
                </button>
              )}
            </div>
            {downloadedSongs.length === 0 ? (
              <div className="text-center py-16 text-slate-500">
                <Download className="w-12 h-12 mx-auto mb-3 opacity-30 text-cyan-400" />
                <p className="font-semibold text-slate-400">No downloaded songs</p>
                <p className="text-xs text-slate-500 mt-1">
                  Download songs to play them seamlessly even when disconnected from the internet.
                </p>
              </div>
            ) : (
              <div className="glass-panel p-2 rounded-2xl space-y-1">
                {downloadedSongs.map((d, idx) => (
                  <SongRow
                    key={d.songId}
                    song={d.song}
                    index={idx}
                    queueContext={downloadedSongs.map((item) => item.song)}
                    onOpenPlaylistModal={onOpenPlaylistModal}
                    onSelectArtist={(artistId) => onNavigate('artist-detail', { artistId })}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'playlists' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {playlists.map((pl) => (
              <PlaylistCard
                key={pl.id}
                playlist={pl}
                onClick={() => onNavigate('playlist-detail', { playlistId: pl.id })}
              />
            ))}
          </div>
        )}

        {activeTab === 'albums' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {albums.map((album) => (
              <AlbumCard
                key={album.id}
                album={album}
                onClick={() => onNavigate('album-detail', { albumId: album.id })}
              />
            ))}
          </div>
        )}

        {activeTab === 'artists' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {artists.map((artist) => (
              <ArtistCard
                key={artist.id}
                artist={artist}
                onClick={() => onNavigate('artist-detail', { artistId: artist.id })}
              />
            ))}
          </div>
        )}

        {activeTab === 'recent' && (
          <div className="glass-panel p-2 rounded-2xl space-y-1">
            {recent.map((song, idx) => (
              <SongRow
                key={song.id}
                song={song}
                index={idx}
                queueContext={recent}
                onOpenPlaylistModal={onOpenPlaylistModal}
                onSelectArtist={(artistId) => onNavigate('artist-detail', { artistId })}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
