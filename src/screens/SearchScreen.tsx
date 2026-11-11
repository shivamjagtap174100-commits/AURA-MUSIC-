import React, { useState, useEffect } from 'react';
import { Search as SearchIcon, X, Music, User, Disc, Radio, Clock, Sparkles, AlertCircle } from 'lucide-react';
import type { Song, Album, Artist, Playlist, MusicLanguage } from '../types/index.ts';
import { catalogService, type SearchResult } from '../services/catalogService';
import { SongRow } from '../components/SongRow';
import { AlbumCard } from '../components/AlbumCard';
import { ArtistCard } from '../components/ArtistCard';
import { PlaylistCard } from '../components/PlaylistCard';
import { MUSIC_LANGUAGES } from '../data/initialCatalog.ts';

interface SearchScreenProps {
  initialQuery?: string;
  onNavigate: (tab: string, meta?: any) => void;
  onOpenPlaylistModal: (song: Song) => void;
}

const TRENDING_SEARCHES = [
  'Arijit Singh',
  'अरिजीत सिंह',
  'Ajay Atul',
  'अजय अतुल',
  'Shreya Ghoshal',
  'श्रेया घोषाल',
  'Marathi songs',
  'मराठी गाणी',
  'Hindi romantic songs',
  'Bollywood hits',
  'Punjabi music',
  'Tamil songs',
  'Diljit Dosanjh',
  'Zingaat',
  'Kesariya',
  'BTS',
];

