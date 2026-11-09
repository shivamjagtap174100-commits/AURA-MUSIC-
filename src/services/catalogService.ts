import { Song, Album, Artist, Playlist, ListeningHistoryItem } from '../types';
import { INITIAL_SONGS, INITIAL_ALBUMS, INITIAL_ARTISTS, INITIAL_PLAYLISTS } from '../data/initialCatalog';
import { supabase, isSupabaseConfigured } from './supabase';

const STORAGE_KEY_CUSTOM_SONGS = 'aura_custom_songs';
const STORAGE_KEY_PLAYLISTS = 'aura_custom_playlists';
const STORAGE_KEY_LIKES = 'aura_liked_song_ids';
const STORAGE_KEY_HISTORY = 'aura_listening_history';

class CatalogService {
  private songs: Song[] = [];
  private albums: Album[] = [];
  private artists: Artist[] = [];
  private playlists: Playlist[] = [];
  private likedSongIds: Set<string> = new Set();
  private history: ListeningHistoryItem[] = [];
  private initialized = false;

  constructor() {
    this.loadLocalData();
  }

  private loadLocalData() {
    try {
      // 1. Initial base songs + local admin added songs
      const storedSongs = localStorage.getItem(STORAGE_KEY_CUSTOM_SONGS);
      const customSongs: Song[] = storedSongs ? JSON.parse(storedSongs) : [];
      this.songs = [...INITIAL_SONGS, ...customSongs];

      // 2. Albums & Artists
      this.albums = [...INITIAL_ALBUMS];
      this.artists = [...INITIAL_ARTISTS];

      // 3. Playlists
      const storedPlaylists = localStorage.getItem(STORAGE_KEY_PLAYLISTS);
      if (storedPlaylists) {
        this.playlists = JSON.parse(storedPlaylists);
      } else {
        this.playlists = [...INITIAL_PLAYLISTS];
        this.savePlaylists();
      }

      // 4. Liked Songs
      const storedLikes = localStorage.getItem(STORAGE_KEY_LIKES);
      if (storedLikes) {
        this.likedSongIds = new Set(JSON.parse(storedLikes));
      } else {
        this.likedSongIds = new Set(['song-1', 'song-2']); // Initial default likes
        this.saveLikes();
      }

      // 5. Listening History
      const storedHistory = localStorage.getItem(STORAGE_KEY_HISTORY);
      if (storedHistory) {
        this.history = JSON.parse(storedHistory);
      }
    } catch (err) {
      console.warn('Error reading local catalog cache:', err);
      this.songs = [...INITIAL_SONGS];
      this.albums = [...INITIAL_ALBUMS];
      this.artists = [...INITIAL_ARTISTS];
      this.playlists = [...INITIAL_PLAYLISTS];
      this.likedSongIds = new Set(['song-1']);
    }
    this.initialized = true;
  }

  public async syncWithSupabase() {
    if (!isSupabaseConfigured || !supabase) return;
    try {
      // Fetch songs from Supabase if present
      const { data: remoteSongs, error } = await supabase
        .from('songs')
        .select('*');

      if (!error && remoteSongs && remoteSongs.length > 0) {
        const mapped: Song[] = remoteSongs.map((s) => ({
          id: s.id,
          title: s.title,
          artistId: s.artist_id,
          artistName: s.artist_name || 'Unknown Artist',
          albumId: s.album_id,
          albumTitle: s.album_title,
          coverUrl: s.cover_url,
          audioUrl: s.audio_url,
          duration: s.duration,
          genre: s.genre,
          releaseYear: s.release_year,
          audioQuality: s.audio_quality,
          bitrate: s.bitrate,
          fileSizeMb: Number(s.file_size_mb || 5),
          playCount: Number(s.play_count || 0),
          lyrics: s.lyrics,
          isRoyaltyFree: s.is_royalty_free,
          licenseInfo: s.license_info,
        }));
        this.songs = mapped;
      }
    } catch (err) {
      console.info('Supabase sync notice:', err);
    }
  }

