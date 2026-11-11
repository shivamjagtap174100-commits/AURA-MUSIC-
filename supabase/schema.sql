-- ==============================================================================
-- AURA MUSIC - Production PostgreSQL Database Schema for Supabase
-- Master Architecture: Independent Licensed Music & Spotify Discovery
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE (Linked with auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    username TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin', 'creator')),
    preferred_quality TEXT NOT NULL DEFAULT 'High (320 kbps)' CHECK (preferred_quality IN ('Normal (128 kbps)', 'High (320 kbps)', 'Ultra HD / FLAC')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. ARTISTS TABLE
CREATE TABLE IF NOT EXISTS public.artists (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    name_native TEXT,
    bio TEXT,
    avatar_url TEXT NOT NULL,
    banner_url TEXT,
    monthly_listeners INTEGER DEFAULT 0,
    genres TEXT[] DEFAULT '{}',
    languages TEXT[] DEFAULT '{}',
    verified BOOLEAN DEFAULT false,
    spotify_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. ALBUMS TABLE
CREATE TABLE IF NOT EXISTS public.albums (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    title_native TEXT,
    artist_id TEXT NOT NULL REFERENCES public.artists(id) ON DELETE CASCADE,
    artist_name TEXT NOT NULL,
    cover_url TEXT NOT NULL,
    release_year INTEGER NOT NULL,
    genre TEXT NOT NULL,
    language TEXT DEFAULT 'All Languages',
    total_tracks INTEGER DEFAULT 1,
    spotify_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4. TRACKS TABLE (Independent Licensed Music Catalog)
CREATE TABLE IF NOT EXISTS public.tracks (
    track_id TEXT PRIMARY KEY, -- Unique Internal Track ID
    provider TEXT NOT NULL DEFAULT 'aura-licensed', -- 'aura-licensed', 'jamendo', 'fma', 'archive-org', 'spotify-discovery', 'itunes'
    provider_track_id TEXT,
    title TEXT NOT NULL,
    title_native TEXT,
    artist_id TEXT NOT NULL REFERENCES public.artists(id) ON DELETE CASCADE,
    artist_name TEXT NOT NULL,
    artist_native TEXT,
    album_id TEXT REFERENCES public.albums(id) ON DELETE SET NULL,
    album_title TEXT,
    album_native TEXT,
    cover_url TEXT NOT NULL,
    audio_url TEXT NOT NULL, -- Verified Audio Stream URL
    audio_asset_id TEXT, -- Unique asset identifier
    duration INTEGER NOT NULL, -- Duration in seconds
    genre TEXT NOT NULL,
    language TEXT NOT NULL DEFAULT 'English',
    composer TEXT,
    release_year INTEGER,
    audio_quality TEXT NOT NULL DEFAULT 'High (320 kbps)',
    bitrate TEXT DEFAULT '320 kbps',
    file_size_mb NUMERIC(5,2) DEFAULT 5.0,
    play_count BIGINT DEFAULT 0,
    lyrics TEXT,
    is_royalty_free BOOLEAN DEFAULT true,
    license_info TEXT,
    playback_rights TEXT DEFAULT 'licensed-full',
    playback_availability TEXT NOT NULL DEFAULT 'available' CHECK (playback_availability IN ('available', 'unavailable')),
    verification_status TEXT NOT NULL DEFAULT 'verified' CHECK (verification_status IN ('verified', 'unverified')),
    spotify_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Backward compatibility view for legacy queries expecting 'songs'
CREATE OR REPLACE VIEW public.songs AS SELECT * FROM public.tracks;

-- 5. PLAYLISTS TABLE
CREATE TABLE IF NOT EXISTS public.playlists (
    id TEXT PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    cover_url TEXT,
    creator_name TEXT NOT NULL DEFAULT 'AURA User',
    is_public BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 6. PLAYLIST_TRACKS TABLE (Normalized Many-to-Many with Exact Track ID)
CREATE TABLE IF NOT EXISTS public.playlist_tracks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    playlist_id TEXT NOT NULL REFERENCES public.playlists(id) ON DELETE CASCADE,
    track_id TEXT NOT NULL REFERENCES public.tracks(track_id) ON DELETE CASCADE,
    position INTEGER NOT NULL DEFAULT 0,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE (playlist_id, track_id)
);

-- Backward compatibility view
CREATE OR REPLACE VIEW public.playlist_songs AS 
SELECT id, playlist_id, track_id AS song_id, position, added_at FROM public.playlist_tracks;

-- 7. USER_LIBRARY TABLE (User Saved Tracks / Liked Songs)
CREATE TABLE IF NOT EXISTS public.user_library (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    track_id TEXT NOT NULL REFERENCES public.tracks(track_id) ON DELETE CASCADE,
    saved_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE (user_id, track_id)
);

-- Backward compatibility view for liked_songs
CREATE OR REPLACE VIEW public.liked_songs AS 
SELECT id, user_id, track_id AS song_id, saved_at AS created_at FROM public.user_library;

-- 8. RECENTLY_PLAYED TABLE (Listening History Synchronization)
CREATE TABLE IF NOT EXISTS public.recently_played (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    track_id TEXT NOT NULL REFERENCES public.tracks(track_id) ON DELETE CASCADE,
    duration_played INTEGER DEFAULT 0,
    played_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Backward compatibility view
CREATE OR REPLACE VIEW public.listening_history AS 
SELECT id, user_id, track_id AS song_id, duration_played, played_at FROM public.recently_played;

-- 9. PLAYBACK_HISTORY TABLE (Full Audit Trail & Playback Verification Logs)
CREATE TABLE IF NOT EXISTS public.playback_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    track_id TEXT NOT NULL REFERENCES public.tracks(track_id) ON DELETE CASCADE,
    session_playback_id TEXT,
    device_info TEXT,
    completed BOOLEAN DEFAULT false,
    played_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 10. DOWNLOADS TABLE (Offline License Cache Records)
CREATE TABLE IF NOT EXISTS public.downloads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    track_id TEXT NOT NULL REFERENCES public.tracks(track_id) ON DELETE CASCADE,
    file_size_bytes BIGINT NOT NULL,
    format TEXT DEFAULT 'audio/mpeg',
    downloaded_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE (user_id, track_id)
);

-- ==============================================================================
-- DATABASE INDEXES FOR OPTIMAL QUERY PERFORMANCE
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_tracks_artist_id ON public.tracks(artist_id);
CREATE INDEX IF NOT EXISTS idx_tracks_album_id ON public.tracks(album_id);
CREATE INDEX IF NOT EXISTS idx_tracks_language ON public.tracks(language);
CREATE INDEX IF NOT EXISTS idx_tracks_genre ON public.tracks(genre);
CREATE INDEX IF NOT EXISTS idx_tracks_availability ON public.tracks(playback_availability);
CREATE INDEX IF NOT EXISTS idx_tracks_verification ON public.tracks(verification_status);
CREATE INDEX IF NOT EXISTS idx_tracks_play_count ON public.tracks(play_count DESC);
CREATE INDEX IF NOT EXISTS idx_albums_artist_id ON public.albums(artist_id);
CREATE INDEX IF NOT EXISTS idx_playlists_user_id ON public.playlists(user_id);
CREATE INDEX IF NOT EXISTS idx_playlist_tracks_playlist_id ON public.playlist_tracks(playlist_id);
CREATE INDEX IF NOT EXISTS idx_playlist_tracks_position ON public.playlist_tracks(playlist_id, position);
CREATE INDEX IF NOT EXISTS idx_user_library_user_id ON public.user_library(user_id);
CREATE INDEX IF NOT EXISTS idx_recently_played_user_id ON public.recently_played(user_id, played_at DESC);
CREATE INDEX IF NOT EXISTS idx_playback_history_track_id ON public.playback_history(track_id);
CREATE INDEX IF NOT EXISTS idx_downloads_user_id ON public.downloads(user_id);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.playlist_tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recently_played ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.playback_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.downloads ENABLE ROW LEVEL SECURITY;

-- Public read access for global catalog
CREATE POLICY "Public read artists" ON public.artists FOR SELECT USING (true);
CREATE POLICY "Public read albums" ON public.albums FOR SELECT USING (true);
CREATE POLICY "Public read tracks" ON public.tracks FOR SELECT USING (true);
CREATE POLICY "Public read public playlists" ON public.playlists FOR SELECT USING (is_public = true);

-- User-scoped policies
CREATE POLICY "Users can manage own playlists" ON public.playlists 
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own playlist tracks" ON public.playlist_tracks 
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.playlists WHERE id = playlist_id AND user_id = auth.uid())
    );

CREATE POLICY "Users can manage own library" ON public.user_library 
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own recently played" ON public.recently_played 
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own downloads" ON public.downloads 
    FOR ALL USING (auth.uid() = user_id);
