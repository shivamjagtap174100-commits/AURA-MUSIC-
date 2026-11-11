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
import { MUSIC_LANGUAGES } from '../data/initialCatalog.ts';

export const AdminScreen: React.FC = () => {
  const { storageUsed } = useDownloads();

  const [songs, setSongs] = useState<Song[]>(() => catalogService.getSongs());
  const [activeTab, setActiveTab] = useState<'tracks' | 'add' | 'analytics'>('tracks');

  // Form State
  const [editingSongId, setEditingSongId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [titleNative, setTitleNative] = useState('');
  const [artistName, setArtistName] = useState('');
  const [artistNative, setArtistNative] = useState('');
  const [albumTitle, setAlbumTitle] = useState('');
  const [genre, setGenre] = useState('Bollywood');
  const [language, setLanguage] = useState('Hindi');
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
    setTitleNative('');
    setArtistName('');
    setArtistNative('');
    setAlbumTitle('');
    setGenre('Bollywood');
    setLanguage('Hindi');
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
    setTitleNative(s.titleNative || '');
    setArtistName(s.artistName);
    setArtistNative(s.artistNative || '');
    setAlbumTitle(s.albumTitle || '');
    setGenre(s.genre);
    setLanguage(s.language || 'Hindi');
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
        titleNative,
        artistName,
        artistNative,
        albumTitle,
        genre,
        language,
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
        titleNative,
        artistId: `artist-${Date.now()}`,
        artistName,
        artistNative,
        albumTitle,
        coverUrl: defaultCover,
        audioUrl,
        duration: parseInt(duration, 10) || 180,
        genre,
        language,
        releaseYear: new Date().getFullYear(),
        audioQuality,
        bitrate: audioQuality.includes('320') ? '320 kbps' : 'Lossless',
        fileSizeMb: 6.0,
        playCount: 1,
        lyrics,
        isRoyaltyFree: true,
        licenseInfo,
        provider: 'local',
        playbackRights: 'user-authorized',
        availabilityStatus: 'available',
        playbackAvailability: 'available',
        verificationStatus: 'verified',
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
    <div className="space-y-6 pb-36 select-none animate-in fade-in duration-150">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-[#171819] border border-[#292929] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-[#C5A66B] text-xs font-mono uppercase tracking-[0.2em] mb-1 font-semibold">
            <Shield className="w-3.5 h-3.5" />
            <span>Administrator Portal</span>
          </div>
          <h1 className="editorial-title text-2xl sm:text-3xl font-['Manrope']">Catalog & Management</h1>
          <p className="text-xs text-[#929292] mt-1">Manage multilingual metadata, audio files, and platform telemetry</p>
        </div>

        <button
          onClick={() => {
            resetForm();
            setActiveTab('add');
          }}
          className="px-4 py-2 rounded-lg bg-[#C5A66B] hover:bg-[#D8BF91] text-[#08090A] font-bold text-xs flex items-center gap-1.5 transition-colors self-start sm:self-auto shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Add Music</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-[#171819] border border-[#292929]">
          <div className="flex items-center justify-between text-[#666666] mb-1">
            <span className="text-xs">Songs</span>
            <Music className="w-4 h-4 text-[#C5A66B]" />
          </div>
          <p className="text-xl font-bold font-mono text-[#F3F0E9]">{songs.length}</p>
        </div>

        <div className="p-4 rounded-xl bg-[#171819] border border-[#292929]">
          <div className="flex items-center justify-between text-[#666666] mb-1">
            <span className="text-xs">Streams</span>
            <BarChart2 className="w-4 h-4 text-[#C5A66B]" />
          </div>
          <p className="text-xl font-bold font-mono text-[#F3F0E9]">{totalPlays.toLocaleString()}</p>
        </div>

        <div className="p-4 rounded-xl bg-[#171819] border border-[#292929]">
          <div className="flex items-center justify-between text-[#666666] mb-1">
            <span className="text-xs">Artists</span>
            <Users className="w-4 h-4 text-[#C5A66B]" />
          </div>
          <p className="text-xl font-bold font-mono text-[#F3F0E9]">{totalArtists}</p>
        </div>

        <div className="p-4 rounded-xl bg-[#171819] border border-[#292929]">
          <div className="flex items-center justify-between text-[#666666] mb-1">
            <span className="text-xs">Offline Cache</span>
            <HardDrive className="w-4 h-4 text-[#C5A66B]" />
          </div>
          <p className="text-xl font-bold font-mono text-[#F3F0E9]">{storageUsed}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#292929] pb-2">
        <button
          onClick={() => setActiveTab('tracks')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            activeTab === 'tracks' ? 'bg-[#202123] text-[#C5A66B] border border-[#C5A66B]/30' : 'text-[#666666] hover:text-[#F3F0E9]'
          }`}
        >
          Manage Music ({songs.length})
        </button>

        <button
          onClick={() => setActiveTab('add')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            activeTab === 'add' ? 'bg-[#202123] text-[#C5A66B] border border-[#C5A66B]/30' : 'text-[#666666] hover:text-[#F3F0E9]'
          }`}
        >
          {editingSongId ? 'Edit Track' : 'Add New Track'}
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            activeTab === 'analytics' ? 'bg-[#202123] text-[#C5A66B] border border-[#C5A66B]/30' : 'text-[#666666] hover:text-[#F3F0E9]'
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
          <button onClick={() => setFeedback(null)} className="text-[#929292] hover:text-[#F3F0E9]">
            Dismiss
          </button>
        </div>
      )}

      {/* TAB 1: Song Table */}
      {activeTab === 'tracks' && (
        <div className="rounded-2xl bg-[#171819] border border-[#292929] overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#292929] text-[#666666] font-medium bg-[#101112]">
                  <th className="p-3">#</th>
                  <th className="p-3">Title</th>
                  <th className="p-3">Artist</th>
                  <th className="p-3">Language</th>
                  <th className="p-3">Genre</th>
                  <th className="p-3">Quality</th>
                  <th className="p-3">Plays</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#292929]">
                {songs.map((song, idx) => (
                  <tr key={song.id} className="hover:bg-[#202123] transition-colors">
                    <td className="p-3 font-mono text-[#666666]">{idx + 1}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={song.coverUrl}
                          alt=""
                          className="w-8 h-8 rounded-lg object-cover bg-[#101112]"
                        />
                        <div>
                          <span className="font-semibold text-[#F3F0E9] block">{song.title}</span>
                          {song.titleNative && (
                            <span className="text-[10px] text-[#C5A66B]">{song.titleNative}</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-3 text-[#929292]">{song.artistName}</td>
                    <td className="p-3 text-[#C5A66B] font-mono">{song.language || 'Music'}</td>
                    <td className="p-3 text-[#666666]">{song.genre}</td>
                    <td className="p-3">
                      <AudioQualityBadge quality={song.audioQuality} />
                    </td>
                    <td className="p-3 font-mono text-[#929292]">{song.playCount.toLocaleString()}</td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleEditClick(song)}
                          className="p-1.5 text-[#666666] hover:text-[#C5A66B] rounded hover:bg-[#202123]"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteSong(song.id, song.title)}
                          className="p-1.5 text-[#666666] hover:text-rose-400 rounded hover:bg-[#202123]"
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
        <form onSubmit={handleSubmitTrack} className="p-6 rounded-2xl bg-[#171819] border border-[#292929] space-y-4 max-w-2xl shadow-xl">
          <h3 className="text-sm font-bold text-[#F3F0E9] font-['Manrope']">
            {editingSongId ? 'Edit Music Metadata' : 'Add New Authorized Track'}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="text-[11px] font-medium text-[#929292] block mb-1">
                Title (Latin Script) *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Kesariya or Zingaat"
                className="w-full px-3 py-2 bg-[#101112] border border-[#292929] rounded-lg text-xs text-[#F3F0E9] focus:outline-none focus:border-[#C5A66B]"
              />
            </div>

            <div>
              <label className="text-[11px] font-medium text-[#929292] block mb-1">
                Title (Native Script)
              </label>
              <input
                type="text"
                value={titleNative}
                onChange={(e) => setTitleNative(e.target.value)}
                placeholder="e.g. केसरिया or झिंगाट"
                className="w-full px-3 py-2 bg-[#101112] border border-[#292929] rounded-lg text-xs text-[#F3F0E9] focus:outline-none focus:border-[#C5A66B]"
              />
            </div>

            <div>
              <label className="text-[11px] font-medium text-[#929292] block mb-1">
                Artist Name *
              </label>
              <input
                type="text"
                required
                value={artistName}
                onChange={(e) => setArtistName(e.target.value)}
                placeholder="e.g. Arijit Singh or Ajay-Atul"
                className="w-full px-3 py-2 bg-[#101112] border border-[#292929] rounded-lg text-xs text-[#F3F0E9] focus:outline-none focus:border-[#C5A66B]"
              />
            </div>

            <div>
              <label className="text-[11px] font-medium text-[#929292] block mb-1">
                Artist (Native Script)
              </label>
              <input
                type="text"
                value={artistNative}
                onChange={(e) => setArtistNative(e.target.value)}
                placeholder="e.g. अरिजीत सिंह or अजय अतुल"
                className="w-full px-3 py-2 bg-[#101112] border border-[#292929] rounded-lg text-xs text-[#F3F0E9] focus:outline-none focus:border-[#C5A66B]"
              />
            </div>

            <div>
              <label className="text-[11px] font-medium text-[#929292] block mb-1">
                Album (Optional)
              </label>
              <input
                type="text"
                value={albumTitle}
                onChange={(e) => setAlbumTitle(e.target.value)}
                placeholder="e.g. Brahmastra or Sairat"
                className="w-full px-3 py-2 bg-[#101112] border border-[#292929] rounded-lg text-xs text-[#F3F0E9] focus:outline-none focus:border-[#C5A66B]"
              />
            </div>

            <div>
              <label className="text-[11px] font-medium text-[#929292] block mb-1">
                Language
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full px-3 py-2 bg-[#101112] border border-[#292929] rounded-lg text-xs text-[#F3F0E9] focus:outline-none focus:border-[#C5A66B]"
              >
                {MUSIC_LANGUAGES.filter((l) => l !== 'All Languages').map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] font-medium text-[#929292] block mb-1">
                Genre
              </label>
              <input
                type="text"
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                placeholder="e.g. Bollywood Romantic, Marathi Folk"
                className="w-full px-3 py-2 bg-[#101112] border border-[#292929] rounded-lg text-xs text-[#F3F0E9] focus:outline-none focus:border-[#C5A66B]"
              />
            </div>

            <div>
              <label className="text-[11px] font-medium text-[#929292] block mb-1">
                Duration (sec)
              </label>
              <input
                type="number"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full px-3 py-2 bg-[#101112] border border-[#292929] rounded-lg text-xs text-[#F3F0E9] font-mono focus:outline-none focus:border-[#C5A66B]"
              />
            </div>

            <div>
              <label className="text-[11px] font-medium text-[#929292] block mb-1">
                Quality Tier
              </label>
              <select
                value={audioQuality}
                onChange={(e) => setAudioQuality(e.target.value as AudioQuality)}
                className="w-full px-3 py-2 bg-[#101112] border border-[#292929] rounded-lg text-xs text-[#F3F0E9] focus:outline-none focus:border-[#C5A66B]"
              >
                <option value="High (320 kbps)">High (320 kbps)</option>
                <option value="Ultra HD / FLAC">Ultra HD / FLAC</option>
                <option value="Normal (128 kbps)">Normal (128 kbps)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-[11px] font-medium text-[#929292] block mb-1">
              Audio File URL (MP3/WAV/AAC) *
            </label>
            <input
              type="url"
              required
              value={audioUrl}
              onChange={(e) => setAudioUrl(e.target.value)}
              placeholder="https://..."
              className="w-full px-3 py-2 bg-[#101112] border border-[#292929] rounded-lg text-xs text-[#F3F0E9] font-mono focus:outline-none focus:border-[#C5A66B]"
            />
          </div>

          <div>
            <label className="text-[11px] font-medium text-[#929292] block mb-1">
              Artwork Image URL
            </label>
            <input
              type="url"
              value={coverUrl}
              onChange={(e) => setCoverUrl(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="w-full px-3 py-2 bg-[#101112] border border-[#292929] rounded-lg text-xs text-[#F3F0E9] font-mono focus:outline-none focus:border-[#C5A66B]"
            />
          </div>

          <div>
            <label className="text-[11px] font-medium text-[#929292] block mb-1">
              Lyrics (Optional)
            </label>
            <textarea
              rows={3}
              value={lyrics}
              onChange={(e) => setLyrics(e.target.value)}
              className="w-full px-3 py-2 bg-[#101112] border border-[#292929] rounded-lg text-xs text-[#F3F0E9] font-mono focus:outline-none focus:border-[#C5A66B] resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={resetForm}
              className="px-3 py-1.5 text-xs text-[#929292] hover:text-[#F3F0E9]"
            >
              Reset
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#C5A66B] hover:bg-[#D8BF91] text-[#08090A] font-bold text-xs rounded-lg shadow-sm"
            >
              {editingSongId ? 'Save Changes' : 'Publish Track'}
            </button>
          </div>
        </form>
      )}

      {/* TAB 3: Telemetry */}
      {activeTab === 'analytics' && (
        <div className="space-y-4">
          <div className="p-6 rounded-2xl bg-[#171819] border border-[#292929] shadow-xl">
            <h3 className="text-sm font-bold text-[#F3F0E9] mb-3 font-['Manrope']">Top Streamed Tracks</h3>
            <div className="space-y-2">
              {songs
                .sort((a, b) => (b.playCount || 0) - (a.playCount || 0))
                .slice(0, 7)
                .map((s, idx) => (
                  <div key={s.id} className="flex justify-between items-center text-xs py-2 border-b border-[#292929]">
                    <span className="text-[#F3F0E9]">
                      {idx + 1}. {s.title} — <span className="text-[#929292]">{s.artistName}</span>
                    </span>
                    <span className="font-mono text-[#C5A66B]">
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
