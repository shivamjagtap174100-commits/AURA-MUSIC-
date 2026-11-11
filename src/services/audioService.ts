/**
 * AURA MUSIC — Audio Service (Façade for PlaybackService)
 * 
 * Re-exports playbackService as audioService to maintain backwards compatibility
 * while strictly adhering to the master architecture.
 */

export { playbackService as audioService, playbackService } from './playbackService.ts';
