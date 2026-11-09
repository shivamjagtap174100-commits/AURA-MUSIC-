import React, { useState } from 'react';
import {
  User,
  ShieldCheck,
  Headphones,
  HardDrive,
  LogOut,
  Edit2,
  Check,
  Database,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useDownloads } from '../context/DownloadContext';
import { AudioQuality } from '../types';
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
    <div className="space-y-6 pb-32 max-w-3xl mx-auto animate-in fade-in duration-200">
      {/* Profile Card Header */}
      <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-white/10 flex flex-col sm:flex-row items-center gap-6 shadow-xl">
        <div className="relative">
          <img
            src={user?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'}
            alt=""
            className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-4 border-violet-500/40 shadow-xl"
          />
          <span className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-slate-900" />
        </div>

        <div className="text-center sm:text-left space-y-2 flex-1">
          {isEditing ? (
            <div className="space-y-2 max-w-xs">
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Full Name"
                className="w-full px-3 py-1.5 bg-black/50 border border-violet-500 rounded-lg text-sm text-white focus:outline-none"
              />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
                className="w-full px-3 py-1.5 bg-black/50 border border-violet-500 rounded-lg text-sm text-white focus:outline-none"
              />
              <button
                onClick={handleSaveProfile}
                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1"
              >
                <Check className="w-3.5 h-3.5" /> Save Changes
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                  {user?.fullName || user?.username}
                </h1>
                <span className="px-2 py-0.5 rounded-full bg-violet-600/30 border border-violet-500/40 text-[10px] font-bold text-violet-300 uppercase">
                  {user?.role}
                </span>
              </div>
              <p className="text-xs text-slate-400">@{user?.username} • {user?.email}</p>
            </>
          )}

          <div className="flex items-center justify-center sm:justify-start gap-2 pt-2">
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="px-3 py-1.5 rounded-xl glass-pill hover:bg-white/10 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit Profile</span>
              </button>
            )}

            {isGuest ? (
              <button
                onClick={() => openAuthModal('signin')}
                className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 text-white font-bold text-xs shadow-md"
              >
                Sign In / Register
              </button>
            ) : (
              <button
                onClick={() => signOut()}
                className="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log Out</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Streaming Audio Quality Preference */}
      <div className="glass-panel p-6 rounded-3xl space-y-4">
        <div className="flex items-center gap-2">
          <Headphones className="w-5 h-5 text-cyan-400" />
          <h2 className="text-base font-bold text-white">Audio Streaming Quality</h2>
        </div>
        <p className="text-xs text-slate-400">
          Aura Music provides original master audio quality up to 320 kbps AAC and Ultra HD FLAC. Select your preferred tier:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {qualities.map((q) => {
            const isSelected = user?.preferredQuality === q;
            return (
              <div
                key={q}
                onClick={() => handleQualitySelect(q)}
                className={`p-4 rounded-2xl cursor-pointer border transition-all ${
                  isSelected
                    ? 'bg-violet-950/60 border-cyan-400 shadow-lg shadow-cyan-400/10'
                    : 'bg-white/[0.03] border-white/10 hover:bg-white/[0.06]'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-white">{q}</span>
                  {isSelected && <Check className="w-4 h-4 text-cyan-400" />}
                </div>
                <p className="text-[11px] text-slate-400">
                  {q.includes('FLAC')
                    ? 'Lossless compression with complete studio fidelity.'
                    : q.includes('320')
                    ? 'High bit-rate stereo with ultra clean highs.'
                    : 'Standard fidelity optimized for mobile data.'}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Offline Storage Status */}
      <div className="glass-panel p-6 rounded-3xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HardDrive className="w-5 h-5 text-teal-400" />
            <h2 className="text-base font-bold text-white">Offline Storage Status</h2>
          </div>
          <span className="text-xs font-mono text-cyan-400 font-bold">{storageUsed}</span>
        </div>
        <p className="text-xs text-slate-400">
          You have <strong className="text-white">{downloadedSongs.length}</strong> songs saved locally in application storage for offline listening without an internet connection.
        </p>
      </div>

      {/* Supabase Connection Status Card */}
      <div className="glass-panel p-6 rounded-3xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-violet-400" />
            <h2 className="text-base font-bold text-white">Backend & Cloud Database</h2>
          </div>
          <span
            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
              isSupabaseConfigured
                ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40'
                : 'bg-cyan-950 text-cyan-300 border border-cyan-500/40'
            }`}
          >
            {isSupabaseConfigured ? 'Supabase Live Connected' : 'Local Offline Mode Active'}
          </span>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">
          {isSupabaseConfigured
            ? 'Aura Music is communicating directly with your PostgreSQL Supabase instance with Row Level Security enabled.'
            : 'To connect your live Supabase project, populate VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file and run the SQL migration script from supabase/schema.sql.'}
        </p>
      </div>
    </div>
  );
};
