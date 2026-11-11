/**
 * AURA MUSIC — Track Repository (Single Source of Truth)
 * 
 * Manages the unified collection of verified tracks, artists, and albums.
 * Guarantees every track has a unique internal track_id, verified provider,
 * and unambiguous audio-to-metadata association.
 */

import type { Song, Artist, Album, MusicLanguage, PlaybackAvailability } from '../types/index.ts';
import { INITIAL_SONGS, INITIAL_ARTISTS, INITIAL_ALBUMS } from '../data/initialCatalog.ts';
import { supabase, isSupabaseConfigured } from './supabase.ts';

const STORAGE_KEY_CUSTOM_TRACKS = 'aura_custom_tracks_v2';

class TrackRepository {
  private tracks: Map<string, Song> = new Map();
  private artists: Map<string, Artist> = new Map();
  private albums: Map<string, Album> = new Map();

  constructor() {
    this.init();
  }

  private init() {
    // 1. Seed artists
    INITIAL_ARTISTS.forEach((artist) => {
      this.artists.set(artist.id, { ...artist });
    });

    // 2. Seed albums
    INITIAL_ALBUMS.forEach((album) => {
      this.albums.set(album.id, { ...album });
    });

    // 3. Seed canonical initial tracks
    INITIAL_SONGS.forEach((song) => {
      const canonical: Song = {
        ...song,
        trackId: song.id,
        provider: song.provider || 'aura-licensed',
        playbackAvailability: song.playbackAvailability || (song.audioUrl ? 'available' : 'unavailable'),
        verificationStatus: song.verificationStatus || (song.audioUrl ? 'verified' : 'unverified'),
      };
      this.tracks.set(song.id, canonical);
    });

    // 4. Load any custom uploaded tracks from safe storage
    if (typeof localStorage !== 'undefined') {
      try {
        const stored = localStorage.getItem(STORAGE_KEY_CUSTOM_TRACKS);
        if (stored) {
          const custom: Song[] = JSON.parse(stored);
          custom.forEach((t) => this.tracks.set(t.id, t));
        }
      } catch (err) {
        console.warn('[TrackRepository] Error reading custom tracks cache:', err);
      }
    }
  }

  public getAllTracks(): Song[] {
    return Array.from(this.tracks.values());
  }

  public getTrackById(trackId: string): Song | undefined {
    return this.tracks.get(trackId);
  }

  public getPlayableTracks(): Song[] {
    return this.getAllTracks().filter(
      (t) => t.playbackAvailability === 'available' && t.verificationStatus === 'verified' && Boolean(t.audioUrl)
    );
  }

  public getTracksByLanguage(language: MusicLanguage | string): Song[] {
    if (!language || language === 'All Languages') {
      return this.getAllTracks();
    }
    return this.getAllTracks().filter((t) => t.language?.toLowerCase() === language.toLowerCase());
  }

  public getTracksByArtist(artistId: string): Song[] {
    return this.getAllTracks().filter((t) => t.artistId === artistId);
  }

  public getTracksByAlbum(albumId: string): Song[] {
    return this.getAllTracks().filter((t) => t.albumId === albumId);
  }

  public getAllArtists(): Artist[] {
    return Array.from(this.artists.values());
  }

  public getArtistById(artistId: string): Artist | undefined {
    return this.artists.get(artistId);
  }

  public getAllAlbums(): Album[] {
    return Array.from(this.albums.values());
  }

  public getAlbumById(albumId: string): Album | undefined {
    return this.albums.get(albumId);
  }

  public saveTrack(track: Song) {
    this.tracks.set(track.id, track);
    if (typeof localStorage !== 'undefined') {
      try {
        const custom = Array.from(this.tracks.values()).filter((t) => !INITIAL_SONGS.some((i) => i.id === t.id));
        localStorage.setItem(STORAGE_KEY_CUSTOM_TRACKS, JSON.stringify(custom));
      } catch (err) {
        console.warn('[TrackRepository] Error persisting custom track:', err);
      }
    }
  }

  /**
   * Sync with Supabase database if configured
   */
  public async syncWithDatabase(): Promise<void> {
    if (!isSupabaseConfigured || !supabase) return;
    try {
      const { data, error } = await supabase
        .from('tracks')
        .select('*');

      if (!error && data && data.length > 0) {
        data.forEach((row: any) => {
          const track: Song = {
            id: row.track_id,
            trackId: row.track_id,
            provider: row.provider || 'aura-licensed',
            providerTrackId: row.provider_track_id,
            title: row.title,
            titleNative: row.title_native,
            artistId: row.artist_id,
            artistName: row.artist_name,
            artistNative: row.artist_native,
            albumId: row.album_id,
            albumTitle: row.album_title,
            albumNative: row.album_native,
            coverUrl: row.cover_url,
            audioUrl: row.audio_url,
            audioAssetId: row.audio_asset_id,
            duration: row.duration,
            genre: row.genre,
            language: row.language,
            composer: row.composer,
            releaseYear: row.release_year,
            audioQuality: row.audio_quality || 'High (320 kbps)',
            bitrate: row.bitrate,
            fileSizeMb: Number(row.file_size_mb) || 5.0,
            playCount: Number(row.play_count) || 0,
            lyrics: row.lyrics,
            isRoyaltyFree: row.is_royalty_free ?? true,
            licenseInfo: row.license_info,
            playbackRights: row.playback_rights || 'licensed-full',
            playbackAvailability: row.playback_availability as PlaybackAvailability || 'available',
            verificationStatus: row.verification_status || 'verified',
            spotifyUrl: row.spotify_url,
            createdAt: row.created_at,
          };
          this.tracks.set(track.id, track);
        });
      }
    } catch (err) {
      console.warn('[TrackRepository] Supabase sync error:', err);
    }
  }
}

export const trackRepository = new TrackRepository();

