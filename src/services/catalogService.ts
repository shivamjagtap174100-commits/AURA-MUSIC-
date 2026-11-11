/**
 * AURA MUSIC — Catalog Service (Unified Façade)
 * 
 * Provides unified access across:
 * - TrackRepository (Single Source of Truth)
 * - LicensedMusicCatalogService (Verified Independent Catalog)
 * - TrackValidationService (Exact Match & Licensing Enforcement)
 * - SearchService (Smart Multilingual Engine)
 * - UserLibraryService (Liked Songs & Library)
 * - PlaylistService (Playlist Management)
 * - RecentlyPlayedService (Listening History)
 * - SpotifyDiscoveryService (Spotify Permitted Metadata Lookup)
 */

import type { Song, Album, Artist, Playlist, MusicLanguage } from '../types/index.ts';
import { trackRepository } from './trackRepository.ts';
import { licensedMusicCatalogService } from './licensedMusicCatalogService.ts';
import { trackValidationService } from './trackValidationService.ts';
import { userLibraryService } from './userLibraryService.ts';
import { playlistService } from './playlistService.ts';
import { recentlyPlayedService } from './recentlyPlayedService.ts';
import { searchService, type UnifiedSearchResult } from './searchService.ts';
import { spotifyDiscoveryService } from './spotifyDiscoveryService.ts';

export type SearchResult = {
  songs: Song[];
  albums: Album[];
  artists: Artist[];
  playlists: Playlist[];
  spotifyTracks?: any[];
};

class CatalogService {
  // Sync with Supabase on start
  public async syncWithSupabase() {
    await trackRepository.syncWithDatabase();
  }

  public async syncUserLibrary(userId: string) {
    // Synchronize library with Supabase
    await trackRepository.syncWithDatabase();
  }

  // --- SONGS ---
  public getSongs(languageFilter?: MusicLanguage): Song[] {
    return licensedMusicCatalogService.getAllTracks(languageFilter);
  }

  public getPlayableSongs(languageFilter?: MusicLanguage): Song[] {
    return licensedMusicCatalogService.getPlayableTracks(languageFilter);
  }

  public getSongById(id: string): Song | undefined {
    return trackRepository.getTrackById(id);
  }

  public getRecommendedSongs(languageFilter?: MusicLanguage): Song[] {
    const songs = this.getSongs(languageFilter);
    return [...songs].sort((a, b) => (b.playCount || 0) - (a.playCount || 0)).slice(0, 10);
  }

  public getTrendingSongs(languageFilter?: MusicLanguage): Song[] {
    const songs = this.getSongs(languageFilter);
    return [...songs].slice(0, 8);
  }

  public getNewReleases(languageFilter?: MusicLanguage): Song[] {
    const songs = this.getSongs(languageFilter);
    return [...songs].sort((a, b) => (b.releaseYear || 0) - (a.releaseYear || 0)).slice(0, 8);
  }

  public getSongsByLanguage(language: string): Song[] {
    return trackRepository.getTracksByLanguage(language);
  }

  public incrementPlayCount(songId: string) {
    const song = trackRepository.getTrackById(songId);
    if (song) {
      song.playCount = (song.playCount || 0) + 1;
      trackRepository.saveTrack(song);
    }
  }

  public async addSong(song: Song) {
    trackRepository.saveTrack(song);
  }

  public updateSong(songId: string, updates: Partial<Song>) {
    const existing = trackRepository.getTrackById(songId);
    if (existing) {
      const updated = { ...existing, ...updates };
      trackRepository.saveTrack(updated);
    }
  }

  public deleteSong(songId: string) {
    // Custom delete
  }

  // --- ALBUMS ---
  public getAlbums(languageFilter?: MusicLanguage): Album[] {
    const all = trackRepository.getAllAlbums();
    if (!languageFilter || languageFilter === 'All Languages') return all;
    return all.filter((a) => a.language?.toLowerCase() === languageFilter.toLowerCase());
  }

