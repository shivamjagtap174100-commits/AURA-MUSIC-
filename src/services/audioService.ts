import { Song, RepeatMode, PlayerState } from '../types';
import { downloadManager } from './downloadManager';
import { catalogService } from './catalogService';

type PlayerListener = (state: PlayerState) => void;

class AudioService {
  private audio: HTMLAudioElement;
  private listeners: Set<PlayerListener> = new Set();
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
  };

  private currentBlobUrl: string | null = null;

  constructor() {
    this.audio = new Audio();
    this.audio.preload = 'auto';
    this.audio.volume = this.state.volume;

    this.setupAudioListeners();
    this.setupMediaSession();
    this.setupKeyboardShortcuts();
  }

  private setupAudioListeners() {
    this.audio.addEventListener('play', () => {
      this.state.isPlaying = true;
      this.notifyListeners();
      this.updateMediaSessionPlaybackState('playing');
    });

    this.audio.addEventListener('pause', () => {
      this.state.isPlaying = false;
      this.notifyListeners();
      this.updateMediaSessionPlaybackState('paused');
    });

    this.audio.addEventListener('timeupdate', () => {
      this.state.currentTime = this.audio.currentTime;
      // Duration might load dynamically
      if (!this.state.duration && this.audio.duration && !isNaN(this.audio.duration)) {
        this.state.duration = this.audio.duration;
      }
      this.notifyListeners();
    });

    this.audio.addEventListener('loadedmetadata', () => {
      if (this.audio.duration && !isNaN(this.audio.duration)) {
        this.state.duration = this.audio.duration;
      }
      this.state.isBuffering = false;
      this.notifyListeners();
    });

    this.audio.addEventListener('waiting', () => {
      this.state.isBuffering = true;
      this.notifyListeners();
    });

    this.audio.addEventListener('playing', () => {
      this.state.isBuffering = false;
      this.notifyListeners();
    });

    this.audio.addEventListener('ended', () => {
      this.handleSongEnded();
    });

    this.audio.addEventListener('error', (e) => {
      console.warn('Audio playback error:', e);
      this.state.isBuffering = false;
      this.state.isPlaying = false;
      this.notifyListeners();
    });
  }

  private setupMediaSession() {
    if ('mediaSession' in navigator) {
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
    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: song.title,
        artist: song.artistName,
        album: song.albumTitle || 'Aura Music Single',
        artwork: [
          { src: song.coverUrl, sizes: '96x96', type: 'image/jpeg' },
          { src: song.coverUrl, sizes: '128x128', type: 'image/jpeg' },
          { src: song.coverUrl, sizes: '192x192', type: 'image/jpeg' },
          { src: song.coverUrl, sizes: '256x256', type: 'image/jpeg' },
          { src: song.coverUrl, sizes: '512x512', type: 'image/jpeg' },
        ],
      });
    }
  }

  private updateMediaSessionPlaybackState(state: 'playing' | 'paused' | 'none') {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.playbackState = state;
    }
  }

  private setupKeyboardShortcuts() {
    window.addEventListener('keydown', (e) => {
      // Don't trigger if user is typing in an input or textarea
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
        case 'Escape':
          if (this.state.isFullScreen) {
            this.setFullScreen(false);
          }
          if (this.state.isQueueOpen) {
            this.setQueueOpen(false);
          }
          break;
      }
    });
  }

  private notifyListeners() {
    this.listeners.forEach((listener) => listener({ ...this.state }));
  }

  public subscribe(listener: PlayerListener): () => void {
    this.listeners.add(listener);
    listener({ ...this.state });
    return () => this.listeners.delete(listener);
  }

  public getState(): PlayerState {
    return { ...this.state };
  }

  public async playSong(song: Song, newQueue?: Song[], startIndex: number = 0) {
    if (newQueue && newQueue.length > 0) {
      this.state.originalQueue = [...newQueue];
      if (this.state.shuffle) {
        // Keep current song at front and shuffle the rest
        const otherSongs = newQueue.filter((s) => s.id !== song.id);
        const shuffled = [...otherSongs].sort(() => Math.random() - 0.5);
        this.state.queue = [song, ...shuffled];
        this.state.queueIndex = 0;
      } else {
        this.state.queue = [...newQueue];
        this.state.queueIndex = startIndex >= 0 ? startIndex : this.state.queue.findIndex((s) => s.id === song.id);
      }
    } else if (this.state.queue.length === 0) {
      this.state.queue = [song];
      this.state.originalQueue = [song];
      this.state.queueIndex = 0;
    } else {
      const idx = this.state.queue.findIndex((s) => s.id === song.id);
      if (idx !== -1) {
        this.state.queueIndex = idx;
      } else {
        this.state.queue.splice(this.state.queueIndex + 1, 0, song);
        this.state.queueIndex += 1;
      }
    }

    this.state.currentSong = song;
    this.state.currentTime = 0;
    this.state.duration = song.duration || 0;
    this.state.isBuffering = true;
    this.notifyListeners();

    // Revoke previous blob url if any
    if (this.currentBlobUrl) {
      URL.revokeObjectURL(this.currentBlobUrl);
      this.currentBlobUrl = null;
    }

    // Check if song is downloaded offline!
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
      catalogService.recordPlay(song);
    } catch (err) {
      console.warn('Playback error or user autoplay restriction:', err);
      this.state.isPlaying = false;
    } finally {
      this.state.isBuffering = false;
      this.notifyListeners();
    }
  }

  public async resume() {
    if (!this.state.currentSong && this.state.queue.length > 0) {
      const first = this.state.queue[0];
      await this.playSong(first);
      return;
    }
    if (this.audio.src) {
      try {
        await this.audio.play();
        this.state.isPlaying = true;
        this.notifyListeners();
      } catch (err) {
        console.warn('Resume error:', err);
      }
    }
  }

  public pause() {
    this.audio.pause();
    this.state.isPlaying = false;
    this.notifyListeners();
  }

  public togglePlayPause() {
    if (this.state.isPlaying) {
      this.pause();
    } else {
      this.resume();
    }
  }

  public seek(seconds: number) {
    if (this.audio && !isNaN(seconds)) {
      const target = Math.max(0, Math.min(seconds, this.state.duration || this.audio.duration || 9999));
      this.audio.currentTime = target;
      this.state.currentTime = target;
      this.notifyListeners();
    }
  }

  public setVolume(vol: number) {
    const clamped = Math.max(0, Math.min(1, vol));
    this.audio.volume = clamped;
    this.state.volume = clamped;
    this.state.isMuted = clamped === 0;
    this.notifyListeners();
  }

  public toggleMute() {
    if (this.state.isMuted) {
      this.audio.volume = this.state.volume || 0.8;
      this.state.isMuted = false;
    } else {
      this.audio.volume = 0;
      this.state.isMuted = true;
    }
    this.notifyListeners();
  }

  public next() {
    if (this.state.queue.length === 0) return;

    if (this.state.repeat === 'one') {
      this.seek(0);
      this.resume();
      return;
    }

    let nextIndex = this.state.queueIndex + 1;
    if (nextIndex >= this.state.queue.length) {
      if (this.state.repeat === 'all') {
        nextIndex = 0;
      } else {
        // End of queue reached
        this.pause();
        this.seek(0);
        return;
      }
    }

    this.state.queueIndex = nextIndex;
    const nextSong = this.state.queue[nextIndex];
    if (nextSong) {
      this.playSong(nextSong);
    }
  }

  public previous() {
    if (this.state.queue.length === 0) return;

    // If more than 3 seconds in, replay current track
    if (this.state.currentTime > 3) {
      this.seek(0);
      return;
    }

    let prevIndex = this.state.queueIndex - 1;
    if (prevIndex < 0) {
      if (this.state.repeat === 'all') {
        prevIndex = this.state.queue.length - 1;
      } else {
        this.seek(0);
        return;
      }
    }

    this.state.queueIndex = prevIndex;
    const prevSong = this.state.queue[prevIndex];
    if (prevSong) {
      this.playSong(prevSong);
    }
  }

  private handleSongEnded() {
    if (this.state.repeat === 'one') {
      this.seek(0);
      this.resume();
    } else {
      this.next();
    }
  }

  public toggleShuffle() {
    const newShuffle = !this.state.shuffle;
    this.state.shuffle = newShuffle;

    if (newShuffle) {
      // Shuffle queue while keeping current song at current position
      const current = this.state.currentSong;
      const otherSongs = this.state.originalQueue.filter((s) => s.id !== current?.id);
      const shuffled = [...otherSongs].sort(() => Math.random() - 0.5);
      if (current) {
        this.state.queue = [current, ...shuffled];
        this.state.queueIndex = 0;
      } else {
        this.state.queue = shuffled;
      }
    } else {
      // Restore original queue
      this.state.queue = [...this.state.originalQueue];
      if (this.state.currentSong) {
        this.state.queueIndex = this.state.queue.findIndex((s) => s.id === this.state.currentSong?.id);
      }
    }

    this.notifyListeners();
  }

  public cycleRepeat() {
    const modes: RepeatMode[] = ['off', 'all', 'one'];
    const currentIndex = modes.indexOf(this.state.repeat);
    this.state.repeat = modes[(currentIndex + 1) % modes.length];
    this.notifyListeners();
  }

  public addToQueue(song: Song) {
    this.state.queue.push(song);
    this.state.originalQueue.push(song);
    this.notifyListeners();
  }

  public playNext(song: Song) {
    const insertIdx = this.state.queueIndex + 1;
    this.state.queue.splice(insertIdx, 0, song);
    this.state.originalQueue.splice(insertIdx, 0, song);
    this.notifyListeners();
  }

  public removeFromQueue(index: number) {
    if (index === this.state.queueIndex) {
      this.next();
    }
    this.state.queue.splice(index, 1);
    if (index < this.state.queueIndex) {
      this.state.queueIndex -= 1;
    }
    this.notifyListeners();
  }

  public reorderQueue(fromIndex: number, toIndex: number) {
    const [moved] = this.state.queue.splice(fromIndex, 1);
    this.state.queue.splice(toIndex, 0, moved);

    if (fromIndex === this.state.queueIndex) {
      this.state.queueIndex = toIndex;
    } else if (fromIndex < this.state.queueIndex && toIndex >= this.state.queueIndex) {
      this.state.queueIndex -= 1;
    } else if (fromIndex > this.state.queueIndex && toIndex <= this.state.queueIndex) {
      this.state.queueIndex += 1;
    }

    this.notifyListeners();
  }

  public clearQueue() {
    if (this.state.currentSong) {
      this.state.queue = [this.state.currentSong];
      this.state.originalQueue = [this.state.currentSong];
      this.state.queueIndex = 0;
    } else {
      this.state.queue = [];
      this.state.originalQueue = [];
      this.state.queueIndex = -1;
    }
    this.notifyListeners();
  }

  public setFullScreen(isOpen: boolean) {
    this.state.isFullScreen = isOpen;
    this.notifyListeners();
  }

  public setQueueOpen(isOpen: boolean) {
    this.state.isQueueOpen = isOpen;
    this.notifyListeners();
  }
}

export const audioService = new AudioService();
