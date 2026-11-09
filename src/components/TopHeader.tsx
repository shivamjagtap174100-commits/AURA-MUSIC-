import React from 'react';
import { Search, ChevronLeft, ChevronRight, User, ShieldCheck, Database, Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { isSupabaseConfigured } from '../services/supabase';
import { Logo } from './Logo';

interface TopHeaderProps {
  onSearchClick: () => void;
  onProfileClick: () => void;
  canGoBack?: boolean;
  onGoBack?: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  onSearchClick,
  onProfileClick,
  canGoBack,
  onGoBack,
}) => {
  const { user, isGuest, openAuthModal } = useAuth();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    if (hour < 21) return 'Good evening';
    return 'Good night';
  };

  return (
    <header className="sticky top-0 z-20 bg-[#08090e]/80 backdrop-blur-xl border-b border-white/[0.06] px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4">
      {/* Left: Mobile Logo & Navigation History */}
      <div className="flex items-center gap-3">
        <div className="md:hidden">
          <Logo size="sm" />
        </div>

        <div className="hidden sm:flex items-center gap-1.5">
          <button
            onClick={onGoBack}
            disabled={!canGoBack}
            className={`p-1.5 rounded-full bg-black/40 border border-white/10 transition-colors ${
              canGoBack ? 'text-white hover:bg-white/10' : 'text-slate-600 cursor-not-allowed'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            disabled
            className="p-1.5 rounded-full bg-black/40 border border-white/10 text-slate-600 cursor-not-allowed"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <span className="hidden lg:inline text-xs font-semibold text-slate-400">
          {getGreeting()}, <span className="text-white">{user?.fullName || user?.username || 'Guest'}</span>
        </span>
      </div>

      {/* Center: Search pill */}
      <div
        onClick={onSearchClick}
        className="flex-1 max-w-md mx-2 sm:mx-4 flex items-center gap-2.5 px-3.5 py-2 rounded-full bg-white/[0.05] hover:bg-white/[0.08] border border-white/[0.08] cursor-pointer text-slate-400 hover:text-slate-200 transition-all shadow-inner"
      >
        <Search className="w-4 h-4 text-violet-400" />
        <span className="text-xs truncate">What do you want to listen to?</span>
        <kbd className="hidden sm:inline-block ml-auto text-[10px] font-mono bg-white/[0.08] px-1.5 py-0.5 rounded text-slate-400">
          Search
        </kbd>
      </div>

      {/* Right: Cloud Sync Status & User Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Supabase status badge */}
        <div
          title={isSupabaseConfigured ? 'Supabase Database Connected' : 'Running in Offline / Local Store Mode'}
          className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium border border-white/10 bg-white/[0.03]"
        >
          <span
            className={`w-2 h-2 rounded-full ${
              isSupabaseConfigured ? 'bg-emerald-400' : 'bg-cyan-400 animate-pulse'
            }`}
          />
          <span className="text-slate-300">
            {isSupabaseConfigured ? 'Cloud Sync' : 'Offline Ready'}
          </span>
        </div>

        {isGuest ? (
          <button
            onClick={() => openAuthModal('signin')}
            className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 text-white shadow-md shadow-violet-500/20 active:scale-95 transition-all"
          >
            Sign In
          </button>
        ) : (
          <div
            onClick={onProfileClick}
            className="flex items-center gap-2 p-1 pl-2 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] cursor-pointer transition-colors"
          >
            <span className="text-xs font-semibold text-slate-200 hidden sm:inline max-w-[100px] truncate">
              {user?.username}
            </span>
            <img
              src={user?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'}
              alt={user?.username || 'User'}
              className="w-7 h-7 rounded-full object-cover border border-violet-500"
            />
          </div>
        )}
      </div>
    </header>
  );
};