  public getAlbumById(id: string): Album | undefined {
    return trackRepository.getAlbumById(id);
  }

  public getAlbumSongs(albumId: string): Song[] {
    return trackRepository.getTracksByAlbum(albumId);
  }

  // --- ARTISTS ---
  public getArtists(languageFilter?: MusicLanguage): Artist[] {
    const all = trackRepository.getAllArtists();
    if (!languageFilter || languageFilter === 'All Languages') return all;
    return all.filter((a) => a.languages?.some((l) => l.toLowerCase() === languageFilter.toLowerCase()));
  }

  public getArtistById(id: string): Artist | undefined {
    return trackRepository.getArtistById(id);
  }

  public getArtistSongs(artistId: string): Song[] {
    return trackRepository.getTracksByArtist(artistId);
  }

  // --- USER LIBRARY (LIKED SONGS) ---
  public getLikedSongIds(): Set<string> {
    return new Set(userLibraryService.getLikedSongIds());
  }

  public isSongLiked(songId: string): boolean {
    return userLibraryService.isSongLiked(songId);
  }

  public toggleLikeSong(songId: string): boolean {
    return userLibraryService.toggleLikeSong(songId);
  }

  public getLikedSongs(): Song[] {
    return userLibraryService.getLikedSongs();
  }

  // --- PLAYLISTS ---
  public getPlaylists(): Playlist[] {
    return playlistService.getPlaylists();
  }

  public getPlaylistById(id: string): Playlist | undefined {
    return playlistService.getPlaylistById(id);
  }

  public createPlaylist(title: string, description: string = '', coverUrl?: string): Playlist {
    return playlistService.createPlaylist(title, description, coverUrl);
  }

  public renamePlaylist(id: string, title: string, description?: string, coverUrl?: string) {
    const p = playlistService.getPlaylistById(id);
    if (p) {
      p.title = title;
      if (description !== undefined) p.description = description;
      if (coverUrl !== undefined) p.coverUrl = coverUrl;
    }
  }

  public deletePlaylist(id: string) {
    playlistService.deletePlaylist(id);
  }

  public addSongToPlaylist(playlistId: string, songId: string) {
    playlistService.addSongToPlaylist(playlistId, songId);
  }

  public removeSongFromPlaylist(playlistId: string, songId: string) {
    playlistService.removeSongFromPlaylist(playlistId, songId);
  }

  public reorderPlaylist(playlistId: string, fromIndex: number, toIndex: number) {
    const p = playlistService.getPlaylistById(playlistId);
    if (p) {
      const [moved] = p.songIds.splice(fromIndex, 1);
      p.songIds.splice(toIndex, 0, moved);
    }
  }

  // --- RECENTLY PLAYED ---
  public recordPlay(song: Song) {
    recentlyPlayedService.recordPlay(song);
  }

  public getRecentlyPlayed(): Song[] {
    return recentlyPlayedService.getRecentSongs();
  }

  // --- SEARCH ---
  public async searchMultilingual(
    query: string,
    languageFilter?: MusicLanguage
  ): Promise<SearchResult> {
    const res: UnifiedSearchResult = await searchService.search(query, languageFilter);
    return {
      songs: res.licensedSongs,
      albums: res.albums,
      artists: res.artists,
      playlists: res.playlists,
      spotifyTracks: res.spotifyTracks,
    };
  }

  public search(query: string, languageFilter?: MusicLanguage): SearchResult {
    const res = searchService.searchSync(query, languageFilter);
    return {
      songs: res.licensedSongs,
      albums: res.albums,
      artists: res.artists,
      playlists: res.playlists,
      spotifyTracks: res.spotifyTracks,
    };
  }

  // --- VALIDATION & SPOTIFY ---
  public validateTrack(song: Song) {
    return trackValidationService.validateForPlayback(song);
  }

  public getSpotifyDiscovery(query: string, language?: string) {
    return spotifyDiscoveryService.search(query, language);
  }
}

export const catalogService = new CatalogService();
