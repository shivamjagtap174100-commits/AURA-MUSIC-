/**
 * AURA MUSIC — Premium Playback Service
 * 
 * Production audio engine strictly enforcing:
 * "THE SONG DISPLAYED MUST ALWAYS BE THE EXACT SONG BEING PLAYED."
 * 
 * Never plays unverified fallback audio.
 */

import type { Song, RepeatMode, PlayerState } from '../types/index.ts';
import { trackValidationService } from './trackValidationService.ts';
import { queueService } from './queueService.ts';
import { recentlyPlayedService } from './recentlyPlayedService.ts';
import { downloadManager } from './downloadManager.ts';

type PlaybackListener = (state: PlayerState) => void;

class MockAudioElement {
  public src: string = '';
  public preload: string = 'auto';
  public volume: number = 0.8;
  public currentTime: number = 0;
  public duration: number = 180;
  private listeners: Record<string, Function[]> = {};

  addEventListener(event: string, fn: Function) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(fn);
  }
  removeEventListener() {}
  async play() { return Promise.resolve(); }
  pause() {}
}

class PlaybackService {
  private audio: HTMLAudioElement;
  private listeners: Set<PlaybackListener> = new Set();
  private state: PlayerState = {
    currentSong: null,
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 0.8,
    isMuted: false,
    shuffle: false,
    repeat: 'off',
    queue: [],
    queueIndex: -1,
    originalQueue: [],
    isBuffering: false,
    isFullScreen: false,
    isQueueOpen: false,
    playbackError: null,
  };

  private currentBlobUrl: string | null = null;

  constructor() {
    this.audio = typeof Audio !== 'undefined' ? new Audio() : (new MockAudioElement() as unknown as HTMLAudioElement);
    this.audio.preload = 'auto';
    this.audio.volume = this.state.volume;

    this.setupAudioListeners();
    this.setupMediaSession();
    this.setupKeyboardShortcuts();

    // Keep queue in sync with queueService
    queueService.subscribe((queue, index) => {
      this.state.queue = queue;
      this.state.queueIndex = index;
      this.state.shuffle = queueService.getShuffle();
      this.state.repeat = queueService.getRepeat();
      this.notify();
    });
  }

  private setupAudioListeners() {
    this.audio.addEventListener('play', () => {
      this.state.isPlaying = true;
      this.state.playbackError = null;
      this.notify();
      this.updateMediaSessionState('playing');
    });

    this.audio.addEventListener('pause', () => {
      this.state.isPlaying = false;
      this.notify();
      this.updateMediaSessionState('paused');
    });

    this.audio.addEventListener('timeupdate', () => {
      this.state.currentTime = this.audio.currentTime || 0;
      if (this.audio.duration && !isNaN(this.audio.duration) && this.audio.duration > 0) {
        this.state.duration = this.audio.duration;
      }
      this.notify();
    });

    this.audio.addEventListener('loadedmetadata', () => {
      if (this.audio.duration && !isNaN(this.audio.duration) && this.audio.duration > 0) {
        this.state.duration = this.audio.duration;
      }
      this.state.isBuffering = false;
      this.notify();
    });

    this.audio.addEventListener('waiting', () => {
      this.state.isBuffering = true;
      this.notify();
    });

    this.audio.addEventListener('playing', () => {
      this.state.isBuffering = false;
      this.notify();
    });

    this.audio.addEventListener('ended', () => {
      // Natural track completion - advance to next track without repeating
      this.handleSongEnded();
    });

    this.audio.addEventListener('error', (e) => {
      console.warn('[PlaybackService] Audio stream error:', e);
      this.state.isBuffering = false;
      this.state.isPlaying = false;
      this.state.playbackError = 'Network or audio decoding error. Stream could not be reached.';
      this.notify();
    });
  }

  private handleSongEnded() {
    if (this.state.repeat === 'one') {
      this.audio.currentTime = 0;
      this.state.currentTime = 0;
      this.audio.play().catch(console.warn);
    } else {
      this.next();
    }
  }

