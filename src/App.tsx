import React, { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { AudioProvider, useAudio } from './context/AudioContext';
import { DownloadProvider } from './context/DownloadContext';
import { Sidebar } from './components/Sidebar';
import { TopHeader } from './components/TopHeader';
import { MiniPlayer } from './components/MiniPlayer';
import { FullScreenPlayer } from './components/FullScreenPlayer';
import { QueueDrawer } from './components/QueueDrawer';
import { MobileBottomNav } from './components/MobileBottomNav';
import { AuthModal } from './components/AuthModal';
import { CreatePlaylistModal } from './components/CreatePlaylistModal';
import { AddToPlaylistModal } from './components/AddToPlaylistModal';

// Screens
import { HomeScreen } from './screens/HomeScreen';
import { DiscoverScreen } from './screens/DiscoverScreen';
import { SearchScreen } from './screens/SearchScreen';
import { LibraryScreen } from './screens/LibraryScreen';
import { LikedSongsScreen } from './screens/LikedSongsScreen';
import { DownloadedScreen } from './screens/DownloadedScreen';
import { PlaylistDetailScreen } from './screens/PlaylistDetailScreen';
import { AlbumDetailScreen } from './screens/AlbumDetailScreen';
import { ArtistDetailScreen } from './screens/ArtistDetailScreen';
import { AdminScreen } from './screens/AdminScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import type { Song } from './types/index.ts';
import { catalogService } from './services/catalogService';

interface NavigationState {
  tab: string;
  meta?: any;
}

const MainApp: React.FC = () => {
  const { currentSong } = useAudio();
  const [navHistory, setNavHistory] = useState<NavigationState[]>([{ tab: 'home' }]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // Modals state
  const [isCreatePlaylistOpen, setIsCreatePlaylistOpen] = useState(false);
  const [songForPlaylist, setSongForPlaylist] = useState<Song | null>(null);
  const [isAddToPlaylistOpen, setIsAddToPlaylistOpen] = useState(false);

  const currentNav = navHistory[historyIndex] || { tab: 'home' };

  // Sync catalog with remote Supabase in background
  useEffect(() => {
    catalogService.syncWithSupabase();
  }, []);

  const handleNavigate = (tab: string, meta?: any) => {
    const nextState: NavigationState = { tab, meta };
    const nextHistory = navHistory.slice(0, historyIndex + 1);
    nextHistory.push(nextState);
    setNavHistory(nextHistory);
    setHistoryIndex(nextHistory.length - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGoBack = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
    }
  };

  const openAddToPlaylist = (song: Song) => {
    setSongForPlaylist(song);
    setIsAddToPlaylistOpen(true);
  };

  const renderCurrentScreen = () => {
    switch (currentNav.tab) {
      case 'home':
        return (
          <HomeScreen
            onNavigate={handleNavigate}
            onOpenPlaylistModal={openAddToPlaylist}
          />
        );
      case 'discover':
        return (
          <DiscoverScreen
            onNavigate={handleNavigate}
            onOpenPlaylistModal={openAddToPlaylist}
          />
        );
      case 'search':
        return (
          <SearchScreen
            initialQuery={currentNav.meta?.genreQuery || ''}
            onNavigate={handleNavigate}
            onOpenPlaylistModal={openAddToPlaylist}
          />
        );
      case 'library':
      case 'recently-played':
        return (
          <LibraryScreen
            onNavigate={handleNavigate}
            onOpenPlaylistModal={openAddToPlaylist}
            onCreatePlaylist={() => setIsCreatePlaylistOpen(true)}
          />
        );
      case 'liked':
        return (
          <LikedSongsScreen
            onNavigate={handleNavigate}
            onOpenPlaylistModal={openAddToPlaylist}
          />
        );
      case 'downloaded':
        return (
          <DownloadedScreen
            onNavigate={handleNavigate}
            onOpenPlaylistModal={openAddToPlaylist}
          />
        );
      case 'playlist-detail':
        return (
          <PlaylistDetailScreen
            playlistId={currentNav.meta?.playlistId}
            onNavigate={handleNavigate}
            onOpenPlaylistModal={openAddToPlaylist}
          />
        );
      case 'album-detail':
        return (
          <AlbumDetailScreen
            albumId={currentNav.meta?.albumId}
            onNavigate={handleNavigate}
            onOpenPlaylistModal={openAddToPlaylist}
          />
        );
      case 'artist-detail':
        return (
          <ArtistDetailScreen
            artistId={currentNav.meta?.artistId}
            onNavigate={handleNavigate}
            onOpenPlaylistModal={openAddToPlaylist}
          />
        );
      case 'admin':
        return <AdminScreen />;
      case 'profile':
        return <ProfileScreen />;
      default:
        return (
          <HomeScreen
            onNavigate={handleNavigate}
            onOpenPlaylistModal={openAddToPlaylist}
          />
        );
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#08090A] text-[#F3F0E9] overflow-hidden">
      {/* Desktop Sidebar */}
      <Sidebar
        currentTab={currentNav.tab}
        onTabChange={handleNavigate}
        onCreatePlaylist={() => setIsCreatePlaylistOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden min-w-0">
        <TopHeader
          onSearchClick={() => handleNavigate('search')}
          onProfileClick={() => handleNavigate('profile')}
          canGoBack={historyIndex > 0}
          onGoBack={handleGoBack}
        />

        <main className="flex-1 overflow-y-auto px-4 sm:px-8 py-6">
          <div className="max-w-7xl mx-auto">{renderCurrentScreen()}</div>
        </main>
      </div>

      {/* Persistent Mini Player */}
      <MiniPlayer />

      {/* Fullscreen Player Modal */}
      <FullScreenPlayer />

      {/* Queue Drawer */}
      <QueueDrawer />

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav
        currentTab={currentNav.tab}
        onTabChange={handleNavigate}
        hasMiniPlayer={Boolean(currentSong)}
      />

      {/* Modals */}
      <AuthModal />
      <CreatePlaylistModal
        isOpen={isCreatePlaylistOpen}
        onClose={() => setIsCreatePlaylistOpen(false)}
        onPlaylistCreated={(id) => handleNavigate('playlist-detail', { playlistId: id })}
      />
      <AddToPlaylistModal
        song={songForPlaylist}
        isOpen={isAddToPlaylistOpen}
        onClose={() => setIsAddToPlaylistOpen(false)}
        onOpenCreatePlaylist={() => setIsCreatePlaylistOpen(true)}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AudioProvider>
        <DownloadProvider>
          <MainApp />
        </DownloadProvider>
      </AudioProvider>
    </AuthProvider>
  );
}
