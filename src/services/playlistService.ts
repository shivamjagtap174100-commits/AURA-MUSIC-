/**
 * AURA MUSIC — Playlist Service
 * 
 * Manages user-created and curated playlists.
 * Guarantees playlist tracks are mapped by explicit track_id, never array indices.
 */

import type { Playlist, Song } from '../types/index.ts';
import { INITIAL_PLAYLISTS } from '../data/initialCatalog.ts';
import { trackRepository } from './trackRepository.ts';
import { supabase, isSupabaseConfigured } from './supabase.ts';

const STORAGE_KEY_PLAYLISTS = 'aura_playlists_v2';
type PlaylistListener = (playlists: Playlist[]) => void;

class PlaylistService {
  private playlists: Playlist[] = [];
  private listeners: Set<PlaylistListener> = new Set();

  constructor() {
    this.loadLocal();
  }

  private loadLocal() {
    if (typeof localStorage === 'undefined') {
      this.playlists = [...INITIAL_PLAYLISTS];
      return;
    }
    try {
      const stored = localStorage.getItem(STORAGE_KEY_PLAYLISTS);
      if (stored) {
        const parsed: Playlist[] = JSON.parse(stored);
        // Guarantee canonical editorial playlists are always present
        const existingIds = new Set(parsed.map((p) => p.id));
        const missingInitial = INITIAL_PLAYLISTS.filter((p) => !existingIds.has(p.id));
        this.playlists = [...parsed, ...missingInitial];
      } else {
        this.playlists = [...INITIAL_PLAYLISTS];
        this.saveLocal();
      }
    } catch (err) {
      console.warn('[PlaylistService] Failed to load local playlists:', err);
      this.playlists = [...INITIAL_PLAYLISTS];
    }
  }

  private saveLocal() {
    if (typeof localStorage === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY_PLAYLISTS, JSON.stringify(this.playlists));
    } catch (err) {
      console.warn('[PlaylistService] Failed to save local playlists:', err);
    }
  }

  private notify() {
    this.listeners.forEach((l) => l([...this.playlists]));
  }

  public subscribe(listener: PlaylistListener): () => void {
    this.listeners.add(listener);
    listener([...this.playlists]);
    return () => this.listeners.delete(listener);
  }

  public getPlaylists(): Playlist[] {
    return [...this.playlists];
  }

  public getPlaylistById(playlistId: string): Playlist | undefined {
    return this.playlists.find((p) => p.id === playlistId);
  }

  public getPlaylistSongs(playlistId: string): Song[] {
    const playlist = this.getPlaylistById(playlistId);
    if (!playlist) return [];

    const songs: Song[] = [];
    for (const songId of playlist.songIds) {
      const s = trackRepository.getTrackById(songId);
      if (s) songs.push(s);
    }
    return songs;
  }

  public createPlaylist(title: string, description?: string, coverUrl?: string, userId?: string): Playlist {
    const newPlaylist: Playlist = {
      id: `playlist-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title: title.trim(),
      description: description?.trim() || 'Custom Playlist',
      coverUrl: coverUrl || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80',
      userId: userId || 'local-user',
      creatorName: 'You',
      isPublic: true,
      songIds: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.playlists.unshift(newPlaylist);
    this.saveLocal();
    this.notify();

    if (isSupabaseConfigured && supabase && userId && userId !== 'local-user') {
      supabase.from('playlists').insert({
        id: newPlaylist.id,
        user_id: userId,
        title: newPlaylist.title,
        description: newPlaylist.description,
        cover_url: newPlaylist.coverUrl,
        is_public: true,
      });
    }

    return newPlaylist;
  }

  public addSongToPlaylist(playlistId: string, songId: string) {
    const playlist = this.playlists.find((p) => p.id === playlistId);
    if (!playlist) return;

    if (!playlist.songIds.includes(songId)) {
      playlist.songIds.push(songId);
      playlist.updatedAt = new Date().toISOString();
      this.saveLocal();
      this.notify();

      if (isSupabaseConfigured && supabase && playlist.userId && playlist.userId !== 'local-user') {
        supabase.from('playlist_tracks').insert({
          playlist_id: playlistId,
          track_id: songId,
          position: playlist.songIds.length - 1,
        });
      }
    }
  }

  public removeSongFromPlaylist(playlistId: string, songId: string) {
    const playlist = this.playlists.find((p) => p.id === playlistId);
    if (!playlist) return;

    playlist.songIds = playlist.songIds.filter((id) => id !== songId);
    playlist.updatedAt = new Date().toISOString();
    this.saveLocal();
    this.notify();

    if (isSupabaseConfigured && supabase && playlist.userId && playlist.userId !== 'local-user') {
      supabase.from('playlist_tracks').delete().match({
        playlist_id: playlistId,
        track_id: songId,
      });
    }
  }

  public deletePlaylist(playlistId: string) {
    this.playlists = this.playlists.filter((p) => p.id !== playlistId);
    this.saveLocal();
    this.notify();

    if (isSupabaseConfigured && supabase) {
      supabase.from('playlists').delete().eq('id', playlistId);
    }
  }
}

export const playlistService = new PlaylistService();

