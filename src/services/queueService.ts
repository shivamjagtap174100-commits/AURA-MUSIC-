/**
 * AURA MUSIC — Queue Management Service
 * 
 * Handles queue ordering, shuffling, repeating, and queue traversal.
 * Guarantees queue state remains synchronized across all views.
 */

import type { Song, RepeatMode } from '../types/index.ts';

type QueueListener = (queue: Song[], currentIndex: number) => void;

class QueueService {
  private queue: Song[] = [];
  private originalQueue: Song[] = [];
  private currentIndex: number = -1;
  private shuffle: boolean = false;
  private repeat: RepeatMode = 'off';
  private listeners: Set<QueueListener> = new Set();

  public subscribe(listener: QueueListener): () => void {
    this.listeners.add(listener);
    listener([...this.queue], this.currentIndex);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((l) => l([...this.queue], this.currentIndex));
  }

  public getQueue(): Song[] {
    return [...this.queue];
  }

  public getCurrentIndex(): number {
    return this.currentIndex;
  }

  public getCurrentTrack(): Song | null {
    if (this.currentIndex >= 0 && this.currentIndex < this.queue.length) {
      return this.queue[this.currentIndex];
    }
    return null;
  }

  public getShuffle(): boolean {
    return this.shuffle;
  }

  public getRepeat(): RepeatMode {
    return this.repeat;
  }

  /**
   * Set new queue with designated starting track
   */
  public setQueue(newQueue: Song[], startTrack?: Song | string, startIndex: number = 0) {
    if (!newQueue || newQueue.length === 0) {
      this.clear();
      return;
    }

    this.originalQueue = [...newQueue];

    let targetIdx = startIndex;
    if (startTrack) {
      const targetId = typeof startTrack === 'string' ? startTrack : startTrack.id;
      const found = newQueue.findIndex((s) => s.id === targetId);
      if (found !== -1) targetIdx = found;
    }

    if (this.shuffle) {
      const current = newQueue[targetIdx] || newQueue[0];
      const others = newQueue.filter((s) => s.id !== current.id).sort(() => Math.random() - 0.5);
      this.queue = [current, ...others];
      this.currentIndex = 0;
    } else {
      this.queue = [...newQueue];
      this.currentIndex = Math.max(0, Math.min(targetIdx, this.queue.length - 1));
    }

    this.notify();
  }

  public addToQueue(track: Song) {
    if (this.queue.length === 0) {
      this.setQueue([track]);
      return;
    }
    this.queue.push(track);
    this.originalQueue.push(track);
    this.notify();
  }

  public playNext(track: Song) {
    if (this.queue.length === 0) {
      this.setQueue([track]);
      return;
    }
    const insertAt = this.currentIndex + 1;
    this.queue.splice(insertAt, 0, track);
    this.notify();
  }

  public removeFromQueue(index: number) {
    if (index < 0 || index >= this.queue.length) return;
    this.queue.splice(index, 1);
    if (this.currentIndex >= index && this.currentIndex > 0) {
      this.currentIndex--;
    }
    this.notify();
  }

  public reorderQueue(fromIndex: number, toIndex: number) {
    if (fromIndex < 0 || fromIndex >= this.queue.length || toIndex < 0 || toIndex >= this.queue.length) return;
    const [moved] = this.queue.splice(fromIndex, 1);
    this.queue.splice(toIndex, 0, moved);
    if (this.currentIndex === fromIndex) {
      this.currentIndex = toIndex;
    } else if (fromIndex < this.currentIndex && toIndex >= this.currentIndex) {
      this.currentIndex--;
    } else if (fromIndex > this.currentIndex && toIndex <= this.currentIndex) {
      this.currentIndex++;
    }
    this.notify();
  }

  public clear() {
    this.queue = [];
    this.originalQueue = [];
    this.currentIndex = -1;
    this.notify();
  }

  public getNext(): Song | null {
    if (this.queue.length === 0) return null;

    if (this.repeat === 'one') {
      return this.queue[this.currentIndex];
    }

    if (this.currentIndex < this.queue.length - 1) {
      this.currentIndex++;
      this.notify();
      return this.queue[this.currentIndex];
    }

    if (this.repeat === 'all') {
      this.currentIndex = 0;
      this.notify();
      return this.queue[0];
    }

    return null;
  }

  public getPrevious(): Song | null {
    if (this.queue.length === 0) return null;

    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.notify();
      return this.queue[this.currentIndex];
    }

    if (this.repeat === 'all') {
      this.currentIndex = this.queue.length - 1;
      this.notify();
      return this.queue[this.currentIndex];
    }

    return this.queue[0];
  }

  public toggleShuffle(): boolean {
    this.shuffle = !this.shuffle;
    const current = this.getCurrentTrack();

    if (this.shuffle) {
      if (current) {
        const others = this.queue.filter((s) => s.id !== current.id).sort(() => Math.random() - 0.5);
        this.queue = [current, ...others];
        this.currentIndex = 0;
      } else {
        this.queue = [...this.queue].sort(() => Math.random() - 0.5);
      }
    } else {
      this.queue = [...this.originalQueue];
      if (current) {
        const found = this.queue.findIndex((s) => s.id === current.id);
        this.currentIndex = found !== -1 ? found : 0;
      }
    }

    this.notify();
    return this.shuffle;
  }

  public cycleRepeat(): RepeatMode {
    const modes: RepeatMode[] = ['off', 'all', 'one'];
    const nextIdx = (modes.indexOf(this.repeat) + 1) % modes.length;
    this.repeat = modes[nextIdx];
    this.notify();
    return this.repeat;
  }
}

export const queueService = new QueueService();

