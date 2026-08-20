'use client';

import React, { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Sparkles, Mail, Lock, ArrowRight, Video, CheckCircle2, PlayCircle, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter a valid email address.');
      return;
    }

    setIsLoading(true);
    setError(null);

    // Note: Credentials provider handles session creation for email
    // TODO: When a dedicated backend user registration endpoint with password hashing is added,
    // call POST /api/auth/signup here before calling signIn() in signup mode.
    try {
      const res = await signIn('credentials', {
        redirect: false,
        email,
        password: password || 'default-password',
      });

      if (res?.error) {
        setError(res.error);
      } else {
        router.push('/workspace');
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    setIsLoading(true);
    signIn('google', { callbackUrl: '/workspace' });
  };

  const handleQuickDemoAccess = async () => {
    setIsLoading(true);
    const res = await signIn('credentials', {
      redirect: false,
      email: 'creator@demo.adanim.ai',
      password: 'demo',
    });
    if (!res?.error) {
      router.push('/workspace');
      router.refresh();
    }
    setIsLoading(false);
  };

  return (
    <div className="flex-1 flex items-center justify-center p-3 sm:p-4 bg-canvas text-text-primary transition-colors duration-200 min-h-[calc(100vh-4rem)]">
      <div className="w-full max-w-sm my-auto">
        {/* Auth Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-surface rounded-2xl p-5 sm:p-6 shadow-elevated border border-border-subtle relative z-10"
        >
          {/* Header */}
          <div className="text-center mb-4">
            <div className="inline-flex h-9 w-9 rounded-xl bg-accent/10 border border-accent/20 text-accent items-center justify-center mb-2">
              <Sparkles className="h-4 w-4" />
            </div>
            <h1 className="text-lg sm:text-xl font-extrabold text-text-primary tracking-tight font-display">
              {authMode === 'login' ? (
                <>Welcome to <span className="text-accent">AdAnim AI</span></>
              ) : (
                <>Create your <span className="text-accent">Free Account</span></>
              )}
            </h1>
            <p className="text-xs text-text-secondary mt-0.5">
              {authMode === 'login'
                ? 'Sign in to generate commercial video ads'
                : 'Get 500 free tokens & create AI commercial ads'}
            </p>
          </div>

          {error && (
            <div className="mb-3 p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 text-xs flex items-center gap-1.5">
              <div className="h-1.5 w-1.5 rounded-full bg-rose-500 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Google Sign In Button */}
          <button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            type="button"
            className="w-full py-2 px-3 rounded-xl border border-border-subtle bg-surface hover:bg-surface-raised text-text-primary text-xs font-semibold flex items-center justify-center gap-2.5 transition-all shadow-subtle cursor-pointer"
          >
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24">
              <path
                fill="#EA4335"
                d="M12 5c1.58 0 2.99.55 4.1 1.62l3.07-3.07C17.26 1.76 14.81 1 12 1 7.42 1 3.53 3.63 1.66 7.43l3.69 2.87C6.23 7.44 8.87 5 12 5z"
              />
              <path
                fill="#4285F4"
                d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58l3.7 2.87c2.16-1.99 3.72-4.93 3.72-8.69z"
              />
              <path
                fill="#FBBC05"
                d="M5.35 14.7C5.12 13.98 5 13.01 5 12s.12-1.98.35-2.7L1.66 6.43C.6 8.1 0 9.98 0 12s.6 3.9 1.66 5.57l3.69-2.87z"
              />
              <path
                fill="#34A853"
                d="M12 23c3.24 0 5.95-1.08 7.93-2.91l-3.7-2.87c-1.08.72-2.45 1.16-4.23 1.16-3.13 0-5.77-2.44-6.65-5.3L1.66 16.95C3.53 20.75 7.42 23 12 23z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>

          <div className="flex items-center gap-2.5 my-3">
            <div className="flex-1 h-[1px] bg-border-subtle" />
            <span className="text-[10px] uppercase tracking-wider text-text-tertiary font-semibold">Or with Email</span>
            <div className="flex-1 h-[1px] bg-border-subtle" />
          </div>

          {/* Email / Password Form */}
          <form onSubmit={handleEmailAuth} className="space-y-2.5">
            <div>
              <label className="block text-[11px] font-semibold text-text-secondary mb-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-tertiary" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@business.com"
                  required
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-surface-raised border border-border-subtle text-text-primary text-xs placeholder-text-tertiary focus:outline-none focus:border-accent transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[11px] font-semibold text-text-secondary">Password</label>
                {authMode === 'login' && (
                  <span className="text-[10px] text-accent hover:underline cursor-pointer">Optional in demo</span>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-tertiary" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-9 py-2 rounded-xl bg-surface-raised border border-border-subtle text-text-primary text-xs placeholder-text-tertiary focus:outline-none focus:border-accent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-primary p-0.5 transition-colors cursor-pointer"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-3 rounded-xl text-white text-xs font-bold bg-accent hover:bg-accent-hover flex items-center justify-center gap-1.5 shadow-sm shadow-accent/20 transition-all cursor-pointer mt-1"
            >
              {isLoading ? (
                <div className="h-3.5 w-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>{authMode === 'login' ? 'Sign In & Start Creating' : 'Create Account & Start Free'}</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Mode Switch & Quick Demo */}
          <div className="mt-3.5 pt-3 border-t border-border-subtle space-y-2 text-center">
            <div>
              <button
                type="button"
                onClick={() => {
                  setAuthMode(authMode === 'login' ? 'signup' : 'login');
                  setError(null);
                }}
                className="text-xs text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
              >
                {authMode === 'login' ? (
                  <>Don't have an account? <span className="text-accent font-semibold hover:underline">Sign up</span></>
                ) : (
                  <>Already have an account? <span className="text-accent font-semibold hover:underline">Sign in</span></>
                )}
              </button>
            </div>

            <div>
              <button
                type="button"
                onClick={handleQuickDemoAccess}
                className="inline-flex items-center gap-1 text-[11px] text-accent hover:underline font-semibold transition-colors bg-accent/10 px-3 py-1 rounded-full border border-accent/20 cursor-pointer"
              >
                <PlayCircle className="h-3 w-3 text-accent" />
                <span>Instant 1-Click Demo Sign-in</span>
              </button>
            </div>
          </div>
        </motion.div>

        {/* Feature Trust Highlights */}
        <div className="mt-3 flex items-center justify-center gap-4 text-center text-text-secondary text-[11px]">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
            <span className="font-medium text-text-primary">Verbatim Scripting</span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-1.5">
            <Video className="h-3.5 w-3.5 text-accent" />
            <span className="font-medium text-text-primary">Continuous Motion</span>
          </div>
        </div>
      </div>
    </div>
  );
}
