/**
 * AURA MUSIC 2.0 — Dynamic Music Provider Registry
 * 
 * Implements a pluggable, modular multi-provider architecture:
 * - Metadata Provider: song title, artist, album, artwork, release date, track identifiers
 * - Playback Provider: licensed full-track playback vs official preview streaming
 * - Discovery Provider: trending tracks, popular artists, new releases
 * - User Music Provider: user-created playlists and library sync
 * 
 * Built to expand dynamically without rewriting application code.
 */

import type { Song, Artist, Album, MusicProvider, SpotifyDiscoveryTrack } from '../types/index.ts';
import { trackRepository } from './trackRepository.ts';
import { spotifyDiscoveryService } from './spotifyDiscoveryService.ts';

export interface ProviderCapabilities {
  metadata: boolean;
  playback: boolean;
  discovery: boolean;
  fullLength: boolean;
  previewsOnly?: boolean;
}

export interface MusicProviderAdapter {
  id: MusicProvider;
  name: string;
  description: string;
  capabilities: ProviderCapabilities;
  searchTracks(query: string, limit?: number): Promise<Song[]>;
  getTrendingTracks?(language?: string, limit?: number): Promise<Song[]>;
  getArtistDetails?(artistId: string): Promise<Artist | null>;
  getAlbumDetails?(albumId: string): Promise<Album | null>;
}

// 1. AURA LICENSED & VERIFIED CATALOG PROVIDER
class AuraLicensedProvider implements MusicProviderAdapter {
  id: MusicProvider = 'aura-licensed';
  name = 'AURA Licensed Catalogue';
  description = 'Verified multi-lingual catalog featuring full-length cultural masters and official studio previews with synchronized lyrics.';
  capabilities: ProviderCapabilities = {
    metadata: true,
    playback: true,
    discovery: true,
    fullLength: true,
  };

  async searchTracks(query: string, limit: number = 20): Promise<Song[]> {
    const q = query.toLowerCase().trim();
    if (!q) return [];
    const all = trackRepository.getAllTracks();
    const matches = all.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        (t.titleNative && t.titleNative.includes(q)) ||
        t.artistName.toLowerCase().includes(q) ||
        (t.artistNative && t.artistNative.includes(q)) ||
        (t.albumTitle && t.albumTitle.toLowerCase().includes(q)) ||
        (t.language && t.language.toLowerCase() === q)
    );
    return matches.slice(0, limit);
  }

  async getTrendingTracks(language?: string, limit: number = 20): Promise<Song[]> {
    const tracks = language
      ? trackRepository.getTracksByLanguage(language)
      : trackRepository.getAllTracks();
    return [...tracks].sort((a, b) => (b.playCount || 0) - (a.playCount || 0)).slice(0, limit);
  }
}

// 2. JAMENDO OPEN LICENSED FULL-LENGTH PROVIDER
class JamendoMusicProvider implements MusicProviderAdapter {
  id: MusicProvider = 'jamendo';
  name = 'Jamendo Global Licensed Music';
  description = 'Millions of full-length, legally licensed tracks under Creative Commons licenses.';
  capabilities: ProviderCapabilities = {
    metadata: true,
    playback: true,
    discovery: true,
    fullLength: true,
  };

  private clientId = '56d30c95'; // Standard Jamendo public developer client_id for non-commercial exploration

  async searchTracks(query: string, limit: number = 10): Promise<Song[]> {
    try {
      const url = `https://api.jamendo.com/v3.0/tracks/?client_id=${this.clientId}&format=jsonpretty&limit=${limit}&namesearch=${encodeURIComponent(query)}&include=musicinfo&audioformat=mp32`;
      const res = await fetch(url);
      if (!res.ok) return [];
      const data = await res.json();
      if (!data.results || !Array.isArray(data.results)) return [];

      return data.results.map((r: any): Song => ({
        id: `jamendo-${r.id}`,
        trackId: `jamendo-${r.id}`,
        provider: 'jamendo',
        providerTrackId: String(r.id),
        title: r.name,
        artistId: `jamendo-artist-${r.artist_id}`,
        artistName: r.artist_name,
        albumId: `jamendo-album-${r.album_id}`,
        albumTitle: r.album_name,
        coverUrl: r.album_image || r.image || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
        audioUrl: r.audio,
        audioAssetId: `jamendo-asset-${r.id}`,
        duration: r.duration || 180,
        genre: r.musicinfo?.tags?.genres?.[0] || 'Indie',
        language: 'English',
        releaseYear: r.releasedate ? new Date(r.releasedate).getFullYear() : 2023,
        audioQuality: 'High (320 kbps)',
        bitrate: '320 kbps',
        playCount: r.stats?.rate_listened_total || 15000,
        isRoyaltyFree: true,
        playbackMode: 'full-length',
        licenseInfo: `Jamendo CC License • ${r.license_ccurl || 'Creative Commons'}`,
        playbackRights: 'creative-commons',
        availabilityStatus: 'available',
        playbackAvailability: 'available',
        verificationStatus: 'verified',
        spotifyUrl: undefined,
      }));
    } catch (err) {
      // Graceful offline fallback
      return [];
    }
  }

