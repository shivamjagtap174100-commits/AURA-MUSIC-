import React from 'react';
import { Play, CheckCircle2, User, ArrowLeft, Disc } from 'lucide-react';
import { Song, Artist } from '../types';
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
      <div className="text-center py-24 text-slate-500">
        <User className="w-16 h-16 mx-auto mb-3 opacity-30 text-violet-400" />
        <h3 className="text-lg font-bold text-slate-300">Artist not found</h3>
        <button
          onClick={() => onNavigate('home')}
          className="mt-4 px-4 py-2 bg-violet-600 text-white text-xs font-semibold rounded-xl"
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
    <div className="space-y-8 pb-32 animate-in fade-in duration-200">
      <button
        onClick={() => onNavigate('home')}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back</span>
      </button>

      {/* Artist Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden glass-panel border border-white/10 min-h-[260px] sm:min-h-[320px] flex flex-col justify-end p-6 sm:p-8 shadow-2xl">
        {/* Banner image or gradient background */}
        <div className="absolute inset-0 -z-10">
          <img
            src={artist.bannerUrl || artist.avatarUrl}
            alt={artist.name}
            className="w-full h-full object-cover filter brightness-[0.4] blur-sm scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#08090e] via-[#08090e]/70 to-transparent" />
        </div>

        <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5">
          <img
            src={artist.avatarUrl}
            alt={artist.name}
            className="w-28 h-28 sm:w-36 sm:h-36 rounded-full object-cover border-4 border-violet-500/40 shadow-2xl shrink-0"
          />

          <div className="text-center sm:text-left space-y-2 flex-1">
            <div className="flex items-center justify-center sm:justify-start gap-1.5 text-cyan-400 text-xs font-bold uppercase tracking-wider">
              {artist.verified && <CheckCircle2 className="w-4 h-4 fill-cyan-400/20" />}
              <span>Verified Artist</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              {artist.name}
            </h1>

            <p className="text-xs sm:text-sm text-slate-300">
              {artist.monthlyListeners?.toLocaleString() || '500,000'} monthly listeners
            </p>

            <div className="pt-2 flex items-center justify-center sm:justify-start gap-3">
              <button
                onClick={handlePlayTop}
                disabled={artistSongs.length === 0}
                className="px-6 py-2.5 rounded-full bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 text-white font-bold text-xs shadow-lg shadow-violet-600/30 flex items-center gap-2 hover:scale-105 active:scale-95 transition-all disabled:opacity-40"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Play Top Tracks</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Artist Bio */}
      {artist.bio && (
        <div className="glass-panel p-5 rounded-2xl">
          <h3 className="text-xs uppercase tracking-widest text-slate-400 font-bold mb-2">
            About the Artist
          </h3>
          <p className="text-sm text-slate-300 leading-relaxed max-w-2xl">{artist.bio}</p>
        </div>
      )}

      {/* Popular Tracks */}
      <section>
        <h2 className="text-xl font-bold text-white mb-4">Popular Releases</h2>
        <div className="glass-panel p-2 sm:p-3 rounded-3xl space-y-1">
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
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Disc className="w-5 h-5 text-cyan-400" />
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
