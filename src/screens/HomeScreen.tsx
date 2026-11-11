import React, { useState } from 'react';
import { Play, Sparkles, Disc, Radio, ArrowRight } from 'lucide-react';
import type { Song, MusicLanguage } from '../types/index.ts';
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

const QUICK_LANGUAGES: MusicLanguage[] = [
  'All Languages',
  'Hindi',
  'Marathi',
  'Punjabi',
  'Tamil',
  'Telugu',
  'English',
  'Korean',
];

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onNavigate,
  onOpenPlaylistModal,
}) => {
  const { playSong } = useAudio();
  const [selectedLanguage, setSelectedLanguage] = useState<MusicLanguage>('All Languages');

  const recentlyPlayed = catalogService.getRecentlyPlayed();
  const recommendedSongs = catalogService.getRecommendedSongs(selectedLanguage);
  const trendingSongs = catalogService.getTrendingSongs(selectedLanguage);
  const albums = catalogService.getAlbums(selectedLanguage);
  const artists = catalogService.getArtists(selectedLanguage);
  const playlists = catalogService.getPlaylists();

  // Featured Cinematic Hero Album (e.g. Sairat / Brahmastra / Neon Odyssey)
  const featuredAlbum = albums.find((a) => a.id === 'album-sairat') || albums[0];

  const handlePlayFeatured = () => {
    if (featuredAlbum) {
      const albumSongs = catalogService.getAlbumSongs(featuredAlbum.id);
      if (albumSongs.length > 0) {
        playSong(albumSongs[0], albumSongs, 0);
        return;
      }
    }
    if (recommendedSongs.length > 0) {
      playSong(recommendedSongs[0], recommendedSongs, 0);
    }
  };

  return (
    <div className="space-y-10 pb-36 select-none animate-in fade-in duration-200">
      {/* Language Filter Pills Bar */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        {QUICK_LANGUAGES.map((lang) => {
          const isSelected = selectedLanguage === lang;
          return (
            <button
              key={lang}
              onClick={() => setSelectedLanguage(lang)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                isSelected
                  ? 'bg-[#C5A66B] text-[#08090A] shadow-md font-semibold'
                  : 'bg-[#171819] text-[#929292] hover:text-[#F3F0E9] hover:bg-[#202123] border border-[#292929]'
              }`}
            >
              {lang}
            </button>
          );
        })}
      </div>

      {/* 1. Cinematic Hero Album Section (Minimal Luxury Obsidian Gold) */}
      {featuredAlbum && (
        <section className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-[#101112] via-[#171819] to-[#101112] border border-[#292929] p-6 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl">
          <div className="max-w-xl space-y-4 text-center md:text-left z-10">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#C5A66B]/10 border border-[#C5A66B]/20">
              <Sparkles className="w-3.5 h-3.5 text-[#C5A66B]" />
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#C5A66B] font-semibold">
                Cinematic Masterpiece
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[#F3F0E9] font-['Manrope'] leading-tight">
              {featuredAlbum.title}
            </h1>

            <p className="text-sm text-[#929292] max-w-md leading-relaxed">
              By <span className="text-[#F3F0E9] font-semibold">{featuredAlbum.artistName}</span> • {featuredAlbum.genre} • High-Fidelity Lossless
            </p>

            <div className="flex items-center justify-center md:justify-start gap-3.5 pt-2">
              <button
                onClick={handlePlayFeatured}
                className="px-7 py-3 rounded-full bg-[#C5A66B] hover:bg-[#D8BF91] text-[#08090A] font-bold text-xs flex items-center gap-2 hover:scale-102 active:scale-98 transition-all shadow-xl"
              >
                <Play className="w-4 h-4 fill-[#08090A]" />
                <span>Play Now</span>
              </button>

              <button
                onClick={() => onNavigate('album-detail', { albumId: featuredAlbum.id })}
                className="px-5 py-3 rounded-full bg-[#171819] hover:bg-[#202123] text-[#F3F0E9] hover:text-[#D8BF91] font-semibold text-xs transition-colors border border-[#292929]"
              >
                Explore Album
              </button>
            </div>
          </div>

          {/* Cinematic Hero Artwork (Crisp 1:1 Square with Gold Border) */}
          <div className="relative w-52 h-52 sm:w-64 sm:h-64 rounded-2xl overflow-hidden shrink-0 bg-[#101112] border border-[#292929] shadow-2xl group">
            <img
              src={featuredAlbum.coverUrl}
              alt={featuredAlbum.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-103"
            />
          </div>
        </section>
      )}

      {/* 2. Recently Played Quick Grid */}
      {recentlyPlayed.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="section-title">Recently Played</h2>
              <p className="text-xs text-[#666666] mt-0.5">Jump right back into your listening sessions</p>
            </div>
            <button
              onClick={() => onNavigate('library')}
              className="text-xs text-[#929292] hover:text-[#C5A66B] transition-colors flex items-center gap-1 font-medium"
            >
              <span>See library</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {recentlyPlayed.slice(0, 6).map((song) => (
              <div
                key={song.id}
                onClick={() => playSong(song, recentlyPlayed)}
                className="group flex items-center gap-3.5 p-2.5 rounded-xl bg-[#171819] hover:bg-[#202123] border border-[#292929] hover:border-[#383838] transition-all cursor-pointer shadow-sm"
              >
                <img
                  src={song.coverUrl}
                  alt={song.title}
                  className="w-12 h-12 rounded-lg object-cover shrink-0 bg-[#101112]"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-[#F3F0E9] truncate group-hover:text-[#D8BF91] font-['Manrope']">
                    {song.title}
                  </p>
                  <p className="text-[11px] text-[#929292] truncate mt-0.5">{song.artistName}</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-[#C5A66B] text-[#08090A] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity mr-1 shadow-md">
                  <Play className="w-3.5 h-3.5 fill-[#08090A] ml-0.5" />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 3. Made For Your Mood / Recommended Songs */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="section-title">Made For Your Mood</h2>
            <p className="text-xs text-[#666666] mt-0.5">Acoustic resonance matching your taste profile</p>
          </div>
        </div>

        <div className="rounded-2xl bg-[#171819] border border-[#292929] p-3 space-y-1 shadow-sm">
          {recommendedSongs.slice(0, 6).map((song, idx) => (
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

      {/* 4. Trending Albums */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="section-title">Trending Albums</h2>
            <p className="text-xs text-[#666666] mt-0.5">Chart-topping collections this week</p>
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

      {/* 5. Daily Mixes */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="section-title">Daily Mixes</h2>
            <p className="text-xs text-[#666666] mt-0.5">Fresh algorithmic playlists tuned daily for you</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              title: 'Daily Mix 1 • Bollywood Soul',
              desc: 'Arijit Singh, Shreya Ghoshal, Pritam & Mithoon',
              cover: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
              songs: ['song-hindi-kesariya', 'song-hindi-tum-hi-ho', 'song-hindi-channa-mereya'],
            },
            {
              title: 'Daily Mix 2 • Marathi Blockbusters',
              desc: 'Ajay-Atul, Sairat, Lai Bhaari & High Energy Folk',
              cover: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80',
              songs: ['song-marathi-zingaat', 'song-marathi-yad-lagla', 'song-marathi-mauli'],
            },
            {
              title: 'Daily Mix 3 • Punjabi Anthems',
              desc: 'Karan Aujla, Diljit Dosanjh, Ikky & Urban Bhangra',
              cover: 'https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/d3/08/bc/d308bc6a-20e1-6532-d933-35d1b429210e/5054197755538.jpg/600x600bb.jpg',
              songs: ['song-punjabi-tauba-tauba', 'song-punjabi-softly', 'song-punjabi-lover'],
            },
            {
              title: 'Daily Mix 4 • Nocturnal Chill',
              desc: 'Japanese City Pop, Miki Matsubara & Synthwave',
              cover: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=600&auto=format&fit=crop&q=80',
              songs: ['song-intl-stay-with-me', 'song-intl-cyber-horizon'],
            },
          ].map((mix, idx) => (
            <div
              key={idx}
              onClick={() => {
                const s = mix.songs.map((id) => catalogService.getSongById(id)).filter(Boolean) as Song[];
                if (s.length > 0) playSong(s[0], s, 0);
              }}
              className="group p-3.5 rounded-xl bg-[#171819] hover:bg-[#202123] border border-[#292929] hover:border-[#383838] transition-all cursor-pointer flex flex-col shadow-sm"
            >
              <div className="relative aspect-square w-full rounded-lg overflow-hidden mb-3 bg-[#101112]">
                <img
                  src={mix.cover}
                  alt={mix.title}
                  className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
                />
                <button className="absolute bottom-2.5 right-2.5 w-10 h-10 rounded-full bg-[#C5A66B] text-[#08090A] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-lg hover:scale-105 active:scale-95">
                  <Play className="w-4 h-4 fill-[#08090A] ml-0.5" />
                </button>
              </div>
              <h4 className="font-semibold text-[#F3F0E9] text-sm truncate group-hover:text-[#D8BF91] font-['Manrope']">
                {mix.title}
              </h4>
              <p className="text-xs text-[#929292] line-clamp-2 mt-1 leading-relaxed">
                {mix.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 6. Popular Artists */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="section-title">Popular Artists</h2>
            <p className="text-xs text-[#666666] mt-0.5">Top-streamed vocalists and composers</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {artists.map((artist) => (
            <ArtistCard
              key={artist.id}
              artist={artist}
              onClick={() => onNavigate('artist-detail', { artistId: artist.id })}
            />
          ))}
        </div>
      </section>

      {/* 7. Recommended Playlists */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="section-title">Recommended Playlists</h2>
            <p className="text-xs text-[#666666] mt-0.5">Editorial selections crafted for your day</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
