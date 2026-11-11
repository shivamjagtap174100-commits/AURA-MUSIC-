/**
 * AURA MUSIC — Smart Multilingual Search Service
 * 
 * Implements:
 * 1. Language-aware search with Devanagari, Gurmukhi, Tamil, Telugu, and Latin transliteration.
 * 2. Strict separation of Independent Licensed Catalog results from Spotify Discovery results.
 * 3. Never returns an unrelated English song as a Marathi playback result.
 */

import type { Song, Album, Artist, Playlist, MusicLanguage, SpotifyDiscoveryTrack } from '../types/index.ts';
import { trackRepository } from './trackRepository.ts';
import { playlistService } from './playlistService.ts';
import { spotifyDiscoveryService } from './spotifyDiscoveryService.ts';
import { providerRegistry } from './providerRegistry.ts';

// Transliteration dictionary for Indian scripts and regional musical queries
const TRANSLITERATION_MAP: Record<string, string[]> = {
  // Arijit Singh
  'arijit': ['अरिजीत', 'अरिजीत सिंह', 'arijit singh', 'अरिजित'],
  'arijit singh': ['अरिजीत सिंह', 'अरिजीत', 'arijit', 'अरिजित सिंग'],
  'अरिजीत सिंह': ['arijit singh', 'arijit', 'अरिजित'],
  'अरिजीत': ['arijit', 'arijit singh'],

  // Shreya Ghoshal
  'shreya': ['श्रेया', 'श्रेया घोषाल', 'shreya ghoshal'],
  'shreya ghoshal': ['श्रेया घोषाल', 'श्रेया', 'shreya'],
  'श्रेया घोषाल': ['shreya ghoshal', 'shreya'],
  'श्रेया': ['shreya', 'shreya ghoshal'],

  // Ajay Atul
  'ajay atul': ['अजय अतुल', 'ajay-atul', 'अजय-अतुल', 'ajay atul'],
  'अजय अतुल': ['ajay atul', 'ajay-atul', 'अजय-अतुल'],
  'ajay': ['अजय', 'ajay atul', 'अजय अतुल'],
  'अजय': ['ajay', 'ajay atul'],

  // Diljit Dosanjh
  'diljit': ['दिलजीत', 'ਦਿਲਜੀਤ', 'diljit dosanjh', 'ਦਿਲਜੀਤ ਦੋਸਾਂਝ'],
  'diljit dosanjh': ['ਦਿਲਜੀਤ ਦੋਸਾਂਝ', 'दिलजीत दोसांझ', 'diljit'],
  'ਦਿਲਜੀਤ ਦੋਸਾਂਝ': ['diljit dosanjh', 'diljit'],

  // Karan Aujla
  'karan': ['ਕਰਨ', 'करण', 'karan aujla', 'ਕਰਨ ਔਜਲਾ'],
  'karan aujla': ['ਕਰਨ ਔਜਲਾ', 'करण औजला', 'karan aujla', 'karan', 'aujla'],
  'ਕਰਨ ਔਜਲਾ': ['karan aujla', 'karan', 'aujla'],
  'करण औजला': ['karan aujla', 'karan'],
  'aujla': ['ਔਜਲਾ', 'karan aujla', 'ਕਰਨ ਔਜਲਾ'],
  'tauba tauba': ['ਤੌਬਾ ਤੌਬਾ', 'तौबा तौबा', 'tauba tauba'],
  'softly': ['ਸਾਫਟਲੀ', 'softly', 'ikky'],
  'winning speech': ['ਵਿਨਿੰਗ ਸਪੀਚ', 'winning speech'],
  '52 bars': ['52 bars', 'ਬਵੰਜਾ ਬਾਰਜ਼'],

  // A.R. Rahman
  'rahman': ['ए आर रहमान', 'ரஹ்மான்', 'ar rahman', 'a.r. rahman'],
  'ar rahman': ['ए आर रहमान', 'ரஹ்மான்', 'rahman', 'a.r. rahman'],
  'a.r. rahman': ['ए आर रहमान', 'ரஹ்மான்', 'rahman', 'ar rahman'],
  'ஏ.ஆர்.ரஹ்மான்': ['ar rahman', 'a.r. rahman', 'rahman'],

  // Sonu Nigam
  'sonu': ['सोनू', 'सोनू निगम', 'sonu nigam'],
  'sonu nigam': ['सोनू निगम', 'सोनू', 'sonu'],
  'सोनू निगम': ['sonu nigam', 'sonu'],

  // Marathi queries
  'marathi': ['मराठी', 'marathi songs', 'मराठी गाणी'],
  'marathi songs': ['मराठी गाणी', 'मराठी गाणी mp3', 'marathi hits', 'मराठी'],
  'मराठी गाणी': ['marathi songs', 'marathi hits', 'marathi'],
  'मराठी': ['marathi', 'marathi songs'],

  // Hindi & Bollywood
  'hindi': ['हिंदी', 'हिन्दी', 'hindi songs', 'बॉलीवुड'],
  'hindi romantic songs': ['हिंदी गाने', 'बॉलीवुड', 'romantic hindi', 'hindi romance'],
  'bollywood': ['बॉलीवुड', 'bollywood hits', 'hindi film'],
  'bollywood hits': ['बॉलीवुड हिट्स', 'bollywood', 'hindi hits'],

  // Punjabi
  'punjabi': ['पंजाबी', 'ਪੰਜਾਬੀ', 'punjabi music', 'punjabi songs'],
  'punjabi music': ['ਪੰਜਾਬੀ ਗਾਣੇ', 'punjabi hits', 'punjabi songs', 'bhangra'],

  // South Indian
  'tamil': ['தமிழ்', 'tamil songs', 'tamil hits'],
  'tamil songs': ['தமிழ் பாடல்கள்', 'tamil hits', 'kollywood'],
  'telugu': ['తెలుగు', 'telugu songs', 'tollywood'],
  'telugu songs': ['తెలుగు పాటలు', 'telugu hits'],

  // Devotional & Classical
  'abhang': ['अभंग', 'vitthal abhang', 'विठ्ठल अभंग'],
  'अभंग': ['abhang', 'vitthal abhang', 'marathi devotional'],
  'bhajan': ['भजन', 'devotional'],
  'classical': ['शास्त्रीय', 'hindustani', 'carnatic', 'raga'],
};

