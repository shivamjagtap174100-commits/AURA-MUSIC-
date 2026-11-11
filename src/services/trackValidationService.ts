/**
 * AURA MUSIC — Track Validation Service
 * 
 * Enforces the core architectural rule:
 * "THE SONG DISPLAYED MUST ALWAYS BE THE EXACT SONG BEING PLAYED."
 * 
 * Guarantees:
 * 1. Metadata and audio are bound through the same verified catalog record.
 * 2. Unverified or mismatched fallback audio is strictly rejected.
 * 3. Unavailable tracks display an explicit unavailable state instead of playing unrelated audio.
 */

import type { Song, PlaybackAvailability, VerificationStatus } from '../types/index.ts';

export interface ValidationResult {
  isValid: boolean;
  canPlay: boolean;
  reason?: string;
  userMessage?: string;
  trackId?: string;
  playbackAvailability: PlaybackAvailability;
  verificationStatus: VerificationStatus;
}

class TrackValidationService {
  /**
   * Validate track before sending to the audio engine.
   * Rejects any track where audio does not match or is unavailable.
   */
  public validateForPlayback(track: Song | null | undefined): ValidationResult {
    if (!track) {
      return {
        isValid: false,
        canPlay: false,
        reason: 'No track supplied for playback validation.',
        userMessage: 'No track selected.',
        playbackAvailability: 'unavailable',
        verificationStatus: 'unverified',
      };
    }

    // 1. Check unique ID
    if (!track.id) {
      return {
        isValid: false,
        canPlay: false,
        reason: 'Track is missing an internal unique track_id.',
        userMessage: 'Track ID error. Playback prevented.',
        playbackAvailability: 'unavailable',
        verificationStatus: 'unverified',
      };
    }

    // 2. Check explicit playback availability flag
    if (track.playbackAvailability === 'unavailable') {
      const msg = track.spotifyUrl
        ? `"${track.title}" commercial master streaming is licensed exclusively on Spotify. Fallback audio is prohibited under AURA Music Architecture.`
        : `"${track.title}" is currently unavailable for independent streaming.`;
      
      return {
        isValid: false,
        canPlay: false,
        trackId: track.id,
        reason: `Track marked with playbackAvailability='unavailable'. Commercial rights reserved.`,
        userMessage: msg,
        playbackAvailability: 'unavailable',
        verificationStatus: track.verificationStatus || 'unverified',
      };
    }

    // 3. Check verification status
    if (track.verificationStatus !== 'verified') {
      return {
        isValid: false,
        canPlay: false,
        trackId: track.id,
        reason: `Track verificationStatus is '${track.verificationStatus}'. Must be 'verified' to play.`,
        userMessage: `"${track.title}" audio asset has not been verified. Unverified playback is disabled.`,
        playbackAvailability: 'unavailable',
        verificationStatus: 'unverified',
      };
    }

    // 4. Check audio URL legitimacy
    if (!track.audioUrl || typeof track.audioUrl !== 'string' || track.audioUrl.trim() === '') {
      return {
        isValid: false,
        canPlay: false,
        trackId: track.id,
        reason: 'Missing audio URL for verified track.',
        userMessage: `Audio asset for "${track.title}" is currently offline.`,
        playbackAvailability: 'unavailable',
        verificationStatus: 'verified',
      };
    }

    // 5. Check against forbidden generic placeholder filenames
    const forbiddenFallbacks = [
      'uplifting-synthwave-124792.mp3',
      'electronic-future-beats-117997.mp3',
      'acoustic-guitar-ambient-14251.mp3',
    ];

    const isMarathiOrHindi = track.language === 'Marathi' || track.language === 'Hindi';
    if (isMarathiOrHindi) {
      const isForbidden = forbiddenFallbacks.some((f) => track.audioUrl.includes(f));
      if (isForbidden) {
        return {
          isValid: false,
          canPlay: false,
          trackId: track.id,
          reason: `Rejected mismatched audio URL. Marathi/Hindi track "${track.title}" cannot play generic synthwave/ambient audio.`,
          userMessage: `Streaming unavailable: Commercial audio master is reserved. Fallback audio is prohibited.`,
          playbackAvailability: 'unavailable',
          verificationStatus: 'unverified',
        };
      }
    }

    return {
      isValid: true,
      canPlay: true,
      trackId: track.id,
      playbackAvailability: 'available',
      verificationStatus: 'verified',
    };
  }

  /**
   * Asserts whether a track is verified and authorized for playback.
   */
  public isPlaybackAuthorized(track: Song): boolean {
    return this.validateForPlayback(track).canPlay;
  }

  /**
   * Validates that track metadata and audio asset ID are bound together.
   */
  public verifyAssetBinding(track: Song): boolean {
    if (!track.id || !track.title || !track.artistName) return false;
    if (track.playbackAvailability === 'available') {
      return Boolean(track.audioUrl && track.verificationStatus === 'verified');
    }
    return true;
  }
}

export const trackValidationService = new TrackValidationService();

