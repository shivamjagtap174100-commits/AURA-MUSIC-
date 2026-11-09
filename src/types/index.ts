export type AudioQuality = 'Normal (128 kbps)' | 'High (320 kbps)' | 'Ultra HD / FLAC';

export interface Artist {
  id: string;
  name: string;
  bio?: string;
  avatarUrl: string;
  bannerUrl?: string;
  monthlyListeners?: number;
  genres?: string[];
  verified?: boolean;
}

export interface Album {
  id: string;
  title: string;
  artistId: string;
  artistName: string;
  coverUrl: string;
  releaseYear: number;
  genre: string;
  totalTracks?: number;
  songIds?: string[];
}

export interface Song {
  id: string;
  title: string;
  artistId: string;
  artistName: string;
  albumId?: string;
  albumTitle?: string;
  coverUrl: string;
  audioUrl: string;
  duration: number; // in seconds
  genre: string;
  releaseYear?: number;
  audioQuality: AudioQuality;
  bitrate?: string;
  fileSizeMb?: number;
  playCount: number;
  lyrics?: string;
  isRoyaltyFree: boolean;
  licenseInfo?: string;
  createdAt?: string;
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
}

export interface ListeningHistoryItem {
  id: string;
  userId: string;
  songId: string;
  playedAt: string;
  durationPlayed: number;
  song?: Song;
}
