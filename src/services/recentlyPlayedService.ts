/**
 * AURA MUSIC — Recently Played Service
 * 
 * Manages listening history with strict track_id association.
 * Synchronizes history between local storage and Supabase database.
 */

import type { Song, ListeningHistoryItem } from '../types/index.ts';
import { supabase, isSupabaseConfigured } from './supabase.ts';
import { trackRepository } from './trackRepository.ts';

const STORAGE_KEY_RECENTLY_PLAYED = 'aura_recently_played_v2';
type RecentlyPlayedListener = (history: ListeningHistoryItem[]) => void;

class RecentlyPlayedService {
  private history: ListeningHistoryItem[] = [];
  private listeners: Set<RecentlyPlayedListener> = new Set();

  constructor() {
    this.loadLocal();
  }

  private loadLocal() {
    if (typeof localStorage === 'undefined') return;
    try {
      const stored = localStorage.getItem(STORAGE_KEY_RECENTLY_PLAYED);
      if (stored) {
        this.history = JSON.parse(stored);
      }
    } catch (err) {
      console.warn('[RecentlyPlayedService] Failed to load local history:', err);
    }
  }

  private saveLocal() {
    if (typeof localStorage === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY_RECENTLY_PLAYED, JSON.stringify(this.history.slice(0, 50)));
    } catch (err) {
      console.warn('[RecentlyPlayedService] Failed to save local history:', err);
    }
  }

  private notify() {
    this.listeners.forEach((l) => l([...this.history]));
  }

  public subscribe(listener: RecentlyPlayedListener): () => void {
    this.listeners.add(listener);
    listener([...this.history]);
    return () => this.listeners.delete(listener);
  }

  public getHistory(): ListeningHistoryItem[] {
    return [...this.history];
  }

  public getRecentSongs(): Song[] {
    const songs: Song[] = [];
    const seen = new Set<string>();

    for (const item of this.history) {
      if (!seen.has(item.songId)) {
        seen.add(item.songId);
        const song = item.song || trackRepository.getTrackById(item.songId);
        if (song) {
          songs.push(song);
        }
      }
    }
    return songs;
  }

  public async recordPlay(song: Song, durationPlayed: number = 0, userId?: string) {
    if (!song || !song.id) return;

    const item: ListeningHistoryItem = {
      id: `play-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      userId: userId || 'local-user',
      songId: song.id,
      playedAt: new Date().toISOString(),
      durationPlayed,
      song,
    };

    // Remove earlier duplicate to bump this song to the very top
    this.history = [item, ...this.history.filter((h) => h.songId !== song.id)].slice(0, 50);
    this.saveLocal();
    this.notify();

    // Sync with Supabase if online and configured
    if (isSupabaseConfigured && supabase && userId && userId !== 'local-user') {
      try {
        await supabase.from('recently_played').insert({
          user_id: userId,
          track_id: song.id,
          duration_played: durationPlayed,
          played_at: item.playedAt,
        });
      } catch (err) {
        console.warn('[RecentlyPlayedService] Supabase insert warning:', err);
      }
    }
  }
}

export const recentlyPlayedService = new RecentlyPlayedService();

