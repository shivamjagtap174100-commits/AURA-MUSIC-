# AURA MUSIC — Master Architecture & Production Documentation

> **Tagline:** *SOUND BEYOND ORDINARY.*  
> **Aesthetic Identity:** Obsidian Gold (Minimal Luxury • Editorial Music Experience)  
> **Platforms:** Modern Web (PWA) & Native Android (Capacitor)

---

## 1. System Overview

**AURA MUSIC** is a commercial-grade, cross-platform music streaming platform engineered with a strict two-pillar architecture:

1. **System A — Spotify Discovery Integration**: Uses the official Spotify Web API for permitted catalog discovery, artist biographies, album discographies, and verified Spotify links (`spotifyUrl`). In accordance with Spotify Developer Policy, Spotify metadata is never grafted onto unrelated third-party audio streams.
2. **System B — Independent Licensed Playback**: An independent, legal audio engine playing 100% matched, verified recordings with genuine audio assets (Marathi Abhangs & Dhol Tasha, Hindustani Classical Ragas & Sitar, Punjabi Folk Dhol, Synthwave, and Japanese City Pop).
3. **The Core Architectural Mandate**:
   > **THE SONG DISPLAYED MUST ALWAYS BE THE EXACT SONG BEING PLAYED.**  
   > If an authorized audio asset is not legally licensed for independent streaming (such as proprietary film masters owned by T-Series or Zee Music), the platform marks the track as unavailable and presents an official link to Spotify. Unrelated fallback audio is strictly prohibited throughout the entire application.

---

## 2. Song Mismatch Root Cause Analysis & Permanent Resolution

### The Issue
Previous prototypes displayed commercial Indian titles (e.g. *Zingaat*, *Kesariya*, *Tum Hi Ho*, *Mauli Mauli*), but mapped them to generic royalty-free electronic synthwave audio files (e.g. `uplifting-synthwave-124792.mp3`, `electronic-future-beats-117997.mp3`). This produced a critical user mismatch where selecting a Marathi song played an English electronic instrumental.

### The Resolution
1. **Unique Track Identification**: Every song possesses a canonical `track_id` (`id`), `provider`, `audio_asset_id`, `playback_availability`, and `verification_status`.
2. **Track Validation Gate (`TrackValidationService`)**: Before any audio stream reaches the HTML5 `audio.src`, it undergoes validation:
   - Verifies that `verification_status === 'verified'` and `playback_availability === 'available'`.
   - Strictly rejects any Marathi or Hindi track paired with synthetic placeholder audio.
   - For commercial tracks where independent full streaming rights are reserved, the engine halts playback, clears the audio buffer, and sets an informative notice with an actionable "Listen on Spotify ↗" button.
3. **Authentic Verified Audio Assets**:
   - **Marathi**: Authentic Marathi Abhangs (*Majhe Maher Pandhari*, *Deva Tujhya Dari* by Pt. Bhimsen Joshi tradition) and traditional Pune Dhol Tasha festive rhythms.
   - **Hindi / Classical**: Authentic Bansuri Flute (*Raga Bhairavi Morning Raga*) and Classical Sitar (*Sitar Tarana in Yaman*).
   - **Punjabi**: Authentic Folk Dhol & Tumbi (*Bhangra Dhol Punjab*).
   - **English / International**: Authentic Synthwave (*Cyber Horizon* by Neon Mirage) and Japanese City Pop (*Stay With Me* by Miki Matsubara).

---

## 3. Modular Backend & Services Architecture

```
src/services/
├── spotifyDiscoveryService.ts     # Official Spotify Web API integration (OAuth Client Credentials & discovery)
├── licensedMusicCatalogService.ts  # Independent licensed music catalog & query layer
├── trackRepository.ts              # Single source of truth for tracks, artists, and albums
├── trackValidationService.ts       # Enforces exact audio-to-metadata matching & rejects fallbacks
├── playbackService.ts              # High-fidelity audio playback engine (HTML5 Audio & MediaSession)
├── queueService.ts                 # Queue management, traversal, shuffling, and repeating
├── searchService.ts                # Multilingual search with script transliteration (Devanagari, Gurmukhi, Latin)
├── playlistService.ts              # Playlist CRUD with explicit track_id foreign keys
├── userLibraryService.ts           # Liked songs, saved albums, and cross-device sync
├── recentlyPlayedService.ts        # Listening history with deduplication and timestamps
├── downloadManager.ts              # IndexedDB binary Blob storage for offline listening
├── audioService.ts                 # Unified backwards-compatibility façade
├── catalogService.ts               # Unified façade linking all modular services
└── supabase.ts                     # Production PostgreSQL connection & RLS client
```

---

## 4. Database Design (PostgreSQL Schema)

The database schema (`supabase/schema.sql`) implements fully normalized tables with foreign keys and Row Level Security:

- **`tracks`**:
  `track_id` (PK), `provider`, `provider_track_id`, `title`, `title_native`, `artist_id` (FK), `artist_name`, `artist_native`, `album_id` (FK), `album_title`, `cover_url`, `audio_url`, `audio_asset_id`, `duration`, `genre`, `language`, `composer`, `audio_quality`, `bitrate`, `file_size_mb`, `play_count`, `playback_availability`, `verification_status`, `spotify_url`.
