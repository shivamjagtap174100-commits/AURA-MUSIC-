import React from 'react';
import { Home, Search, Library, User, ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface MobileBottomNavProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  hasMiniPlayer: boolean;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentTab,
  onTabChange,
  hasMiniPlayer,
}) => {
  const { user } = useAuth();

  const tabs = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'search', label: 'Search', icon: Search },
    { id: 'library', label: 'Library', icon: Library },
    ...(user?.role === 'admin'
      ? [{ id: 'admin', label: 'Admin', icon: ShieldAlert }]
      : [{ id: 'profile', label: 'Profile', icon: User }]),
  ];

  return (
    <nav
      className={`md:hidden fixed left-0 right-0 z-30 bg-[#090a10]/95 backdrop-blur-xl border-t border-white/[0.08] px-3 py-2 flex items-center justify-around ${
        hasMiniPlayer ? 'bottom-[62px]' : 'bottom-0'
      }`}
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = currentTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${
              isActive ? 'text-cyan-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Icon className={`w-5 h-5 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
            <span className="text-[10px] tracking-wide">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
