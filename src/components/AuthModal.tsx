import React, { useState } from 'react';
import { X, Mail, Lock, User, AlertCircle, CheckCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Logo } from './Logo';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    authModalMode,
    closeAuthModal,
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    resetPassword,
  } = useAuth();

  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot'>(authModalMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    setMode(authModalMode);
    setErrorMsg(null);
    setSuccessMsg(null);
  }, [authModalMode, isAuthModalOpen]);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      if (mode === 'signin') {
        await signInWithEmail(email, password);
        closeAuthModal();
      } else if (mode === 'signup') {
        if (!username) throw new Error('Please enter a username');
        await signUpWithEmail(email, password, username, fullName || username);
        closeAuthModal();
      } else if (mode === 'forgot') {
        await resetPassword(email);
        setSuccessMsg('Password reset instructions sent to your email.');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setErrorMsg(null);
    setLoading(true);
    try {
      await signInWithGoogle();
      closeAuthModal();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Google sign in failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150 select-none">
      <div className="relative w-full max-w-sm p-6 sm:p-7 rounded-2xl bg-[#171819] border border-[#292929] shadow-2xl">
        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-4 right-4 p-1.5 text-[#666666] hover:text-[#F3F0E9] rounded-md hover:bg-[#202123] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Branding Header */}
        <div className="flex flex-col items-center text-center mb-5">
          <Logo size="md" />
          <h2 className="text-lg font-bold text-[#F3F0E9] mt-3 font-['Manrope']">
            {mode === 'signin'
              ? 'Sign in to AURA'
              : mode === 'signup'
              ? 'Create your account'
              : 'Reset password'}
          </h2>
          <p className="text-xs text-[#929292] mt-1">
            {mode === 'signin'
              ? 'Access your library, playlists, and synced offline music.'
              : mode === 'signup'
              ? 'High-fidelity music streaming with offline listening.'
              : 'Enter your registered email to receive a reset link.'}
          </p>
        </div>

        {/* Feedback Messages */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-lg bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
        {successMsg && (
          <div className="mb-4 p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          {mode === 'signup' && (
            <>
              <div>
                <label className="text-[11px] font-medium text-[#929292] block mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 w-4 h-4 text-[#666666]" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Jordan Lee"
                    className="w-full pl-9 pr-3 py-2 bg-[#101112] border border-[#292929] rounded-lg text-xs text-[#F3F0E9] placeholder-[#555555] focus:outline-none focus:border-[#C5A66B] transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-medium text-[#929292] block mb-1">
                  Username
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-[#666666] text-xs">@</span>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="jordan_music"
                    className="w-full pl-8 pr-3 py-2 bg-[#101112] border border-[#292929] rounded-lg text-xs text-[#F3F0E9] placeholder-[#555555] focus:outline-none focus:border-[#C5A66B] transition-colors"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="text-[11px] font-medium text-[#929292] block mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 w-4 h-4 text-[#666666]" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-9 pr-3 py-2 bg-[#101112] border border-[#292929] rounded-lg text-xs text-[#F3F0E9] placeholder-[#555555] focus:outline-none focus:border-[#C5A66B] transition-colors"
              />
            </div>
          </div>

          {mode !== 'forgot' && (
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-[11px] font-medium text-[#929292]">
                  Password
                </label>
                {mode === 'signin' && (
                  <button
                    type="button"
                    onClick={() => setMode('forgot')}
                    className="text-[11px] text-[#929292] hover:text-[#C5A66B] transition-colors"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 w-4 h-4 text-[#666666]" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 bg-[#101112] border border-[#292929] rounded-lg text-xs text-[#F3F0E9] placeholder-[#555555] focus:outline-none focus:border-[#C5A66B] transition-colors"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 mt-2 rounded-lg bg-[#C5A66B] hover:bg-[#D8BF91] text-[#08090A] font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 shadow-md"
          >
            {loading ? (
              <span>Processing...</span>
            ) : (
              <>
                <span>
                  {mode === 'signin'
                    ? 'Sign In'
                    : mode === 'signup'
                    ? 'Create Account'
                    : 'Send Reset Link'}
                </span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        {/* Google OAuth Button */}
        <div className="mt-4 pt-4 border-t border-[#292929]">
          <button
            type="button"
            onClick={handleGoogle}
            disabled={loading}
            className="w-full py-2 px-3 rounded-lg bg-[#202123] hover:bg-[#28292c] border border-[#292929] text-[#F3F0E9] text-xs font-medium flex items-center justify-center gap-2.5 transition-colors"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>
        </div>

        {/* Toggle Mode */}
        <div className="mt-4 text-center text-xs text-[#666666]">
          {mode === 'signin' ? (
            <p>
              Don't have an account?{' '}
              <button
                onClick={() => setMode('signup')}
                className="text-[#C5A66B] hover:underline font-medium"
              >
                Sign up
              </button>
            </p>
          ) : mode === 'signup' ? (
            <p>
              Already have an account?{' '}
              <button
                onClick={() => setMode('signin')}
                className="text-[#C5A66B] hover:underline font-medium"
              >
                Sign in
              </button>
            </p>
          ) : (
            <button
              onClick={() => setMode('signin')}
              className="text-[#C5A66B] hover:underline font-medium"
            >
              Back to sign in
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