- **`artists`**:
  `id` (PK), `name`, `name_native`, `bio`, `avatar_url`, `banner_url`, `monthly_listeners`, `genres`, `languages`, `verified`, `spotify_url`.
- **`albums`**:
  `id` (PK), `title`, `title_native`, `artist_id` (FK), `artist_name`, `cover_url`, `release_year`, `genre`, `language`, `total_tracks`, `spotify_url`.
- **`playlists`**:
  `id` (PK), `user_id` (FK), `title`, `description`, `cover_url`, `creator_name`, `is_public`.
- **`playlist_tracks`**:
  `id` (PK), `playlist_id` (FK), `track_id` (FK), `position`, `added_at`.
- **`user_library`**:
  `id` (PK), `user_id` (FK), `track_id` (FK), `saved_at`.
- **`recently_played`**:
  `id` (PK), `user_id` (FK), `track_id` (FK), `duration_played`, `played_at`.
- **`playback_history`**:
  `id` (PK), `user_id` (FK), `track_id` (FK), `session_playback_id`, `device_info`, `completed`, `played_at`.
- **`downloads`**:
  `id` (PK), `user_id` (FK), `track_id` (FK), `file_size_bytes`, `format`, `downloaded_at`.

---

## 5. Obsidian Gold Design System

The visual identity is built on dark AMOLED luxury with warm champagne gold accents:

| Token | Hex | Role |
|---|---|---|
| `--background` | `#08090A` | Deep Obsidian AMOLED shell |
| `--background-secondary` | `#101112` | Sidebar, navigation, modal surfaces |
| `--surface` | `#171819` | Cards, song rows, bottom player bar |
| `--surface-elevated` | `#202123` | Active track highlights, hover cards |
| `--accent-gold` | `#C5A66B` | Champagne gold: play controls, scrubbers, active states |
| `--accent-gold-light` | `#D8BF91` | Metallic highlights, secondary accents |
| `--text-primary` | `#F3F0E9` | Crisp off-white typography |
| `--text-secondary` | `#929292` | Artist metadata, subheadings |
| `--text-muted` | `#666666` | Durations, track numbers |
| `--border` | `#292929` | Hairline dividers and subtle borders |

---

## 6. Smart Multilingual Search Engine

The search engine (`SearchService`) features:
1. **Bidirectional Transliteration**:
   - Queries like `अरिजीत सिंह` match `Arijit Singh`.
   - Queries like `अजय अतुल` or `मराठी गाणी` match `Ajay Atul` and `Marathi songs`.
   - Supports Gurmukhi (`ਦਿਲਜੀਤ ਦੋਸਾਂਝ`), Tamil (`அனிருத்`), and Telugu (`సిద్ శ్రీరామ్`).
2. **Categorical Separation**:
   - **Licensed Playable Tracks**: Shows verified songs that play real matched audio.
   - **Spotify Discovery**: Shows Spotify catalog results with official artwork, popularity, and direct Spotify links.
   - Never returns an unrelated English song when searching for Marathi music.

---

## 7. Automated Test Suites

Run the automated test suites using the bundled CLI scripts:

```bash
# 1. Master Architecture Suite (Verifies all 13 core requirements)
npm run test:architecture

# 2. Multilingual Verification Suite (16/16 query tests across scripts)
npm run test:verify

# 3. Cross-Platform Responsiveness & Audio Suite (Desktop, Tablet, Mobile)
npm run test:cross-platform
```

### Verified Test Coverage:
- [x] Marathi search and authentic playback
- [x] Hindi search and authentic playback
- [x] English search and authentic playback
- [x] 100% correct title and audio matching
- [x] Strict incorrect audio rejection
- [x] Duplicate track handling and queue deduping
- [x] Missing audio rejection
- [x] Invalid metadata rejection
- [x] Spotify discovery and commercial licensing separation
- [x] Playlist synchronization by track ID
- [x] Queue management and state transitions
- [x] Player state synchronization (MiniPlayer & FullScreenPlayer)
- [x] API failure resilience and empty-state handling

---

## 8. Development & Build Instructions

### Prerequisites
- Node.js 20+ (Node 24 recommended)
- Android Studio & JDK 21 (for native Android builds)

### Installation & Local Run
```bash
# Install dependencies
npm install

# Start Vite development server with local network access
npm run dev -- --host
```
- Local URL: `http://localhost:5173/`
- Wi-Fi Testing: `http://<your-local-ip>:5173/`

### Production Web Build
```bash
npm run build
```
Generates optimized assets in `dist/`.

### Android Build (Capacitor)
```bash
# 1. Build web and synchronize assets to Android
npm run android:sync

# 2. Open project in Android Studio
npm run android:open
```

---

## 9. Environment Configuration

Create a `.env` file in the root directory:

```env
# Supabase Configuration (Optional for cloud sync; local storage works out of the box)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Spotify Web API (Optional for live Spotify search; curated discovery works out of the box)
VITE_SPOTIFY_CLIENT_ID=your-spotify-client-id
VITE_SPOTIFY_CLIENT_SECRET=your-spotify-client-secret
```
