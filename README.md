# AURA MUSIC

> **Tagline:** *Your Music. Your Mood. Your World.*

A premium, production-quality cross-platform music streaming platform built for **Web** and **Android**. Designed with an original sonic identity, deep charcoal aesthetics, electric violet and teal accents, glassmorphic surfaces, and studio-grade audio capabilities.

---

## 🎧 Key Capabilities & Architectural Highlights

- **Original Brand & Design Identity:**
  - Charcoal & deep space dark theme (`#08090e`, `#0f111a`, `#171926`).
  - Electric violet (`#8b5cf6`) and neon teal (`#06b6d4`) accents with glowing aura backdrops.
  - Custom SVG logo featuring an iridescent soundwave aura with gradient particles.
  - Smooth glassmorphism, responsive navigation drawer, and rounded card hierarchy.
- **Cross-Platform Support:**
  - **Web Application:** Fully responsive desktop, tablet, and mobile interface; installable Progressive Web App (PWA); persistent mini-player; global keyboard shortcuts.
  - **Android Application:** Capacitor Android native shell with Gradle build configuration (`android/`), background audio playback permissions (`FOREGROUND_SERVICE`, `WAKE_LOCK`, `FOREGROUND_SERVICE_MEDIA_PLAYBACK`), and lock screen notification media controls via the MediaSession API.
- **Persistent High-Fidelity Audio Player:**
  - Plays actual audio files (MP3, WAV, AAC, FLAC).
  - Play, Pause, Next, Previous, Seek slider, Volume slider, and Mute.
  - Shuffle mode and Repeat modes (`off`, `all`, `one`).
  - Queue drawer with track reordering (move up/down), remove item, and clear queue.
  - Mini-player (docked above bottom navigation on mobile, full-width at bottom on desktop).
  - Full-screen player modal with breathing/rotating vinyl album artwork, ambient backlights, lyrics reader, and queue view.
- **True Offline Download Engine:**
  - Authorized royalty-free music downloads using chunked streaming with accurate progress percentages.
  - Platform-specific local storage: IndexedDB (`idb-keyval`) audio Blob caching (`aura_offline_audio_{id}`).
  - Offline playback interception: automatically serves local `blob:` URLs when offline or playing downloaded tracks with zero internet connectivity.
  - Storage telemetry: view total local disk space consumed and remove downloads individually.
- **Playlist System & Library:**
  - Create playlists with custom titles, descriptions, and cover artwork presets.
  - Add and remove songs, reorder tracks within playlists, rename, or delete playlists.
  - Dedicated "Liked Songs" library with instant heart toggling and shuffle playback.
  - Dedicated "Offline Tracks" library for zero-latency airplane/offline listening.
- **Search Engine:**
  - Real-time search across songs, artists, albums, genres, and playlists.
  - Instant filter chips (`All`, `Songs`, `Artists`, `Albums`, `Playlists`).
  - Empty state with interactive genre discovery cards.
- **Supabase Authentication & Backend:**
  - Email/password authentication, Google OAuth integration, password reset, and guest browsing mode.
  - User profiles with avatars and audio streaming quality preferences (128 kbps, 320 kbps, Ultra HD / FLAC).
  - Production PostgreSQL schema (`supabase/schema.sql`) with Row Level Security (RLS) policies, indexes, auto-profile trigger on signup, and storage buckets (`music-audio`, `music-covers`).
  - Graceful offline fallback: fully functional local store and guest mode if Supabase credentials are not yet configured.
- **Admin Dashboard:**
  - Role-protected admin portal (`role: 'admin'`).
  - Upload/publish authorized royalty-free tracks with metadata (Title, Artist, Album, Genre, Duration, Audio Quality, Bitrate, Audio Stream URL, Cover URL, Lyrics, License info).
  - Edit song metadata and delete songs from catalog.
  - Real-time listening statistics and top-streamed track visualizations.

---

## 📂 Project Structure

