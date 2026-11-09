import React, { useState, useEffect } from 'react';
import { Search as SearchIcon, X, Music, User, Disc, Radio, Sparkles } from 'lucide-react';
import { Song, Album, Artist, Playlist } from '../types';
import { catalogService } from '../services/catalogService';
import { SongRow } from '../components/SongRow';
import { AlbumCard } from '../components/AlbumCard';
import { ArtistCard } from '../components/ArtistCard';
import { PlaylistCard } from '../components/PlaylistCard';
import { GENRES } from '../data/initialCatalog';

interface SearchScreenProps {
  initialQuery?: string;
  onNavigate: (tab: string, meta?: any) => void;
  onOpenPlaylistModal: (song: Song) => void;
}

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
    <div className="space-y-6 pb-32 animate-in fade-in duration-200">
      {/* Search Input Bar */}
      <div className="relative max-w-2xl">
        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-violet-400" />
        <input
          type="text"
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search songs, artists, albums, playlists, genres..."
          className="w-full pl-12 pr-10 py-3.5 bg-white/[0.05] hover:bg-white/[0.08] focus:bg-white/[0.09] border border-white/10 focus:border-cyan-400 rounded-2xl text-sm sm:text-base text-white placeholder-slate-500 focus:outline-none transition-all shadow-lg"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white rounded-full hover:bg-white/10"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Filter Chips */}
      {query && (
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {(['all', 'songs', 'artists', 'albums', 'playlists'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold capitalize transition-all ${
                activeFilter === filter
                  ? 'bg-gradient-to-r from-violet-600 to-cyan-500 text-white shadow-md shadow-violet-600/30'
                  : 'bg-white/[0.05] text-slate-400 hover:text-white hover:bg-white/[0.08]'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      )}

      {/* Results Display */}
      {query ? (
        hasResults ? (
          <div className="space-y-8">
            {/* Top Song Result */}
            {(activeFilter === 'all' || activeFilter === 'songs') && results.songs.length > 0 && (
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
                  <Music className="w-4 h-4 text-cyan-400" />
                  <span>Songs ({results.songs.length})</span>
                </h3>
                <div className="glass-panel p-2 rounded-2xl space-y-1">
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

            {/* Artists Result */}
            {(activeFilter === 'all' || activeFilter === 'artists') && results.artists.length > 0 && (
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
                  <User className="w-4 h-4 text-violet-400" />
                  <span>Artists ({results.artists.length})</span>
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
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

            {/* Albums Result */}
            {(activeFilter === 'all' || activeFilter === 'albums') && results.albums.length > 0 && (
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
                  <Disc className="w-4 h-4 text-cyan-400" />
                  <span>Albums ({results.albums.length})</span>
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
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

            {/* Playlists Result */}
            {(activeFilter === 'all' || activeFilter === 'playlists') && results.playlists.length > 0 && (
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
                  <Radio className="w-4 h-4 text-violet-400" />
                  <span>Playlists ({results.playlists.length})</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
          <div className="text-center py-16 text-slate-500">
            <SearchIcon className="w-12 h-12 mx-auto mb-3 text-slate-600 opacity-40" />
            <p className="text-base font-semibold text-slate-400">No results found for "{query}"</p>
            <p className="text-xs text-slate-500 mt-1">
              Try searching with different keywords, artist name, or genre.
            </p>
          </div>
        )
      ) : (
        /* Empty State: Explore Genres */
        <div>
          <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>Browse All Genres</span>
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {GENRES.map((genre) => (
              <div
                key={genre.id}
                onClick={() => setQuery(genre.name)}
                className={`p-5 rounded-2xl bg-gradient-to-br ${genre.color} border border-white/10 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer shadow-lg`}
              >
                <h4 className="text-lg font-bold text-white">{genre.name}</h4>
                <p className="text-xs text-white/70 mt-1">Listen to {genre.name}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
