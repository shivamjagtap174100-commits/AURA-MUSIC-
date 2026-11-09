import React, { useState, useEffect } from 'react';
import { Search as SearchIcon, X, Music, User, Disc, Radio, Clock } from 'lucide-react';
import type { Song, Album, Artist, Playlist } from '../types/index.ts';
import { catalogService } from '../services/catalogService';
import { SongRow } from '../components/SongRow';
import { AlbumCard } from '../components/AlbumCard';
import { ArtistCard } from '../components/ArtistCard';
import { PlaylistCard } from '../components/PlaylistCard';

interface SearchScreenProps {
  initialQuery?: string;
  onNavigate: (tab: string, meta?: any) => void;
  onOpenPlaylistModal: (song: Song) => void;
}

const RECENT_SEARCHES = ['Synthwave', 'Luna Chill', 'Neon Odyssey', 'Electronic', 'Deep House'];

const DISCOVER_GENRES = [
  { id: 'synthwave', name: 'Synthwave & Retro', desc: 'Analog synthesizers and nostalgic rhythms' },
  { id: 'lo-fi', name: 'Lo-Fi & Study', desc: 'Chill vinyl textures and low tempo beats' },
  { id: 'electronic', name: 'Electronic & Ambient', desc: 'Expansive soundscapes and deep bass' },
  { id: 'deep-house', name: 'Deep House', desc: 'Warm 4/4 grooves and rolling sub-lines' },
  { id: 'acoustic', name: 'Acoustic & Folk', desc: 'Fingerstyle guitars and organic instruments' },
  { id: 'chillstep', name: 'Chillstep & Future', desc: 'Ethereal melodies and modern sub-drops' },
];

export const SearchScreen: React.FC<SearchScreenProps> = ({
  initialQuery = '',
  onNavigate,
  onOpenPlaylistModal,
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [activeFilter, setActiveFilter] = useState<'all' | 'songs' | 'artists' | 'albums' | 'playlists'>('all');
  const [results, setResults] = useState<{
    songs: Song[];
    albums: Album[];
    artists: Artist[];
    playlists: Playlist[];
  }>({ songs: [], albums: [], artists: [], playlists: [] });

  useEffect(() => {
    if (initialQuery) {
      setQuery(initialQuery);
    }
  }, [initialQuery]);

  useEffect(() => {
    if (!query.trim()) {
      setResults({ songs: [], albums: [], artists: [], playlists: [] });
      return;
    }
    const res = catalogService.search(query);
    setResults(res);
  }, [query]);

  const hasResults =
    results.songs.length > 0 ||
    results.albums.length > 0 ||
    results.artists.length > 0 ||
    results.playlists.length > 0;

  return (
    <div className="space-y-6 pb-32 select-none animate-in fade-in duration-150">
      {/* Search Input Bar */}
      <div className="relative max-w-xl">
        <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#737373]" />
        <input
          type="text"
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search songs, artists, albums, playlists..."
          className="w-full pl-10 pr-9 py-2.5 bg-[#181818] border border-[#262626] focus:border-[#B7A0FF] rounded-lg text-sm text-[#F5F5F5] placeholder-[#525252] focus:outline-none transition-colors"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#737373] hover:text-white rounded"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Filter Category Chips */}
      {query && (
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {(['all', 'songs', 'artists', 'albums', 'playlists'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-3 py-1 rounded-md text-xs font-medium capitalize transition-colors ${
                activeFilter === filter
                  ? 'bg-[#282828] text-[#F5F5F5] border border-[#383838]'
                  : 'bg-[#181818] text-[#737373] hover:text-white border border-[#242424]'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      )}

      {/* Results View */}
      {query ? (
        hasResults ? (
          <div className="space-y-8">
            {/* Top Songs */}
            {(activeFilter === 'all' || activeFilter === 'songs') && results.songs.length > 0 && (
              <div>
                <h3 className="section-title mb-3 flex items-center gap-2">
                  <Music className="w-4 h-4 text-[#B7A0FF]" />
                  <span>Songs ({results.songs.length})</span>
                </h3>
                <div className="rounded-xl bg-[#181818] border border-[#242424] p-2 space-y-0.5">
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

            {/* Artists */}
            {(activeFilter === 'all' || activeFilter === 'artists') && results.artists.length > 0 && (
              <div>
                <h3 className="section-title mb-3 flex items-center gap-2">
                  <User className="w-4 h-4 text-[#B7A0FF]" />
                  <span>Artists ({results.artists.length})</span>
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
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

            {/* Albums */}
            {(activeFilter === 'all' || activeFilter === 'albums') && results.albums.length > 0 && (
              <div>
                <h3 className="section-title mb-3 flex items-center gap-2">
                  <Disc className="w-4 h-4 text-[#B7A0FF]" />
                  <span>Albums ({results.albums.length})</span>
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
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

            {/* Playlists */}
            {(activeFilter === 'all' || activeFilter === 'playlists') && results.playlists.length > 0 && (
              <div>
                <h3 className="section-title mb-3 flex items-center gap-2">
                  <Radio className="w-4 h-4 text-[#B7A0FF]" />
                  <span>Playlists ({results.playlists.length})</span>
                </h3>
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
          </div>
        ) : (
          <div className="text-center py-20 text-[#737373]">
            <p className="text-sm font-medium text-[#A1A1A1]">No matches found for "{query}"</p>
            <p className="text-xs text-[#737373] mt-1">Please check your spelling or search by another artist or genre.</p>
          </div>
        )
      ) : (
        /* Empty / Idle State: Recent searches & Discover Genres */
        <div className="space-y-8">
          {/* Recent Searches */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#737373] mb-3 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span>Recent Searches</span>
            </h3>
            <div className="flex items-center gap-2 flex-wrap">
              {RECENT_SEARCHES.map((term) => (
                <button
                  key={term}
                  onClick={() => setQuery(term)}
                  className="px-3 py-1.5 rounded-md bg-[#181818] hover:bg-[#202020] border border-[#242424] text-xs text-[#A1A1A1] hover:text-[#F5F5F5] transition-colors"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>

          {/* Discover by Genre (Refined Editorial Surfaces) */}
          <div>
            <h3 className="section-title mb-3">Browse Genres & Moods</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {DISCOVER_GENRES.map((g) => (
                <div
                  key={g.id}
                  onClick={() => setQuery(g.name.split(' ')[0])}
                  className="p-4 rounded-lg bg-[#181818] hover:bg-[#202020] border border-[#242424] hover:border-[#333333] cursor-pointer transition-colors"
                >
                  <h4 className="text-sm font-medium text-[#F5F5F5]">{g.name}</h4>
                  <p className="text-xs text-[#737373] mt-1">{g.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
