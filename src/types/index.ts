export type AudioQuality = 'Normal (128 kbps)' | 'High (320 kbps)' | 'Ultra HD / FLAC';

export type PlaybackAvailability = 'available' | 'unavailable';
export type VerificationStatus = 'verified' | 'unverified';
export type MusicProvider = 'aura-licensed' | 'jamendo' | 'fma' | 'archive-org' | 'spotify-discovery' | 'itunes' | 'local' | 'supabase';

export type MusicLanguage =
  | 'All Languages'
  | 'Hindi'
  | 'Marathi'
  | 'Punjabi'
  | 'Tamil'
  | 'Telugu'
  | 'Malayalam'
  | 'Kannada'
  | 'Bengali'
  | 'Gujarati'
  | 'Bhojpuri'
  | 'Assamese'
  | 'Odia'
  | 'English'
  | 'Korean'
  | 'Japanese'
  | 'Spanish'
  | 'French'
  | 'Arabic'
  | 'Devotional'
  | 'Classical'
  | 'Other';

export interface Artist {
  id: string;
  name: string;
  nameNative?: string;
  bio?: string;
  avatarUrl: string;
  bannerUrl?: string;
  monthlyListeners?: number;
  genres?: string[];
  languages?: string[];
  verified?: boolean;
  spotifyUrl?: string;
}

export interface Album {
  id: string;
  title: string;
  titleNative?: string;
  artistId: string;
  artistName: string;
  coverUrl: string;
  releaseYear: number;
  genre: string;
  language?: string;
  totalTracks?: number;
  songIds?: string[];
  spotifyUrl?: string;
}

export interface Song {
  id: string; // Unique internal track_id
  trackId?: string; // Canonical alias for id
  provider: MusicProvider;
  providerTrackId?: string;
  title: string;
  titleNative?: string;
  artistId: string;
  artistName: string;
  artistNative?: string;
  albumId?: string;
  albumTitle?: string;
  albumNative?: string;
  coverUrl: string;
  audioUrl: string;
  audioAssetId?: string;
  duration: number; // in seconds
  genre: string;
  language?: string;
  composer?: string;
  releaseYear?: number;
  releaseDate?: string;
  audioQuality: AudioQuality;
  bitrate?: string;
  fileSizeMb?: number;
  playCount: number;
  lyrics?: string;
  isRoyaltyFree: boolean;
  licenseInfo?: string;
  playbackMode?: 'full-length' | 'preview'; // Truthful playback distinction: full licensed track vs 30s preview
  previewDuration?: number; // Actual preview length in seconds (default 30)
  playbackRights?: 'public-domain' | 'licensed-preview' | 'creative-commons' | 'user-authorized' | 'licensed-full';
  availabilityStatus?: 'available' | 'offline-cached' | 'streaming';
  playbackAvailability: PlaybackAvailability; // 'available' | 'unavailable'
  verificationStatus: VerificationStatus; // 'verified' | 'unverified'
  spotifyUrl?: string;
  createdAt?: string;
}

// Canonical alias for Song matching backend architecture
export type Track = Song;

export interface SpotifyDiscoveryTrack {
  spotifyTrackId: string;
  title: string;
  artistName: string;
  artistId?: string;
  albumTitle: string;
  albumId?: string;
  coverUrl: string;
  spotifyUrl: string;
  previewUrl?: string | null;
  durationMs: number;
  releaseDate?: string;
  popularity?: number;
  isExplicit?: boolean;
  language?: string;
}

export interface SpotifyDiscoveryArtist {
  spotifyArtistId: string;
  name: string;
  coverUrl?: string;
  genres: string[];
  popularity?: number;
  followers?: number;
  spotifyUrl: string;
}

export interface SpotifyDiscoveryAlbum {
  spotifyAlbumId: string;
  title: string;
  artistName: string;
  coverUrl: string;
  releaseDate?: string;
  totalTracks?: number;
  spotifyUrl: string;
}

export interface Playlist {
  id: string;
  title: string;
  description?: string;
  coverUrl: string;
  userId?: string;
  creatorName: string;
  isPublic: boolean;
  songIds: string[];
  createdAt: string;
  updatedAt?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  username: string;
  fullName?: string;
  avatarUrl?: string;
  role: 'user' | 'admin' | 'creator';
  preferredQuality: AudioQuality;
  offlineDownloadsCount?: number;
  createdAt: string;
}

export interface DownloadedSong {
  id: string;
  songId: string;
  song: Song;
  downloadedAt: string;
  fileSize: number; // in bytes
  format: string; // e.g., 'audio/mpeg'
  localUri?: string;
}

export type RepeatMode = 'off' | 'all' | 'one';

export interface PlayerState {
  currentSong: Song | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number; // 0 to 1
  isMuted: boolean;
  shuffle: boolean;
  repeat: RepeatMode;
  queue: Song[];
  queueIndex: number;
  originalQueue: Song[];
  isBuffering: boolean;
  isFullScreen: boolean;
  isQueueOpen: boolean;
  playbackError?: string | null;
}

export interface PlaylistTrackRecord {
  id: string;
  playlistId: string;
  trackId: string;
  position: number;
  addedAt: string;
}

export interface UserLibraryRecord {
  id: string;
  userId: string;
  trackId: string;
  savedAt: string;
}

export interface RecentlyPlayedRecord {
  id: string;
  userId: string;
  trackId: string;
  playedAt: string;
  durationPlayed: number;
  song?: Song;
}

export interface PlaybackHistoryRecord {
  id: string;
  userId: string;
  trackId: string;
  sessionPlaybackId?: string;
  deviceInfo?: string;
  completed?: boolean;
  playedAt: string;
}

export interface ListeningHistoryItem {
  id: string;
  userId: string;
  songId: string;
  playedAt: string;
  durationPlayed: number;
  song?: Song;
}
