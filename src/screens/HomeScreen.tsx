import React from 'react';
import { Play, Sparkles, TrendingUp, Flame, Disc, Radio, Clock, Music2 } from 'lucide-react';
import { Song, Album, Artist, Playlist } from '../types';
import { catalogService } from '../services/catalogService';
import { useAudio } from '../context/AudioContext';
import { SongRow } from '../components/SongRow';
import { AlbumCard } from '../components/AlbumCard';
import { PlaylistCard } from '../components/PlaylistCard';
import { GENRES } from '../data/initialCatalog';

interface HomeScreenProps {
  onNavigate: (tab: string, meta?: any) => void;
  onOpenPlaylistModal: (song: Song) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onNavigate,
  onOpenPlaylistModal,
}) => {
  const { playSong } = useAudio();

  const recentlyPlayed = catalogService.getRecentlyPlayed();
  const recommendedSongs = catalogService.getRecommendedSongs();
  const trendingSongs = catalogService.getTrendingSongs();
  const newReleases = catalogService.getNewReleases();
  const albums = catalogService.getAlbums();
  const playlists = catalogService.getPlaylists();

  const heroSong = recommendedSongs[0] || trendingSongs[0];

  const handlePlayHero = () => {
    if (heroSong) {
      playSong(heroSong, recommendedSongs, 0);
    }
  };

  return (
    <div className="space-y-8 pb-32 animate-in fade-in duration-300">
      {/* Hero Showcase Banner */}
      {heroSong && (
        <div className="relative rounded-3xl overflow-hidden glass-panel border border-white/10 p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 aura-glow">
          <div className="relative z-10 max-w-lg space-y-3 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-600/30 border border-violet-500/40 text-violet-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>AURA FEATURED TRACK</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight">
              {heroSong.title}
            </h1>

            <p className="text-sm sm:text-base text-slate-300 line-clamp-2">
              By <span className="text-cyan-400 font-semibold">{heroSong.artistName}</span> •{' '}
              {heroSong.albumTitle || 'Original Release'} • High Definition {heroSong.audioQuality}
            </p>

            <div className="flex items-center justify-center md:justify-start gap-3 pt-2">
              <button
                onClick={handlePlayHero}
                className="px-6 py-3 rounded-full bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 text-white font-bold text-sm shadow-xl shadow-violet-600/30 flex items-center gap-2 hover:scale-105 active:scale-95 transition-all"
              >
                <Play className="w-5 h-5 fill-white" />
                <span>Listen Now</span>
              </button>
              <button
                onClick={() => onNavigate('artist-detail', { artistId: heroSong.artistId })}
                className="px-5 py-3 rounded-full glass-pill hover:bg-white/10 text-white font-semibold text-xs transition-colors"
              >
                View Artist
              </button>
            </div>
          </div>

          {/* Hero Artwork with Glowing Aura */}
          <div className="relative w-48 h-48 sm:w-60 sm:h-60 rounded-2xl overflow-hidden shadow-2xl shrink-0 group border border-white/10">
            <img
              src={heroSong.coverUrl}
              alt={heroSong.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-violet-600/20 to-cyan-500/20 mix-blend-overlay" />
          </div>

          {/* Ambient background light */}
          <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-violet-600/30 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute -left-20 -top-20 w-80 h-80 bg-cyan-600/20 rounded-full blur-[100px] pointer-events-none" />
        </div>
      )}

      {/* Continue Listening / Recently Played Quick Grid */}
      {recentlyPlayed.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-cyan-400" />
              <h2 className="text-xl font-bold text-white tracking-wide">Continue Listening</h2>
            </div>
            <button
              onClick={() => onNavigate('library')}
              className="text-xs font-semibold text-slate-400 hover:text-white"
            >
              See all
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {recentlyPlayed.slice(0, 6).map((song) => (
              <div
                key={song.id}
                onClick={() => playSong(song, recentlyPlayed)}
                className="group flex items-center gap-3 p-2.5 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] hover:border-violet-500/30 transition-all cursor-pointer shadow-sm"
              >
                <img
                  src={song.coverUrl}
                  alt={song.title}
                  className="w-14 h-14 rounded-xl object-cover shrink-0 shadow-md"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-white truncate group-hover:text-cyan-400 transition-colors">
                    {song.title}
                  </p>
                  <p className="text-xs text-slate-400 truncate">{song.artistName}</p>
                </div>
                <div className="w-9 h-9 rounded-full bg-violet-600 hover:bg-violet-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md">
                  <Play className="w-4 h-4 fill-white ml-0.5" />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Recommended For You */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-violet-400" />
            <h2 className="text-xl font-bold text-white tracking-wide">Recommended For You</h2>
          </div>
        </div>

        <div className="space-y-1 glass-panel p-2 rounded-3xl">
          {recommendedSongs.slice(0, 5).map((song, idx) => (
            <SongRow
              key={song.id}
              song={song}
              index={idx}
              queueContext={recommendedSongs}
              onOpenPlaylistModal={onOpenPlaylistModal}
              onSelectArtist={(artistId) => onNavigate('artist-detail', { artistId })}
            />
          ))}
        </div>
      </section>

      {/* Popular Albums Horizontal Scroll */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Disc className="w-5 h-5 text-cyan-400" />
            <h2 className="text-xl font-bold text-white tracking-wide">Popular Albums</h2>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {albums.map((album) => (
            <AlbumCard
              key={album.id}
              album={album}
              onClick={() => onNavigate('album-detail', { albumId: album.id })}
            />
          ))}
        </div>
      </section>

      {/* Featured Curated Playlists */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-violet-400" />
            <h2 className="text-xl font-bold text-white tracking-wide">Featured Playlists</h2>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {playlists.slice(0, 3).map((pl) => (
            <PlaylistCard
              key={pl.id}
              playlist={pl}
              onClick={() => onNavigate('playlist-detail', { playlistId: pl.id })}
            />
          ))}
        </div>
      </section>

      {/* Browse By Genre Cards */}
      <section>
        <h2 className="text-xl font-bold text-white tracking-wide mb-4">Browse by Genre</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {GENRES.map((genre) => (
            <div
              key={genre.id}
              onClick={() => onNavigate('search', { genreQuery: genre.name })}
              className={`p-4 rounded-2xl bg-gradient-to-br ${genre.color} border border-white/10 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer shadow-lg`}
            >
              <h3 className="text-sm sm:text-base font-bold text-white">{genre.name}</h3>
              <p className="text-[11px] text-white/70 mt-1">Explore soundscapes</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
