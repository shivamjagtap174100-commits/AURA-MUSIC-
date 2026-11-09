import React from 'react';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
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
    <header className="sticky top-0 z-20 bg-[#101010]/90 backdrop-blur-md border-b border-[#202020] px-4 sm:px-8 py-3 flex items-center justify-between gap-4 select-none">
      {/* Left: Mobile Logo & Navigation History */}
      <div className="flex items-center gap-3">
        <div className="md:hidden">
          <Logo size="sm" />
        </div>

        <div className="hidden sm:flex items-center gap-1">
          <button
            onClick={onGoBack}
            disabled={!canGoBack}
            className={`p-1.5 rounded-full transition-colors ${
              canGoBack ? 'text-[#F5F5F5] hover:bg-[#202020]' : 'text-[#404040] cursor-not-allowed'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            disabled
            className="p-1.5 rounded-full text-[#404040] cursor-not-allowed"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <span className="hidden lg:inline text-xs text-[#737373] ml-2">
          {getGreeting()}, <span className="text-[#F5F5F5] font-medium">{user?.fullName || user?.username || 'Listener'}</span>
        </span>
      </div>

      {/* Center: Minimal Search Field */}
      <div
        onClick={onSearchClick}
        className="flex-1 max-w-sm mx-2 sm:mx-4 flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-[#181818] hover:bg-[#202020] border border-[#262626] cursor-pointer text-[#737373] hover:text-[#A1A1A1] transition-colors"
      >
        <Search className="w-3.5 h-3.5 text-[#737373]" />
        <span className="text-xs truncate">Search songs, artists, albums...</span>
      </div>

      {/* Right: Cloud Sync Status & User Profile */}
      <div className="flex items-center gap-3">
        {/* Connection status pill */}
        <div
          title={isSupabaseConfigured ? 'Connected to Supabase' : 'Offline local database'}
          className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono text-[#737373] border border-[#242424]"
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              isSupabaseConfigured ? 'bg-emerald-500' : 'bg-[#B7A0FF]'
            }`}
          />
          <span>{isSupabaseConfigured ? 'Online' : 'Local'}</span>
        </div>

        {isGuest ? (
          <button
            onClick={() => openAuthModal('signin')}
            className="px-3 py-1 rounded-md text-xs font-medium bg-[#F5F5F5] hover:bg-white text-black transition-colors"
          >
            Sign In
          </button>
        ) : (
          <div
            onClick={onProfileClick}
            className="flex items-center gap-2 p-1 rounded-full hover:bg-[#181818] cursor-pointer transition-colors"
          >
            <img
              src={user?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'}
              alt=""
              className="w-7 h-7 rounded-full object-cover border border-[#303030]"
            />
          </div>
        )}
      </div>
    </header>
  );
};
