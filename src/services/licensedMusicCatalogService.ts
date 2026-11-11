/**
 * AURA MUSIC — Licensed Music Catalog Service
 * 
 * Provides an independent playback system using a verified licensed music catalog.
 * Guarantees every track record has legitimate metadata, artwork, and full-length authorized audio.
 * Never scrapes or extracts unauthorized audio.
 */

import type { Song, Album, Artist, Playlist, MusicLanguage } from '../types/index.ts';
import { trackRepository } from './trackRepository.ts';
import { trackValidationService } from './trackValidationService.ts';
import { INITIAL_PLAYLISTS } from '../data/initialCatalog.ts';

class LicensedMusicCatalogService {
  private playlists: Playlist[] = [];

  constructor() {
    this.playlists = [...INITIAL_PLAYLISTS];
  }

  /**
   * Get all verified, playable tracks in the independent catalog.
   */
  public getPlayableTracks(language?: MusicLanguage | string): Song[] {
    const allPlayable = trackRepository.getPlayableTracks();
    if (!language || language === 'All Languages') {
      return allPlayable;
    }
    return allPlayable.filter((t) => t.language?.toLowerCase() === language.toLowerCase());
  }

  /**
   * Get all tracks regardless of availability (e.g. for complete catalog view / discographies)
   */
  public getAllTracks(language?: MusicLanguage | string): Song[] {
    return trackRepository.getTracksByLanguage(language || 'All Languages');
  }

  /**
   * Get track by unique internal track_id
   */
  public getTrack(trackId: string): Song | undefined {
    return trackRepository.getTrackById(trackId);
  }

  /**
   * Checks whether a track can be played.
   */
  public isTrackPlayable(trackId: string): boolean {
    const track = trackRepository.getTrackById(trackId);
    if (!track) return false;
    return trackValidationService.isPlaybackAuthorized(track);
  }

  /**
   * Get all artists
   */
  public getArtists(): Artist[] {
    return trackRepository.getAllArtists();
  }

  public getArtist(artistId: string): Artist | undefined {
    return trackRepository.getArtistById(artistId);
  }

  /**
   * Get all albums
   */
  public getAlbums(): Album[] {
    return trackRepository.getAllAlbums();
  }

  public getAlbum(albumId: string): Album | undefined {
    return trackRepository.getAlbumById(albumId);
  }

  /**
   * Get curated playlists
   */
  public getPlaylists(): Playlist[] {
    return this.playlists;
  }

  public getPlaylist(playlistId: string): Playlist | undefined {
    return this.playlists.find((p) => p.id === playlistId);
  }
}

export const licensedMusicCatalogService = new LicensedMusicCatalogService();

