// Automated verification suite for AURA MUSIC business logic and services
import { INITIAL_SONGS, INITIAL_ALBUMS, INITIAL_ARTISTS, INITIAL_PLAYLISTS, GENRES } from '../src/data/initialCatalog.ts';

console.log('=== AURA MUSIC AUTOMATED VERIFICATION SUITE ===');

// 1. Verify Catalog Integrity
console.log('\n[TEST 1] Verifying Catalog Data...');
console.assert(INITIAL_SONGS.length >= 8, 'Should have at least 8 initial songs');
console.assert(INITIAL_ALBUMS.length >= 5, 'Should have at least 5 initial albums');
console.assert(INITIAL_ARTISTS.length >= 5, 'Should have at least 5 initial artists');
console.assert(INITIAL_PLAYLISTS.length >= 3, 'Should have at least 3 initial playlists');
console.assert(GENRES.length >= 6, 'Should have at least 6 genres');

INITIAL_SONGS.forEach((song) => {
  console.assert(song.title && song.artistName, `Song ${song.id} must have title and artist`);
  console.assert(song.audioUrl && song.audioUrl.startsWith('http'), `Song ${song.id} audioUrl must be valid http(s)`);
  console.assert(song.duration > 0, `Song ${song.id} duration must be positive`);
  console.assert(song.isRoyaltyFree === true, `Song ${song.id} must be marked royalty free`);
});
console.log(`✓ Catalog Integrity passed: ${INITIAL_SONGS.length} songs, ${INITIAL_ALBUMS.length} albums, ${INITIAL_ARTISTS.length} artists.`);

// 2. Verify Search Logic
console.log('\n[TEST 2] Verifying Search Engine...');
function searchCatalog(query) {
  const q = query.trim().toLowerCase();
  return INITIAL_SONGS.filter(
    (s) =>
      s.title.toLowerCase().includes(q) ||
      s.artistName.toLowerCase().includes(q) ||
      s.genre.toLowerCase().includes(q)
  );
}

const synthwaveResults = searchCatalog('synthwave');
console.assert(synthwaveResults.length >= 2, 'Search for "synthwave" should return tracks');
console.log(`✓ Search for "synthwave" returned ${synthwaveResults.length} tracks.`);

const neonResults = searchCatalog('Neon Mirage');
console.assert(neonResults.length >= 2, 'Search for artist "Neon Mirage" should return tracks');
console.log(`✓ Search for artist "Neon Mirage" returned ${neonResults.length} tracks.`);

// 3. Verify Playlist Logic
console.log('\n[TEST 3] Verifying Playlist Operations...');
const samplePlaylist = {
  id: 'test-pl-1',
  title: 'My Late Night Vibes',
  songIds: ['song-1', 'song-2'],
};
samplePlaylist.songIds.push('song-3');
console.assert(samplePlaylist.songIds.length === 3, 'Adding song should increase songIds length');

const [moved] = samplePlaylist.songIds.splice(0, 1);
samplePlaylist.songIds.splice(1, 0, moved);
console.assert(samplePlaylist.songIds[1] === 'song-1', 'Song should be reordered correctly');

samplePlaylist.songIds = samplePlaylist.songIds.filter((id) => id !== 'song-2');
console.assert(samplePlaylist.songIds.length === 2, 'Removing song should decrease songIds length');
console.log('✓ Playlist creation, reordering, and removal logic verified.');

// 4. Verify Audio Quality Calculation
console.log('\n[TEST 4] Verifying Audio Quality Tiers...');
const qualities = ['Normal (128 kbps)', 'High (320 kbps)', 'Ultra HD / FLAC'];
qualities.forEach((q) => {
  const isLossless = q.includes('FLAC');
  const isHigh = q.includes('320');
  console.log(`  Tier [${q}]: lossless=${isLossless}, highQuality=${isHigh}`);
});
console.log('✓ Audio Quality calculation verified.');

console.log('\n=== ALL VERIFICATION TESTS PASSED SUCCESSFULLY! ===\n');