  async getTrendingTracks(genre?: string, limit: number = 10): Promise<Song[]> {
    try {
      const order = 'popularity_month';
      const url = `https://api.jamendo.com/v3.0/tracks/?client_id=${this.clientId}&format=jsonpretty&limit=${limit}&order=${order}&include=musicinfo&audioformat=mp32`;
      const res = await fetch(url);
      if (!res.ok) return [];
      const data = await res.json();
      if (!data.results) return [];

      return data.results.map((r: any): Song => ({
        id: `jamendo-${r.id}`,
        trackId: `jamendo-${r.id}`,
        provider: 'jamendo',
        providerTrackId: String(r.id),
        title: r.name,
        artistId: `jamendo-artist-${r.artist_id}`,
        artistName: r.artist_name,
        albumId: `jamendo-album-${r.album_id}`,
        albumTitle: r.album_name,
        coverUrl: r.album_image || r.image,
        audioUrl: r.audio,
        audioAssetId: `jamendo-asset-${r.id}`,
        duration: r.duration || 210,
        genre: r.musicinfo?.tags?.genres?.[0] || 'Global Pop',
        language: 'English',
        releaseYear: 2024,
        audioQuality: 'High (320 kbps)',
        bitrate: '320 kbps',
        playCount: r.stats?.rate_listened_total || 25000,
        isRoyaltyFree: true,
        playbackMode: 'full-length',
        licenseInfo: 'Creative Commons / Jamendo Licensed Full Track',
        playbackRights: 'creative-commons',
        availabilityStatus: 'available',
        playbackAvailability: 'available',
        verificationStatus: 'verified',
      }));
    } catch {
      return [];
    }
  }
}

// 3. SPOTIFY METADATA & DISCOVERY PROVIDER
class SpotifyDiscoveryProvider implements MusicProviderAdapter {
  id: MusicProvider = 'spotify-discovery';
  name = 'Spotify Web API Discovery';
  description = 'Official Spotify Web API for album discographies, artist bios, and verified Spotify references.';
  capabilities: ProviderCapabilities = {
    metadata: true,
    playback: false, // Per Spotify Developer Policy, third-party audio engine cannot stream Spotify Content
    discovery: true,
    fullLength: false,
    previewsOnly: true,
  };

  async searchTracks(query: string, limit: number = 10): Promise<Song[]> {
    const results = await spotifyDiscoveryService.search(query);
    return results.tracks.slice(0, limit).map((st: SpotifyDiscoveryTrack): Song => ({
      id: `spotify-ref-${st.spotifyTrackId}`,
      trackId: `spotify-ref-${st.spotifyTrackId}`,
      provider: 'spotify-discovery',
      providerTrackId: st.spotifyTrackId,
      title: st.title,
      artistId: st.artistId || `artist-${st.artistName.toLowerCase().replace(/\s+/g, '-')}`,
      artistName: st.artistName,
      albumTitle: st.albumTitle,
      coverUrl: st.coverUrl,
      audioUrl: '',
      duration: Math.round(st.durationMs / 1000),
      genre: 'Commercial Master',
      language: st.language || 'English',
      audioQuality: 'High (320 kbps)',
      playCount: (st.popularity || 80) * 100000,
      isRoyaltyFree: false,
      playbackMode: 'preview',
      playbackRights: 'user-authorized',
      availabilityStatus: 'streaming',
      playbackAvailability: 'unavailable',
      verificationStatus: 'unverified',
      spotifyUrl: st.spotifyUrl,
    }));
  }
}

class ProviderRegistry {
  private providers: Map<MusicProvider, MusicProviderAdapter> = new Map();

  constructor() {
    this.register(new AuraLicensedProvider());
    this.register(new JamendoMusicProvider());
    this.register(new SpotifyDiscoveryProvider());
  }

  public register(adapter: MusicProviderAdapter) {
    this.providers.set(adapter.id, adapter);
  }

  public getProvider(id: MusicProvider): MusicProviderAdapter | undefined {
    return this.providers.get(id);
  }

  public getAllProviders(): MusicProviderAdapter[] {
    return Array.from(this.providers.values());
  }

  /**
   * Dynamic multi-provider search across all connected sources
   */
  public async searchAllProviders(query: string): Promise<{
    licensedTracks: Song[];
    spotifyDiscovery: Song[];
  }> {
    const licensedTracks: Song[] = [];
    const spotifyDiscovery: Song[] = [];

    const adapters = Array.from(this.providers.values());
    await Promise.allSettled(
      adapters.map(async (adapter) => {
        try {
          const results = await adapter.searchTracks(query, 10);
          if (adapter.id === 'spotify-discovery') {
            spotifyDiscovery.push(...results);
          } else {
            licensedTracks.push(...results);
          }
        } catch (err) {
          console.warn(`[ProviderRegistry] Search failed for provider ${adapter.id}:`, err);
        }
      })
    );

    return { licensedTracks, spotifyDiscovery };
  }
}

export const providerRegistry = new ProviderRegistry();
