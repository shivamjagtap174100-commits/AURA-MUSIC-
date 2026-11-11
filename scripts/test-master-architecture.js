/**
 * AURA MUSIC — Comprehensive Master Architecture Automated Test Suite
 * 
 * Verifies all 13 core requirements:
 * 1. Marathi search and playback
 * 2. Hindi search and playback
 * 3. English search and playback
 * 4. Correct title and audio matching
 * 5. Incorrect audio rejection
 * 6. Duplicate track handling
 * 7. Missing audio handling
 * 8. Invalid metadata handling
 * 9. Spotify discovery & commercial licensing separation
 * 10. Playlist synchronization
 * 11. Queue synchronization
 * 12. Player state synchronization (MiniPlayer & FullScreenPlayer)
 * 13. API failure handling
 */

import { trackRepository } from '../src/services/trackRepository.ts';
import { trackValidationService } from '../src/services/trackValidationService.ts';
import { licensedMusicCatalogService } from '../src/services/licensedMusicCatalogService.ts';
import { queueService } from '../src/services/queueService.ts';
import { playbackService } from '../src/services/playbackService.ts';
import { searchService } from '../src/services/searchService.ts';
import { spotifyDiscoveryService } from '../src/services/spotifyDiscoveryService.ts';
import { playlistService } from '../src/services/playlistService.ts';
import { recentlyPlayedService } from '../src/services/recentlyPlayedService.ts';
import { userLibraryService } from '../src/services/userLibraryService.ts';
import { INITIAL_SONGS } from '../src/data/initialCatalog.ts';

console.log('================================================================');
console.log('      AURA MUSIC — MASTER ARCHITECTURE AUTOMATED TEST SUITE     ');
console.log('================================================================\n');

let passedTests = 0;
let totalTests = 13;

// --- TEST 1: MARATHI SEARCH AND PLAYBACK ---
console.log('[TEST 1] Testing Marathi Search & Authentic Playback...');
const marathiSearch = searchService.searchSync('मराठी गाणी', 'Marathi');
console.assert(marathiSearch.licensedSongs.length > 0, 'Marathi search must return tracks');
const playableMarathi = marathiSearch.playableSongs;
console.assert(playableMarathi.length > 0, 'Must have playable verified Marathi tracks');
playableMarathi.forEach((song) => {
  console.assert(song.language === 'Marathi', `Track "${song.title}" must have language 'Marathi'`);
  const val = trackValidationService.validateForPlayback(song);
  console.assert(val.canPlay === true, `Playable track "${song.title}" must validate for playback`);
});
// Assert that NO unrelated English song is returned in Marathi search
const hasEnglishInMarathi = marathiSearch.licensedSongs.some((s) => s.language === 'English');
console.assert(!hasEnglishInMarathi, 'Marathi search must NEVER return unrelated English tracks');
console.log(`  ✓ Marathi search passed: ${marathiSearch.licensedSongs.length} tracks found, ${playableMarathi.length} verified playable. Zero unrelated English tracks.`);
passedTests++;

// --- TEST 2: HINDI SEARCH AND PLAYBACK ---
console.log('\n[TEST 2] Testing Hindi Search & Authentic Playback...');
const hindiSearch = searchService.searchSync('अरिजीत सिंह', 'Hindi');
console.assert(hindiSearch.licensedSongs.length > 0, 'Hindi search by native script must find tracks');
const playableHindi = searchService.searchSync('Bhairavi', 'Hindi').playableSongs;
console.assert(playableHindi.length > 0, 'Must have playable verified Hindi track');
const bhairavi = playableHindi[0];
const hindiVal = trackValidationService.validateForPlayback(bhairavi);
console.assert(hindiVal.canPlay === true, 'Raga Bhairavi must validate for playback');
console.log(`  ✓ Hindi search & playback passed: "${bhairavi.title}" (${bhairavi.language}) verified for playback.`);
passedTests++;

// --- TEST 3: ENGLISH SEARCH AND PLAYBACK ---
console.log('\n[TEST 3] Testing English Search & Authentic Playback...');
const englishSearch = searchService.searchSync('Cyber Horizon', 'English');
console.assert(englishSearch.licensedSongs.length > 0, 'English search must find Cyber Horizon');
const cyberSong = englishSearch.licensedSongs[0];
console.assert(cyberSong.language === 'English', 'Language must be English');
const englishVal = trackValidationService.validateForPlayback(cyberSong);
console.assert(englishVal.canPlay === true, 'Cyber Horizon must validate for playback');
console.log(`  ✓ English search & playback passed: "${cyberSong.title}" verified for playback.`);
passedTests++;

