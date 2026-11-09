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
      <div className="text-center py-20 text-[#737373]">
        <p className="text-sm font-medium text-[#A1A1A1]">Artist not found</p>
        <button
          onClick={() => onNavigate('home')}
          className="mt-3 px-3 py-1.5 bg-[#202020] text-xs font-medium text-white rounded-md"
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
    <div className="space-y-8 pb-32 select-none animate-in fade-in duration-150">
      <button
        onClick={() => onNavigate('home')}
        className="inline-flex items-center gap-1.5 text-xs text-[#737373] hover:text-[#F5F5F5] transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back</span>
      </button>

      {/* Artist Hero Banner */}
      <div className="relative rounded-xl overflow-hidden bg-[#181818] border border-[#242424] p-6 sm:p-8 flex flex-col sm:flex-row items-center sm:items-end gap-6">
        <div className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-full overflow-hidden bg-[#242424] border-2 border-[#303030] shadow-xl shrink-0">
          <img
            src={artist.avatarUrl}
            alt={artist.name}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="text-center sm:text-left space-y-2 flex-1">
          <div className="flex items-center justify-center sm:justify-start gap-1.5 text-[#B7A0FF] text-[11px] font-mono uppercase tracking-wider">
            {artist.verified && (
              <span className="w-3.5 h-3.5 rounded-full bg-[#B7A0FF]/20 flex items-center justify-center">
                <Check className="w-2.5 h-2.5 text-[#B7A0FF] stroke-[2.5]" />
              </span>
            )}
            <span>Verified Artist</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-bold text-[#F5F5F5] tracking-tight">
            {artist.name}
          </h1>

          <p className="text-xs text-[#A1A1A1] font-mono">
            {artist.monthlyListeners?.toLocaleString() || '500,000'} monthly listeners
          </p>

          <div className="pt-2 flex items-center justify-center sm:justify-start gap-3">
            <button
              onClick={handlePlayTop}
              disabled={artistSongs.length === 0}
              className="px-5 py-2 rounded-full bg-[#F5F5F5] hover:bg-white text-black font-semibold text-xs flex items-center gap-1.5 shadow-md disabled:opacity-40"
            >
              <Play className="w-3.5 h-3.5 fill-black" />
              <span>Play Top Tracks</span>
            </button>
          </div>
        </div>
      </div>

      {/* Artist Bio */}
      {artist.bio && (
        <div className="p-4 rounded-xl bg-[#181818] border border-[#242424]">
          <h3 className="text-xs uppercase tracking-wider text-[#737373] font-mono mb-1.5">
            About the Artist
          </h3>
          <p className="text-xs sm:text-sm text-[#D4D4D4] leading-relaxed max-w-xl">{artist.bio}</p>
        </div>
      )}

      {/* Popular Tracks */}
      <section>
        <h2 className="section-title mb-3">Popular Releases</h2>
        <div className="rounded-xl bg-[#181818] border border-[#242424] p-2 space-y-0.5">
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
            <Disc className="w-4 h-4 text-[#B7A0FF]" />
            <span>Discography</span>
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
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
