'use client';

import React, { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Sparkles, Mail, Lock, ArrowRight, ShieldCheck, PlayCircle, Video, CheckCircle2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter a valid email address.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await signIn('credentials', {
        redirect: false,
        email,
        password: password || 'default-password',
      });

      if (res?.error) {
        setError(res.error);
      } else {
        router.push('/create');
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to sign in. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    setIsLoading(true);
    signIn('google', { callbackUrl: '/create' });
  };

  const handleQuickDemoAccess = async () => {
    setIsLoading(true);
    const res = await signIn('credentials', {
      redirect: false,
      email: 'creator@demo.adanim.ai',
      password: 'demo',
    });
    if (!res?.error) {
      router.push('/create');
      router.refresh();
    }
    setIsLoading(false);
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 relative">
      {/* Background Soft Blobs */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-violet-200/40 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="w-full max-w-md">
        {/* Auth Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-900/5 border border-slate-200/90 relative z-10">
          
          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex h-12 w-12 rounded-2xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-blue-600 items-center justify-center shadow-lg shadow-violet-500/25 mb-3 text-white">
              <Sparkles className="h-6 w-6 animate-pulse" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Welcome to <span className="gradient-text">AdAnim AI</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Sign in to generate continuous-motion animated commercial video ads
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-rose-500" />
              <span>{error}</span>
            </div>
          )}

          {/* Google Sign In Button */}
          <button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            type="button"
            className="w-full py-2.5 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold flex items-center justify-center gap-3 transition-all shadow-sm hover:border-slate-300"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24">
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

          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-[1px] bg-slate-200" />
            <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Or with Email</span>
            <div className="flex-1 h-[1px] bg-slate-200" />
          </div>

          {/* Email / Password Form */}
          <form onSubmit={handleEmailSignIn} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@business.com"
                  required
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:bg-white focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700">Password</label>
                <span className="text-[11px] text-violet-600 hover:underline cursor-pointer">Optional in demo</span>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:bg-white focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl text-white text-sm font-bold gradient-button flex items-center justify-center gap-2 shadow-lg shadow-violet-500/20 hover:shadow-violet-500/35 transition-all"
            >
              {isLoading ? (
                <div className="h-4 w-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In & Start Creating</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick 1-Click Demo Sign-in */}
          <div className="mt-5 pt-4 border-t border-slate-100 text-center">
            <button
              type="button"
              onClick={handleQuickDemoAccess}
              className="inline-flex items-center gap-1.5 text-xs text-violet-700 hover:text-violet-800 font-semibold transition-colors bg-violet-50 hover:bg-violet-100 px-3.5 py-1.5 rounded-full border border-violet-200"
            >
              <PlayCircle className="h-3.5 w-3.5 text-violet-600" />
              <span>Instant 1-Click Demo Sign-in</span>
            </button>
          </div>
        </div>

        {/* Feature Trust Highlights */}
        <div className="mt-6 grid grid-cols-2 gap-3 text-center text-slate-500 text-xs">
          <div className="p-3 rounded-2xl bg-white/70 border border-slate-200/80 shadow-sm flex items-center gap-2 justify-center">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span className="font-medium text-slate-700">Verbatim Scripting</span>
          </div>
          <div className="p-3 rounded-2xl bg-white/70 border border-slate-200/80 shadow-sm flex items-center gap-2 justify-center">
            <Video className="h-4 w-4 text-violet-600" />
            <span className="font-medium text-slate-700">Continuous Motion</span>
          </div>
        </div>
      </div>
    </div>
  );
}
