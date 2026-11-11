import React, { useState } from 'react';
import { Compass, Sparkles, Flame, Play, Music, Radio, Disc } from 'lucide-react';
import type { Song, MusicLanguage } from '../types/index.ts';
import { catalogService } from '../services/catalogService';
import { useAudio } from '../context/AudioContext';
import { SongRow } from '../components/SongRow';
import { AlbumCard } from '../components/AlbumCard';
import { ArtistCard } from '../components/ArtistCard';
import { GENRES, MUSIC_LANGUAGES } from '../data/initialCatalog.ts';

interface DiscoverScreenProps {
  onNavigate: (tab: string, meta?: any) => void;
  onOpenPlaylistModal: (song: Song) => void;
}

export const DiscoverScreen: React.FC<DiscoverScreenProps> = ({
  onNavigate,
  onOpenPlaylistModal,
}) => {
  const { playSong } = useAudio();
  const [selectedLanguage, setSelectedLanguage] = useState<MusicLanguage>('All Languages');

  const songs = catalogService.getSongs(selectedLanguage);
  const albums = catalogService.getAlbums(selectedLanguage);
  const artists = catalogService.getArtists(selectedLanguage);

  // Regional collections extracted from catalog
  const marathiSongs = catalogService.getSongsByLanguage('Marathi');
  const hindiSongs = catalogService.getSongsByLanguage('Hindi');
  const punjabiSongs = catalogService.getSongsByLanguage('Punjabi');
  const southSongs = [
    ...catalogService.getSongsByLanguage('Tamil'),
    ...catalogService.getSongsByLanguage('Telugu'),
  ];
  const intlSongs = [
    ...catalogService.getSongsByLanguage('Korean'),
    ...catalogService.getSongsByLanguage('Japanese'),
    ...catalogService.getSongsByLanguage('English'),
  ];

  return (
    <div className="space-y-10 pb-36 select-none animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#292929] pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#C5A66B]/10 border border-[#C5A66B]/20 mb-2">
            <Compass className="w-3.5 h-3.5 text-[#C5A66B]" />
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#C5A66B] font-semibold">
              Global Music Discovery
            </span>
          </div>
          <h1 className="editorial-hero text-3xl sm:text-4xl text-[#F3F0E9] font-['Manrope']">
            Explore Sounds Across Languages
          </h1>
          <p className="text-xs sm:text-sm text-[#929292] mt-1">
            Discover regional anthems, Bollywood classics, Punjabi energy, and global releases.
          </p>
        </div>
      </div>

      {/* Language Filter Chips */}
      <div>
        <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#666666] block mb-2.5">
          Filter By Language
        </span>
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {MUSIC_LANGUAGES.map((lang) => {
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
      </div>

      {/* Genres & Mood Collections */}
      <section>
        <h2 className="section-title mb-4">Music Genres & Categories</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {GENRES.map((genreName) => (
            <div
              key={genreName}
              onClick={() => onNavigate('search', { genreQuery: genreName })}
              className="p-4 rounded-xl bg-[#171819] hover:bg-[#202123] border border-[#292929] hover:border-[#C5A66B]/50 cursor-pointer transition-all flex flex-col justify-between h-24 group shadow-sm"
            >
              <div className="w-7 h-7 rounded-lg bg-[#202123] flex items-center justify-center text-[#C5A66B] group-hover:bg-[#C5A66B] group-hover:text-[#08090A] transition-colors">
                <Radio className="w-3.5 h-3.5" />
              </div>
              <span className="font-semibold text-xs text-[#F3F0E9] group-hover:text-[#D8BF91] font-['Manrope'] truncate">
                {genreName}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* 1. Marathi Hits & Blockbusters */}
      {marathiSongs.length > 0 && (selectedLanguage === 'All Languages' || selectedLanguage === 'Marathi') && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="section-title flex items-center gap-2">
                <span>Marathi Blockbusters & Zingaat</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-[#C5A66B]/15 text-[#C5A66B] font-mono">
                  मराठी
                </span>
              </h2>
              <p className="text-xs text-[#666666] mt-0.5">Ajay-Atul masterpieces, Sairat, Lai Bhaari, and legendary folk</p>
            </div>
          </div>

          <div className="rounded-2xl bg-[#171819] border border-[#292929] p-3 space-y-1 shadow-sm">
            {marathiSongs.map((song, idx) => (
              <SongRow
                key={song.id}
                song={song}
                index={idx}
                queueContext={marathiSongs}
                onOpenPlaylistModal={onOpenPlaylistModal}
                onSelectArtist={(artistId) => onNavigate('artist-detail', { artistId })}
              />
            ))}
          </div>
        </section>
      )}

      {/* 2. Hindi & Bollywood Hits */}
      {hindiSongs.length > 0 && (selectedLanguage === 'All Languages' || selectedLanguage === 'Hindi') && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="section-title flex items-center gap-2">
                <span>Bollywood Romantic & Soulful</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-[#C5A66B]/15 text-[#C5A66B] font-mono">
                  हिंदी
                </span>
              </h2>
              <p className="text-xs text-[#666666] mt-0.5">Arijit Singh, Shreya Ghoshal, and Pritam essentials</p>
            </div>
          </div>

          <div className="rounded-2xl bg-[#171819] border border-[#292929] p-3 space-y-1 shadow-sm">
            {hindiSongs.map((song, idx) => (
              <SongRow
                key={song.id}
                song={song}
                index={idx}
                queueContext={hindiSongs}
                onOpenPlaylistModal={onOpenPlaylistModal}
                onSelectArtist={(artistId) => onNavigate('artist-detail', { artistId })}
              />
            ))}
          </div>
        </section>
      )}

      {/* 3. Punjabi Vibes */}
      {punjabiSongs.length > 0 && (selectedLanguage === 'All Languages' || selectedLanguage === 'Punjabi') && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="section-title flex items-center gap-2">
                <span>Punjabi Fire & Urban Pop</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-[#C5A66B]/15 text-[#C5A66B] font-mono">
                  ਪੰਜਾਬੀ
                </span>
              </h2>
              <p className="text-xs text-[#666666] mt-0.5">Heavy basslines and chart-toppers from Diljit Dosanjh and Sidhu Moose Wala</p>
            </div>
          </div>

          <div className="rounded-2xl bg-[#171819] border border-[#292929] p-3 space-y-1 shadow-sm">
            {punjabiSongs.map((song, idx) => (
              <SongRow
                key={song.id}
                song={song}
                index={idx}
                queueContext={punjabiSongs}
                onOpenPlaylistModal={onOpenPlaylistModal}
                onSelectArtist={(artistId) => onNavigate('artist-detail', { artistId })}
              />
            ))}
          </div>
        </section>
      )}

      {/* 4. South Cinema Hits (Tamil & Telugu) */}
      {southSongs.length > 0 && (selectedLanguage === 'All Languages' || selectedLanguage === 'Tamil' || selectedLanguage === 'Telugu') && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="section-title flex items-center gap-2">
                <span>Tamil & Telugu Cinema Explosions</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-[#C5A66B]/15 text-[#C5A66B] font-mono">
                  தெலுங்கு / தமிழ்
                </span>
              </h2>
              <p className="text-xs text-[#666666] mt-0.5">Anirudh Ravichander, Sid Sriram, and high-energy anthems</p>
            </div>
          </div>

          <div className="rounded-2xl bg-[#171819] border border-[#292929] p-3 space-y-1 shadow-sm">
            {southSongs.map((song, idx) => (
              <SongRow
                key={song.id}
                song={song}
                index={idx}
                queueContext={southSongs}
                onOpenPlaylistModal={onOpenPlaylistModal}
                onSelectArtist={(artistId) => onNavigate('artist-detail', { artistId })}
              />
            ))}
          </div>
        </section>
      )}

      {/* 5. International Hits (K-Pop, City Pop, Synthwave) */}
      {intlSongs.length > 0 && (selectedLanguage === 'All Languages' || selectedLanguage === 'Korean' || selectedLanguage === 'Japanese' || selectedLanguage === 'English') && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="section-title flex items-center gap-2">
                <span>International Curation</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-[#C5A66B]/15 text-[#C5A66B] font-mono">
                  Global
                </span>
              </h2>
              <p className="text-xs text-[#666666] mt-0.5">BTS K-Pop, Miki Matsubara City Pop, and Tokyo Synthwave</p>
            </div>
          </div>

          <div className="rounded-2xl bg-[#171819] border border-[#292929] p-3 space-y-1 shadow-sm">
            {intlSongs.map((song, idx) => (
              <SongRow
                key={song.id}
                song={song}
                index={idx}
                queueContext={intlSongs}
                onOpenPlaylistModal={onOpenPlaylistModal}
                onSelectArtist={(artistId) => onNavigate('artist-detail', { artistId })}
              />
            ))}
          </div>
        </section>
      )}

      {/* Featured Albums Grid */}
      <section>
        <h2 className="section-title mb-4">Albums Across Regions</h2>
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

      {/* Featured Artists */}
      <section>
        <h2 className="section-title mb-4">Featured Vocalists & Composers</h2>
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
    </div>
  );
};

