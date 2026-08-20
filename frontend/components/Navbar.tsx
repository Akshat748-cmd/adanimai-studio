'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import {
  Sparkles,
  LayoutDashboard,
  LogIn,
  LogOut,
  Wand2,
  Menu,
  X,
  Zap,
  Users,
  HelpCircle,
  ChevronRight
} from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Create Ad', href: '/create', icon: Wand2 },
    { name: 'My Projects', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Presenters', href: '/#presenters', icon: Users },
    { name: 'How It Works', href: '/#how-it-works', icon: HelpCircle },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/85 backdrop-blur-xl transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-18 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-blue-600 flex items-center justify-center shadow-md shadow-violet-500/20 group-hover:scale-105 transition-transform">
            <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-white animate-pulse" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-lg sm:text-xl tracking-tight text-slate-900">
                AdAnim<span className="gradient-text">AI</span>
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-violet-50 text-violet-700 border border-violet-200">
                PRO
              </span>
            </div>
            <p className="text-[10px] text-slate-500 hidden sm:block leading-none">
              AI Animated Video Ads
            </p>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-violet-50 text-violet-700 font-semibold border border-violet-200 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`}
              >
                {Icon && <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-violet-600' : 'text-slate-400'}`} />}
                <span>{link.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right Action Items */}
        <div className="hidden sm:flex items-center gap-3">
          {/* Free Credits Badge */}
          <div className="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100/80 border border-slate-200 text-slate-600 text-xs font-medium">
            <Zap className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
            <span>50 Free Credits</span>
          </div>

          <div className="h-4 w-[1px] bg-slate-200 hidden lg:block" />

          {/* User Auth Section */}
          {session ? (
            <div className="flex items-center gap-2.5">
              <div className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-slate-100/80 border border-slate-200">
                <div className="h-6 w-6 rounded-full bg-violet-600 text-white flex items-center justify-center text-xs font-bold">
                  {session.user?.email?.[0]?.toUpperCase() || 'U'}
                </div>
                <span className="text-xs font-medium text-slate-700 max-w-[120px] truncate">
                  {session.user?.email?.split('@')[0]}
                </span>
              </div>
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-all"
                title="Sign Out"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden lg:inline">Logout</span>
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white gradient-button flex items-center gap-1.5 shadow-md shadow-violet-500/20"
            >
              <LogIn className="h-3.5 w-3.5" />
              <span>Sign In</span>
            </Link>
          )}
        </div>

        {/* Mobile Hamburger Toggle */}
        <div className="flex items-center gap-2 sm:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-t border-slate-200/80 bg-white/95 backdrop-blur-xl px-4 py-4 space-y-2 shadow-xl animate-in slide-in-from-top-2">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;
            return (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-violet-50 text-violet-700 font-semibold border border-violet-200'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  {Icon && <Icon className={`h-4 w-4 ${isActive ? 'text-violet-600' : 'text-slate-400'}`} />}
                  <span>{link.name}</span>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-400" />
              </Link>
            );
          })}

          <div className="pt-2 border-t border-slate-200 flex flex-col gap-2">
            {session ? (
              <div className="flex items-center justify-between px-2 pt-1">
                <span className="text-xs text-slate-500 truncate">{session.user?.email}</span>
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="text-xs font-semibold text-rose-600 hover:underline"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-2.5 rounded-xl text-center text-sm font-semibold text-white gradient-button flex items-center justify-center gap-2"
              >
                <LogIn className="h-4 w-4" />
                <span>Sign In to Account</span>
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
