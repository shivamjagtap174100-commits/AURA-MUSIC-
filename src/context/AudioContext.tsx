import React, { createContext, useContext, useEffect, useState } from 'react';
import type { PlayerState, Song } from '../types/index.ts';
import { audioService } from '../services/audioService';

interface AudioContextValue extends PlayerState {
  playSong: (song: Song, queue?: Song[], startIndex?: number) => Promise<void>;
  togglePlayPause: () => void;
  pause: () => void;
  resume: () => Promise<void>;
  seek: (seconds: number) => void;
  setVolume: (vol: number) => void;
  toggleMute: () => void;
  next: () => void;
  previous: () => void;
  toggleShuffle: () => void;
  cycleRepeat: () => void;
  addToQueue: (song: Song) => void;
  playNext: (song: Song) => void;
  removeFromQueue: (index: number) => void;
  reorderQueue: (fromIndex: number, toIndex: number) => void;
  clearQueue: () => void;
  setFullScreen: (isOpen: boolean) => void;
  setQueueOpen: (isOpen: boolean) => void;
  clearPlaybackError: () => void;
}

const AudioContext = createContext<AudioContextValue | null>(null);

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<PlayerState>(audioService.getState());

  useEffect(() => {
    const unsubscribe = audioService.subscribe((newState) => {
      setState(newState);
    });
    return unsubscribe;
  }, []);

  const value: AudioContextValue = {
    ...state,
    playSong: (song, queue, startIndex) => audioService.playSong(song, queue, startIndex),
    togglePlayPause: () => audioService.togglePlayPause(),
    pause: () => audioService.pause(),
    resume: () => audioService.resume(),
    seek: (seconds) => audioService.seek(seconds),
    setVolume: (vol) => audioService.setVolume(vol),
    toggleMute: () => audioService.toggleMute(),
    next: () => audioService.next(),
    previous: () => audioService.previous(),
    toggleShuffle: () => audioService.toggleShuffle(),
    cycleRepeat: () => audioService.cycleRepeat(),
    addToQueue: (song) => audioService.addToQueue(song),
    playNext: (song) => audioService.playNext(song),
    removeFromQueue: (index) => audioService.removeFromQueue(index),
    reorderQueue: (fromIndex, toIndex) => audioService.reorderQueue(fromIndex, toIndex),
    clearQueue: () => audioService.clearQueue(),
    setFullScreen: (isOpen) => audioService.setFullScreen(isOpen),
    setQueueOpen: (isOpen) => audioService.setQueueOpen(isOpen),
    clearPlaybackError: () => audioService.clearPlaybackError(),
  };

  return <AudioContext.Provider value={value}>{children}</AudioContext.Provider>;
};

export const useAudio = () => {
  const ctx = useContext(AudioContext);
  if (!ctx) throw new Error('useAudio must be used within an AudioProvider');
  return ctx;
};

