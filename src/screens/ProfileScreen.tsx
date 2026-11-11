import React, { useState } from 'react';
import {
  Headphones,
  HardDrive,
  LogOut,
  Edit2,
  Check,
  Database,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useDownloads } from '../context/DownloadContext';
import type { AudioQuality } from '../types/index.ts';
import { isSupabaseConfigured } from '../services/supabase';

export const ProfileScreen: React.FC = () => {
  const { user, isGuest, signOut, updateProfile, updatePreferredQuality, openAuthModal } = useAuth();
  const { storageUsed, downloadedSongs } = useDownloads();

  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [username, setUsername] = useState(user?.username || '');

  const handleSaveProfile = async () => {
    if (!username.trim()) return;
    await updateProfile({ fullName, username });
    setIsEditing(false);
  };

  const handleQualitySelect = (quality: AudioQuality) => {
    updatePreferredQuality(quality);
  };

  const qualities: AudioQuality[] = [
    'Normal (128 kbps)',
    'High (320 kbps)',
    'Ultra HD / FLAC',
  ];

  return (
    <div className="space-y-6 pb-36 max-w-2xl mx-auto select-none animate-in fade-in duration-150">
      {/* Profile Card Header */}
      <div className="p-6 rounded-2xl bg-[#171819] border border-[#292929] flex flex-col sm:flex-row items-center gap-5 shadow-xl">
        <div className="relative">
          <img
            src={user?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'}
            alt=""
            className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-2 border-[#C5A66B]/30 bg-[#101112]"
          />
        </div>

        <div className="text-center sm:text-left space-y-1.5 flex-1">
          {isEditing ? (
            <div className="space-y-2 max-w-xs">
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Full Name"
                className="w-full px-3 py-1.5 bg-[#101112] border border-[#C5A66B] rounded-lg text-xs text-[#F3F0E9] focus:outline-none"
              />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
                className="w-full px-3 py-1.5 bg-[#101112] border border-[#C5A66B] rounded-lg text-xs text-[#F3F0E9] focus:outline-none"
              />
              <button
                onClick={handleSaveProfile}
                className="px-3.5 py-1 bg-[#C5A66B] hover:bg-[#D8BF91] text-[#08090A] rounded-lg text-xs font-semibold flex items-center gap-1 shadow-sm"
              >
                <Check className="w-3 h-3" /> Save
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-[#F3F0E9] font-['Manrope']">
                  {user?.fullName || user?.username}
                </h1>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono text-[#C5A66B] bg-[#C5A66B]/10 border border-[#C5A66B]/20 uppercase">
                  {user?.role}
                </span>
              </div>
              <p className="text-xs text-[#929292] font-mono">@{user?.username} • {user?.email}</p>
            </>
          )}

          <div className="flex items-center justify-center sm:justify-start gap-2 pt-2">
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="px-3 py-1.5 bg-[#202123] hover:bg-[#28292c] text-[#F3F0E9] text-xs font-medium rounded-lg border border-[#292929] flex items-center gap-1.5 transition-colors"
              >
                <Edit2 className="w-3 h-3 text-[#C5A66B]" />
                <span>Edit Profile</span>
              </button>
            )}

            {isGuest ? (
              <button
                onClick={() => openAuthModal('signin')}
                className="px-3.5 py-1.5 bg-[#C5A66B] hover:bg-[#D8BF91] text-[#08090A] font-semibold text-xs rounded-lg shadow-sm"
              >
                Sign In
              </button>
            ) : (
              <button
                onClick={() => signOut()}
                className="px-3 py-1.5 bg-[#202123] hover:bg-rose-950/40 text-[#929292] hover:text-rose-400 text-xs font-medium rounded-lg border border-[#292929] flex items-center gap-1.5 transition-colors"
              >
                <LogOut className="w-3 h-3" />
                <span>Sign Out</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Streaming Quality Preference */}
      <div className="p-6 rounded-2xl bg-[#171819] border border-[#292929] space-y-4 shadow-xl">
        <div className="flex items-center gap-2">
          <Headphones className="w-4 h-4 text-[#C5A66B]" />
          <h2 className="text-sm font-bold text-[#F3F0E9] font-['Manrope']">Audio Streaming Quality</h2>
        </div>
        <p className="text-xs text-[#929292]">
          Select your master playback bit-rate. High-resolution FLAC audio preserves original recording details.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {qualities.map((q) => {
            const isSelected = user?.preferredQuality === q;
            return (
              <div
                key={q}
                onClick={() => handleQualitySelect(q)}
                className={`p-3.5 rounded-xl cursor-pointer border transition-colors ${
                  isSelected
                    ? 'bg-[#202123] border-[#C5A66B] shadow-sm'
                    : 'bg-[#101112] border-[#292929] hover:bg-[#171819]'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`text-xs font-semibold ${isSelected ? 'text-[#C5A66B]' : 'text-[#F3F0E9]'}`}>
                    {q}
                  </span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-[#C5A66B]" />}
                </div>
                <p className="text-[11px] text-[#666666]">
                  {q.includes('FLAC')
                    ? 'Studio lossless fidelity.'
                    : q.includes('320')
                    ? 'Crystal clear stereo stream.'
                    : 'Standard mobile data friendly.'}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Offline Storage Status */}
      <div className="p-6 rounded-2xl bg-[#171819] border border-[#292929] space-y-2 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-[#C5A66B]" />
            <h2 className="text-sm font-bold text-[#F3F0E9] font-['Manrope']">Offline Storage</h2>
          </div>
          <span className="text-xs font-mono text-[#C5A66B]">{storageUsed}</span>
        </div>
        <p className="text-xs text-[#929292]">
          <strong className="text-[#F3F0E9] font-mono">{downloadedSongs.length}</strong> songs saved locally in application storage for offline listening with zero data consumption.
        </p>
      </div>

      {/* Backend & Security */}
      <div className="p-6 rounded-2xl bg-[#171819] border border-[#292929] space-y-2 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-[#C5A66B]" />
            <h2 className="text-sm font-bold text-[#F3F0E9] font-['Manrope']">Backend & Security</h2>
          </div>
          <span className="text-[11px] font-mono text-[#929292]">
            {isSupabaseConfigured ? 'Supabase Connected' : 'Local Persistent Mode'}
          </span>
        </div>
        <p className="text-xs text-[#929292] leading-relaxed">
          {isSupabaseConfigured
            ? 'Aura Music is communicating securely with PostgreSQL via Supabase with active Row Level Security.'
            : 'Running in offline-first mode. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env to sync with cloud.'}
        </p>
      </div>
    </div>
  );
};
