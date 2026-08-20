'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Play,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Zap,
  Globe2,
  Video,
  Layers,
  Wand2,
  Star,
  Check,
  Volume2,
  Clock,
  Sparkle,
  X
} from 'lucide-react';
import { CONTINUOUS_MOTION_CHARACTERS } from '@/lib/services/avatar';

export default function HomePage() {
  const [activePreviewChar, setActivePreviewChar] = useState<any | null>(null);

  return (
    <div className="flex-1 flex flex-col items-center justify-center overflow-hidden">
      {/* Background Soft Blobs */}
      <div className="absolute top-12 left-1/2 -translate-x-1/2 w-[850px] h-[450px] bg-gradient-to-tr from-violet-200/50 via-indigo-100/40 to-blue-200/50 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* HERO SECTION */}
      <section className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-16 sm:pt-16 sm:pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column */}
          <div className="lg:col-span-7 flex flex-col items-start text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-violet-50 border border-violet-200/80 text-violet-700 text-xs font-semibold mb-6 shadow-sm">
              <Sparkles className="h-3.5 w-3.5 text-violet-600 animate-pulse" />
              <span>AI-Powered Animated Video Ad Studio</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.12] max-w-2xl">
              Turn Any Business Into{' '}
              <span className="gradient-text">Animated Video Ads</span>{' '}
              Instantly.
            </h1>

            <p className="mt-5 text-base sm:text-lg text-slate-600 max-w-xl leading-relaxed">
              Input your website URL or business notes to generate high-converting commercial video ads featuring{' '}
              <strong className="text-slate-900 font-semibold">continuous-motion animated presenters</strong> speaking your exact verbatim sales copy in 8+ languages.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 w-full sm:w-auto">
              <Link
                href="/create"
                className="px-7 py-4 rounded-2xl text-base font-bold text-white gradient-button flex items-center justify-center gap-2.5 shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 hover:-translate-y-0.5 transition-all"
              >
                <Wand2 className="h-5 w-5" />
                <span>Generate Your Video Ad →</span>
              </Link>

              <Link
                href="/dashboard"
                className="px-6 py-4 rounded-2xl text-base font-semibold text-slate-700 secondary-button flex items-center justify-center gap-2"
              >
                <Layers className="h-4 w-4 text-violet-600" />
                <span>View Video Projects</span>
              </Link>
            </div>

            <div className="mt-10 pt-6 border-t border-slate-200/80 flex flex-wrap items-center gap-6 sm:gap-8 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  <div className="h-6 w-6 rounded-full bg-violet-600 text-white flex items-center justify-center text-[10px] font-bold border border-white">M</div>
                  <div className="h-6 w-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold border border-white">A</div>
                  <div className="h-6 w-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold border border-white">P</div>
                  <div className="h-6 w-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold border border-white">R</div>
                </div>
                <span className="font-semibold text-slate-800">2,500+ Ads Generated</span>
              </div>

              <div className="flex items-center gap-1.5">
                <div className="flex text-amber-400">
                  <Star className="h-3.5 w-3.5 fill-amber-400" />
                  <Star className="h-3.5 w-3.5 fill-amber-400" />
                  <Star className="h-3.5 w-3.5 fill-amber-400" />
                  <Star className="h-3.5 w-3.5 fill-amber-400" />
                  <Star className="h-3.5 w-3.5 fill-amber-400" />
                </div>
                <span className="font-semibold text-slate-800">4.9/5 User Rating</span>
              </div>

              <div className="flex items-center gap-1.5 text-emerald-700">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                <span className="font-medium">SSL Secured</span>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-5 relative flex justify-center">
            <div className="absolute inset-0 bg-gradient-to-tr from-violet-400/20 to-blue-400/20 rounded-3xl blur-2xl -z-10" />

            <div className="w-full max-w-md bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/90 shadow-2xl shadow-slate-900/10 relative">
              <div className="absolute -top-4 -right-3 sm:-right-4 bg-white px-3.5 py-1.5 rounded-full border border-violet-200/80 shadow-lg shadow-violet-500/10 text-xs font-semibold text-violet-700 flex items-center gap-1.5 z-20 animate-float">
                <Check className="h-3.5 w-3.5 text-emerald-500 stroke-[3]" />
                <span>AI Script — Generated</span>
              </div>

              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-slate-900 border border-slate-200 group">
                <img
                  src={CONTINUOUS_MOTION_CHARACTERS[0].avatarUrl}
                  alt={CONTINUOUS_MOTION_CHARACTERS[0].name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/20" />

                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white text-[11px] font-bold flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>Continuous Motion Presenter</span>
                </div>

                <button
                  type="button"
                  onClick={() => setActivePreviewChar(CONTINUOUS_MOTION_CHARACTERS[0])}
                  className="absolute inset-0 m-auto h-16 w-16 rounded-full bg-white/95 text-violet-600 flex items-center justify-center shadow-xl shadow-black/30 hover:scale-110 transition-transform group-hover:bg-white cursor-pointer"
                  title="Play Sample Video"
                >
                  <Play className="h-7 w-7 fill-violet-600 ml-1" />
                </button>

                <div className="absolute bottom-3 left-4 right-4 text-white">
                  <p className="text-xs font-semibold truncate mb-1">
                    "Hamare school ka education aur campus sabse behtareen hai..."
                  </p>
                  <div className="w-full h-1.5 bg-white/30 rounded-full overflow-hidden">
                    <div className="w-2/3 h-full bg-gradient-to-r from-violet-400 to-blue-400 rounded-full animate-pulse" />
                  </div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center gap-2 text-[11px] font-medium text-slate-700">
                  <div className="h-5 w-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                    <Check className="h-3 w-3 stroke-[3]" />
                  </div>
                  <span className="truncate">Presenter — Animated</span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center gap-2 text-[11px] font-medium text-slate-700">
                  <div className="h-5 w-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                    <Check className="h-3 w-3 stroke-[3]" />
                  </div>
                  <span className="truncate">Voiceover — Synced</span>
                </div>
              </div>

              <div className="absolute -bottom-4 -left-3 sm:-left-4 bg-white px-3.5 py-1.5 rounded-full border border-slate-200 shadow-lg text-xs font-semibold text-slate-800 flex items-center gap-1.5 z-20 animate-float-delayed">
                <div className="h-2 w-2 rounded-full bg-emerald-500" />
                <span>Video Ad — Commercial Ready</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* FEATURE HIGHLIGHTS */}
      <section id="how-it-works" className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/90 shadow-xl shadow-slate-900/5">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-xs font-bold uppercase tracking-widest text-violet-600 mb-2">
              Engineered for High-Conversion Commercials
            </h2>
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Four Core Guarantees in Every Video
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-5 rounded-2xl bg-slate-50/70 border border-slate-100 flex flex-col justify-between">
              <div>
                <div className="h-11 w-11 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 text-white flex items-center justify-center mb-4 shadow-md shadow-violet-500/20">
                  <Zap className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Continuous Motion</h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  Dynamic hand gestures, natural body swaying, and authentic eye contact (not static talking heads).
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-200/60 text-[11px] font-semibold text-violet-700 flex items-center gap-1">
                <span>Active 3D Gestures</span>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50/70 border border-slate-100 flex flex-col justify-between">
              <div>
                <div className="h-11 w-11 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-600 text-white flex items-center justify-center mb-4 shadow-md shadow-indigo-500/20">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900">100% Verbatim Script</h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  Whatever exact words you review and edit in the prompt textarea are spoken word-for-word without omission.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-200/60 text-[11px] font-semibold text-indigo-700 flex items-center gap-1">
                <span>Exact Spoken Delivery</span>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50/70 border border-slate-100 flex flex-col justify-between">
              <div>
                <div className="h-11 w-11 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-600 text-white flex items-center justify-center mb-4 shadow-md shadow-blue-500/20">
                  <Globe2 className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Multi-Language Sync</h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  Hindi, English, Punjabi, Marathi, Tamil, Telugu, Bengali, Gujarati with authentic native pronunciation and lipsync.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-200/60 text-[11px] font-semibold text-blue-700 flex items-center gap-1">
                <span>8+ Indian & Global Languages</span>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50/70 border border-slate-100 flex flex-col justify-between">
              <div>
                <div className="h-11 w-11 rounded-xl bg-gradient-to-tr from-purple-600 to-pink-600 text-white flex items-center justify-center mb-4 shadow-md shadow-purple-500/20">
                  <Sparkle className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Commercial Ready</h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  Persuasive sales copywriting highlighting offerings, value proposition, and customer benefits.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-200/60 text-[11px] font-semibold text-purple-700 flex items-center gap-1">
                <span>Sales-Optimized Copy</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PRESENTER GALLERY */}
      <section id="presenters" className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold mb-3">
            <Video className="h-3.5 w-3.5" />
            <span>Curated Character Catalog</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Meet the Continuous-Motion Presenters
          </h2>
          <p className="text-sm text-slate-600 mt-2">
            Stylized 3D commercial avatars equipped with active hand gestures, lifelike presentation posture, and natural expression.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {CONTINUOUS_MOTION_CHARACTERS.map((char) => (
            <div
              key={char.id}
              className="bg-white rounded-3xl p-4 border border-slate-200/90 shadow-lg shadow-slate-900/5 card-hover flex flex-col justify-between"
            >
              <div>
                <div className="relative aspect-square rounded-2xl overflow-hidden mb-4 bg-slate-100 border border-slate-100 group">
                  <img
                    src={char.avatarUrl}
                    alt={char.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-white/90 backdrop-blur-md text-[10px] font-bold text-emerald-700 border border-emerald-200 shadow-sm">
                    Active Motion
                  </div>

                  <button
                    type="button"
                    onClick={() => setActivePreviewChar(char)}
                    className="absolute inset-0 m-auto h-12 w-12 rounded-full bg-white/95 text-violet-600 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg shadow-black/20"
                    title="Watch Sample Motion"
                  >
                    <Play className="h-5 w-5 fill-violet-600 ml-0.5" />
                  </button>
                </div>

                <h3 className="text-base font-bold text-slate-900">{char.name}</h3>
                <p className="text-xs font-semibold text-violet-600">{char.style}</p>
                <p className="text-xs text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">
                  {char.description}
                </p>
              </div>

              <Link
                href={`/create?character=${char.id}`}
                className="mt-5 w-full py-2.5 px-4 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-violet-600 hover:text-white flex items-center justify-center gap-1.5 transition-all shadow-sm"
              >
                <span>Use {char.name.split(' ')[0]}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* BOTTOM CTA BANNER */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="relative rounded-3xl p-8 sm:p-14 bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 text-white text-center shadow-2xl shadow-violet-500/25 overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full blur-xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
              Ready to Turn Your Business Into High-Converting Video Ads?
            </h2>
            <p className="mt-3 text-sm sm:text-base text-violet-100 leading-relaxed">
              Start generating continuous-motion animated commercials with authentic verbatim speech in seconds.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/create"
                className="w-full sm:w-auto px-8 py-4 rounded-2xl text-base font-bold text-violet-900 bg-white hover:bg-violet-50 shadow-xl shadow-black/15 transition-all flex items-center justify-center gap-2"
              >
                <Wand2 className="h-5 w-5 text-violet-600" />
                <span>Create Your Free Ad Now →</span>
              </Link>

              <Link
                href="/dashboard"
                className="w-full sm:w-auto px-6 py-4 rounded-2xl text-base font-semibold text-white bg-white/15 hover:bg-white/25 border border-white/30 backdrop-blur-md flex items-center justify-center gap-2 transition-all"
              >
                <span>Explore Dashboard</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Video Preview Modal */}
      {activePreviewChar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl p-5 sm:p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  {activePreviewChar.name} — Continuous Motion Preview
                </h3>
                <p className="text-xs text-slate-500">
                  {activePreviewChar.style} • Full body gestures & commercial presentation posture
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActivePreviewChar(null)}
                className="p-1.5 rounded-xl bg-slate-100 text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition-all"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="aspect-video rounded-2xl overflow-hidden bg-black mb-4">
              <video
                src={activePreviewChar.previewVideoUrl}
                controls
                autoPlay
                className="w-full h-full object-contain"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-slate-500">
                100% Lipsynced with your verbatim prompt copy
              </span>
              <Link
                href={`/create?character=${activePreviewChar.id}`}
                onClick={() => setActivePreviewChar(null)}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-white gradient-button flex items-center gap-1.5"
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
