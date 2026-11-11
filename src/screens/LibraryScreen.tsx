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
  LayoutList,
  LayoutGrid,
} from 'lucide-react';
import type { Song } from '../types/index.ts';
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
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const { playSong } = useAudio();
  const { downloadedSongs, storageUsed } = useDownloads();

  const allSongs = catalogService.getSongs();
  const likedSongs = catalogService.getLikedSongs();
  const playlists = catalogService.getPlaylists();
  const albums = catalogService.getAlbums();
  const artists = catalogService.getArtists();
  const recent = catalogService.getRecentlyPlayed();

  const tabs = [
    { id: 'all', label: 'All Songs', count: allSongs.length },
    { id: 'liked', label: 'Liked Songs', count: likedSongs.length },
    { id: 'downloaded', label: 'Downloads', count: downloadedSongs.length },
    { id: 'playlists', label: 'Playlists', count: playlists.length },
    { id: 'albums', label: 'Albums', count: albums.length },
    { id: 'artists', label: 'Artists', count: artists.length },
    { id: 'recent', label: 'Recently Played', count: recent.length },
  ];

  const handlePlayAll = (songs: Song[]) => {
    if (songs.length > 0) {
      playSong(songs[0], songs, 0);
    }
  };

  return (
    <div className="space-y-6 pb-36 select-none animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#292929] pb-5">
        <div>
          <h1 className="editorial-title text-2xl sm:text-3xl font-['Manrope']">Your Library</h1>
          <p className="editorial-subtitle mt-1">Saved tracks, collections, playlists, and offline music</p>
        </div>

        <div className="flex items-center gap-2">
          {/* List vs Grid View Toggle */}
          <div className="flex items-center bg-[#101112] p-1 rounded-lg border border-[#292929]">
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded transition-colors ${
                viewMode === 'list' ? 'bg-[#171819] text-[#C5A66B]' : 'text-[#666666] hover:text-[#F3F0E9]'
              }`}
              title="List View"
            >
              <LayoutList className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded transition-colors ${
                viewMode === 'grid' ? 'bg-[#171819] text-[#C5A66B]' : 'text-[#666666] hover:text-[#F3F0E9]'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={onCreatePlaylist}
            className="px-3.5 py-1.5 rounded-lg bg-[#C5A66B] hover:bg-[#D8BF91] text-[#08090A] text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Playlist</span>
          </button>
        </div>
      </div>

      {/* Library Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as LibraryTab)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all flex items-center gap-2 ${
                isActive
                  ? 'bg-[#C5A66B] text-[#08090A] shadow-sm font-semibold'
                  : 'bg-[#171819] text-[#929292] hover:text-[#F3F0E9] hover:bg-[#202123] border border-[#292929]'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`text-[10px] font-mono ${isActive ? 'text-[#08090A]' : 'text-[#666666]'}`}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Tab: All Songs */}
      {activeTab === 'all' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#666666] font-mono">{allSongs.length} available songs</span>
            <button
              onClick={() => handlePlayAll(allSongs)}
              className="text-xs text-[#C5A66B] hover:text-[#D8BF91] font-medium flex items-center gap-1.5 transition-colors"
            >
              <Play className="w-3 h-3 fill-[#C5A66B]" />
              <span>Play All</span>
            </button>
          </div>

          <div className="rounded-2xl bg-[#171819] border border-[#292929] p-3 space-y-1 shadow-sm">
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

      {/* Tab: Liked Songs */}
      {activeTab === 'liked' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#666666] font-mono">{likedSongs.length} liked tracks</span>
            {likedSongs.length > 0 && (
              <button
                onClick={() => handlePlayAll(likedSongs)}
                className="text-xs text-[#C5A66B] hover:text-[#D8BF91] font-medium flex items-center gap-1.5 transition-colors"
              >
                <Play className="w-3 h-3 fill-[#C5A66B]" />
                <span>Play All</span>
              </button>
            )}
          </div>

          {likedSongs.length === 0 ? (
            <div className="text-center py-16 rounded-2xl bg-[#171819] border border-[#292929]">
              <Heart className="w-8 h-8 text-[#666666] mx-auto mb-2" />
              <p className="text-sm font-medium text-[#F3F0E9]">No liked songs yet</p>
              <p className="text-xs text-[#929292] mt-1">Tap the heart on any song to save it here</p>
            </div>
          ) : (
            <div className="rounded-2xl bg-[#171819] border border-[#292929] p-3 space-y-1 shadow-sm">
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

      {/* Tab: Downloads */}
      {activeTab === 'downloaded' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#666666] font-mono">
              {downloadedSongs.length} offline tracks • {storageUsed}
            </span>
          </div>

          {downloadedSongs.length === 0 ? (
            <div className="text-center py-16 rounded-2xl bg-[#171819] border border-[#292929]">
              <Download className="w-8 h-8 text-[#666666] mx-auto mb-2" />
              <p className="text-sm font-medium text-[#F3F0E9]">No downloaded songs</p>
              <p className="text-xs text-[#929292] mt-1">Click the download button on any song for offline playback</p>
            </div>
          ) : (
            <div className="rounded-2xl bg-[#171819] border border-[#292929] p-3 space-y-1 shadow-sm">
              {downloadedSongs.map((d, idx) => (
                <SongRow
                  key={d.id}
                  song={d.song}
                  index={idx}
                  queueContext={downloadedSongs.map((ds) => ds.song)}
                  onOpenPlaylistModal={onOpenPlaylistModal}
                  onSelectArtist={(artistId) => onNavigate('artist-detail', { artistId })}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: Playlists */}
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

      {/* Tab: Albums */}
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

      {/* Tab: Artists */}
      {activeTab === 'artists' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {artists.map((artist) => (
            <ArtistCard
              key={artist.id}
              artist={artist}
              onClick={() => onNavigate('artist-detail', { artistId: artist.id })}
            />
          ))}
        </div>
      )}

      {/* Tab: Recently Played */}
      {activeTab === 'recent' && (
        <div className="rounded-2xl bg-[#171819] border border-[#292929] p-3 space-y-1 shadow-sm">
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
  );
};
