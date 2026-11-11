/**
 * AURA MUSIC — User Library Service
 * 
 * Manages liked songs, saved tracks, and followed artists.
 * Synchronizes with Supabase user_library table.
 */

import type { Song } from '../types/index.ts';
import { supabase, isSupabaseConfigured } from './supabase.ts';
import { trackRepository } from './trackRepository.ts';

const STORAGE_KEY_LIKED_SONGS = 'aura_liked_songs_v2';
type LibraryListener = (likedSongIds: Set<string>) => void;

class UserLibraryService {
  private likedSongIds: Set<string> = new Set();
  private listeners: Set<LibraryListener> = new Set();

  constructor() {
    this.loadLocal();
  }

  private loadLocal() {
    if (typeof localStorage === 'undefined') return;
    try {
      const stored = localStorage.getItem(STORAGE_KEY_LIKED_SONGS);
      if (stored) {
        this.likedSongIds = new Set(JSON.parse(stored));
      } else {
        // Initial favorites
        this.likedSongIds = new Set(['song-marathi-maher', 'song-hindi-bhairavi']);
        this.saveLocal();
      }
    } catch (err) {
      console.warn('[UserLibraryService] Failed to load local likes:', err);
    }
  }

  private saveLocal() {
    if (typeof localStorage === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY_LIKED_SONGS, JSON.stringify(Array.from(this.likedSongIds)));
    } catch (err) {
      console.warn('[UserLibraryService] Failed to save local likes:', err);
    }
  }

  private notify() {
    this.listeners.forEach((l) => l(new Set(this.likedSongIds)));
  }

  public subscribe(listener: LibraryListener): () => void {
    this.listeners.add(listener);
    listener(new Set(this.likedSongIds));
    return () => this.listeners.delete(listener);
  }

  public isSongLiked(songId: string): boolean {
    return this.likedSongIds.has(songId);
  }

  public getLikedSongIds(): string[] {
    return Array.from(this.likedSongIds);
  }

  public getLikedSongs(): Song[] {
    const songs: Song[] = [];
    for (const id of this.likedSongIds) {
      const s = trackRepository.getTrackById(id);
      if (s) songs.push(s);
    }
    return songs;
  }

  public toggleLikeSong(songId: string, userId?: string): boolean {
    const isLiked = this.likedSongIds.has(songId);
    if (isLiked) {
      this.likedSongIds.delete(songId);
    } else {
      this.likedSongIds.add(songId);
    }

    this.saveLocal();
    this.notify();

    // Sync with Supabase
    if (isSupabaseConfigured && supabase && userId && userId !== 'local-user') {
      if (isLiked) {
        supabase.from('user_library').delete().match({ user_id: userId, track_id: songId });
      } else {
        supabase.from('user_library').insert({ user_id: userId, track_id: songId });
      }
    }

    return !isLiked;
  }
}

export const userLibraryService = new UserLibraryService();

