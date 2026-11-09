import React from 'react';
import {
  Home,
  Search,
  Library,
  Heart,
  Download,
  PlusSquare,
  ShieldAlert,
  User,
  Music,
  LogOut,
  Radio,
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
  const { downloadedSongs, storageUsed } = useDownloads();
  const playlists = catalogService.getPlaylists();
  const likedCount = catalogService.getLikedSongIds().size;

  const mainNav = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'search', label: 'Search', icon: Search },
    { id: 'library', label: 'Your Library', icon: Library },
  ];

  return (
    <aside className="w-64 shrink-0 hidden md:flex flex-col h-screen bg-[#090a10] border-r border-white/[0.07] p-4 select-none">
      {/* Brand Logo */}
      <div className="px-2 py-3 mb-4 cursor-pointer" onClick={() => onTabChange('home')}>
        <Logo size="md" showTagline={true} />
      </div>

      {/* Main Navigation Links */}
      <nav className="space-y-1 mb-6">
        {mainNav.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center gap-3.5 px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 ${
                isActive
                  ? 'bg-gradient-to-r from-violet-600/30 to-cyan-500/10 text-white border-l-2 border-cyan-400 font-semibold'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-white/[0.04]'
              }`}
            >
              <Icon
                className={`w-5 h-5 ${
                  isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-slate-200'
                }`}
              />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Library Collections */}
      <div className="mb-4">
        <div className="flex items-center justify-between px-3 mb-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Collections
          </span>
          <button
            onClick={onCreatePlaylist}
            title="Create Playlist"
            className="p-1 rounded text-slate-400 hover:text-cyan-400 hover:bg-white/10 transition-colors"
          >
            <PlusSquare className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-1">
          {/* Liked Songs */}
          <button
            onClick={() => onTabChange('liked')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
              currentTab === 'liked'
                ? 'bg-pink-950/40 text-pink-300 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-pink-500 to-rose-700 flex items-center justify-center text-white shadow-sm">
                <Heart className="w-3.5 h-3.5 fill-white" />
              </div>
              <span>Liked Songs</span>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">{likedCount}</span>
          </button>

          {/* Downloaded Songs (Offline) */}
          <button
            onClick={() => onTabChange('downloaded')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
              currentTab === 'downloaded'
                ? 'bg-cyan-950/40 text-cyan-300 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-teal-500 to-cyan-700 flex items-center justify-center text-white shadow-sm">
                <Download className="w-3.5 h-3.5" />
              </div>
              <span>Offline Tracks</span>
            </div>
            <span className="text-[10px] text-cyan-400/80 font-mono">{storageUsed}</span>
          </button>
        </div>
      </div>

      {/* User Playlists Scrollable list */}
      <div className="flex-1 overflow-y-auto pr-1 space-y-1 min-h-[100px] border-t border-white/[0.06] pt-3">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 block mb-1">
          Playlists
        </span>
        {playlists.map((pl) => (
          <button
            key={pl.id}
            onClick={() => onTabChange('playlist-detail', { playlistId: pl.id })}
            className={`w-full text-left px-3 py-1.5 rounded-lg text-xs truncate transition-colors flex items-center gap-2 ${
              currentTab === 'playlist-detail' && pl.id === currentTab
                ? 'text-cyan-400 font-semibold'
                : 'text-slate-400 hover:text-slate-100 hover:bg-white/[0.03]'
            }`}
          >
            <Music className="w-3.5 h-3.5 shrink-0 text-slate-400" />
            <span className="truncate">{pl.title}</span>
          </button>
        ))}
      </div>

      {/* Admin Portal Shortcut */}
      {user?.role === 'admin' && (
        <div className="pt-2 border-t border-white/[0.06] mb-2">
          <button
            onClick={() => onTabChange('admin')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
              currentTab === 'admin'
                ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg shadow-violet-600/30'
                : 'text-violet-400 hover:bg-violet-950/40 border border-violet-500/20'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Admin Dashboard</span>
          </button>
        </div>
      )}

      {/* Bottom User Profile / Status */}
      <div className="pt-3 border-t border-white/[0.07] flex items-center justify-between">
        <div
          onClick={() => onTabChange('profile')}
          className="flex items-center gap-2.5 min-w-0 cursor-pointer group flex-1"
        >
          <img
            src={user?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'}
            alt={user?.username || 'User'}
            className="w-8 h-8 rounded-full object-cover border border-violet-500/40"
          />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-white truncate group-hover:text-cyan-400 transition-colors">
              {user?.username || 'Guest'}
            </p>
            <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
              <span className={`w-1.5 h-1.5 rounded-full ${isSupabaseConfigured ? 'bg-emerald-400' : 'bg-cyan-400 animate-pulse'}`} />
              <span>{isSupabaseConfigured ? 'Supabase Live' : 'Aura Local'}</span>
            </div>
          </div>
        </div>

        {isGuest ? (
          <button
            onClick={() => openAuthModal('signin')}
            className="text-xs font-semibold px-2.5 py-1 bg-violet-600 hover:bg-violet-500 text-white rounded-lg shadow-sm"
          >
            Sign In
          </button>
        ) : (
          <button
            onClick={() => signOut()}
            title="Log Out"
            className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-white/[0.06]"
          >
            <LogOut className="w-4 h-4" />
          </button>
        )}
      </div>
    </aside>
  );
};
