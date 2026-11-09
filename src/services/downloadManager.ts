import { get, set, del, keys } from 'idb-keyval';
import { Song, DownloadedSong } from '../types';

const AUDIO_PREFIX = 'aura_offline_audio_';
const META_PREFIX = 'aura_offline_meta_';

export interface DownloadProgress {
  songId: string;
  progress: number; // 0 to 100
  status: 'idle' | 'downloading' | 'completed' | 'error';
  error?: string;
}

type ProgressListener = (progressMap: Record<string, DownloadProgress>) => void;
const listeners: Set<ProgressListener> = new Set();
const activeProgress: Record<string, DownloadProgress> = {};

function notifyListeners() {
  listeners.forEach((listener) => listener({ ...activeProgress }));
}

export const downloadManager = {
  subscribe(listener: ProgressListener): () => void {
    listeners.add(listener);
    listener({ ...activeProgress });
    return () => listeners.delete(listener);
  },

  async isDownloaded(songId: string): Promise<boolean> {
    try {
      const blob = await get<Blob>(`${AUDIO_PREFIX}${songId}`);
      return Boolean(blob && blob.size > 0);
    } catch {
      return false;
    }
  },

  async getDownloadedAudioBlob(songId: string): Promise<Blob | null> {
    try {
      const blob = await get<Blob>(`${AUDIO_PREFIX}${songId}`);
      return blob || null;
    } catch {
      return null;
    }
  },

  async getOfflineAudioUrl(songId: string): Promise<string | null> {
    const blob = await this.getDownloadedAudioBlob(songId);
    if (!blob) return null;
    return URL.createObjectURL(blob);
  },

  async getAllDownloadedSongs(): Promise<DownloadedSong[]> {
    try {
      const allKeys = await keys();
      const metaKeys = allKeys.filter(
        (k) => typeof k === 'string' && k.startsWith(META_PREFIX)
      );

      const items: DownloadedSong[] = [];
      for (const k of metaKeys) {
        const item = await get<DownloadedSong>(k);
        if (item) {
          items.push(item);
        }
      }
      return items.sort((a, b) => new Date(b.downloadedAt).getTime() - new Date(a.downloadedAt).getTime());
    } catch (err) {
      console.error('Failed to read downloaded songs:', err);
      return [];
    }
  },

  async downloadSong(song: Song): Promise<boolean> {
    if (!song.isRoyaltyFree) {
      activeProgress[song.id] = {
        songId: song.id,
        progress: 0,
        status: 'error',
        error: 'Only licensed/royalty-free music can be downloaded for offline use.',
      };
      notifyListeners();
      return false;
    }

    const alreadyDownloaded = await this.isDownloaded(song.id);
    if (alreadyDownloaded) {
      activeProgress[song.id] = {
        songId: song.id,
        progress: 100,
        status: 'completed',
      };
      notifyListeners();
      return true;
    }

    activeProgress[song.id] = {
      songId: song.id,
      progress: 5,
      status: 'downloading',
    };
    notifyListeners();

    try {
      const response = await fetch(song.audioUrl, {
        mode: 'cors',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const contentLengthHeader = response.headers.get('content-length');
      const totalBytes = contentLengthHeader ? parseInt(contentLengthHeader, 10) : (song.fileSizeMb || 5) * 1024 * 1024;
      
      const reader = response.body?.getReader();
      if (!reader) {
        // Fallback to blob if streaming reader not supported
        const blob = await response.blob();
        await set(`${AUDIO_PREFIX}${song.id}`, blob);
        
        const downloadedItem: DownloadedSong = {
          id: `dl-${song.id}`,
          songId: song.id,
          song,
          downloadedAt: new Date().toISOString(),
          fileSize: blob.size,
          format: blob.type || 'audio/mpeg',
        };
        await set(`${META_PREFIX}${song.id}`, downloadedItem);

        activeProgress[song.id] = {
          songId: song.id,
          progress: 100,
          status: 'completed',
        };
        notifyListeners();
        return true;
      }

      // Stream with accurate progress
      let receivedBytes = 0;
      const chunks: Uint8Array[] = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        if (value) {
          chunks.push(value);
          receivedBytes += value.length;
          const pct = Math.min(99, Math.round((receivedBytes / totalBytes) * 100));
          
          activeProgress[song.id] = {
            songId: song.id,
            progress: pct,
            status: 'downloading',
          };
          notifyListeners();
        }
      }

      const blob = new Blob(chunks as BlobPart[], { type: 'audio/mpeg' });
      await set(`${AUDIO_PREFIX}${song.id}`, blob);

      const downloadedItem: DownloadedSong = {
        id: `dl-${song.id}`,
        songId: song.id,
        song,
        downloadedAt: new Date().toISOString(),
        fileSize: blob.size || receivedBytes,
        format: 'audio/mpeg',
      };
      await set(`${META_PREFIX}${song.id}`, downloadedItem);

      activeProgress[song.id] = {
        songId: song.id,
        progress: 100,
        status: 'completed',
      };
      notifyListeners();
      return true;
    } catch (err) {
      console.error('Download failed for song:', song.id, err);
      activeProgress[song.id] = {
        songId: song.id,
        progress: 0,
        status: 'error',
        error: (err as Error).message || 'Download failed',
      };
      notifyListeners();
      return false;
    }
  },

  async removeDownload(songId: string): Promise<boolean> {
    try {
      await del(`${AUDIO_PREFIX}${songId}`);
      await del(`${META_PREFIX}${songId}`);
      delete activeProgress[songId];
      notifyListeners();
      return true;
    } catch (err) {
      console.error('Failed to remove downloaded song:', songId, err);
      return false;
    }
  },

  async getTotalStorage(): Promise<{ totalBytes: number; formatted: string }> {
    const songs = await this.getAllDownloadedSongs();
    const totalBytes = songs.reduce((sum, item) => sum + (item.fileSize || 0), 0);
    const mb = totalBytes / (1024 * 1024);
    const formatted = mb > 1024 ? `${(mb / 1024).toFixed(1)} GB` : `${mb.toFixed(1)} MB`;
    return { totalBytes, formatted };
  },
};
