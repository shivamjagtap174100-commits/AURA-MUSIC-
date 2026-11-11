import React from 'react';
import { Play, Check, ArrowLeft, Disc } from 'lucide-react';
import type { Song } from '../types/index.ts';
import { catalogService } from '../services/catalogService';
import { useAudio } from '../context/AudioContext';
import { SongRow } from '../components/SongRow';
import { AlbumCard } from '../components/AlbumCard';

interface ArtistDetailScreenProps {
  artistId: string;
  onNavigate: (tab: string, meta?: any) => void;
  onOpenPlaylistModal: (song: Song) => void;
}

export const ArtistDetailScreen: React.FC<ArtistDetailScreenProps> = ({
  artistId,
  onNavigate,
  onOpenPlaylistModal,
}) => {
  const { playSong } = useAudio();
  const artist = catalogService.getArtistById(artistId);
  const artistSongs = catalogService.getArtistSongs(artistId);
  const artistAlbums = catalogService
    .getAlbums()
    .filter((a) => a.artistId === artistId);

  if (!artist) {
    return (
      <div className="text-center py-20 text-[#666666]">
        <p className="text-sm font-medium text-[#929292]">Artist not found</p>
        <button
          onClick={() => onNavigate('home')}
          className="mt-3 px-3 py-1.5 bg-[#171819] text-xs font-medium text-[#F3F0E9] rounded-lg border border-[#292929]"
        >
          Return Home
        </button>
      </div>
    );
  }

  const handlePlayTop = () => {
    if (artistSongs.length > 0) {
      playSong(artistSongs[0], artistSongs, 0);
    }
  };

  return (
    <div className="space-y-8 pb-36 select-none animate-in fade-in duration-150">
      <button
        onClick={() => onNavigate('home')}
        className="inline-flex items-center gap-1.5 text-xs text-[#929292] hover:text-[#C5A66B] transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back</span>
      </button>

      {/* Artist Hero Banner */}
      <div className="relative rounded-2xl overflow-hidden bg-[#171819] border border-[#292929] p-6 sm:p-8 flex flex-col sm:flex-row items-center sm:items-end gap-6 shadow-xl">
        <div className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-full overflow-hidden bg-[#101112] border-2 border-[#C5A66B]/30 shadow-2xl shrink-0">
          <img
            src={artist.avatarUrl}
            alt={artist.name}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="text-center sm:text-left space-y-2 flex-1">
          <div className="flex items-center justify-center sm:justify-start gap-1.5 text-[#C5A66B] text-[10px] font-mono uppercase tracking-[0.2em] font-semibold">
            {artist.verified && (
              <span className="w-3.5 h-3.5 rounded-full bg-[#C5A66B]/20 flex items-center justify-center">
                <Check className="w-2.5 h-2.5 text-[#C5A66B] stroke-[2.5]" />
              </span>
            )}
            <span>Verified Artist</span>
          </div>

          <div className="flex items-center justify-center sm:justify-start gap-2.5">
            <h1 className="text-3xl sm:text-5xl font-extrabold text-[#F3F0E9] tracking-tight font-['Manrope']">
              {artist.name}
            </h1>
            {artist.nameNative && (
              <span className="text-sm px-2.5 py-0.5 rounded-full bg-[#101112] text-[#C5A66B] border border-[#292929]">
                {artist.nameNative}
              </span>
            )}
          </div>

          <p className="text-xs text-[#929292] font-mono">
            {artist.monthlyListeners?.toLocaleString() || '500,000'} monthly listeners
          </p>

          <div className="pt-2 flex items-center justify-center sm:justify-start gap-3">
            <button
              onClick={handlePlayTop}
              disabled={artistSongs.length === 0}
              className="px-6 py-2.5 rounded-full bg-[#C5A66B] hover:bg-[#D8BF91] text-[#08090A] font-bold text-xs flex items-center gap-1.5 shadow-md disabled:opacity-40"
            >
              <Play className="w-3.5 h-3.5 fill-[#08090A]" />
              <span>Play Top Tracks</span>
            </button>
          </div>
        </div>
      </div>

      {/* Artist Bio */}
      {artist.bio && (
        <div className="p-4 rounded-xl bg-[#171819] border border-[#292929]">
          <h3 className="text-[10px] uppercase tracking-[0.2em] text-[#C5A66B] font-mono mb-1.5 font-semibold">
            About the Artist
          </h3>
          <p className="text-xs sm:text-sm text-[#F3F0E9] leading-relaxed max-w-xl">{artist.bio}</p>
        </div>
      )}

      {/* Popular Tracks */}
      <section>
        <h2 className="section-title mb-3">Popular Releases</h2>
        <div className="rounded-2xl bg-[#171819] border border-[#292929] p-3 space-y-1 shadow-sm">
          {artistSongs.map((song, idx) => (
            <SongRow
              key={song.id}
              song={song}
              index={idx}
              queueContext={artistSongs}
              onOpenPlaylistModal={onOpenPlaylistModal}
            />
          ))}
        </div>
      </section>

      {/* Artist Albums */}
      {artistAlbums.length > 0 && (
        <section>
          <h2 className="section-title mb-3 flex items-center gap-2">
            <Disc className="w-4 h-4 text-[#C5A66B]" />
            <span>Discography</span>
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {artistAlbums.map((album) => (
              <AlbumCard
                key={album.id}
                album={album}
                onClick={() => onNavigate('album-detail', { albumId: album.id })}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