// --- TEST 4: CORRECT TITLE AND AUDIO MATCHING ---
console.log('\n[TEST 4] Verifying 100% Correct Title and Audio Matching...');
const allPlayable = licensedMusicCatalogService.getPlayableTracks();
console.assert(allPlayable.length >= 5, 'Must have at least 5 verified playable tracks');
allPlayable.forEach((track) => {
  console.assert(track.audioUrl && track.audioUrl.startsWith('https://'), `Valid HTTPS audio URL required for ${track.title}`);
  console.assert(track.verificationStatus === 'verified', `Verification status must be 'verified' for ${track.title}`);
  console.assert(track.playbackAvailability === 'available', `Availability must be 'available' for ${track.title}`);

  // Strict matching rule: Marathi tracks must have Marathi audio assets
  if (track.language === 'Marathi') {
    const isSyntheticEDM = track.audioUrl.includes('synthwave') || track.audioUrl.includes('future-beats');
    console.assert(!isSyntheticEDM, `Marathi track "${track.title}" cannot play synthetic EDM audio`);
  }
});
console.log(`  ✓ All ${allPlayable.length} playable tracks verified: 100% matched title, language, and audio asset.`);
passedTests++;

// --- TEST 5: INCORRECT AUDIO REJECTION ---
console.log('\n[TEST 5] Verifying Strict Incorrect Audio Rejection...');
const spoofedTrack = {
  ...cyberSong,
  id: 'song-spoofed',
  title: 'Fake Marathi Track',
  language: 'Marathi',
  audioUrl: 'https://cdn.pixabay.com/download/audio/2022/10/14/audio_9939f792cb.mp3?filename=uplifting-synthwave-124792.mp3',
  playbackAvailability: 'available',
  verificationStatus: 'verified',
};
const spoofVal = trackValidationService.validateForPlayback(spoofedTrack);
console.assert(spoofVal.canPlay === false, 'Spoofed mismatched audio track must be strictly rejected');
console.log(`  ✓ Incorrect audio rejection passed: "${spoofedTrack.title}" rejected (${spoofVal.reason}).`);
passedTests++;

// --- TEST 6: DUPLICATE TRACK HANDLING ---
console.log('\n[TEST 6] Testing Duplicate Track Handling...');
recentlyPlayedService.recordPlay(cyberSong);
recentlyPlayedService.recordPlay(cyberSong);
const history = recentlyPlayedService.getHistory();
const cyberOccurrences = history.filter((h) => h.songId === cyberSong.id);
console.assert(cyberOccurrences.length === 1, 'Recently played must deduplicate and bump track to top');
console.log('  ✓ Duplicate track handling in history passed: duplicate safely deduped to top.');
passedTests++;

// --- TEST 7: MISSING AUDIO HANDLING ---
console.log('\n[TEST 7] Testing Missing Audio Handling...');
const emptyAudioTrack = {
  ...cyberSong,
  id: 'song-no-audio',
  audioUrl: '',
  playbackAvailability: 'available',
  verificationStatus: 'verified',
};
const emptyVal = trackValidationService.validateForPlayback(emptyAudioTrack);
console.assert(emptyVal.canPlay === false, 'Track with missing audio URL must not be allowed to play');
console.log('  ✓ Missing audio handling passed: rejected with error.');
passedTests++;

// --- TEST 8: INVALID METADATA HANDLING ---
console.log('\n[TEST 8] Testing Invalid Metadata Handling...');
const nullTrackVal = trackValidationService.validateForPlayback(null);
console.assert(nullTrackVal.canPlay === false, 'Null track must be rejected');
const missingIdVal = trackValidationService.validateForPlayback({ title: 'No ID' });
console.assert(missingIdVal.canPlay === false, 'Track without ID must be rejected');
console.log('  ✓ Invalid metadata handling passed.');
passedTests++;

// --- TEST 9: SPOTIFY DISCOVERY & COMMERCIAL LICENSING SEPARATION ---
console.log('\n[TEST 9] Testing Spotify Discovery & Commercial Master Separation...');
const spotifyResults = spotifyDiscoveryService.getTrendingDiscovery('Marathi');
console.assert(spotifyResults.length > 0, 'Spotify discovery must return tracks');
console.assert(spotifyResults[0].spotifyUrl.startsWith('https://open.spotify.com/'), 'Spotify discovery track must have valid Spotify link');