  private saveCustomSongs() {
    const custom = this.songs.filter((s) => !INITIAL_SONGS.some((init) => init.id === s.id));
    localStorage.setItem(STORAGE_KEY_CUSTOM_SONGS, JSON.stringify(custom));
  }

  private savePlaylists() {
    localStorage.setItem(STORAGE_KEY_PLAYLISTS, JSON.stringify(this.playlists));
  }

  private saveLikes() {
    localStorage.setItem(STORAGE_KEY_LIKES, JSON.stringify(Array.from(this.likedSongIds)));
  }

  private saveHistory() {
    localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(this.history.slice(0, 50)));
  }

  // --- SONGS ---
  public getSongs(): Song[] {
    return this.songs;
  }

  public getSongById(id: string): Song | undefined {
    return this.songs.find((s) => s.id === id);
  }

  public getRecommendedSongs(): Song[] {
    // Return high rated / most played tracks
    return [...this.songs].sort((a, b) => b.playCount - a.playCount).slice(0, 6);
  }

  public getTrendingSongs(): Song[] {
    return [...this.songs].slice(0, 5);
  }

  public getNewReleases(): Song[] {
    return [...this.songs].slice(-4).reverse();
  }

  public incrementPlayCount(songId: string) {
    const song = this.songs.find((s) => s.id === songId);
    if (song) {
      song.playCount = (song.playCount || 0) + 1;
      this.saveCustomSongs();
    }
  }

  public addSong(song: Song) {
    this.songs.unshift(song);
    this.saveCustomSongs();
  }

  public updateSong(songId: string, updates: Partial<Song>) {
    const index = this.songs.findIndex((s) => s.id === songId);
    if (index !== -1) {
      this.songs[index] = { ...this.songs[index], ...updates };
      this.saveCustomSongs();
    }
  }

  public deleteSong(songId: string) {
    this.songs = this.songs.filter((s) => s.id !== songId);
    this.likedSongIds.delete(songId);
    this.saveCustomSongs();
    this.saveLikes();
    // Also remove from all playlists
    this.playlists.forEach((p) => {
      p.songIds = p.songIds.filter((id) => id !== songId);
    });
    this.savePlaylists();
  }

  // --- ALBUMS & ARTISTS ---
  public getAlbums(): Album[] {
    return this.albums;
  }

  public getAlbumById(id: string): Album | undefined {
    return this.albums.find((a) => a.id === id);
  }

  public getAlbumSongs(albumId: string): Song[] {
    return this.songs.filter((s) => s.albumId === albumId);
  }

  public getArtists(): Artist[] {
    return this.artists;
  }

  public getArtistById(id: string): Artist | undefined {
    return this.artists.find((a) => a.id === id);
  }

  public getArtistSongs(artistId: string): Song[] {
    return this.songs.filter((s) => s.artistId === artistId);
  }

  // --- LIKED SONGS ---
  public getLikedSongIds(): Set<string> {
    return new Set(this.likedSongIds);
  }

  public isSongLiked(songId: string): boolean {
    return this.likedSongIds.has(songId);
  }

  public toggleLikeSong(songId: string): boolean {
    if (this.likedSongIds.has(songId)) {
      this.likedSongIds.delete(songId);
      this.saveLikes();
      return false;
    } else {
      this.likedSongIds.add(songId);
      this.saveLikes();
      return true;
    }
  }

  public getLikedSongs(): Song[] {
    return this.songs.filter((s) => this.likedSongIds.has(s.id));
  }

  // --- PLAYLISTS ---
  public getPlaylists(): Playlist[] {
    return this.playlists;
  }

  public getPlaylistById(id: string): Playlist | undefined {
    return this.playlists.find((p) => p.id === id);
  }

  public createPlaylist(title: string, description: string = '', coverUrl?: string): Playlist {
    const newPlaylist: Playlist = {
      id: `pl-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title,
      description,
      coverUrl: coverUrl || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80',
      creatorName: 'You',
      isPublic: true,
      songIds: [],
      createdAt: new Date().toISOString(),
    };
    this.playlists.unshift(newPlaylist);
    this.savePlaylists();
    return newPlaylist;
  }

  public renamePlaylist(id: string, title: string, description?: string, coverUrl?: string) {
    const playlist = this.playlists.find((p) => p.id === id);
    if (playlist) {
      playlist.title = title;
      if (description !== undefined) playlist.description = description;
      if (coverUrl !== undefined) playlist.coverUrl = coverUrl;
      playlist.updatedAt = new Date().toISOString();
      this.savePlaylists();
    }
  }

  public deletePlaylist(id: string) {
    this.playlists = this.playlists.filter((p) => p.id !== id);
    this.savePlaylists();
  }

  public addSongToPlaylist(playlistId: string, songId: string) {
    const playlist = this.playlists.find((p) => p.id === playlistId);
    if (playlist && !playlist.songIds.includes(songId)) {
      playlist.songIds.push(songId);
      playlist.updatedAt = new Date().toISOString();
      this.savePlaylists();
    }
  }

  public removeSongFromPlaylist(playlistId: string, songId: string) {
    const playlist = this.playlists.find((p) => p.id === playlistId);
    if (playlist) {
      playlist.songIds = playlist.songIds.filter((id) => id !== songId);
      playlist.updatedAt = new Date().toISOString();
      this.savePlaylists();
    }
  }

  public reorderPlaylist(playlistId: string, fromIndex: number, toIndex: number) {
    const playlist = this.playlists.find((p) => p.id === playlistId);
    if (playlist) {
      const updated = [...playlist.songIds];
      const [moved] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, moved);
      playlist.songIds = updated;
      playlist.updatedAt = new Date().toISOString();
      this.savePlaylists();
    }
  }

  // --- LISTENING HISTORY ---
  public recordPlay(song: Song) {
    this.incrementPlayCount(song.id);
    const item: ListeningHistoryItem = {
      id: `hist-${Date.now()}`,
      userId: 'local-user',
      songId: song.id,
      playedAt: new Date().toISOString(),
      durationPlayed: 0,
      song,
    };
    // Keep most recent first, filter duplicates within same session
    this.history = [item, ...this.history.filter((h) => h.songId !== song.id)].slice(0, 30);
    this.saveHistory();
  }

  public getRecentlyPlayed(): Song[] {
    const recentSongIds = this.history.map((h) => h.songId);
    const result: Song[] = [];
    recentSongIds.forEach((id) => {
      const s = this.getSongById(id);
      if (s && !result.some((r) => r.id === s.id)) {
        result.push(s);
      }
    });
    // Fallback if empty
    if (result.length === 0) {
      return this.songs.slice(0, 4);
    }
    return result;
  }

  // --- SEARCH ---
  public search(query: string): {
    songs: Song[];
    albums: Album[];
    artists: Artist[];
    playlists: Playlist[];
  } {
    const q = query.trim().toLowerCase();
    if (!q) {
      return { songs: [], albums: [], artists: [], playlists: [] };
    }

    const songs = this.songs.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.artistName.toLowerCase().includes(q) ||
        s.genre.toLowerCase().includes(q) ||
        (s.albumTitle && s.albumTitle.toLowerCase().includes(q)) ||
        (s.lyrics && s.lyrics.toLowerCase().includes(q))
    );

    const albums = this.albums.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.artistName.toLowerCase().includes(q) ||
        a.genre.toLowerCase().includes(q)
    );

    const artists = this.artists.filter(
      (art) =>
        art.name.toLowerCase().includes(q) ||
        (art.genres && art.genres.some((g) => g.toLowerCase().includes(q)))
    );

    const playlists = this.playlists.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        (p.description && p.description.toLowerCase().includes(q))
    );

    return { songs, albums, artists, playlists };
  }
}

export const catalogService = new CatalogService();

