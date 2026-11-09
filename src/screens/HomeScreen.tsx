import React from 'react';
import { Play } from 'lucide-react';
import type { Song } from '../types/index.ts';
import { catalogService } from '../services/catalogService';
import { useAudio } from '../context/AudioContext';
import { SongRow } from '../components/SongRow';
import { AlbumCard } from '../components/AlbumCard';
import { PlaylistCard } from '../components/PlaylistCard';
import { ArtistCard } from '../components/ArtistCard';

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
  const albums = catalogService.getAlbums();
  const artists = catalogService.getArtists();
  const playlists = catalogService.getPlaylists();

  // One large featured editorial album / release
  const featuredAlbum = albums[0];
  const featuredSong = recommendedSongs[0] || trendingSongs[0];

  const handlePlayFeatured = () => {
    if (featuredAlbum) {
      const albumSongs = catalogService.getAlbumSongs(featuredAlbum.id);
      if (albumSongs.length > 0) {
        playSong(albumSongs[0], albumSongs, 0);
        return;
      }
    }
    if (featuredSong) {
      playSong(featuredSong, recommendedSongs, 0);
    }
  };

  return (
    <div className="space-y-10 pb-32 select-none animate-in fade-in duration-200">
      {/* 1. Large Featured Album / Release (Minimal Luxury Editorial) */}
      {featuredAlbum && (
        <section className="relative rounded-xl overflow-hidden bg-[#181818] border border-[#262626] p-6 sm:p-8 flex flex-col sm:flex-row items-center sm:items-end justify-between gap-6">
          <div className="max-w-xl space-y-3 text-center sm:text-left z-10">
            <span className="text-[11px] font-mono uppercase tracking-widest text-[#B7A0FF] font-medium">
              Featured Editorial Release
            </span>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#F5F5F5]">
              {featuredAlbum.title}
            </h1>

            <p className="text-sm text-[#A1A1A1] max-w-md">
              By <span className="text-[#F5F5F5] font-medium">{featuredAlbum.artistName}</span> • {featuredAlbum.genre} • High-Fidelity Studio Audio
            </p>

            <div className="flex items-center justify-center sm:justify-start gap-3 pt-3">
              <button
                onClick={handlePlayFeatured}
                className="px-6 py-2.5 rounded-full bg-[#F5F5F5] hover:bg-white text-black font-semibold text-xs flex items-center gap-2 hover:scale-102 active:scale-98 transition-all shadow-md"
              >
                <Play className="w-4 h-4 fill-black" />
                <span>Play Album</span>
              </button>

              <button
                onClick={() => onNavigate('album-detail', { albumId: featuredAlbum.id })}
                className="px-4 py-2.5 rounded-full bg-[#242424] hover:bg-[#2c2c2c] text-[#D4D4D4] hover:text-white font-medium text-xs transition-colors border border-[#303030]"
              >
                View Details
              </button>
            </div>
          </div>

          {/* Featured Artwork (Crisp 1:1 Square) */}
          <div className="relative w-44 h-44 sm:w-56 sm:h-56 rounded-lg overflow-hidden shrink-0 bg-[#242424] border border-[#303030] shadow-xl">
            <img
              src={featuredAlbum.coverUrl}
              alt={featuredAlbum.title}
              className="w-full h-full object-cover"
            />
          </div>
        </section>
      )}

      {/* 2. Recently Played Quick Grid */}
      {recentlyPlayed.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title">Recently Played</h2>
            <button
              onClick={() => onNavigate('library')}
              className="text-xs text-[#737373] hover:text-[#A1A1A1] transition-colors"
            >
              Show all
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {recentlyPlayed.slice(0, 6).map((song) => (
              <div
                key={song.id}
                onClick={() => playSong(song, recentlyPlayed)}
                className="group flex items-center gap-3 p-2 rounded-lg bg-[#181818] hover:bg-[#202020] border border-[#242424] hover:border-[#303030] transition-colors cursor-pointer"
              >
                <img
                  src={song.coverUrl}
                  alt={song.title}
                  className="w-12 h-12 rounded object-cover shrink-0 bg-[#242424]"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-[#F5F5F5] truncate group-hover:text-white">
                    {song.title}
                  </p>
                  <p className="text-[11px] text-[#A1A1A1] truncate mt-0.5">{song.artistName}</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-[#F5F5F5] text-black flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity mr-1 shadow-sm">
                  <Play className="w-3.5 h-3.5 fill-black ml-0.5" />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 3. Made For You / Recommended Songs */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="section-title">Made For You</h2>
            <p className="text-xs text-[#737373] mt-0.5">Selected based on your acoustic preferences</p>
          </div>
        </div>

        <div className="rounded-xl bg-[#181818] border border-[#242424] p-2 space-y-0.5">
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

      {/* 4. Popular Artists */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="section-title">Popular Artists</h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
          {artists.map((artist) => (
            <ArtistCard
              key={artist.id}
              artist={artist}
              onClick={() => onNavigate('artist-detail', { artistId: artist.id })}
            />
          ))}
        </div>
      </section>

      {/* 5. New Releases / Albums */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="section-title">New Releases</h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
          {albums.map((album) => (
            <AlbumCard
              key={album.id}
              album={album}
              onClick={() => onNavigate('album-detail', { albumId: album.id })}
            />
          ))}
        </div>
      </section>

      {/* 6. Recommended Playlists */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="section-title">Curated Playlists</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {playlists.map((pl) => (
            <PlaylistCard
              key={pl.id}
              playlist={pl}
              onClick={() => onNavigate('playlist-detail', { playlistId: pl.id })}
            />
          ))}
        </div>
      </section>
    </div>
  );
};
