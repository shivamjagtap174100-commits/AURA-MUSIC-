import React from 'react';
import {
  Home,
  Compass,
  Search,
  Library,
  Heart,
  History,
  Download,
  Plus,
  Shield,
  Music,
  LogOut,
} from 'lucide-react';
import { Logo } from './Logo';
import { useAuth } from '../context/AuthContext';
import { useDownloads } from '../context/DownloadContext';
import { catalogService } from '../services/catalogService';
import { isSupabaseConfigured } from '../services/supabase';

interface SidebarProps {
  currentTab: string;
  onTabChange: (tab: string, meta?: any) => void;
  onCreatePlaylist: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onTabChange,
  onCreatePlaylist,
}) => {
  const { user, isGuest, signOut, openAuthModal } = useAuth();
  const { storageUsed } = useDownloads();
  const playlists = catalogService.getPlaylists();
  const likedCount = catalogService.getLikedSongIds().size;

  const mainNav = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'discover', label: 'Discover', icon: Compass },
    { id: 'search', label: 'Search', icon: Search },
    { id: 'library', label: 'Your Library', icon: Library },
  ];

  const collectionNav = [
    { id: 'liked', label: 'Liked Songs', icon: Heart, count: likedCount },
    { id: 'recently-played', label: 'Recently Played', icon: History },
    { id: 'downloaded', label: 'Downloads', icon: Download, badge: storageUsed },
  ];

  return (
    <aside className="w-64 shrink-0 hidden md:flex flex-col h-screen bg-[#08090A] border-r border-[#292929] p-4 select-none">
      {/* Brand Logo */}
      <div className="px-2 py-3 mb-5 cursor-pointer" onClick={() => onTabChange('home')}>
        <Logo size="md" showTagline={true} />
      </div>

      {/* SECTION: MAIN */}
      <div className="mb-6">
        <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#666666] px-3 block mb-2">
          Main
        </span>
        <nav className="space-y-1">
          {mainNav.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-[#171819] text-[#C5A66B] shadow-sm'
                    : 'text-[#929292] hover:text-[#F3F0E9] hover:bg-[#101112]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#C5A66B]' : 'text-[#666666]'}`} />
                  <span>{item.label}</span>
                </div>
                {isActive && <div className="w-1.5 h-1.5 rounded-full bg-[#C5A66B]" />}
              </button>
            );
          })}
        </nav>
      </div>

      {/* SECTION: COLLECTION */}
      <div className="mb-6">
        <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#666666] px-3 block mb-2">
          Collection
        </span>
        <div className="space-y-1">
          {collectionNav.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-[#171819] text-[#C5A66B]'
                    : 'text-[#929292] hover:text-[#F3F0E9] hover:bg-[#101112]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#C5A66B]' : 'text-[#666666]'}`} />
                  <span>{item.label}</span>
                </div>
                {item.count !== undefined ? (
                  <span className="text-xs font-mono text-[#666666]">{item.count}</span>
                ) : item.badge ? (
                  <span className="text-[10px] font-mono text-[#666666]">{item.badge}</span>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>

      {/* SECTION: PLAYLISTS */}
      <div className="flex-1 overflow-y-auto pr-1 space-y-1 min-h-[110px] border-t border-[#1F2022] pt-4">
        <div className="flex items-center justify-between px-3 mb-2">
          <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#666666]">
            Playlists
          </span>
          <button
            onClick={onCreatePlaylist}
            title="Create Playlist"
            className="p-1 text-[#666666] hover:text-[#C5A66B] rounded hover:bg-[#171819] transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {playlists.map((pl) => {
          const isActive = currentTab === 'playlist-detail' && pl.id === currentTab;
          return (
            <button
              key={pl.id}
              onClick={() => onTabChange('playlist-detail', { playlistId: pl.id })}
              className={`w-full text-left px-3 py-1.5 rounded-md text-xs truncate transition-colors flex items-center gap-2.5 ${
                isActive
                  ? 'text-[#C5A66B] font-medium bg-[#171819]'
                  : 'text-[#929292] hover:text-[#F3F0E9] hover:bg-[#101112]'
              }`}
            >
              <Music className="w-3.5 h-3.5 shrink-0 text-[#666666]" />
              <span className="truncate">{pl.title}</span>
            </button>
          );
        })}
      </div>

      {/* Admin Portal Link */}
      {user?.role === 'admin' && (
        <div className="pt-2 border-t border-[#1F2022] mb-2">
          <button
            onClick={() => onTabChange('admin')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
              currentTab === 'admin'
                ? 'bg-[#171819] text-[#C5A66B]'
                : 'text-[#666666] hover:text-[#929292]'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Admin Portal</span>
          </button>
        </div>
      )}

      {/* Bottom Profile Bar */}
      <div className="pt-3 border-t border-[#1F2022] flex items-center justify-between">
        <div
          onClick={() => onTabChange('profile')}
          className="flex items-center gap-2.5 min-w-0 cursor-pointer group flex-1"
        >
          <img
            src={user?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'}
            alt=""
            className="w-7 h-7 rounded-full object-cover bg-[#171819] border border-[#292929] group-hover:border-[#C5A66B] transition-colors"
          />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-[#F3F0E9] truncate group-hover:text-[#D8BF91] transition-colors">
              {user?.username || 'Guest'}
            </p>
            <p className="text-[10px] text-[#666666]">
              {isSupabaseConfigured ? 'Supabase Sync' : 'Local Storage'}
            </p>
          </div>
        </div>

        {isGuest ? (
          <button
            onClick={() => openAuthModal('signin')}
            className="text-xs font-medium px-2.5 py-1 bg-[#171819] hover:bg-[#202123] text-[#F3F0E9] hover:text-[#C5A66B] rounded-md transition-colors border border-[#292929]"
          >
            Sign In
          </button>
        ) : (
          <button
            onClick={() => signOut()}
            title="Log Out"
            className="p-1.5 text-[#666666] hover:text-[#F3F0E9] rounded transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </aside>
  );
};
