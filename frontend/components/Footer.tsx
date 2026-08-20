'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShieldCheck, Video, Globe2, Coins, Sparkles } from 'lucide-react';

export default function Footer() {
  const pathname = usePathname();

  // No footer on full-height workspace studio screen!
  if (pathname === '/workspace') {
    return null;
  }

  return (
    <footer className="border-t border-border-subtle bg-footer-bg py-12 text-text-secondary text-xs mt-auto transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* 4 Feature Highlights Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pb-8 border-b border-border-subtle">
          <div className="flex items-start gap-3">
            <ShieldCheck className="h-5 w-5 text-accent shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-text-primary text-xs">100% Safe</p>
              <p className="text-[11px] text-text-tertiary mt-0.5">Enterprise Encrypted</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Video className="h-5 w-5 text-accent shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-text-primary text-xs">Continuous Motion</p>
              <p className="text-[11px] text-text-tertiary mt-0.5">3D Cartoon Presenters</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Globe2 className="h-5 w-5 text-accent shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-text-primary text-xs">32 Indian Languages</p>
              <p className="text-[11px] text-text-tertiary mt-0.5">Dual Neural Voices</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Coins className="h-5 w-5 text-accent shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-text-primary text-xs">500 Free Tokens</p>
              <p className="text-[11px] text-text-tertiary mt-0.5">Ready to Generate</p>
            </div>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-2 text-text-tertiary">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-lg bg-accent text-white flex items-center justify-center">
              <Sparkles className="h-3.5 w-3.5" />
            </div>
            <span className="font-bold text-xs text-text-primary">
              AdAnim<span className="text-accent">AI</span>
            </span>
            <span className="text-[11px] text-text-tertiary">
              © 2026 AdAnimAI Studio. All rights reserved.
            </span>
          </div>

          <div className="flex items-center gap-4 text-text-secondary text-xs">
            <Link href="/#how-it-works" className="hover:text-text-primary transition-colors">How It Works</Link>
            <span>•</span>
            <Link href="/#presenters" className="hover:text-text-primary transition-colors">Presenters</Link>
            <span>•</span>
            <Link href="/workspace" className="hover:text-text-primary transition-colors">Studio Workspace</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
