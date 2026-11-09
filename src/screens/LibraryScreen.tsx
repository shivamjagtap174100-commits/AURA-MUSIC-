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
    { id: 'downloaded', label: 'Downloaded', count: downloadedSongs.length },
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
    <div className="space-y-6 pb-32 select-none animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="editorial-title">Your Library</h1>
          <p className="editorial-subtitle mt-1">Saved tracks, collections, playlists, and offline music</p>
        </div>

        <div className="flex items-center gap-2">
          {/* List vs Grid View Toggle */}
          <div className="flex items-center bg-[#181818] p-1 rounded-lg border border-[#262626]">
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded transition-colors ${
                viewMode === 'list' ? 'bg-[#282828] text-white' : 'text-[#737373] hover:text-white'
              }`}
              title="List View"
            >
              <LayoutList className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded transition-colors ${
                viewMode === 'grid' ? 'bg-[#282828] text-white' : 'text-[#737373] hover:text-white'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={onCreatePlaylist}
            className="px-3 py-1.5 rounded-lg bg-[#202020] hover:bg-[#282828] border border-[#2b2b2b] text-[#F5F5F5] text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-3.5 h-3.5 text-[#B7A0FF]" />
            <span>New Playlist</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as LibraryTab)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
                isActive
                  ? 'bg-[#282828] text-[#F5F5F5] border border-[#383838]'
                  : 'bg-[#181818] text-[#737373] hover:text-[#D4D4D4] border border-[#242424]'
              }`}
            >
              <span>{tab.label}</span>
              <span className="text-[10px] font-mono text-[#737373]">{tab.count}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'all' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#737373] font-mono">{allSongs.length} Tracks</span>
              <button
                onClick={() => handlePlayAll(allSongs)}
                className="flex items-center gap-1.5 px-3 py-1 bg-[#181818] hover:bg-[#202020] border border-[#262626] rounded text-xs font-medium text-[#F5F5F5] transition-colors"
              >
                <Play className="w-3 h-3 fill-white" />
                <span>Play All</span>
              </button>
            </div>

            {viewMode === 'list' ? (
              <div className="rounded-xl bg-[#181818] border border-[#242424] p-2 space-y-0.5">
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
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
                {allSongs.map((song, idx) => (
                  <div
                    key={song.id}
                    onClick={() => playSong(song, allSongs, idx)}
                    className="p-3 rounded-lg bg-[#181818] hover:bg-[#202020] border border-[#242424] cursor-pointer group transition-colors"
                  >
                    <div className="relative aspect-square w-full rounded-md overflow-hidden mb-2.5 bg-[#242424]">
                      <img src={song.coverUrl} alt="" className="w-full h-full object-cover" />
                      <div className="absolute bottom-2 right-2 w-8 h-8 rounded-full bg-[#F5F5F5] text-black flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Play className="w-3.5 h-3.5 fill-black ml-0.5" />
                      </div>
                    </div>
                    <p className="text-xs font-medium text-[#F5F5F5] truncate">{song.title}</p>
                    <p className="text-[11px] text-[#737373] truncate mt-0.5">{song.artistName}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'liked' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#737373] font-mono">{likedSongs.length} Favorites</span>
              {likedSongs.length > 0 && (
                <button
                  onClick={() => handlePlayAll(likedSongs)}
                  className="flex items-center gap-1.5 px-3 py-1 bg-[#181818] hover:bg-[#202020] border border-[#262626] rounded text-xs font-medium text-[#F5F5F5] transition-colors"
                >
                  <Play className="w-3 h-3 fill-white" />
                  <span>Play Liked</span>
                </button>
              )}
            </div>

            {likedSongs.length === 0 ? (
              <div className="text-center py-20 text-[#737373]">
                <Heart className="w-8 h-8 mx-auto mb-2 opacity-30 text-[#B7A0FF]" />
                <p className="text-sm font-medium text-[#A1A1A1]">No liked tracks</p>
                <p className="text-xs text-[#737373] mt-1">Tap the heart icon on any track to save it to your favorites.</p>
              </div>
            ) : (
              <div className="rounded-xl bg-[#181818] border border-[#242424] p-2 space-y-0.5">
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
              <span className="text-xs text-[#737373] font-mono">
                {downloadedSongs.length} Offline Tracks • {storageUsed}
              </span>
              {downloadedSongs.length > 0 && (
                <button
                  onClick={() => handlePlayAll(downloadedSongs.map((d) => d.song))}
                  className="flex items-center gap-1.5 px-3 py-1 bg-[#181818] hover:bg-[#202020] border border-[#262626] rounded text-xs font-medium text-[#F5F5F5] transition-colors"
                >
                  <Play className="w-3 h-3 fill-white" />
                  <span>Play Offline</span>
                </button>
              )}
            </div>

            {downloadedSongs.length === 0 ? (
              <div className="text-center py-20 text-[#737373]">
                <Download className="w-8 h-8 mx-auto mb-2 opacity-30 text-[#B7A0FF]" />
                <p className="text-sm font-medium text-[#A1A1A1]">No offline music saved</p>
                <p className="text-xs text-[#737373] mt-1">Download songs to enjoy uninterrupted playback with zero internet connection.</p>
              </div>
            ) : (
              <div className="rounded-xl bg-[#181818] border border-[#242424] p-2 space-y-0.5">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
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
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
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
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
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
          <div className="rounded-xl bg-[#181818] border border-[#242424] p-2 space-y-0.5">
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