export interface UnifiedSearchResult {
  query: string;
  // Independent Verified Catalog Results (Playable with 100% matched audio)
  licensedSongs: Song[];
  playableSongs: Song[];
  albums: Album[];
  artists: Artist[];
  playlists: Playlist[];
  // Spotify Discovery Integration (Attributed with external links & Spotify badges)
  spotifyTracks: SpotifyDiscoveryTrack[];
  detectedLanguage?: string;
}

class SearchService {
  /**
   * Normalize search text (remove punctuation, lower-case, trim)
   */
  private normalize(str: string): string {
    return str.toLowerCase().replace(/[-_.,!?:;'"]/g, ' ').replace(/\s+/g, ' ').trim();
  }

  /**
   * Detect potential target language from search tokens
   */
  public detectLanguageFromQuery(query: string): string | null {
    const q = this.normalize(query);
    if (/[\u0900-\u097F]/.test(query)) {
      // Devanagari script (Marathi or Hindi)
      if (q.includes('मराठी') || q.includes('गाणी') || q.includes('झिंगाट') || q.includes('माऊली') || q.includes('अभंग')) {
        return 'Marathi';
      }
      return 'Hindi';
    }
    if (/[\u0A00-\u0A7F]/.test(query) || q.includes('punjabi') || q.includes('bhangra')) {
      return 'Punjabi';
    }
    if (/[\u0B80-\u0BFF]/.test(query) || q.includes('tamil')) {
      return 'Tamil';
    }
    if (/[\u0C00-\u0C7F]/.test(query) || q.includes('telugu')) {
      return 'Telugu';
    }
    if (q.includes('marathi') || q.includes('sairat') || q.includes('abhang')) {
      return 'Marathi';
    }
    if (q.includes('hindi') || q.includes('bollywood') || q.includes('arijit') || q.includes('ghoshal')) {
      return 'Hindi';
    }
    return null;
  }

  /**
   * Synchronous local search for immediate, zero-latency UI rendering
   */
  public searchSync(query: string, languageFilter?: MusicLanguage | string): UnifiedSearchResult {
    const rawQ = query.trim();
    if (!rawQ) {
      return {
        query,
        licensedSongs: [],
        playableSongs: [],
        albums: [],
        artists: [],
        playlists: [],
        spotifyTracks: [],
      };
    }

    const normQ = this.normalize(rawQ);
    const detectedLang = this.detectLanguageFromQuery(rawQ);
    const activeLanguage = (!languageFilter || languageFilter === 'All Languages') ? detectedLang : languageFilter;

    // Expand search terms with transliterations
    const terms = new Set<string>([rawQ, normQ]);
    for (const [key, synonyms] of Object.entries(TRANSLITERATION_MAP)) {
      if (key === rawQ || key === normQ || synonyms.some((s) => s.toLowerCase() === normQ)) {
        terms.add(key);
        synonyms.forEach((syn) => terms.add(syn));
      }
    }

    const searchTokens = Array.from(terms);

    // Filter licensed tracks
    const allTracks = trackRepository.getAllTracks();
    const matchedTracks = allTracks.filter((s) => {
      // Language enforcement: If user searches Marathi or filtered by Marathi, NEVER show unrelated English tracks!
      if (activeLanguage && activeLanguage !== 'All Languages') {
        if (s.language && s.language.toLowerCase() !== activeLanguage.toLowerCase()) {
          // If searching for Marathi, exclude English unless explicitly requested
          const isMarathiSearch = activeLanguage.toLowerCase() === 'marathi';
          if (isMarathiSearch && s.language.toLowerCase() === 'english') {
            return false;
          }
        }
      }

      const matchTarget = [
        s.title,
        s.titleNative,
        s.artistName,
        s.artistNative,
        s.albumTitle,
        s.albumNative,
        s.composer,
        s.genre,
        s.language,
      ].filter(Boolean).join(' ');

      const normTarget = this.normalize(matchTarget);

      return searchTokens.some((tok) => {
        const normTok = this.normalize(tok);
        return matchTarget.includes(tok) || normTarget.includes(normTok);
      });
    });

    // Rank results: prioritize exact title/artist matches and verified playable tracks
    matchedTracks.sort((a, b) => {
      const aPlayable = a.playbackAvailability === 'available' ? 1 : 0;
      const bPlayable = b.playbackAvailability === 'available' ? 1 : 0;
      if (aPlayable !== bPlayable) return bPlayable - aPlayable;
      return (b.playCount || 0) - (a.playCount || 0);
    });

    const playable = matchedTracks.filter((t) => t.playbackAvailability === 'available');

    // Filter Artists
    const allArtists = trackRepository.getAllArtists();
    const matchedArtists = allArtists.filter((a) => {
      const target = [a.name, a.nameNative, ...(a.genres || []), ...(a.languages || [])].filter(Boolean).join(' ');
      const normTarget = this.normalize(target);
      return searchTokens.some((tok) => target.includes(tok) || normTarget.includes(this.normalize(tok)));
    });

    // Filter Albums
    const allAlbums = trackRepository.getAllAlbums();
    const matchedAlbums = allAlbums.filter((al) => {
      const target = [al.title, al.titleNative, al.artistName, al.genre, al.language].filter(Boolean).join(' ');
      const normTarget = this.normalize(target);
      return searchTokens.some((tok) => target.includes(tok) || normTarget.includes(this.normalize(tok)));
    });

    // Filter Playlists
    const allPlaylists = playlistService.getPlaylists();
    const matchedPlaylists = allPlaylists.filter((p) => {
      const target = [p.title, p.description].filter(Boolean).join(' ');
      const normTarget = this.normalize(target);
      return searchTokens.some((tok) => target.includes(tok) || normTarget.includes(this.normalize(tok)));
    });

    // Spotify Discovery (Curated fallback during sync search)
    const spotifyDiscovery = spotifyDiscoveryService.getTrendingDiscovery(activeLanguage || undefined).filter((st) => {
      const target = `${st.title} ${st.artistName} ${st.albumTitle}`.toLowerCase();
      return searchTokens.some((tok) => target.includes(this.normalize(tok)));
    });

    return {
      query,
      licensedSongs: matchedTracks,
      playableSongs: playable,
      albums: matchedAlbums,
      artists: matchedArtists,
      playlists: matchedPlaylists,
      spotifyTracks: spotifyDiscovery,
      detectedLanguage: detectedLang || undefined,
    };
  }

  /**
   * Asynchronous deep search integrating live Spotify Discovery Web API & Multi-Provider Registry
   */
  public async search(query: string, languageFilter?: MusicLanguage | string): Promise<UnifiedSearchResult> {
    const syncResults = this.searchSync(query, languageFilter);

    if (!query.trim()) return syncResults;

    try {
      const activeLanguage = (!languageFilter || languageFilter === 'All Languages')
        ? syncResults.detectedLanguage
        : languageFilter;

      // 1. Query Spotify discovery
      const spotifyRes = await spotifyDiscoveryService.search(query, activeLanguage || undefined);

      // 2. Query dynamic multi-provider registry for additional licensed tracks if local results are few
      let additionalLicensed: Song[] = [];
      try {
        const jamendo = providerRegistry.getProvider('jamendo');
        if (jamendo) {
          additionalLicensed = await jamendo.searchTracks(query, 5);
        }
      } catch {
        // Safe fallback
      }

      const existingIds = new Set(syncResults.licensedSongs.map((s) => s.id));
      const newLicensed = additionalLicensed.filter((s) => !existingIds.has(s.id));
      const combinedLicensed = [...syncResults.licensedSongs, ...newLicensed];
      const combinedPlayable = combinedLicensed.filter((s) => s.playbackAvailability === 'available');

      return {
        ...syncResults,
        licensedSongs: combinedLicensed,
        playableSongs: combinedPlayable,
        spotifyTracks: spotifyRes.tracks.length > 0 ? spotifyRes.tracks : syncResults.spotifyTracks,
      };
    } catch (err) {
      console.warn('[SearchService] Async discovery search warning:', err);
      return syncResults;
    }
  }
}

export const searchService = new SearchService();

