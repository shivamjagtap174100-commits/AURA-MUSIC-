import type { UserProfile, AudioQuality } from '../types/index.ts';
import { supabase, isSupabaseConfigured } from './supabase.ts';

const STORAGE_KEY_AUTH_USER = 'aura_auth_user';

const safeStorage = {
  getItem: (key: string): string | null => {
    try {
      return typeof localStorage !== 'undefined' ? localStorage.getItem(key) : null;
    } catch {
      return null;
    }
  },
  setItem: (key: string, value: string): void => {
    try {
      if (typeof localStorage !== 'undefined') localStorage.setItem(key, value);
    } catch {}
  },
  removeItem: (key: string): void => {
    try {
      if (typeof localStorage !== 'undefined') localStorage.removeItem(key);
    } catch {}
  },
};

export interface AuthState {
  user: UserProfile | null;
  isGuest: boolean;
  isLoading: boolean;
}

type AuthListener = (state: AuthState) => void;

class AuthService {
  private user: UserProfile | null = null;
  private isGuest = true;
  private isLoading = true;
  private listeners: Set<AuthListener> = new Set();

  constructor() {
    this.init();
  }

  private async init() {
    // 1. Try checking cached user
    try {
      const cached = safeStorage.getItem(STORAGE_KEY_AUTH_USER);
      if (cached) {
        this.user = JSON.parse(cached);
        this.isGuest = false;
      }
    } catch (e) {
      console.warn('Error reading cached auth:', e);
    }

    // 2. If Supabase configured, check active session
    if (isSupabaseConfigured && supabase) {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          await this.loadUserProfile(session.user.id, session.user.email || '');
        } else if (!this.user) {
          this.setGuestUser();
        }

        supabase.auth.onAuthStateChange(async (event, session) => {
          if (session?.user) {
            await this.loadUserProfile(session.user.id, session.user.email || '');
          } else if (event === 'SIGNED_OUT') {
            this.setGuestUser();
          }
        });
      } catch (err) {
        console.warn('Supabase session load error:', err);
        if (!this.user) this.setGuestUser();
      }
    } else if (!this.user) {
      this.setGuestUser();
    }

    this.isLoading = false;
    this.notify();
  }

  private setGuestUser() {
    this.user = {
      id: 'guest-user',
      email: 'guest@auramusic.io',
      username: 'Guest Listener',
      fullName: 'Aura Guest',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
      role: 'admin', // Allow testing admin dashboard in guest mode!
      preferredQuality: 'High (320 kbps)',
      createdAt: new Date().toISOString(),
    };
    this.isGuest = true;
    safeStorage.removeItem(STORAGE_KEY_AUTH_USER);
  }

  private async loadUserProfile(userId: string, email: string) {
    if (!supabase) return;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (data && !error) {
        this.user = {
          id: data.id,
          email: data.email || email,
          username: data.username || email.split('@')[0],
          fullName: data.full_name || '',
          avatarUrl: data.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
          role: data.role || 'user',
          preferredQuality: data.preferred_quality || 'High (320 kbps)',
          createdAt: data.created_at,
        };
        this.isGuest = false;
        safeStorage.setItem(STORAGE_KEY_AUTH_USER, JSON.stringify(this.user));
        this.notify();
      } else {
        // Fallback profile if profile row hasn't generated yet
        this.user = {
          id: userId,
          email: email,
          username: email.split('@')[0],
          fullName: email.split('@')[0],
          avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
          role: 'user',
          preferredQuality: 'High (320 kbps)',
          createdAt: new Date().toISOString(),
        };
        this.isGuest = false;
        safeStorage.setItem(STORAGE_KEY_AUTH_USER, JSON.stringify(this.user));
        this.notify();
      }
    } catch (err) {
      console.warn('Failed to load profile:', err);
    }
  }

  private notify() {
    this.listeners.forEach((listener) =>
      listener({
        user: this.user,
        isGuest: this.isGuest,
        isLoading: this.isLoading,
      })
    );
  }

  public subscribe(listener: AuthListener): () => void {
    this.listeners.add(listener);
    listener({
      user: this.user,
      isGuest: this.isGuest,
      isLoading: this.isLoading,
    });
    return () => this.listeners.delete(listener);
  }

  public getState(): AuthState {
    return {
      user: this.user,
      isGuest: this.isGuest,
      isLoading: this.isLoading,
    };
  }

  public async signUpWithEmail(email: string, password: string, username: string, fullName: string) {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
            full_name: fullName,
          },
        },
      });
      if (error) throw error;
      return data;
    } else {
      // Local simulated signup
      this.user = {
        id: `user-${Date.now()}`,
        email,
        username,
        fullName,
        avatarUrl: `https://api.dicebear.com/7.x/identicon/svg?seed=${username}`,
        role: 'user',
        preferredQuality: 'High (320 kbps)',
        createdAt: new Date().toISOString(),
      };
      this.isGuest = false;
      safeStorage.setItem(STORAGE_KEY_AUTH_USER, JSON.stringify(this.user));
      this.notify();
      return { user: this.user };
    }
  }

  public async signInWithEmail(email: string, password: string) {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      return data;
    } else {
      // Local simulated signin
      this.user = {
        id: `user-${Date.now()}`,
        email,
        username: email.split('@')[0],
        fullName: email.split('@')[0],
        avatarUrl: `https://api.dicebear.com/7.x/identicon/svg?seed=${email}`,
        role: email.includes('admin') ? 'admin' : 'user',
        preferredQuality: 'High (320 kbps)',
        createdAt: new Date().toISOString(),
      };
      this.isGuest = false;
      safeStorage.setItem(STORAGE_KEY_AUTH_USER, JSON.stringify(this.user));
      this.notify();
      return { user: this.user };
    }
  }

  public async signInWithGoogle() {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      });
      if (error) throw error;
      return data;
    } else {
      // Simulated Google login for offline testing
      this.user = {
        id: `google-user-${Date.now()}`,
        email: 'alex.rivera@auramusic.io',
        username: 'alexrivera',
        fullName: 'Alex Rivera',
        avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
        role: 'admin',
        preferredQuality: 'Ultra HD / FLAC',
        createdAt: new Date().toISOString(),
      };
      this.isGuest = false;
      safeStorage.setItem(STORAGE_KEY_AUTH_USER, JSON.stringify(this.user));
      this.notify();
      return { user: this.user };
    }
  }

  public async resetPassword(email: string) {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
    }
    return true;
  }

  public async signOut() {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    this.setGuestUser();
    this.notify();
  }

  public async updateProfile(updates: Partial<UserProfile>) {
    if (!this.user) return;
    this.user = { ...this.user, ...updates };

    if (!this.isGuest) {
      safeStorage.setItem(STORAGE_KEY_AUTH_USER, JSON.stringify(this.user));
    }

    if (isSupabaseConfigured && supabase && !this.isGuest) {
      await supabase
        .from('profiles')
        .update({
          username: this.user.username,
          full_name: this.user.fullName,
          avatar_url: this.user.avatarUrl,
          preferred_quality: this.user.preferredQuality,
          updated_at: new Date().toISOString(),
        })
        .eq('id', this.user.id);
    }

    this.notify();
  }

  public updatePreferredQuality(quality: AudioQuality) {
    this.updateProfile({ preferredQuality: quality });
  }
}

export const authService = new AuthService();