```
aura-music/
├── android/                   # Native Android Studio Gradle Project (Capacitor)
│   ├── app/
│   │   ├── build.gradle       # App-level build configuration (permissions, targetSdk)
│   │   └── src/main/
│   │       ├── AndroidManifest.xml # Media playback, foreground service & internet permissions
│   │       └── assets/public/ # Synced production web build assets
│   ├── build.gradle           # Root Gradle configuration
│   └── gradlew.bat            # Windows Gradle wrapper
├── public/
│   ├── favicon.svg            # Custom Aura Music SVG vector icon
│   └── manifest.json          # PWA Manifest (standalone display, theme-color)
├── scripts/
│   ├── build-android.ps1      # PowerShell Android APK & AAB automated builder
│   ├── build-android.sh       # Bash Android APK & AAB automated builder
│   └── verify-suite.js        # Automated catalog and business logic test suite
├── src/
│   ├── components/
│   │   ├── AddToPlaylistModal.tsx
│   │   ├── AlbumCard.tsx
│   │   ├── ArtistCard.tsx
│   │   ├── AudioQualityBadge.tsx
│   │   ├── AuthModal.tsx
│   │   ├── CreatePlaylistModal.tsx
│   │   ├── EqualizerBars.tsx
│   │   ├── FullScreenPlayer.tsx
│   │   ├── Logo.tsx
│   │   ├── MiniPlayer.tsx
│   │   ├── MobileBottomNav.tsx
│   │   ├── PlaylistCard.tsx
│   │   ├── QueueDrawer.tsx
│   │   ├── Sidebar.tsx
│   │   ├── SongRow.tsx
│   │   └── TopHeader.tsx
│   ├── context/
│   │   ├── AudioContext.tsx
│   │   ├── AuthContext.tsx
│   │   └── DownloadContext.tsx
│   ├── data/
│   │   └── initialCatalog.ts  # Verified royalty-free audio catalog (MP3 streams, artwork, lyrics)
│   ├── screens/
│   │   ├── AdminScreen.tsx
│   │   ├── AlbumDetailScreen.tsx
│   │   ├── ArtistDetailScreen.tsx
│   │   ├── DownloadedScreen.tsx
│   │   ├── HomeScreen.tsx
│   │   ├── LibraryScreen.tsx
│   │   ├── LikedSongsScreen.tsx
│   │   ├── PlaylistDetailScreen.tsx
│   │   ├── ProfileScreen.tsx
│   │   └── SearchScreen.tsx
│   ├── services/
│   │   ├── audioService.ts    # Audio playback engine + MediaSession API
│   │   ├── authService.ts     # Supabase auth + guest mode + profiles
│   │   ├── catalogService.ts  # Songs, albums, artists, playlists data layer
│   │   ├── downloadManager.ts # IndexedDB audio Blob offline cache
│   │   └── supabase.ts        # Supabase client & connection validator
│   ├── types/
│   │   └── index.ts           # TypeScript interfaces & types
│   ├── App.tsx                # Master container & view router
│   ├── index.css              # Tailwind CSS v4 styling & glassmorphic themes
│   └── main.tsx
├── supabase/
│   ├── schema.sql             # Full PostgreSQL schema with RLS policies, tables, triggers
│   └── seed.sql               # Initial seed data for artists, albums, songs
├── .env.example               # Environment variables example
├── capacitor.config.ts        # Capacitor configuration
├── package.json
└── vite.config.ts
```

---

## ⚡ Quick Start & Development

### Prerequisites

- **Node.js** v18+ (tested on Node 24)
- **npm** v10+

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment (Optional)

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Set your Supabase credentials:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
```
*(If omitted, Aura Music operates in full-featured offline local store mode automatically).*

### 3. Run Development Server

```bash
npm run dev
```

Open your browser at `http://localhost:5173`.

---

## 🧪 Automated Testing & Verification

Run the verification suite to test catalog data integrity, licensing, search algorithms, playlist reordering, and audio quality calculation:

```bash
npm run test:verify
```

---

## 📱 Android Application Setup & Builds

### Prerequisites for Android Native Builds

- **Java Development Kit (JDK 17 or JDK 21)**
- **Android Studio** with Android SDK Platform 34+ and Android Build Tools.

### Syncing Web Assets to Android

Whenever you update the web application, sync assets with:

```bash
npm run android:sync
```

### Open in Android Studio

```bash
npm run android:open
```

### Build Debug APK

```bash
npm run android:build:debug
```
*Output artifact:* `android/app/build/outputs/apk/debug/app-debug.apk`

### Build Release APK

```bash
npm run android:build:release
```
*Output artifact:* `android/app/build/outputs/apk/release/app-release-unsigned.apk`

### Build Google Play AAB Bundle

```bash
npm run android:bundle
```
*Output artifact:* `android/app/build/outputs/bundle/release/app-release.aab`

Or use the provided PowerShell / Bash build scripts:
- **Windows:** `.\scripts\build-android.ps1 -Target all`
- **Linux / macOS:** `./scripts/build-android.sh all`

---

## 🗄️ Supabase Database Setup

1. Log into your [Supabase Dashboard](https://supabase.com).
2. Go to the **SQL Editor** tab.
3. Open `supabase/schema.sql` and run the script to create:
   - Tables: `profiles`, `artists`, `albums`, `songs`, `playlists`, `playlist_songs`, `liked_songs`, `listening_history`, `downloads`.
   - Security: Row Level Security (RLS) policies for user privacy.
   - Storage Buckets: `music-audio` and `music-covers`.
   - Triggers: Automatic profile row creation upon signup.
4. Run `supabase/seed.sql` to populate the initial royalty-free catalog.

---

## ⌨️ Desktop Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| `Space` | Play / Pause playback |
| `→` (Right Arrow) | Seek forward 5 seconds |
| `←` (Left Arrow) | Seek backward 5 seconds |
| `Shift` + `→` | Skip to next track |
| `Shift` + `←` | Skip to previous track |
| `↑` (Up Arrow) | Volume up (+5%) |
| `↓` (Down Arrow) | Volume down (-5%) |
| `M` | Toggle Mute / Unmute |
| `S` | Toggle Shuffle |
| `R` | Cycle Repeat (`off` → `all` → `one`) |
| `Esc` | Minimize full-screen player or close modals |

---

## 🚀 Web Production Deployment

### Build Production Bundle

```bash
npm run build
```
The optimized production bundle is generated in `dist/`.

### Deploy to Vercel

```bash
npx vercel deploy --prod
```

### Deploy to Netlify

```bash
npx netlify deploy --prod --dir=dist
```

---

## ⚖️ Audio Licensing & Public Domain Notice

All bundled tracks in AURA MUSIC utilize verified Creative Commons Zero (CC0) and royalty-free licenses suitable for commercial and non-commercial streaming. When uploading new music via the Admin Dashboard, only upload authorized audio files you own or have explicit rights to distribute.

---

**AURA MUSIC** — *Your Music. Your Mood. Your World.*
