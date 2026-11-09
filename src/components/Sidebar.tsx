import React from 'react';
import {
  Home,
  Search,
  Library,
  Heart,
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
    { id: 'search', label: 'Search', icon: Search },
    { id: 'library', label: 'Your Library', icon: Library },
  ];

  return (
    <aside className="w-60 shrink-0 hidden md:flex flex-col h-screen bg-[#101010] border-r border-[#242424] p-4 select-none">
      {/* Brand Logo */}
      <div className="px-2 py-3 mb-6 cursor-pointer" onClick={() => onTabChange('home')}>
        <Logo size="md" showTagline={true} />
      </div>

      {/* Main Navigation */}
      <nav className="space-y-1 mb-6">
        {mainNav.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-[#181818] text-[#B7A0FF]'
                  : 'text-[#A1A1A1] hover:text-[#F5F5F5] hover:bg-[#181818]/60'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-[#B7A0FF]' : 'text-[#737373]'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Collections */}
      <div className="mb-6">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-[#737373] px-3 block mb-2">
          Collections
        </span>

        <div className="space-y-1">
          {/* Liked Songs */}
          <button
            onClick={() => onTabChange('liked')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
              currentTab === 'liked'
                ? 'bg-[#181818] text-[#B7A0FF]'
                : 'text-[#A1A1A1] hover:text-[#F5F5F5] hover:bg-[#181818]/60'
            }`}
          >
            <div className="flex items-center gap-3">
              <Heart className="w-4 h-4 text-[#737373]" />
              <span>Liked Songs</span>
            </div>
            <span className="text-xs font-mono text-[#737373]">{likedCount}</span>
          </button>

          {/* Downloaded Music */}
          <button
            onClick={() => onTabChange('downloaded')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
              currentTab === 'downloaded'
                ? 'bg-[#181818] text-[#B7A0FF]'
                : 'text-[#A1A1A1] hover:text-[#F5F5F5] hover:bg-[#181818]/60'
            }`}
          >
            <div className="flex items-center gap-3">
              <Download className="w-4 h-4 text-[#737373]" />
              <span>Downloaded</span>
            </div>
            <span className="text-[10px] font-mono text-[#737373]">{storageUsed}</span>
          </button>
        </div>
      </div>

      {/* Playlists List */}
      <div className="flex-1 overflow-y-auto pr-1 space-y-1 min-h-[120px] border-t border-[#202020] pt-4">
        <div className="flex items-center justify-between px-3 mb-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#737373]">
            Playlists
          </span>
          <button
            onClick={onCreatePlaylist}
            title="Create Playlist"
            className="p-1 text-[#737373] hover:text-[#F5F5F5] rounded hover:bg-[#1c1c1c] transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {playlists.map((pl) => (
          <button
            key={pl.id}
            onClick={() => onTabChange('playlist-detail', { playlistId: pl.id })}
            className={`w-full text-left px-3 py-1.5 rounded-md text-xs truncate transition-colors flex items-center gap-2.5 ${
              currentTab === 'playlist-detail' && pl.id === currentTab
                ? 'text-[#B7A0FF] font-medium'
                : 'text-[#A1A1A1] hover:text-[#F5F5F5]'
            }`}
          >
            <Music className="w-3.5 h-3.5 shrink-0 text-[#737373]" />
            <span className="truncate">{pl.title}</span>
          </button>
        ))}
      </div>

      {/* Admin Portal Link */}
      {user?.role === 'admin' && (
        <div className="pt-2 border-t border-[#202020] mb-2">
          <button
            onClick={() => onTabChange('admin')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
              currentTab === 'admin'
                ? 'bg-[#181818] text-[#B7A0FF]'
                : 'text-[#737373] hover:text-[#A1A1A1]'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Admin Management</span>
          </button>
        </div>
      )}

      {/* Bottom Profile Bar */}
      <div className="pt-3 border-t border-[#202020] flex items-center justify-between">
        <div
          onClick={() => onTabChange('profile')}
          className="flex items-center gap-2.5 min-w-0 cursor-pointer group flex-1"
        >
          <img
            src={user?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'}
            alt=""
            className="w-7 h-7 rounded-full object-cover bg-[#202020] border border-[#303030]"
          />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-[#F5F5F5] truncate group-hover:text-white transition-colors">
              {user?.username || 'Guest'}
            </p>
            <p className="text-[10px] text-[#737373]">
              {isSupabaseConfigured ? 'Supabase Live' : 'Local Storage'}
            </p>
          </div>
        </div>

        {isGuest ? (
          <button
            onClick={() => openAuthModal('signin')}
            className="text-xs font-medium px-2.5 py-1 bg-[#202020] hover:bg-[#282828] text-[#F5F5F5] rounded-md transition-colors border border-[#303030]"
          >
            Sign In
          </button>
        ) : (
          <button
            onClick={() => signOut()}
            title="Log Out"
            className="p-1.5 text-[#737373] hover:text-[#F5F5F5] rounded transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </aside>
  );
};