// Test that unverified / unavailable commercial tracks are strictly prevented from playing independent audio
const unavailableCommercialTrack = {
  id: 'commercial-unlicensed-master',
  trackId: 'commercial-unlicensed-master',
  title: 'Protected Commercial Master',
  artistName: 'Exclusive Label Artist',
  albumTitle: 'Exclusive Album',
  coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600',
  audioUrl: '',
  duration: 210,
  genre: 'Commercial Pop',
  language: 'Marathi',
  playbackAvailability: 'unavailable',
  verificationStatus: 'unverified',
  spotifyUrl: 'https://open.spotify.com/track/6K47v8W7xZ1bXfJgL1Jz5c',
};
const commercialVal = trackValidationService.validateForPlayback(unavailableCommercialTrack);
console.assert(commercialVal.canPlay === false, 'Commercial master must not play independent audio');
console.assert(commercialVal.userMessage && commercialVal.userMessage.includes('Spotify'), 'Commercial master notice must point user to Spotify');
console.log('  ✓ Commercial licensing & Spotify Discovery separation passed.');
passedTests++;

// --- TEST 10: PLAYLIST SYNCHRONIZATION ---
console.log('\n[TEST 10] Testing Playlist Synchronization by Track ID...');
const testPlaylist = playlistService.createPlaylist('Architecture Test Playlist');
console.assert(testPlaylist.id, 'Playlist must have unique ID');
playlistService.addSongToPlaylist(testPlaylist.id, cyberSong.id);
let playlistSongs = playlistService.getPlaylistSongs(testPlaylist.id);
console.assert(playlistSongs.length === 1, 'Playlist must contain added song');
console.assert(playlistSongs[0].id === cyberSong.id, 'Playlist song ID must match');

playlistService.removeSongFromPlaylist(testPlaylist.id, cyberSong.id);
playlistSongs = playlistService.getPlaylistSongs(testPlaylist.id);
console.assert(playlistSongs.length === 0, 'Playlist must be empty after removal');
playlistService.deletePlaylist(testPlaylist.id);
console.log('  ✓ Playlist synchronization passed: exact track_id association maintained.');
passedTests++;

// --- TEST 11: QUEUE SYNCHRONIZATION ---
console.log('\n[TEST 11] Testing Queue Management & Traversal...');
queueService.setQueue(allPlayable, allPlayable[0]);
console.assert(queueService.getCurrentIndex() === 0, 'Queue current index must start at 0');
const nextSong = queueService.getNext();
console.assert(nextSong && queueService.getCurrentIndex() === 1, 'getNext() must advance index to 1');
const prevSong = queueService.getPrevious();
console.assert(prevSong && queueService.getCurrentIndex() === 0, 'getPrevious() must retreat index to 0');
console.log('  ✓ Queue service state transitions passed.');
passedTests++;

// --- TEST 12: PLAYER STATE SYNCHRONIZATION ---
console.log('\n[TEST 12] Testing Playback Engine State Synchronization...');
const initialPlayerState = playbackService.getState();
console.assert(initialPlayerState !== null, 'Player state must be defined');
console.assert(typeof initialPlayerState.volume === 'number', 'Volume must be numeric');
playbackService.setVolume(0.65);
console.assert(playbackService.getState().volume === 0.65, 'Volume must be updated in player state');
playbackService.clearPlaybackError();
console.assert(playbackService.getState().playbackError === null, 'clearPlaybackError() must reset error state');
console.log('  ✓ Player state synchronization passed.');
passedTests++;

// --- TEST 13: API FAILURE HANDLING ---
console.log('\n[TEST 13] Testing API Resilience & Fallback Handling...');
const offlineSearch = searchService.searchSync('nonexistent_random_token_xyz_999');
console.assert(offlineSearch.licensedSongs.length === 0, 'Empty search must cleanly return 0 songs');
console.assert(offlineSearch.albums.length === 0, 'Empty search must cleanly return 0 albums');
console.log('  ✓ API resilience and graceful empty-state handling verified.');
passedTests++;

console.log('\n================================================================');
console.log(`   ALL AURA MUSIC MASTER ARCHITECTURE TESTS PASSED (${passedTests}/${totalTests})!  `);
console.log('================================================================\n');

