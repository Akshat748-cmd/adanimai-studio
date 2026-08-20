import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import SessionWrapper from '@/components/SessionWrapper';
import { ShieldCheck, Sparkles, Video, Globe2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'AdAnimAI — AI Animated Video Ad Studio for Businesses',
  description:
    'Turn any website URL or business description into high-converting animated video ads with continuous-motion 3D cartoon presenters and verbatim multi-language speech.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="bg-[#f8fafc] text-slate-900 min-h-screen flex flex-col antialiased selection:bg-violet-600 selection:text-white">
        <SessionWrapper>
          <Navbar />
          <main className="flex-1 flex flex-col relative">{children}</main>
          
          {/* Light SaaS Footer */}
          <footer className="border-t border-slate-200/80 bg-white/90 py-10 text-slate-600 text-xs mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="h-7 w-7 rounded-lg bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center text-white">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <span className="font-extrabold text-sm tracking-tight text-slate-900">
                    AdAnim<span className="gradient-text">AI</span>
                  </span>
                  <span className="text-[11px] text-slate-500">
                    — AI Animated Commercials Studio
                  </span>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-6 text-slate-500 text-xs font-medium">
                  <span className="inline-flex items-center gap-1.5 text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/60">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    SSL 256-bit Encrypted
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-violet-700 bg-violet-50 px-2.5 py-1 rounded-full border border-violet-200/60">
                    <Video className="h-3.5 w-3.5" />
                    Continuous-Motion Presenters
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200/60">
                    <Globe2 className="h-3.5 w-3.5" />
                    8+ Languages
                  </span>
                </div>
              </div>

              <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-500">
                <p>© 2026 AdAnimAI SaaS Platform. All rights reserved. Verbatim sales copywriting & continuous motion avatars.</p>
                <div className="flex items-center gap-4">
                  <a href="/#how-it-works" className="hover:text-slate-900 transition-colors">How It Works</a>
                  <span>•</span>
                  <a href="/#presenters" className="hover:text-slate-900 transition-colors">Presenters</a>
                  <span>•</span>
                  <a href="/create" className="hover:text-slate-900 transition-colors">Create Video Ad</a>
                </div>
              </div>
            </div>
          </footer>
        </SessionWrapper>
      </body>
    </html>
  );
}
