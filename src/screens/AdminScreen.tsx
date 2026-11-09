import React, { useState } from 'react';
import {
  ShieldAlert,
  Plus,
  Trash2,
  Edit2,
  Music,
  BarChart2,
  Users,
  HardDrive,
  CheckCircle,
  AlertCircle,
  Upload,
} from 'lucide-react';
import { Song, AudioQuality } from '../types';
import { catalogService } from '../services/catalogService';
import { useAuth } from '../context/AuthContext';
import { useDownloads } from '../context/DownloadContext';
import { AudioQualityBadge } from '../components/AudioQualityBadge';

export const AdminScreen: React.FC = () => {
  const { user } = useAuth();
  const { storageUsed } = useDownloads();

  const [songs, setSongs] = useState<Song[]>(() => catalogService.getSongs());
  const [activeTab, setActiveTab] = useState<'tracks' | 'add' | 'analytics'>('tracks');

  // Form State for Adding/Editing Track
  const [editingSongId, setEditingSongId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [artistName, setArtistName] = useState('');
  const [albumTitle, setAlbumTitle] = useState('');
  const [genre, setGenre] = useState('Synthwave');
  const [duration, setDuration] = useState('180');
  const [audioQuality, setAudioQuality] = useState<AudioQuality>('High (320 kbps)');
  const [audioUrl, setAudioUrl] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [lyrics, setLyrics] = useState('');
  const [licenseInfo, setLicenseInfo] = useState('CC0 / Royalty-Free Licensed');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const resetForm = () => {
    setEditingSongId(null);
    setTitle('');
    setArtistName('');
    setAlbumTitle('');
    setGenre('Synthwave');
    setDuration('180');
    setAudioQuality('High (320 kbps)');
    setAudioUrl('');
    setCoverUrl('');
    setLyrics('');
    setLicenseInfo('CC0 / Royalty-Free Licensed');
  };

  const handleEditClick = (s: Song) => {
    setEditingSongId(s.id);
    setTitle(s.title);
    setArtistName(s.artistName);
    setAlbumTitle(s.albumTitle || '');
    setGenre(s.genre);
    setDuration(s.duration.toString());
    setAudioQuality(s.audioQuality);
    setAudioUrl(s.audioUrl);
    setCoverUrl(s.coverUrl);
    setLyrics(s.lyrics || '');
    setLicenseInfo(s.licenseInfo || 'CC0 / Royalty-Free Licensed');
    setActiveTab('add');
  };

  const handleDeleteSong = (songId: string, songTitle: string) => {
    if (window.confirm(`Are you sure you want to delete "${songTitle}"?`)) {
      catalogService.deleteSong(songId);
      setSongs([...catalogService.getSongs()]);
      setFeedback({ type: 'success', message: `Deleted "${songTitle}" successfully.` });
    }
  };

  const handleSubmitTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !artistName || !audioUrl) {
      setFeedback({ type: 'error', message: 'Please fill in Title, Artist, and Audio Stream URL.' });
      return;
    }

    const defaultCover =
      coverUrl ||
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80';

    if (editingSongId) {
      catalogService.updateSong(editingSongId, {
        title,
        artistName,
        albumTitle,
        genre,
        duration: parseInt(duration, 10) || 180,
        audioQuality,
        audioUrl,
        coverUrl: defaultCover,
        lyrics,
        licenseInfo,
      });
      setFeedback({ type: 'success', message: `Updated "${title}" successfully!` });
    } else {
      const newSong: Song = {
        id: `song-custom-${Date.now()}`,
        title,
        artistId: `artist-${Date.now()}`,
        artistName,
        albumTitle,
        coverUrl: defaultCover,
        audioUrl,
        duration: parseInt(duration, 10) || 180,
        genre,
        releaseYear: new Date().getFullYear(),
        audioQuality,
        bitrate: audioQuality.includes('320') ? '320 kbps' : 'Lossless',
        fileSizeMb: 6.0,
        playCount: 1,
        lyrics,
        isRoyaltyFree: true,
        licenseInfo,
      };

      catalogService.addSong(newSong);
      setFeedback({ type: 'success', message: `Added new track "${title}" to Aura Catalog!` });
    }

    setSongs([...catalogService.getSongs()]);
    resetForm();
    setActiveTab('tracks');
  };

  // Stats calculation
  const totalPlays = songs.reduce((sum, s) => sum + (s.playCount || 0), 0);
  const totalAlbums = catalogService.getAlbums().length;
  const totalArtists = catalogService.getArtists().length;

  return (
    <div className="space-y-6 pb-32 animate-in fade-in duration-200">
      {/* Admin Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-violet-950/80 to-purple-950/60 border border-violet-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-violet-600 to-cyan-400 flex items-center justify-center text-white shadow-lg">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Aura Music Admin Portal</h1>
            <p className="text-xs text-slate-300">
              Manage songs, catalog metadata, audio streaming URLs, and platform statistics.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              resetForm();
              setActiveTab('add');
            }}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-violet-600/30 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Music</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl glass-panel">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-semibold">Total Songs</span>
            <Music className="w-4 h-4 text-violet-400" />
          </div>
          <p className="text-2xl font-bold text-white">{songs.length}</p>
        </div>

        <div className="p-4 rounded-2xl glass-panel">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-semibold">Total Streams</span>
            <BarChart2 className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-2xl font-bold text-white">{totalPlays.toLocaleString()}</p>
        </div>

        <div className="p-4 rounded-2xl glass-panel">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-semibold">Verified Artists</span>
            <Users className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-2xl font-bold text-white">{totalArtists}</p>
        </div>

        <div className="p-4 rounded-2xl glass-panel">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-semibold">Offline Cache</span>
            <HardDrive className="w-4 h-4 text-teal-400" />
          </div>
          <p className="text-2xl font-bold text-white">{storageUsed}</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-white/[0.08] pb-3">
        <button
          onClick={() => setActiveTab('tracks')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'tracks'
              ? 'bg-violet-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
          }`}
        >
          Manage Music ({songs.length})
        </button>

        <button
          onClick={() => setActiveTab('add')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'add'
              ? 'bg-violet-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
          }`}
        >
          {editingSongId ? 'Edit Track' : 'Upload / Add Music'}
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'analytics'
              ? 'bg-violet-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
          }`}
        >
          Analytics & Insights
        </button>
      </div>

      {/* Feedback Toast */}
      {feedback && (
        <div
          className={`p-3.5 rounded-2xl flex items-center justify-between text-xs font-medium border ${
            feedback.type === 'success'
              ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
              : 'bg-rose-950/60 border-rose-500/40 text-rose-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? (
              <CheckCircle className="w-4 h-4" />
            ) : (
              <AlertCircle className="w-4 h-4" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="hover:text-white">
            Dismiss
          </button>
        </div>
      )}

      {/* TAB 1: Song Management Table */}
      {activeTab === 'tracks' && (
        <div className="glass-panel rounded-3xl overflow-hidden border border-white/[0.08]">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-white/[0.08] text-slate-400 font-semibold bg-white/[0.02]">
                  <th className="p-3.5">#</th>
                  <th className="p-3.5">Track Title</th>
                  <th className="p-3.5">Artist & Album</th>
                  <th className="p-3.5">Genre</th>
                  <th className="p-3.5">Quality</th>
                  <th className="p-3.5">Plays</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {songs.map((song, idx) => (
                  <tr key={song.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-3.5 font-mono text-slate-500">{idx + 1}</td>
                    <td className="p-3.5">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={song.coverUrl}
                          alt=""
                          className="w-9 h-9 rounded-lg object-cover"
                        />
                        <span className="font-bold text-white">{song.title}</span>
                      </div>
                    </td>
                    <td className="p-3.5">
                      <p className="text-slate-200 font-medium">{song.artistName}</p>
                      <p className="text-slate-500 text-[11px]">{song.albumTitle || 'Single'}</p>
                    </td>
                    <td className="p-3.5 text-slate-300">{song.genre}</td>
                    <td className="p-3.5">
                      <AudioQualityBadge quality={song.audioQuality} />
                    </td>
                    <td className="p-3.5 font-mono text-cyan-400">{song.playCount.toLocaleString()}</td>
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleEditClick(song)}
                          className="p-1.5 text-slate-400 hover:text-cyan-400 rounded-lg hover:bg-white/[0.08]"
                          title="Edit Metadata"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteSong(song.id, song.title)}
                          className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-white/[0.08]"
                          title="Delete Music"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: Upload / Add Music Form */}
      {activeTab === 'add' && (
        <form onSubmit={handleSubmitTrack} className="glass-panel p-6 sm:p-8 rounded-3xl space-y-5 max-w-3xl">
          <h3 className="text-lg font-bold text-white mb-2">
            {editingSongId ? 'Edit Music Metadata' : 'Add Authorized Music Track'}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider block mb-1">
                Track Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Neon Horizons"
                className="w-full px-3.5 py-2.5 bg-black/40 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-violet-500"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider block mb-1">
                Artist Name *
              </label>
              <input
                type="text"
                required
                value={artistName}
                onChange={(e) => setArtistName(e.target.value)}
                placeholder="e.g. Solstice Echo"
                className="w-full px-3.5 py-2.5 bg-black/40 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-violet-500"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider block mb-1">
                Album Title (Optional)
              </label>
              <input
                type="text"
                value={albumTitle}
                onChange={(e) => setAlbumTitle(e.target.value)}
                placeholder="e.g. Cyber Soundscapes"
                className="w-full px-3.5 py-2.5 bg-black/40 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-violet-500"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider block mb-1">
                Genre
              </label>
              <select
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-black/40 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-violet-500"
              >
                <option value="Synthwave">Synthwave</option>
                <option value="Lo-Fi">Lo-Fi & Chill</option>
                <option value="Electronic">Electronic</option>
                <option value="Deep House">Deep House</option>
                <option value="Acoustic">Acoustic</option>
                <option value="Chillstep">Chillstep</option>
                <option value="Ambient">Ambient</option>
                <option value="Cyberpunk">Cyberpunk</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider block mb-1">
                Duration (seconds)
              </label>
              <input
                type="number"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-black/40 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-violet-500 font-mono"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider block mb-1">
                Audio Quality Tier
              </label>
              <select
                value={audioQuality}
                onChange={(e) => setAudioQuality(e.target.value as AudioQuality)}
                className="w-full px-3.5 py-2.5 bg-black/40 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-violet-500"
              >
                <option value="High (320 kbps)">High (320 kbps)</option>
                <option value="Ultra HD / FLAC">Ultra HD / FLAC</option>
                <option value="Normal (128 kbps)">Normal (128 kbps)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider block mb-1">
              Audio File URL (MP3/WAV/AAC) *
            </label>
            <input
              type="url"
              required
              value={audioUrl}
              onChange={(e) => setAudioUrl(e.target.value)}
              placeholder="https://cdn.example.com/audio/track.mp3"
              className="w-full px-3.5 py-2.5 bg-black/40 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-violet-500 font-mono text-xs"
            />
            <p className="text-[10px] text-slate-500 mt-1">
              Must be authorized, public domain, or royalty-free audio file with CORS enabled.
            </p>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider block mb-1">
              Cover Artwork URL
            </label>
            <input
              type="url"
              value={coverUrl}
              onChange={(e) => setCoverUrl(e.target.value)}
              placeholder="https://images.unsplash.com/photo-..."
              className="w-full px-3.5 py-2.5 bg-black/40 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-violet-500 font-mono text-xs"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider block mb-1">
              Lyrics (Optional)
            </label>
            <textarea
              rows={3}
              value={lyrics}
              onChange={(e) => setLyrics(e.target.value)}
              placeholder="[Verse 1]..."
              className="w-full px-3.5 py-2.5 bg-black/40 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-violet-500 font-mono text-xs resize-none"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider block mb-1">
              Royalty-Free Licensing Information
            </label>
            <input
              type="text"
              value={licenseInfo}
              onChange={(e) => setLicenseInfo(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-black/40 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-violet-500 text-xs"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
            >
              Reset
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 text-white font-bold text-xs shadow-lg shadow-violet-600/30"
            >
              {editingSongId ? 'Save Changes' : 'Publish Track'}
            </button>
          </div>
        </form>
      )}

      {/* TAB 3: Analytics & Listening Insights */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-3xl">
            <h3 className="text-base font-bold text-white mb-4">Top Streamed Tracks</h3>
            <div className="space-y-3">
              {songs
                .sort((a, b) => (b.playCount || 0) - (a.playCount || 0))
                .slice(0, 5)
                .map((s, idx) => {
                  const maxPlays = songs[0]?.playCount || 1;
                  const pct = Math.round(((s.playCount || 0) / maxPlays) * 100);
                  return (
                    <div key={s.id} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="font-semibold text-white">
                          {idx + 1}. {s.title} — {s.artistName}
                        </span>
                        <span className="text-cyan-400 font-mono font-bold">
                          {s.playCount.toLocaleString()} plays
                        </span>
                      </div>
                      <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-violet-500 to-cyan-400 rounded-full"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="glass-panel p-6 rounded-3xl">
              <h3 className="text-base font-bold text-white mb-2">Supabase Database Health</h3>
              <div className="space-y-2 text-xs text-slate-300">
                <div className="flex justify-between py-1 border-b border-white/[0.06]">
                  <span>PostgreSQL RLS Status</span>
                  <span className="text-emerald-400 font-semibold">Active & Enforced</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/[0.06]">
                  <span>Storage Buckets</span>
                  <span className="text-cyan-400 font-semibold">music-audio, music-covers</span>
                </div>
                <div className="flex justify-between py-1">
                  <span>Client-Side Security</span>
                  <span className="text-emerald-400 font-semibold">Anon Key Restricted</span>
                </div>
              </div>
            </div>

            <div className="glass-panel p-6 rounded-3xl">
              <h3 className="text-base font-bold text-white mb-2">Offline Storage Telemetry</h3>
              <div className="space-y-2 text-xs text-slate-300">
                <div className="flex justify-between py-1 border-b border-white/[0.06]">
                  <span>IndexedDB Key</span>
                  <span className="text-cyan-400 font-mono">aura_offline_audio_*</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/[0.06]">
                  <span>Current App Storage</span>
                  <span className="text-violet-300 font-mono font-bold">{storageUsed}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span>Audio Format</span>
                  <span className="text-slate-400">Audio/MPEG (Blob Cached)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
