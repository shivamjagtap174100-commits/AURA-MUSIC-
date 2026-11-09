import React, { useState } from 'react';
import {
  Shield,
  Plus,
  Trash2,
  Edit2,
  Music,
  BarChart2,
  Users,
  HardDrive,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import type { Song, AudioQuality } from '../types/index.ts';
import { catalogService } from '../services/catalogService';
import { useDownloads } from '../context/DownloadContext';
import { AudioQualityBadge } from '../components/AudioQualityBadge';

export const AdminScreen: React.FC = () => {
  const { storageUsed } = useDownloads();

  const [songs, setSongs] = useState<Song[]>(() => catalogService.getSongs());
  const [activeTab, setActiveTab] = useState<'tracks' | 'add' | 'analytics'>('tracks');

  // Form State
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
    if (window.confirm(`Delete "${songTitle}" from catalog?`)) {
      catalogService.deleteSong(songId);
      setSongs([...catalogService.getSongs()]);
      setFeedback({ type: 'success', message: `Deleted "${songTitle}".` });
    }
  };

  const handleSubmitTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !artistName || !audioUrl) {
      setFeedback({ type: 'error', message: 'Please provide Title, Artist, and Audio URL.' });
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
      setFeedback({ type: 'success', message: `Updated "${title}".` });
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
      setFeedback({ type: 'success', message: `Published "${title}".` });
    }

    setSongs([...catalogService.getSongs()]);
    resetForm();
    setActiveTab('tracks');
  };

  const totalPlays = songs.reduce((sum, s) => sum + (s.playCount || 0), 0);
  const totalArtists = catalogService.getArtists().length;

  return (
    <div className="space-y-6 pb-32 select-none animate-in fade-in duration-150">
      {/* Header */}
      <div className="p-6 rounded-xl bg-[#181818] border border-[#242424] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[#B7A0FF] text-xs font-mono uppercase tracking-wider mb-1">
            <Shield className="w-3.5 h-3.5" />
            <span>Administrator Portal</span>
          </div>
          <h1 className="editorial-title">Catalog & Management</h1>
          <p className="text-xs text-[#737373] mt-1">Manage music metadata, audio files, and platform telemetry</p>
        </div>

        <button
          onClick={() => {
            resetForm();
            setActiveTab('add');
          }}
          className="px-4 py-2 rounded-lg bg-[#F5F5F5] hover:bg-white text-black font-semibold text-xs flex items-center gap-1.5 transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Music</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-lg bg-[#181818] border border-[#242424]">
          <div className="flex items-center justify-between text-[#737373] mb-1">
            <span className="text-xs">Songs</span>
            <Music className="w-4 h-4" />
          </div>
          <p className="text-xl font-bold font-mono text-[#F5F5F5]">{songs.length}</p>
        </div>

        <div className="p-4 rounded-lg bg-[#181818] border border-[#242424]">
          <div className="flex items-center justify-between text-[#737373] mb-1">
            <span className="text-xs">Streams</span>
            <BarChart2 className="w-4 h-4" />
          </div>
          <p className="text-xl font-bold font-mono text-[#F5F5F5]">{totalPlays.toLocaleString()}</p>
        </div>

        <div className="p-4 rounded-lg bg-[#181818] border border-[#242424]">
          <div className="flex items-center justify-between text-[#737373] mb-1">
            <span className="text-xs">Artists</span>
            <Users className="w-4 h-4" />
          </div>
          <p className="text-xl font-bold font-mono text-[#F5F5F5]">{totalArtists}</p>
        </div>

        <div className="p-4 rounded-lg bg-[#181818] border border-[#242424]">
          <div className="flex items-center justify-between text-[#737373] mb-1">
            <span className="text-xs">Offline Cache</span>
            <HardDrive className="w-4 h-4" />
          </div>
          <p className="text-xl font-bold font-mono text-[#F5F5F5]">{storageUsed}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#242424] pb-2">
        <button
          onClick={() => setActiveTab('tracks')}
          className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
            activeTab === 'tracks' ? 'bg-[#282828] text-white' : 'text-[#737373] hover:text-white'
          }`}
        >
          Manage Music ({songs.length})
        </button>

        <button
          onClick={() => setActiveTab('add')}
          className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
            activeTab === 'add' ? 'bg-[#282828] text-white' : 'text-[#737373] hover:text-white'
          }`}
        >
          {editingSongId ? 'Edit Track' : 'Add New Track'}
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
            activeTab === 'analytics' ? 'bg-[#282828] text-white' : 'text-[#737373] hover:text-white'
          }`}
        >
          Telemetry
        </button>
      </div>

      {/* Feedback Toast */}
      {feedback && (
        <div
          className={`p-3 rounded-lg flex items-center justify-between text-xs border ${
            feedback.type === 'success'
              ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-950/40 border-rose-500/30 text-rose-300'
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
          <button onClick={() => setFeedback(null)} className="text-[#A1A1A1] hover:text-white">
            Dismiss
          </button>
        </div>
      )}

      {/* TAB 1: Song Table */}
      {activeTab === 'tracks' && (
        <div className="rounded-xl bg-[#181818] border border-[#242424] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#262626] text-[#737373] font-medium bg-[#141414]">
                  <th className="p-3">#</th>
                  <th className="p-3">Title</th>
                  <th className="p-3">Artist</th>
                  <th className="p-3">Genre</th>
                  <th className="p-3">Quality</th>
                  <th className="p-3">Plays</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#242424]">
                {songs.map((song, idx) => (
                  <tr key={song.id} className="hover:bg-[#1f1f1f] transition-colors">
                    <td className="p-3 font-mono text-[#737373]">{idx + 1}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={song.coverUrl}
                          alt=""
                          className="w-8 h-8 rounded object-cover bg-[#242424]"
                        />
                        <span className="font-medium text-[#F5F5F5]">{song.title}</span>
                      </div>
                    </td>
                    <td className="p-3 text-[#A1A1A1]">{song.artistName}</td>
                    <td className="p-3 text-[#737373]">{song.genre}</td>
                    <td className="p-3">
                      <AudioQualityBadge quality={song.audioQuality} />
                    </td>
                    <td className="p-3 font-mono text-[#A1A1A1]">{song.playCount.toLocaleString()}</td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleEditClick(song)}
                          className="p-1.5 text-[#737373] hover:text-white rounded hover:bg-[#262626]"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteSong(song.id, song.title)}
                          className="p-1.5 text-[#737373] hover:text-rose-400 rounded hover:bg-[#262626]"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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

      {/* TAB 2: Form */}
      {activeTab === 'add' && (
        <form onSubmit={handleSubmitTrack} className="p-6 rounded-xl bg-[#181818] border border-[#242424] space-y-4 max-w-2xl">
          <h3 className="text-sm font-semibold text-[#F5F5F5]">
            {editingSongId ? 'Edit Music Metadata' : 'Add New Authorized Track'}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="text-[11px] font-medium text-[#A1A1A1] block mb-1">
                Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Track title"
                className="w-full px-3 py-2 bg-[#101010] border border-[#2b2b2b] rounded-md text-xs text-white focus:outline-none focus:border-[#B7A0FF]"
              />
            </div>

            <div>
              <label className="text-[11px] font-medium text-[#A1A1A1] block mb-1">
                Artist *
              </label>
              <input
                type="text"
                required
                value={artistName}
                onChange={(e) => setArtistName(e.target.value)}
                placeholder="Artist name"
                className="w-full px-3 py-2 bg-[#101010] border border-[#2b2b2b] rounded-md text-xs text-white focus:outline-none focus:border-[#B7A0FF]"
              />
            </div>

            <div>
              <label className="text-[11px] font-medium text-[#A1A1A1] block mb-1">
                Album (Optional)
              </label>
              <input
                type="text"
                value={albumTitle}
                onChange={(e) => setAlbumTitle(e.target.value)}
                placeholder="Album name"
                className="w-full px-3 py-2 bg-[#101010] border border-[#2b2b2b] rounded-md text-xs text-white focus:outline-none focus:border-[#B7A0FF]"
              />
            </div>

            <div>
              <label className="text-[11px] font-medium text-[#A1A1A1] block mb-1">
                Genre
              </label>
              <select
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                className="w-full px-3 py-2 bg-[#101010] border border-[#2b2b2b] rounded-md text-xs text-white focus:outline-none focus:border-[#B7A0FF]"
              >
                <option value="Synthwave">Synthwave</option>
                <option value="Lo-Fi">Lo-Fi & Chill</option>
                <option value="Electronic">Electronic</option>
                <option value="Deep House">Deep House</option>
                <option value="Acoustic">Acoustic</option>
                <option value="Chillstep">Chillstep</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-medium text-[#A1A1A1] block mb-1">
                Duration (sec)
              </label>
              <input
                type="number"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full px-3 py-2 bg-[#101010] border border-[#2b2b2b] rounded-md text-xs text-white font-mono focus:outline-none focus:border-[#B7A0FF]"
              />
            </div>

            <div>
              <label className="text-[11px] font-medium text-[#A1A1A1] block mb-1">
                Quality Tier
              </label>
              <select
                value={audioQuality}
                onChange={(e) => setAudioQuality(e.target.value as AudioQuality)}
                className="w-full px-3 py-2 bg-[#101010] border border-[#2b2b2b] rounded-md text-xs text-white focus:outline-none focus:border-[#B7A0FF]"
              >
                <option value="High (320 kbps)">High (320 kbps)</option>
                <option value="Ultra HD / FLAC">Ultra HD / FLAC</option>
                <option value="Normal (128 kbps)">Normal (128 kbps)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-[11px] font-medium text-[#A1A1A1] block mb-1">
              Audio File URL (MP3/WAV) *
            </label>
            <input
              type="url"
              required
              value={audioUrl}
              onChange={(e) => setAudioUrl(e.target.value)}
              placeholder="https://..."
              className="w-full px-3 py-2 bg-[#101010] border border-[#2b2b2b] rounded-md text-xs text-white font-mono focus:outline-none focus:border-[#B7A0FF]"
            />
          </div>

          <div>
            <label className="text-[11px] font-medium text-[#A1A1A1] block mb-1">
              Artwork Image URL
            </label>
            <input
              type="url"
              value={coverUrl}
              onChange={(e) => setCoverUrl(e.target.value)}
              placeholder="https://..."
              className="w-full px-3 py-2 bg-[#101010] border border-[#2b2b2b] rounded-md text-xs text-white font-mono focus:outline-none focus:border-[#B7A0FF]"
            />
          </div>

          <div>
            <label className="text-[11px] font-medium text-[#A1A1A1] block mb-1">
              Lyrics (Optional)
            </label>
            <textarea
              rows={3}
              value={lyrics}
              onChange={(e) => setLyrics(e.target.value)}
              className="w-full px-3 py-2 bg-[#101010] border border-[#2b2b2b] rounded-md text-xs text-white font-mono focus:outline-none focus:border-[#B7A0FF] resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={resetForm}
              className="px-3 py-1.5 text-xs text-[#737373] hover:text-white"
            >
              Reset
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-[#F5F5F5] hover:bg-white text-black font-semibold text-xs rounded-md"
            >
              {editingSongId ? 'Save Changes' : 'Publish Track'}
            </button>
          </div>
        </form>
      )}

      {/* TAB 3: Telemetry */}
      {activeTab === 'analytics' && (
        <div className="space-y-4">
          <div className="p-6 rounded-xl bg-[#181818] border border-[#242424]">
            <h3 className="text-sm font-semibold text-[#F5F5F5] mb-3">Top Streamed Tracks</h3>
            <div className="space-y-2">
              {songs
                .sort((a, b) => (b.playCount || 0) - (a.playCount || 0))
                .slice(0, 5)
                .map((s, idx) => (
                  <div key={s.id} className="flex justify-between items-center text-xs py-1 border-b border-[#242424]">
                    <span className="text-[#D4D4D4]">
                      {idx + 1}. {s.title} — <span className="text-[#737373]">{s.artistName}</span>
                    </span>
                    <span className="font-mono text-[#A1A1A1]">
                      {s.playCount.toLocaleString()} plays
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
