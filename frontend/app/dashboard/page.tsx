'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Building2,
  Video,
  Play,
  RotateCcw,
  Sparkles,
  Calendar,
  Globe,
  Plus,
  ArrowUpRight,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Clock,
  Download,
  X,
  Layers,
  Sparkle
} from 'lucide-react';
import { CONTINUOUS_MOTION_CHARACTERS } from '@/lib/services/avatar';

export default function DashboardPage() {
  const router = useRouter();
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState<any | null>(null);

  const fetchBusinesses = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/businesses');
      const data = await res.json();
      if (data.success) {
        setBusinesses(data.businesses || []);
      }
    } catch (err) {
      console.error('Failed to load businesses:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBusinesses();
  }, []);

  const totalVideos = businesses.reduce((acc, b) => acc + (b.videoProjects?.length || 0), 0);
  const completedVideos = businesses.reduce(
    (acc, b) => acc + (b.videoProjects?.filter((p: any) => p.status === 'completed').length || 0),
    0
  );

  return (
    <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-violet-100 text-violet-700 flex items-center justify-center">
              <LayoutDashboard className="h-4 w-4" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Video Projects & Commercial Archive
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage your businesses, view multi-version animated ad videos, and generate new commercial campaigns
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchBusinesses}
            disabled={isLoading}
            className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-all"
            title="Refresh Projects"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>

          <Link
            href="/create"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white gradient-button shadow-md shadow-violet-500/20 shrink-0"
          >
            <Plus className="h-4 w-4" />
            <span>New Video Ad</span>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Registered Businesses</p>
            <p className="text-2xl font-black text-slate-900 mt-1">{businesses.length}</p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center">
            <Building2 className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Video Versions</p>
            <p className="text-2xl font-black text-slate-900 mt-1">{totalVideos}</p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Layers className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Completed Ready Ads</p>
            <p className="text-2xl font-black text-emerald-600 mt-1">{completedVideos}</p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Loading state */}
      {isLoading ? (
        <div className="p-16 text-center bg-white rounded-3xl border border-slate-200/90 shadow-sm">
          <RefreshCw className="h-8 w-8 text-violet-600 animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-600 font-medium">Loading your video campaigns...</p>
        </div>
      ) : businesses.length === 0 ? (
        <div className="bg-white rounded-3xl p-8 sm:p-14 text-center max-w-lg mx-auto border border-slate-200/90 shadow-xl shadow-slate-900/5">
          <div className="h-16 w-16 rounded-2xl bg-violet-50 border border-violet-200 flex items-center justify-center mx-auto mb-4 text-violet-600">
            <Video className="h-8 w-8" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">No video projects yet</h3>
          <p className="text-xs sm:text-sm text-slate-500 mt-2 mb-6">
            Turn your business URL or manual offerings into continuous-motion animated character advertisements in seconds!
          </p>
          <Link
            href="/create"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white gradient-button shadow-md shadow-violet-500/20"
          >
            <Sparkles className="h-4 w-4" />
            <span>Create Your First Video Ad</span>
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {businesses.map((biz) => (
            <div key={biz.id} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5 mb-6">
                <div>
                  <div className="flex items-center gap-2.5">
                    <h2 className="text-xl font-extrabold text-slate-900">{biz.name}</h2>
                    <span className="text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full bg-violet-50 text-violet-700 border border-violet-200">
                      {biz.category}
                    </span>
                    {biz.sourceType === 'url' && biz.url && (
                      <a
                        href={biz.url.startsWith('http') ? biz.url : `https://${biz.url}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-slate-400 hover:text-violet-600 flex items-center gap-1"
                      >
                        <Globe className="h-3 w-3" />
                        <span className="truncate max-w-[150px]">{biz.url}</span>
                      </a>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl">
                    {biz.description}
                  </p>
                  {biz.location && (
                    <p className="text-[11px] text-slate-400 mt-1">📍 {biz.location}</p>
                  )}
                </div>

                <Link
                  href={`/create`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-50 hover:bg-violet-50 hover:text-violet-700 border border-slate-200 transition-all shrink-0 self-start sm:self-auto"
                >
                  <RotateCcw className="h-3.5 w-3.5 text-violet-600" />
                  <span>New Ad for {biz.name}</span>
                </Link>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Generated Video Versions ({biz.videoProjects?.length || 0})
                  </h4>
                </div>

                {(!biz.videoProjects || biz.videoProjects.length === 0) ? (
                  <p className="text-xs text-slate-400 italic py-2">No videos rendered for this business yet.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {biz.videoProjects.map((proj: any) => {
                      const char = CONTINUOUS_MOTION_CHARACTERS.find((c) => c.id === proj.characterId);
                      
                      const isCompleted = proj.status === 'completed';
                      const isFailed = proj.status === 'failed';
                      const isProcessing = !isCompleted && !isFailed;

                      return (
                        <div
                          key={proj.id}
                          className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4 flex flex-col justify-between hover:border-violet-300 hover:shadow-md transition-all"
                        >
                          <div>
                            <div className="flex items-center justify-between gap-2 mb-3">
                              <span className="text-xs font-bold text-violet-700 bg-violet-100/70 px-2.5 py-0.5 rounded-full">
                                Version {proj.version}
                              </span>

                              <span
                                className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                                  isCompleted
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                    : isFailed
                                    ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                    : 'bg-violet-50 text-violet-700 border border-violet-200 animate-pulse'
                                }`}
                              >
                                {isCompleted && <CheckCircle2 className="h-3 w-3" />}
                                {isFailed && <AlertCircle className="h-3 w-3" />}
                                {isProcessing && <Clock className="h-3 w-3 animate-spin" />}
                                <span>{proj.status.toUpperCase()}</span>
                              </span>
                            </div>

                            <div className="flex items-center gap-2 mb-3">
                              {char && (
                                <img
                                  src={char.avatarUrl}
                                  alt={char.name}
                                  className="h-6 w-6 rounded-full object-cover border border-slate-200"
                                />
                              )}
                              <span className="text-xs text-slate-800 font-semibold">
                                {char?.name.split(' ')[0] || 'Avatar'}
                              </span>
                              <span className="text-slate-300">•</span>
                              <span className="text-[11px] text-slate-500 uppercase font-semibold">
                                {proj.language}
                              </span>
                            </div>

                            <div className="bg-white p-3 rounded-xl border border-slate-200/80 mb-4 text-xs text-slate-700 italic leading-relaxed line-clamp-3">
                              "{proj.promptText}"
                            </div>
                          </div>

                          {isCompleted && proj.videoUrl && (
                            <button
                              onClick={() => setSelectedVideo(proj)}
                              className="w-full py-2.5 px-3 rounded-xl text-xs font-bold bg-white hover:bg-violet-600 hover:text-white text-slate-800 border border-slate-200 hover:border-violet-600 flex items-center justify-center gap-2 transition-all shadow-sm group"
                            >
                              <Play className="h-3.5 w-3.5 fill-violet-600 group-hover:fill-white text-violet-600 group-hover:text-white" />
                              <span>Watch Video (v{proj.version})</span>
                            </button>
                          )}

                          {isFailed && (
                            <div className="text-[11px] text-rose-600 bg-rose-50 p-2 rounded-lg border border-rose-100">
                              {proj.errorMessage || 'Rendering failed.'}
                            </div>
                          )}

                          {isProcessing && (
                            <div className="text-center py-2 text-xs text-violet-600 font-medium">
                              Rendering video in background...
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Video Modal Preview */}
      {selectedVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-3xl bg-white rounded-3xl p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Video Preview — Version {selectedVideo.version}
                </h3>
                <p className="text-xs text-slate-500">
                  Language: <span className="uppercase text-violet-700 font-bold">{selectedVideo.language}</span> • Continuous Motion Commercial
                </p>
              </div>
              <button
                onClick={() => setSelectedVideo(null)}
                className="p-1.5 rounded-xl bg-slate-100 text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition-all"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="aspect-video rounded-2xl overflow-hidden bg-black mb-4">
              <video src={selectedVideo.videoUrl} controls autoPlay className="w-full h-full object-contain" />
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs text-slate-700 italic leading-relaxed mb-4">
              "{selectedVideo.promptText}"
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500">
                100% Verbatim Spoken Delivery
              </span>
              <div className="flex items-center gap-2">
                <a
                  href={selectedVideo.videoUrl}
                  download={`adanimai_v${selectedVideo.version}.mp4`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 flex items-center gap-1.5 transition-colors"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Download MP4</span>
                </a>
                <button
                  onClick={() => setSelectedVideo(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white gradient-button"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
