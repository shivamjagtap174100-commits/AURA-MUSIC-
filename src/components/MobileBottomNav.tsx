import React from 'react';
import { Home, Search, Library, User, Shield } from 'lucide-react';
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
      ? [{ id: 'admin', label: 'Admin', icon: Shield }]
      : [{ id: 'profile', label: 'Profile', icon: User }]),
  ];

  return (
    <nav
      className={`md:hidden fixed left-0 right-0 z-30 bg-[#181818] border-t border-[#262626] px-2 py-1.5 flex items-center justify-around select-none ${
        hasMiniPlayer ? 'bottom-[56px]' : 'bottom-0'
      }`}
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = currentTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex flex-col items-center gap-0.5 py-1 px-4 rounded transition-colors ${
              isActive ? 'text-[#B7A0FF]' : 'text-[#737373] hover:text-[#A1A1A1]'
            }`}
          >
            <Icon className="w-5 h-5" />
            <span className="text-[10px] tracking-tight">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