export const SearchScreen: React.FC<SearchScreenProps> = ({
  initialQuery = '',
  onNavigate,
  onOpenPlaylistModal,
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [selectedLanguage, setSelectedLanguage] = useState<MusicLanguage>('All Languages');
  const [activeCategory, setActiveCategory] = useState<'all' | 'songs' | 'spotify' | 'artists' | 'albums' | 'playlists'>('all');
  const [recentSearches, setRecentSearches] = useState<string[]>([
    'Arijit Singh',
    'Ajay Atul',
    'Marathi songs',
    'Bollywood hits',
  ]);
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<SearchResult>({
    songs: [],
    albums: [],
    artists: [],
    playlists: [],
  });

  useEffect(() => {
    if (initialQuery) {
      setQuery(initialQuery);
    }
  }, [initialQuery]);

  useEffect(() => {
    const rawQ = query.trim();
    if (!rawQ) {
      setResults({ songs: [], albums: [], artists: [], playlists: [] });
      setIsSearching(false);
      return;
    }

    // Immediate local search for zero-latency UI response
    const immediateLocal = catalogService.search(rawQ, selectedLanguage);
    setResults(immediateLocal);

    // Asynchronous deep search with iTunes API and transliteration
    let isCurrentEffect = true;
    setIsSearching(true);

    const timer = setTimeout(async () => {
      try {
        const fullResult = await catalogService.searchMultilingual(rawQ, selectedLanguage);
        if (isCurrentEffect) {
          setResults(fullResult);
        }
      } finally {
        if (isCurrentEffect) setIsSearching(false);
      }
    }, 250);

    return () => {
      isCurrentEffect = false;
      clearTimeout(timer);
    };
  }, [query, selectedLanguage]);

  const handleSelectQuery = (selected: string) => {
    setQuery(selected);
    if (!recentSearches.includes(selected)) {
      setRecentSearches([selected, ...recentSearches.slice(0, 5)]);
    }
  };

  const hasResults =
    results.songs.length > 0 ||
    results.albums.length > 0 ||
    results.artists.length > 0 ||
    results.playlists.length > 0;

  return (
    <div className="space-y-6 pb-36 select-none animate-in fade-in duration-150">
      {/* Search Input Bar with Obsidian Gold Styling */}
      <div className="relative max-w-2xl">
        <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#C5A66B]" />
        <input
          type="text"
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search Hindi, Marathi, Punjabi, Tamil, English or native script (e.g. अरिजीत, अजय अतुल, श्रेया)..."
          className="w-full pl-10 pr-10 py-3 bg-[#101112] border border-[#292929] focus:border-[#C5A66B] rounded-xl text-sm text-[#F3F0E9] placeholder-[#555555] focus:outline-none transition-all shadow-inner"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#666666] hover:text-[#F3F0E9] rounded-md transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Language Filter Chips */}
      <div>
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {MUSIC_LANGUAGES.map((lang) => {
            const isSelected = selectedLanguage === lang;
            return (
              <button
                key={lang}
                onClick={() => setSelectedLanguage(lang)}
                className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-[#C5A66B] text-[#08090A] shadow-sm font-semibold'
                    : 'bg-[#171819] text-[#929292] hover:text-[#F3F0E9] hover:bg-[#202123] border border-[#292929]'
                }`}
              >
                {lang}
              </button>
            );
          })}
        </div>
      </div>

      {/* Category Tabs: All, Playable Songs, Spotify Discovery, Artists, Albums, Playlists */}
      {query && (
        <div className="flex items-center gap-2 border-b border-[#292929] pb-3 overflow-x-auto no-scrollbar">
          {(['all', 'songs', 'spotify', 'artists', 'albums', 'playlists'] as const).map((cat) => {
            const label = cat === 'songs' ? 'Licensed Tracks' : cat === 'spotify' ? 'Spotify Discovery' : cat;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors shrink-0 ${
                  activeCategory === cat
                    ? 'bg-[#171819] text-[#C5A66B] border border-[#C5A66B]/30'
                    : 'text-[#929292] hover:text-[#F3F0E9]'
                }`}
              >
                {label}
              </button>
            );
          })}
          {results.spotifyTracks && results.spotifyTracks.length > 0 && (
            <span className="ml-auto text-[10px] font-mono text-[#1DB954] bg-[#1DB954]/10 px-2 py-0.5 rounded border border-[#1DB954]/20 hidden sm:inline">
              Spotify Web API Active
            </span>
          )}
        </div>
      )}

      {/* Search Empty / Default State: Trending Searches & Recent Searches */}
      {!query && (
        <div className="space-y-8 pt-2">
          {/* Trending Searches */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-3.5 h-3.5 text-[#C5A66B]" />
              <h3 className="text-xs font-bold uppercase tracking-[0.16em] text-[#666666]">
                Trending & Multilingual Queries
              </h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {TRENDING_SEARCHES.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectQuery(item)}
                  className="px-3 py-1.5 rounded-xl bg-[#171819] hover:bg-[#202123] border border-[#292929] hover:border-[#C5A66B]/40 text-xs text-[#F3F0E9] hover:text-[#D8BF91] transition-all flex items-center gap-1.5 shadow-sm"
                >
                  <span>{item}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Recent Searches */}
          {recentSearches.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-3.5 h-3.5 text-[#666666]" />
                <h3 className="text-xs font-bold uppercase tracking-[0.16em] text-[#666666]">
                  Recent Searches
                </h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectQuery(item)}
                    className="px-3 py-1.5 rounded-xl bg-[#101112] hover:bg-[#171819] border border-[#292929] text-xs text-[#929292] hover:text-[#F3F0E9] transition-colors"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Search Results Display */}
      {query && (
        <div className="space-y-8">
          {/* Top Exact / Key Matching Artist */}
          {(activeCategory === 'all' || activeCategory === 'artists') && results.artists.length > 0 && (
            <div>
              <h3 className="section-title mb-3">Artists</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
                {results.artists.map((artist) => (
                  <ArtistCard
                    key={artist.id}
                    artist={artist}
                    onClick={() => onNavigate('artist-detail', { artistId: artist.id })}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Matching Songs */}
          {(activeCategory === 'all' || activeCategory === 'songs') && results.songs.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="section-title">Songs ({results.songs.length})</h3>
              </div>
              <div className="rounded-2xl bg-[#171819] border border-[#292929] p-3 space-y-1 shadow-sm">
                {results.songs.map((song, idx) => (
                  <SongRow
                    key={song.id}
                    song={song}
                    index={idx}
                    queueContext={results.songs}
                    onOpenPlaylistModal={onOpenPlaylistModal}
                    onSelectArtist={(artistId) => onNavigate('artist-detail', { artistId })}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Spotify Discovery (Permitted Reference & Links) */}
          {(activeCategory === 'all' || activeCategory === 'spotify') && results.spotifyTracks && results.spotifyTracks.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <h3 className="section-title">Spotify Discovery</h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#1DB954]/15 text-[#1DB954] border border-[#1DB954]/30">
                    Official Web API
                  </span>
                </div>
                <span className="text-xs text-[#929292] hidden sm:inline">
                  Permitted discovery references & direct Spotify links
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {results.spotifyTracks.map((st: any) => (
                  <div
                    key={st.spotifyTrackId}
                    className="flex items-center justify-between gap-3 p-3 rounded-xl bg-[#171819] border border-[#292929] hover:border-[#1DB954]/40 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <img
                        src={st.coverUrl}
                        alt={st.title}
                        className="w-12 h-12 rounded-lg object-cover bg-[#202123] shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-[#F3F0E9] truncate">
                          {st.title}
                        </p>
                        <p className="text-xs text-[#929292] truncate mt-0.5">
                          {st.artistName}
                        </p>
                        <p className="text-[11px] text-[#666666] truncate">
                          {st.albumTitle}
                        </p>
                      </div>
                    </div>
                    <a
                      href={st.spotifyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1.5 rounded-lg bg-[#1DB954] text-black font-semibold text-xs hover:bg-[#1ed760] transition-colors shrink-0 flex items-center gap-1 shadow"
                    >
                      <span>Spotify</span>
                      <span>↗</span>
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Matching Albums */}
          {(activeCategory === 'all' || activeCategory === 'albums') && results.albums.length > 0 && (
            <div>
              <h3 className="section-title mb-3">Albums</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
                {results.albums.map((album) => (
                  <AlbumCard
                    key={album.id}
                    album={album}
                    onClick={() => onNavigate('album-detail', { albumId: album.id })}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Matching Playlists */}
          {(activeCategory === 'all' || activeCategory === 'playlists') && results.playlists.length > 0 && (
            <div>
              <h3 className="section-title mb-3">Playlists</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {results.playlists.map((pl) => (
                  <PlaylistCard
                    key={pl.id}
                    playlist={pl}
                    onClick={() => onNavigate('playlist-detail', { playlistId: pl.id })}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Honest, Clear No-Results State with Suggestions */}
          {!hasResults && !isSearching && (
            <div className="text-center py-16 px-4 rounded-2xl bg-[#171819] border border-[#292929] max-w-lg mx-auto space-y-4">
              <div className="w-12 h-12 rounded-full bg-[#101112] border border-[#292929] text-[#C5A66B] flex items-center justify-center mx-auto">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-[#F3F0E9] font-['Manrope']">
                  No matching tracks found for "{query}"
                </h3>
                <p className="text-xs text-[#929292] mt-1 max-w-xs mx-auto">
                  Try checking spelling, selecting "All Languages", or searching for popular artists like Arijit Singh, Ajay-Atul, or Shreya Ghoshal.
                </p>
              </div>

              <div className="pt-2 flex flex-wrap justify-center gap-2">
                {['Arijit Singh', 'Ajay Atul', 'Marathi songs', 'Zingaat', 'Kesariya'].map((s) => (
                  <button
                    key={s}
                    onClick={() => handleSelectQuery(s)}
                    className="px-3 py-1 rounded-lg bg-[#202123] text-xs text-[#C5A66B] hover:bg-[#28292c]"
                  >
                    Search {s}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
