'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Sparkles,
  Play,
  ArrowRight,
  ShieldCheck,
  Zap,
  Globe2,
  Video,
  Wand2,
  Star,
  Check,
  Sparkle,
  X
} from 'lucide-react';
import { CONTINUOUS_MOTION_CHARACTERS } from '@adanimai/shared';

export default function HomePage() {
  const [activePreviewChar, setActivePreviewChar] = useState<any | null>(null);

  return (
    <div className="flex-1 flex flex-col items-center justify-center overflow-hidden bg-canvas text-text-primary transition-colors duration-200">
      {/* HERO SECTION - Sized to fit 100% zoom standard laptop viewports without scroll */}
      <section className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-8 sm:pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
          {/* Left Column */}
          <div className="lg:col-span-7 flex flex-col items-start text-left space-y-3.5 sm:space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-[11px] font-semibold shadow-xs">
              <Sparkles className="h-3 w-3" />
              <span>AI-Powered Animated Video Ad Studio</span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-text-primary tracking-tight leading-[1.18] max-w-xl font-display">
              Turn Any Business Into <span className="text-accent">Animated Commercials</span> Instantly.
            </h1>

            <p className="text-xs sm:text-sm text-text-secondary max-w-lg leading-relaxed">
              Input your website URL or business notes to generate high-converting commercial video ads featuring{' '}
              <strong className="text-text-primary font-semibold">continuous-motion animated presenters</strong> speaking your exact verbatim sales copy in 32 Indian languages.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto pt-1">
              <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                <Link
                  href="/workspace"
                  className="px-6 py-3 rounded-xl text-xs sm:text-sm font-bold text-white bg-accent hover:bg-accent-hover flex items-center justify-center gap-2 shadow-md shadow-accent/20 transition-all cursor-pointer"
                >
                  <Wand2 className="h-4 w-4" />
                  <span>Open Studio Workspace →</span>
                </Link>
              </motion.div>
            </div>

            <div className="pt-3 border-t border-border-subtle flex flex-wrap items-center gap-4 sm:gap-6 text-[11px] text-text-secondary">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-1.5">
                  <div className="h-5 w-5 rounded-full bg-accent text-white flex items-center justify-center text-[9px] font-bold border border-surface">M</div>
                  <div className="h-5 w-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[9px] font-bold border border-surface">A</div>
                  <div className="h-5 w-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[9px] font-bold border border-surface">P</div>
                  <div className="h-5 w-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[9px] font-bold border border-surface">R</div>
                </div>
                <span className="font-semibold text-text-primary">2,500+ Ads Generated</span>
              </div>

              <div className="flex items-center gap-1">
                <div className="flex text-amber-400">
                  <Star className="h-3 w-3 fill-amber-400" />
                  <Star className="h-3 w-3 fill-amber-400" />
                  <Star className="h-3 w-3 fill-amber-400" />
                  <Star className="h-3 w-3 fill-amber-400" />
                  <Star className="h-3 w-3 fill-amber-400" />
                </div>
                <span className="font-semibold text-text-primary">4.9/5 Rating</span>
              </div>

              <div className="flex items-center gap-1 text-emerald-600">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span className="font-medium">SSL Encrypted</span>
              </div>
            </div>
          </div>

          {/* Right Column Video Demo Card */}
          <div className="lg:col-span-5 relative flex justify-center">
            <div className="w-full max-w-sm sm:max-w-md bg-surface rounded-2xl p-3.5 sm:p-4 border border-border-subtle shadow-elevated relative">
              <div className="absolute -top-3 right-3 sm:right-4 bg-surface px-3 py-1 rounded-full border border-border-subtle shadow-md text-[10px] font-semibold text-accent flex items-center gap-1 z-20">
                <Check className="h-3 w-3 text-emerald-500 stroke-[3]" />
                <span>AI Script — Generated</span>
              </div>

              <div className="relative aspect-[16/11] rounded-xl overflow-hidden bg-slate-900 border border-border-subtle group">
                <img
                  src={CONTINUOUS_MOTION_CHARACTERS[0].avatarUrl}
                  alt={CONTINUOUS_MOTION_CHARACTERS[0].name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />

                <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white text-[10px] font-bold flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                  <span>Continuous Motion Presenter</span>
                </div>

                <button
                  type="button"
                  onClick={() => setActivePreviewChar(CONTINUOUS_MOTION_CHARACTERS[0])}
                  className="absolute inset-0 m-auto h-12 w-12 rounded-full bg-white/95 text-accent flex items-center justify-center shadow-lg hover:scale-110 transition-transform group-hover:bg-white cursor-pointer"
                  title="Play Sample Video"
                >
                  <Play className="h-5 w-5 fill-accent ml-0.5" />
                </button>

                <div className="absolute bottom-2.5 left-3 right-3 text-white">
                  <p className="text-[11px] font-semibold truncate mb-1">
                    "Hamare products aur services ki quality sabse behtareen aur trusted hai..."
                  </p>
                  <div className="w-full h-1 bg-white/30 rounded-full overflow-hidden">
                    <div className="w-2/3 h-full bg-accent rounded-full animate-pulse" />
                  </div>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2">
                <div className="p-2 rounded-xl bg-surface-raised border border-border-subtle flex items-center gap-1.5 text-[10px] font-medium text-text-secondary">
                  <div className="h-4 w-4 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                    <Check className="h-2.5 w-2.5 stroke-[3]" />
                  </div>
                  <span className="truncate">Presenter — Animated</span>
                </div>

                <div className="p-2 rounded-xl bg-surface-raised border border-border-subtle flex items-center gap-1.5 text-[10px] font-medium text-text-secondary">
                  <div className="h-4 w-4 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                    <Check className="h-2.5 w-2.5 stroke-[3]" />
                  </div>
                  <span className="truncate">Voiceover — Synced</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURE HIGHLIGHTS */}
      <section id="how-it-works" className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-surface rounded-2xl p-5 sm:p-8 border border-border-subtle shadow-sm">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <h2 className="text-[10px] font-bold uppercase tracking-widest text-accent mb-1.5">
              Engineered for High-Conversion Commercials
            </h2>
            <p className="text-xl sm:text-2xl font-extrabold text-text-primary font-display">
              Four Core Guarantees in Every Video
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-surface-raised border border-border-subtle flex flex-col justify-between">
              <div>
                <div className="h-9 w-9 rounded-lg bg-accent/10 border border-accent/20 text-accent flex items-center justify-center mb-3">
                  <Zap className="h-4 w-4" />
                </div>
                <h3 className="text-sm font-bold text-text-primary">Continuous Motion</h3>
                <p className="text-xs text-text-secondary mt-1.5 leading-relaxed">
                  Dynamic hand gestures, natural body swaying, and authentic eye contact (not static talking heads).
                </p>
              </div>
              <div className="mt-3 pt-2.5 border-t border-border-subtle text-[10px] font-semibold text-accent flex items-center gap-1">
                <span>Active 3D Gestures</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-surface-raised border border-border-subtle flex flex-col justify-between">
              <div>
                <div className="h-9 w-9 rounded-lg bg-accent/10 border border-accent/20 text-accent flex items-center justify-center mb-3">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <h3 className="text-sm font-bold text-text-primary">100% Verbatim Script</h3>
                <p className="text-xs text-text-secondary mt-1.5 leading-relaxed">
                  Whatever exact words you review and edit in the prompt textarea are spoken word-for-word without omission.
                </p>
              </div>
              <div className="mt-3 pt-2.5 border-t border-border-subtle text-[10px] font-semibold text-accent flex items-center gap-1">
                <span>Exact Spoken Delivery</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-surface-raised border border-border-subtle flex flex-col justify-between">
              <div>
                <div className="h-9 w-9 rounded-lg bg-accent/10 border border-accent/20 text-accent flex items-center justify-center mb-3">
                  <Globe2 className="h-4 w-4" />
                </div>
                <h3 className="text-sm font-bold text-text-primary">Multi-Language Sync</h3>
                <p className="text-xs text-text-secondary mt-1.5 leading-relaxed">
                  32 regional Indian languages with dual Neural voices (Professional Anchor & Local Casual).
                </p>
              </div>
              <div className="mt-3 pt-2.5 border-t border-border-subtle text-[10px] font-semibold text-accent flex items-center gap-1">
                <span>32 Indian Languages</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-surface-raised border border-border-subtle flex flex-col justify-between">
              <div>
                <div className="h-9 w-9 rounded-lg bg-accent/10 border border-accent/20 text-accent flex items-center justify-center mb-3">
                  <Sparkle className="h-4 w-4" />
                </div>
                <h3 className="text-sm font-bold text-text-primary">Commercial Ready</h3>
                <p className="text-xs text-text-secondary mt-1.5 leading-relaxed">
                  Persuasive sales copywriting highlighting offerings, value proposition, and customer benefits.
                </p>
              </div>
              <div className="mt-3 pt-2.5 border-t border-border-subtle text-[10px] font-semibold text-accent flex items-center gap-1">
                <span>Sales-Optimized Copy</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PRESENTER GALLERY */}
      <section id="presenters" className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-[11px] font-semibold mb-2">
            <Video className="h-3 w-3" />
            <span>Curated Character Catalog</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight font-display">
            Meet the Continuous-Motion Presenters
          </h2>
          <p className="text-xs sm:text-sm text-text-secondary mt-1.5">
            Stylized 3D commercial avatars equipped with active hand gestures, lifelike presentation posture, and natural expression.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {CONTINUOUS_MOTION_CHARACTERS.map((char) => (
            <div
              key={char.id}
              className="bg-surface rounded-2xl p-3.5 border border-border-subtle shadow-subtle flex flex-col justify-between"
            >
              <div>
                <div className="relative aspect-square rounded-xl overflow-hidden mb-3 bg-slate-900 border border-border-subtle group">
                  <img
                    src={char.avatarUrl}
                    alt={char.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-surface/90 backdrop-blur-md text-[9px] font-bold text-emerald-600 border border-border-subtle shadow-sm">
                    Active Motion
                  </div>

                  <button
                    type="button"
                    onClick={() => setActivePreviewChar(char)}
                    className="absolute inset-0 m-auto h-10 w-10 rounded-full bg-white/95 text-accent flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg cursor-pointer"
                    title="Watch Sample Motion"
                  >
                    <Play className="h-4 w-4 fill-accent ml-0.5" />
                  </button>
                </div>

                <h3 className="text-sm font-bold text-text-primary">{char.name}</h3>
                <p className="text-xs font-semibold text-accent">{char.style}</p>
                <p className="text-xs text-text-tertiary mt-1 line-clamp-2 leading-relaxed">
                  {char.description}
                </p>
              </div>

              <Link
                href={`/workspace?character=${char.id}`}
                className="mt-4 w-full py-2 px-3 rounded-xl text-xs font-bold text-text-primary bg-surface-raised hover:bg-accent hover:text-white flex items-center justify-center gap-1.5 transition-all shadow-subtle"
              >
                <span>Use {char.name.split(' ')[0]}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Video Preview Modal */}
      {activePreviewChar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-xl bg-surface rounded-2xl p-4 sm:p-5 shadow-2xl border border-border-subtle">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-base font-bold text-text-primary font-display">
                  {activePreviewChar.name} — Continuous Motion Preview
                </h3>
                <p className="text-xs text-text-secondary">
                  {activePreviewChar.style} • Full body gestures & commercial posture
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActivePreviewChar(null)}
                className="p-1 rounded-lg bg-surface-raised text-text-secondary hover:text-text-primary border border-border-subtle"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="aspect-video rounded-xl overflow-hidden bg-black mb-3 border border-border-subtle">
              <video
                src={activePreviewChar.previewVideoUrl}
                controls
                autoPlay
                className="w-full h-full object-contain"
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-xs text-text-tertiary">
                100% Lipsynced with your verbatim copy
              </span>
              <Link
                href={`/workspace?character=${activePreviewChar.id}`}
                onClick={() => setActivePreviewChar(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-accent hover:bg-accent-hover flex items-center gap-1 shadow-sm"
              >
                <span>Select this Presenter</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
