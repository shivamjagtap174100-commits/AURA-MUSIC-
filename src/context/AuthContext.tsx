import React, { createContext, useContext, useEffect, useState } from 'react';
import { AuthState, authService } from '../services/authService';
import { UserProfile, AudioQuality } from '../types';

interface AuthContextValue extends AuthState {
  signInWithEmail: (email: string, pass: string) => Promise<unknown>;
  signUpWithEmail: (email: string, pass: string, username: string, fullName: string) => Promise<unknown>;
  signInWithGoogle: () => Promise<unknown>;
  resetPassword: (email: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  updatePreferredQuality: (quality: AudioQuality) => void;
  openAuthModal: (mode?: 'signin' | 'signup') => void;
  closeAuthModal: () => void;
  isAuthModalOpen: boolean;
  authModalMode: 'signin' | 'signup';
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>(authService.getState());
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup'>('signin');

  useEffect(() => {
    const unsub = authService.subscribe(setState);
    return unsub;
  }, []);

  const openAuthModal = (mode: 'signin' | 'signup' = 'signin') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const value: AuthContextValue = {
    ...state,
    signInWithEmail: (e, p) => authService.signInWithEmail(e, p),
    signUpWithEmail: (e, p, u, f) => authService.signUpWithEmail(e, p, u, f),
    signInWithGoogle: () => authService.signInWithGoogle(),
    resetPassword: (e) => authService.resetPassword(e),
    signOut: () => authService.signOut(),
    updateProfile: (u) => authService.updateProfile(u),
    updatePreferredQuality: (q) => authService.updatePreferredQuality(q),
    openAuthModal,
    closeAuthModal,
    isAuthModalOpen,
    authModalMode,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};

