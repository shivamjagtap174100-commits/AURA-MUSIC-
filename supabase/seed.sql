-- ==============================================================================
-- AURA MUSIC - Initial Seed Data (Verified Royalty-Free Catalog)
-- ==============================================================================

-- 1. Insert Initial Artists
INSERT INTO public.artists (id, name, bio, avatar_url, banner_url, monthly_listeners, genres, verified)
VALUES
('00000000-0000-0000-0000-000000000001', 'Neon Mirage', 'Pioneer of modern synthwave and nostalgic retro-futuristic soundscapes from Tokyo.', 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=1600&auto=format&fit=crop&q=80', 842100, ARRAY['Synthwave', 'Cyberpunk', 'Electronic'], true),
('00000000-0000-0000-0000-000000000002', 'Luna Chill', 'Creating late-night lofi beats, rainy atmosphere, and soulful vinyl textures for deep focus.', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=1600&auto=format&fit=crop&q=80', 1250000, ARRAY['Lo-Fi', 'Chillhop', 'Ambient'], true),
('00000000-0000-0000-0000-000000000003', 'Solstice Echo', 'Atmospheric electronic producer crafting expansive soundscapes and driving basslines.', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1600&auto=format&fit=crop&q=80', 620400, ARRAY['Electronic', 'Ambient', 'Chillstep'], true),
('00000000-0000-0000-0000-000000000004', 'Velvet Groove', 'Deep house purveyor blending infectious basslines with warm analog synthesizers.', 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=600&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=1600&auto=format&fit=crop&q=80', 940300, ARRAY['Deep House', 'Groove', 'Nu-Disco'], true),
('00000000-0000-0000-0000-000000000005', 'Aria Meadow', 'Acoustic fingerstyle guitarist and neoclassical composer known for emotional melodies.', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=1600&auto=format&fit=crop&q=80', 410800, ARRAY['Acoustic', 'Neoclassical', 'Chillout'], true)
ON CONFLICT (id) DO NOTHING;

-- 2. Insert Initial Albums
INSERT INTO public.albums (id, title, artist_id, cover_url, release_year, genre)
VALUES
('00000000-0000-0000-0000-000000000011', 'Neon Odyssey', '00000000-0000-0000-0000-000000000001', 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80', 2024, 'Synthwave'),
('00000000-0000-0000-0000-000000000012', 'Midnight Cafe', '00000000-0000-0000-0000-000000000002', 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80', 2024, 'Lo-Fi'),
('00000000-0000-0000-0000-000000000013', 'Astral Projections', '00000000-0000-0000-0000-000000000003', 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&auto=format&fit=crop&q=80', 2024, 'Electronic'),
('00000000-0000-0000-0000-000000000014', 'Velvet Nights', '00000000-0000-0000-0000-000000000004', 'https://images.unsplash.com/photo-1571266028243-3716f02d2d2e?w=600&auto=format&fit=crop&q=80', 2024, 'Deep House'),
('00000000-0000-0000-0000-000000000015', 'Autumn Echoes', '00000000-0000-0000-0000-000000000005', 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop&q=80', 2024, 'Acoustic')
ON CONFLICT (id) DO NOTHING;

-- 3. Insert Initial Songs
INSERT INTO public.songs (id, title, artist_id, album_id, cover_url, audio_url, duration, genre, release_year, audio_quality, bitrate, file_size_mb, play_count, is_royalty_free, license_info)
VALUES
('00000000-0000-0000-0000-000000000101', 'Cyber Horizon', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000011', 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80', 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=synthwave-80s-110045.mp3', 165, 'Synthwave', 2024, 'High (320 kbps)', '320 kbps', 6.4, 145920, true, 'Pixabay License / Free Commercial Use'),
('00000000-0000-0000-0000-000000000102', 'Midnight Drift', '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000012', 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80', 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=lofi-study-112191.mp3', 147, 'Lo-Fi', 2024, 'High (320 kbps)', '320 kbps', 5.6, 289400, true, 'Pixabay License / Free Commercial Use'),
('00000000-0000-0000-0000-000000000103', 'Astral Velocity', '00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000013', 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&auto=format&fit=crop&q=80', 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a73467.mp3?filename=electronic-future-beats-117997.mp3', 184, 'Electronic', 2024, 'Ultra HD / FLAC', 'Lossless 96kHz', 8.2, 97840, true, 'Pixabay License / Free Commercial Use'),
('00000000-0000-0000-0000-000000000104', 'Velvet Nights', '00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000014', 'https://images.unsplash.com/photo-1571266028243-3716f02d2d2e?w=600&auto=format&fit=crop&q=80', 'https://cdn.pixabay.com/download/audio/2021/09/06/audio_9b6ec438dc.mp3?filename=deep-ambient-11028.mp3', 172, 'Deep House', 2024, 'High (320 kbps)', '320 kbps', 6.8, 168320, true, 'Pixabay License / Free Commercial Use'),
('00000000-0000-0000-0000-000000000105', 'Raindrop Memories', '00000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000015', 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop&q=80', 'https://cdn.pixabay.com/download/audio/2022/02/07/audio_d1719ab488.mp3?filename=acoustic-guitar-ambient-14251.mp3', 153, 'Acoustic', 2024, 'High (320 kbps)', '320 kbps', 5.9, 112000, true, 'Pixabay License / Free Commercial Use'),
('00000000-0000-0000-0000-000000000106', 'Solar Flare', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000011', 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&auto=format&fit=crop&q=80', 'https://cdn.pixabay.com/download/audio/2022/10/14/audio_9939f792cb.mp3?filename=uplifting-synthwave-124792.mp3', 178, 'Synthwave', 2024, 'Ultra HD / FLAC', 'Lossless 96kHz', 7.9, 204350, true, 'Pixabay License / Free Commercial Use')
ON CONFLICT (id) DO NOTHING;