  private setupMediaSession() {
    if (typeof navigator !== 'undefined' && 'mediaSession' in navigator) {
      navigator.mediaSession.setActionHandler('play', () => this.resume());
      navigator.mediaSession.setActionHandler('pause', () => this.pause());
      navigator.mediaSession.setActionHandler('previoustrack', () => this.previous());
      navigator.mediaSession.setActionHandler('nexttrack', () => this.next());
      navigator.mediaSession.setActionHandler('seekto', (details) => {
        if (details.seekTime !== undefined && details.seekTime !== null) {
          this.seek(details.seekTime);
        }
      });
      navigator.mediaSession.setActionHandler('seekbackward', (details) => {
        const offset = details.seekOffset || 10;
        this.seek(Math.max(0, this.state.currentTime - offset));
      });
      navigator.mediaSession.setActionHandler('seekforward', (details) => {
        const offset = details.seekOffset || 10;
        this.seek(Math.min(this.state.duration, this.state.currentTime + offset));
      });
    }
  }

  private updateMediaMetadata(song: Song) {
    if (typeof navigator !== 'undefined' && 'mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: song.title,
        artist: song.artistName,
        album: song.albumTitle || 'AURA MUSIC',
        artwork: [
          { src: song.coverUrl, sizes: '96x96', type: 'image/jpeg' },
          { src: song.coverUrl, sizes: '128x128', type: 'image/jpeg' },
          { src: song.coverUrl, sizes: '256x256', type: 'image/jpeg' },
          { src: song.coverUrl, sizes: '512x512', type: 'image/jpeg' },
        ],
      });
    }
  }

  private updateMediaSessionState(state: 'playing' | 'paused' | 'none') {
    if (typeof navigator !== 'undefined' && 'mediaSession' in navigator) {
      navigator.mediaSession.playbackState = state;
    }
  }

  private setupKeyboardShortcuts() {
    if (typeof window === 'undefined') return;
    window.addEventListener('keydown', (e) => {
      const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea') return;

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          this.togglePlayPause();
          break;
        case 'ArrowRight':
          if (e.shiftKey) {
            this.next();
          } else {
            this.seek(Math.min(this.state.duration, this.state.currentTime + 5));
          }
          break;
        case 'ArrowLeft':
          if (e.shiftKey) {
            this.previous();
          } else {
            this.seek(Math.max(0, this.state.currentTime - 5));
          }
          break;
        case 'ArrowUp':
          e.preventDefault();
          this.setVolume(Math.min(1, this.state.volume + 0.05));
          break;
        case 'ArrowDown':
          e.preventDefault();
          this.setVolume(Math.max(0, this.state.volume - 0.05));
          break;
        case 'KeyM':
          this.toggleMute();
          break;
        case 'KeyS':
          this.toggleShuffle();
          break;
        case 'KeyR':
          this.cycleRepeat();
          break;
      }
    });
  }

  private notify() {
    this.listeners.forEach((l) => l({ ...this.state }));
  }

  public subscribe(listener: PlaybackListener): () => void {
    this.listeners.add(listener);
    listener({ ...this.state });
    return () => this.listeners.delete(listener);
  }

  public getState(): PlayerState {
    return { ...this.state };
  }

  /**
   * Play song with strict validation
   */
  public async playSong(song: Song, newQueue?: Song[], startIndex: number = 0) {
    if (!song) return;

    // Update queue if provided
    if (newQueue && newQueue.length > 0) {
      queueService.setQueue(newQueue, song, startIndex);
    } else {
      queueService.setQueue([song]);
    }

    // 1. VALIDATE TRACK BEFORE PLAYBACK
    const validation = trackValidationService.validateForPlayback(song);

    this.state.currentSong = song;
    this.state.currentTime = 0;
    this.state.duration = song.duration || 0;

    if (!validation.canPlay) {
      // STOP any currently running audio! DO NOT PLAY FALLBACK AUDIO!
      this.audio.pause();
      this.audio.src = '';
      this.state.isPlaying = false;
      this.state.isBuffering = false;
      this.state.playbackError = validation.userMessage || validation.reason || 'Track playback unavailable.';
      this.notify();
      return;
    }

    // Clear previous error
    this.state.playbackError = null;
    this.state.isBuffering = true;
    this.notify();

    // Revoke previous blob url if any
    if (this.currentBlobUrl) {
      URL.revokeObjectURL(this.currentBlobUrl);
      this.currentBlobUrl = null;
    }

    // 2. CHECK OFFLINE BLOB STORAGE FIRST
    const offlineUrl = await downloadManager.getOfflineAudioUrl(song.id);
    if (offlineUrl) {
      this.currentBlobUrl = offlineUrl;
      this.audio.src = offlineUrl;
    } else {
      this.audio.src = song.audioUrl;
    }

    this.updateMediaMetadata(song);

    try {
      await this.audio.play();
      this.state.isPlaying = true;
      recentlyPlayedService.recordPlay(song);
    } catch (err) {
      console.warn('[PlaybackService] Autoplay blocked or media error:', err);
      this.state.isPlaying = false;
    } finally {
      this.state.isBuffering = false;
      this.notify();
    }
  }

  public async togglePlayPause() {
    if (!this.state.currentSong) {
      const q = queueService.getQueue();
      if (q.length > 0) {
        await this.playSong(q[0]);
      }
      return;
    }

    if (this.state.playbackError) {
      // Cannot resume unverified/unavailable track
      return;
    }

    if (this.state.isPlaying) {
      this.pause();
    } else {
      await this.resume();
    }
  }

  public pause() {
    this.audio.pause();
    this.state.isPlaying = false;
    this.notify();
  }

  public async resume() {
    if (!this.state.currentSong) {
      const q = queueService.getQueue();
      if (q.length > 0) {
        await this.playSong(q[0]);
      }
      return;
    }

    if (this.state.playbackError) return;

    try {
      await this.audio.play();
      this.state.isPlaying = true;
      this.notify();
    } catch (err) {
      console.warn('[PlaybackService] Resume error:', err);
    }
  }

  public seek(seconds: number) {
    if (isNaN(seconds) || seconds < 0) return;
    const maxDur = (this.audio.duration && !isNaN(this.audio.duration) && this.audio.duration > 0)
      ? this.audio.duration
      : (this.state.duration || 0);
    const clamped = maxDur > 0 ? Math.max(0, Math.min(maxDur, seconds)) : seconds;
    this.audio.currentTime = clamped;
    this.state.currentTime = clamped;
    this.notify();
  }

  public setVolume(vol: number) {
    const clamped = Math.max(0, Math.min(1, vol));
    this.audio.volume = clamped;
    this.state.volume = clamped;
    this.state.isMuted = clamped === 0;
    this.notify();
  }

  public toggleMute() {
    if (this.state.isMuted) {
      this.audio.volume = this.state.volume > 0 ? this.state.volume : 0.8;
      this.state.isMuted = false;
    } else {
      this.audio.volume = 0;
      this.state.isMuted = true;
    }
    this.notify();
  }

  public next() {
    const nextTrack = queueService.getNext();
    if (nextTrack) {
      this.playSong(nextTrack);
    } else {
      this.state.isPlaying = false;
      this.notify();
    }
  }

  public previous() {
    if (this.state.currentTime > 3) {
      this.seek(0);
      return;
    }
    const prevTrack = queueService.getPrevious();
    if (prevTrack) {
      this.playSong(prevTrack);
    }
  }

  public toggleShuffle() {
    const isShuffle = queueService.toggleShuffle();
    this.state.shuffle = isShuffle;
    this.notify();
  }

  public cycleRepeat() {
    const repeatMode = queueService.cycleRepeat();
    this.state.repeat = repeatMode;
    this.notify();
  }

  public addToQueue(song: Song) {
    queueService.addToQueue(song);
  }

  public playNext(song: Song) {
    queueService.playNext(song);
  }

  public removeFromQueue(index: number) {
    queueService.removeFromQueue(index);
  }

  public reorderQueue(fromIndex: number, toIndex: number) {
    queueService.reorderQueue(fromIndex, toIndex);
  }

  public clearQueue() {
    queueService.clear();
  }

  public setFullScreen(isOpen: boolean) {
    this.state.isFullScreen = isOpen;
    this.notify();
  }

  public setQueueOpen(isOpen: boolean) {
    this.state.isQueueOpen = isOpen;
    this.notify();
  }

  public clearPlaybackError() {
    this.state.playbackError = null;
    this.notify();
  }
}

export const playbackService = new PlaybackService();
// Export canonical alias for backwards compatibility
export const audioService = playbackService;
