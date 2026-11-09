import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { DownloadedSong, Song } from '../types';
import { downloadManager, DownloadProgress } from '../services/downloadManager';

interface DownloadContextValue {
  downloadedSongs: DownloadedSong[];
  downloadProgress: Record<string, DownloadProgress>;
  isDownloaded: (songId: string) => boolean;
  downloadSong: (song: Song) => Promise<boolean>;
  removeDownload: (songId: string) => Promise<boolean>;
  refreshDownloads: () => Promise<void>;
  storageUsed: string;
}

const DownloadContext = createContext<DownloadContextValue | null>(null);

export const DownloadProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [downloadedSongs, setDownloadedSongs] = useState<DownloadedSong[]>([]);
  const [downloadProgress, setDownloadProgress] = useState<Record<string, DownloadProgress>>({});
  const [downloadedIds, setDownloadedIds] = useState<Set<string>>(new Set());
  const [storageUsed, setStorageUsed] = useState('0 MB');

  const refreshDownloads = useCallback(async () => {
    const list = await downloadManager.getAllDownloadedSongs();
    setDownloadedSongs(list);
    setDownloadedIds(new Set(list.map((d) => d.songId)));
    const { formatted } = await downloadManager.getTotalStorage();
    setStorageUsed(formatted);
  }, []);

  useEffect(() => {
    refreshDownloads();
    const unsub = downloadManager.subscribe((progressMap) => {
      setDownloadProgress(progressMap);
      // If any completed, refresh downloads list
      const hasCompleted = Object.values(progressMap).some((p) => p.status === 'completed');
      if (hasCompleted) {
        refreshDownloads();
      }
    });
    return unsub;
  }, [refreshDownloads]);

  const isDownloaded = (songId: string) => downloadedIds.has(songId);

  const downloadSong = async (song: Song) => {
    const success = await downloadManager.downloadSong(song);
    await refreshDownloads();
    return success;
  };

  const removeDownload = async (songId: string) => {
    const success = await downloadManager.removeDownload(songId);
    await refreshDownloads();
    return success;
  };

  return (
    <DownloadContext.Provider
      value={{
        downloadedSongs,
        downloadProgress,
        isDownloaded,
        downloadSong,
        removeDownload,
        refreshDownloads,
        storageUsed,
      }}
    >
      {children}
    </DownloadContext.Provider>
  );
};

export const useDownloads = () => {
  const ctx = useContext(DownloadContext);
  if (!ctx) throw new Error('useDownloads must be used within a DownloadProvider');
  return ctx;
};

