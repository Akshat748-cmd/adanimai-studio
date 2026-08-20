'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Globe,
  Sparkles,
  RefreshCw,
  Play,
  RotateCcw,
  Download,
  Share2,
  AlertTriangle,
  Check,
  Clock,
  Video,
  Plus,
  Coins,
  Search,
  Bot,
  PanelLeftClose,
  PanelLeft,
  X,
  Edit3,
  SendHorizontal,
  ShieldCheck,
  Globe2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  CONTINUOUS_MOTION_CHARACTERS,
  SUPPORTED_LANGUAGES,
  VIDEO_LENGTH_COSTS,
  BusinessProfile,
  CharacterOption,
  VideoJobStatus,
  VideoLength,
  VoiceStyle,
} from '@adanimai/shared';
import { isValidUrl, formatUrl } from '@/lib/utils';

type WorkspaceState = 'idle' | 'analyzing' | 'analyzed' | 'generating' | 'done' | 'error';

function WorkspaceContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();

  // Sidebar & History State
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [historyBusinesses, setHistoryBusinesses] = useState<any[]>([]);
  const [historySearchQuery, setHistorySearchQuery] = useState('');
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // User Credits State
  const [credits, setCredits] = useState<number>(500);
  const [isLoadingCredits, setIsLoadingCredits] = useState(true);

  // Workspace Main State Machine
  const [workspaceState, setWorkspaceState] = useState<WorkspaceState>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Business Input (Mode A: URL, Mode B: Manual)
  const [inputMode, setInputMode] = useState<'url' | 'manual'>('url');
  const [urlInput, setUrlInput] = useState('');
  const [manualForm, setManualForm] = useState({
    name: '',
    category: 'Retail & Shopping',
    customCategory: '',
    productsOffering: '',
    location: '',
    usp: '',
  });

  // Business Analysis & Script Customization State
  const [businessProfile, setBusinessProfile] = useState<BusinessProfile>({
    name: '',
    category: '',
    description: '',
    products: [],
    tone: 'Energetic',
    location: '',
    sourceType: 'url',
  });
  const [promptScriptText, setPromptScriptText] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('hi');
  const [selectedVoiceStyle, setSelectedVoiceStyle] = useState<VoiceStyle>('professional');
  const [selectedCharacterId, setSelectedCharacterId] = useState<string>('char_cartoon_maya');
  const [selectedVideoLength, setSelectedVideoLength] = useState<VideoLength>(30);

  // Video Generation & Result State
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [activeBusinessId, setActiveBusinessId] = useState<string | null>(null);
  const [generationJobStatus, setGenerationJobStatus] = useState<VideoJobStatus | string>('queued');
  const [renderedVideoUrl, setRenderedVideoUrl] = useState<string | null>(null);
  const [currentVersion, setCurrentVersion] = useState<number>(1);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // Loading States
  const [isScraping, setIsScraping] = useState(false);
  const [isGeneratingScript, setIsGeneratingScript] = useState(false);
  const [isSubmittingJob, setIsSubmittingJob] = useState(false);

  // Chat Feed Scroll Ref
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [workspaceState, isScraping, isGeneratingScript, generationJobStatus, renderedVideoUrl]);

  // Fetch Credits from Backend
  const fetchCredits = async () => {
    try {
      const userEmail = session?.user?.email || 'creator@adanimai.com';
      const res = await fetch(`/api/user/credits?userEmail=${encodeURIComponent(userEmail)}`);
      const data = await res.json();
      if (data.success && typeof data.credits === 'number') {
        setCredits(data.credits);
      }
    } catch (err) {
      console.error('Failed to load user credits:', err);
    } finally {
      setIsLoadingCredits(false);
    }
  };

  // Fetch Past Businesses/Projects History
  const fetchHistory = async () => {
    setIsLoadingHistory(true);
    try {
      const res = await fetch('/api/businesses');
      const data = await res.json();
      if (data.success) {
        setHistoryBusinesses(data.businesses || []);
      }
    } catch (err) {
      console.error('Failed to load history:', err);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchCredits();
    fetchHistory();
  }, [session]);

  // Read URL query parameter for pre-selected character
  useEffect(() => {
    const charParam = searchParams.get('character');
    if (charParam && CONTINUOUS_MOTION_CHARACTERS.some((c) => c.id === charParam)) {
      setSelectedCharacterId(charParam);
    }
  }, [searchParams]);

  // Handle URL or Manual Analysis Submit
  const handleAnalyzeBusiness = async () => {
    setErrorMessage(null);

    if (inputMode === 'url') {
      if (!urlInput.trim()) {
        setErrorMessage('Please enter a website URL.');
        return;
      }
      if (!isValidUrl(urlInput)) {
        setErrorMessage('Please enter a valid website URL (e.g. yourbusiness.com or https://mybrand.in).');
        return;
      }

      const formattedUrl = formatUrl(urlInput);
      setWorkspaceState('analyzing');
      setIsScraping(true);

      try {
        const response = await fetch('/api/scrape', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: formattedUrl }),
        });

        const data = await response.json();
        const bizData = data.business || data.data;

        if (data.success && bizData) {
          const profile: BusinessProfile = {
            ...bizData,
            sourceType: 'url',
            url: formattedUrl,
          };
          setBusinessProfile(profile);
          setWorkspaceState('analyzed');
          generateSalesScript(profile, selectedLanguage);
        } else {
          setErrorMessage(data.errorMessage || 'Could not analyze website. Please enter details manually.');
          setWorkspaceState('idle');
          setInputMode('manual');
        }
      } catch (err: any) {
        console.error('Scrape error:', err);
        setErrorMessage('Network error during analysis. You can enter your business details manually.');
        setWorkspaceState('idle');
        setInputMode('manual');
      } finally {
        setIsScraping(false);
      }
    } else {
      if (!manualForm.name.trim()) {
        setErrorMessage('Please provide your business or brand name.');
        return;
      }

      setWorkspaceState('analyzing');
      setIsScraping(true);

      const resolvedCategory =
        manualForm.category === 'Other' && manualForm.customCategory.trim()
          ? manualForm.customCategory.trim()
          : manualForm.category;

      const profile: BusinessProfile = {
        name: manualForm.name.trim(),
        category: resolvedCategory,
        description: manualForm.productsOffering.trim() || `${manualForm.name} provides quality offerings.`,
        products: manualForm.productsOffering
          ? manualForm.productsOffering.split(',').map((p) => p.trim()).filter(Boolean)
          : [],
        tone: 'Energetic',
        location: manualForm.location.trim() || undefined,
        sourceType: 'manual',
      };

      setBusinessProfile(profile);
      setIsScraping(false);
      setWorkspaceState('analyzed');
      generateSalesScript(profile, selectedLanguage);
    }
  };

  // Generate Category-Tailored Persuasive Sales Script
  const generateSalesScript = async (profile: BusinessProfile, langCode: string) => {
    setIsGeneratingScript(true);
    try {
      const response = await fetch('/api/script/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          business: profile,
          languageCode: langCode,
        }),
      });

      const data = await response.json();
      if (data.success && data.promptText) {
        setPromptScriptText(data.promptText);
      }
    } catch (err) {
      console.error('Failed to generate script:', err);
    } finally {
      setIsGeneratingScript(false);
    }
  };

  // Trigger Video Generation with Token Check
  const handleGenerateVideo = async () => {
    if (!promptScriptText.trim()) {
      setErrorMessage('Ad script text cannot be empty.');
      return;
    }

    const cost = VIDEO_LENGTH_COSTS[selectedVideoLength] || 100;
    if (credits < cost) {
      setErrorMessage(`Insufficient credits! This ${selectedVideoLength}s video requires ${cost} credits, but you have ${credits}.`);
      return;
    }

    setErrorMessage(null);
    setIsSubmittingJob(true);
    setWorkspaceState('generating');
    setGenerationJobStatus('queued');
    setRenderedVideoUrl(null);

    setCredits((prev) => Math.max(0, prev - cost));

    try {
      const userEmail = session?.user?.email || 'creator@adanimai.com';
      const response = await fetch('/api/video/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': userEmail,
        },
        body: JSON.stringify({
          businessId: activeBusinessId || businessProfile.id,
          businessData: businessProfile,
          promptText: promptScriptText.trim(),
          language: selectedLanguage,
          characterId: selectedCharacterId,
          voiceStyle: selectedVoiceStyle,
          videoLength: selectedVideoLength,
        }),
      });

      const data = await response.json();

      if (data.success && data.projectId) {
        setActiveProjectId(data.projectId);
        setActiveBusinessId(data.businessId);
        setCurrentVersion(data.version || 1);
        if (typeof data.remainingCredits === 'number') {
          setCredits(data.remainingCredits);
        }
        pollVideoStatus(data.projectId);
      } else {
        fetchCredits();
        setErrorMessage(data.errorMessage || 'Failed to initiate video generation.');
        setWorkspaceState('analyzed');
      }
    } catch (err: any) {
      console.error('Video generation submit error:', err);
      fetchCredits();
      setErrorMessage('Network error while starting generation. Please try again.');
      setWorkspaceState('analyzed');
    } finally {
      setIsSubmittingJob(false);
    }
  };

  // Poll video status
  const pollVideoStatus = (projectId: string) => {
    const pollInterval = setInterval(async () => {
      try {
        const res = await fetch(`/api/video/status/${projectId}`);
        const data = await res.json();

        if (data.success && data.project) {
          const status = data.project.status;
          setGenerationJobStatus(status);

          if (status === 'completed' && data.project.videoUrl) {
            clearInterval(pollInterval);
            setRenderedVideoUrl(data.project.videoUrl);
            setWorkspaceState('done');
            fetchHistory();
            confetti({
              particleCount: 70,
              spread: 60,
              origin: { y: 0.6 },
            });
          } else if (status === 'failed') {
            clearInterval(pollInterval);
            setErrorMessage(data.project.errorMessage || 'Video generation failed.');
            setWorkspaceState('error');
          }
        }
      } catch (err) {
        console.error('Polling error:', err);
      }
    }, 2500);
  };

  // Load a past business / video from sidebar history
  const handleLoadPastBusiness = (biz: any) => {
    setActiveBusinessId(biz.id);
    setBusinessProfile({
      id: biz.id,
      name: biz.name,
      category: biz.category,
      description: biz.description,
      products: typeof biz.products === 'string' ? JSON.parse(biz.products || '[]') : biz.products,
      tone: biz.tone || 'Energetic',
      location: biz.location || '',
      sourceType: biz.sourceType || 'manual',
      url: biz.url,
    });

    const latestVideo = biz.videoProjects && biz.videoProjects[0];
    if (latestVideo) {
      setPromptScriptText(latestVideo.promptText);
      setSelectedLanguage(latestVideo.language || 'hi');
      setSelectedCharacterId(latestVideo.characterId || 'char_cartoon_maya');
      setSelectedVoiceStyle((latestVideo.voiceStyle as VoiceStyle) || 'professional');
      setSelectedVideoLength((latestVideo.videoLength as VideoLength) || 30);
      setCurrentVersion(latestVideo.version || 1);

      if (latestVideo.status === 'completed' && latestVideo.videoUrl) {
        setRenderedVideoUrl(latestVideo.videoUrl);
        setWorkspaceState('done');
      } else {
        setWorkspaceState('analyzed');
      }
    } else {
      setWorkspaceState('analyzed');
      generateSalesScript(biz, selectedLanguage);
    }
  };

  // Reset to IDLE for New Commercial
  const handleNewCommercial = () => {
    setWorkspaceState('idle');
    setUrlInput('');
    setErrorMessage(null);
    setActiveProjectId(null);
    setActiveBusinessId(null);
    setRenderedVideoUrl(null);
    setManualForm({
      name: '',
      category: 'Retail & Shopping',
      customCategory: '',
      productsOffering: '',
      location: '',
      usp: '',
    });
  };

  const filteredHistory = historyBusinesses.filter((b) =>
    b.name.toLowerCase().includes(historySearchQuery.toLowerCase()) ||
    b.category.toLowerCase().includes(historySearchQuery.toLowerCase())
  );

  const selectedChar = CONTINUOUS_MOTION_CHARACTERS.find((c) => c.id === selectedCharacterId) || CONTINUOUS_MOTION_CHARACTERS[0];
  const selectedLangObj = SUPPORTED_LANGUAGES.find((l) => l.code === selectedLanguage) || SUPPORTED_LANGUAGES[0];

  return (
    <div className="flex h-[calc(100vh-4rem)] w-full overflow-hidden bg-canvas text-text-primary transition-colors duration-200">
      {/* 1. Left Collapsible Sidebar */}
      <aside
        className={`${
          isSidebarOpen ? 'w-56 sm:w-60' : 'w-0'
        } transition-all duration-300 ease-in-out border-r border-border-subtle bg-surface flex flex-col justify-between overflow-hidden shrink-0 z-20`}
      >
        <div className="flex flex-col h-full overflow-hidden">
          {/* Sidebar Top */}
          <div className="p-3 border-b border-border-subtle space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-text-primary uppercase tracking-wider">Campaigns</span>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="p-1 text-text-tertiary hover:text-text-primary rounded-lg transition-colors cursor-pointer"
                title="Collapse sidebar"
              >
                <PanelLeftClose className="h-3.5 w-3.5" />
              </button>
            </div>

            <button
              onClick={handleNewCommercial}
              className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl font-semibold text-xs text-white bg-accent hover:bg-accent-hover transition-colors cursor-pointer shadow-sm"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>New Commercial</span>
            </button>

            <div className="relative">
              <Search className="absolute left-2.5 top-2 h-3 w-3 text-text-tertiary" />
              <input
                type="text"
                placeholder="Search campaigns..."
                value={historySearchQuery}
                onChange={(e) => setHistorySearchQuery(e.target.value)}
                className="w-full pl-8 pr-2.5 py-1.5 text-xs rounded-xl bg-surface-raised border border-border-subtle text-text-primary placeholder-text-tertiary focus:outline-none focus:border-accent transition-colors"
              />
            </div>
          </div>

          {/* Sidebar Middle */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {isLoadingHistory ? (
              <div className="py-6 text-center text-xs text-text-tertiary">Loading...</div>
            ) : filteredHistory.length === 0 ? (
              <div className="py-8 px-3 text-center space-y-1.5">
                <div className="h-8 w-8 rounded-xl bg-surface-raised text-text-tertiary flex items-center justify-center mx-auto">
                  <Video className="h-3.5 w-3.5" />
                </div>
                <p className="text-xs font-semibold text-text-primary">No campaigns yet</p>
                <p className="text-[10px] text-text-tertiary leading-relaxed">
                  Enter a URL to create an ad.
                </p>
              </div>
            ) : (
              filteredHistory.map((biz) => {
                const isActive = activeBusinessId === biz.id;
                const videoCount = biz.videoProjects?.length || 0;
                return (
                  <button
                    key={biz.id}
                    onClick={() => handleLoadPastBusiness(biz)}
                    className={`w-full text-left p-2 rounded-xl transition-all ${
                      isActive
                        ? 'bg-accent/10 text-accent font-semibold'
                        : 'text-text-secondary hover:text-text-primary hover:bg-surface-raised'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs truncate max-w-[150px]">{biz.name}</span>
                      <span className="text-[10px] text-text-tertiary">
                        {videoCount} v
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Sidebar Bottom */}
          <div className="p-3 border-t border-border-subtle bg-surface flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-accent/10 flex items-center justify-center text-accent">
                <Coins className="h-3.5 w-3.5" />
              </div>
              <div>
                <p className="text-[9px] uppercase font-bold text-text-tertiary tracking-wider">Balance</p>
                <p className="text-xs font-bold text-text-primary flex items-center gap-0.5">
                  <span>{isLoadingCredits ? '...' : credits}</span>
                  <span className="text-[9px] text-text-tertiary font-normal">tokens</span>
                </p>
              </div>
            </div>

            <button
              onClick={fetchCredits}
              className="text-[11px] text-accent hover:underline font-medium cursor-pointer"
            >
              Sync
            </button>
          </div>
        </div>
      </aside>

      {/* 2. Main Studio Canvas */}
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-canvas relative">
        {!isSidebarOpen && (
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="absolute top-3 left-3 z-30 p-1.5 rounded-lg bg-surface border border-border-subtle shadow-sm text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
            title="Open sidebar"
          >
            <PanelLeft className="h-3.5 w-3.5" />
          </button>
        )}

        <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-2xl w-full mx-auto">
          <AnimatePresence mode="wait">
            {/* IDLE STATE: Compact Centered Prompt Card */}
            {workspaceState === 'idle' && (
              <motion.div
                key="idle-view"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-6 pt-2 sm:pt-6"
              >
                {/* Hero Titles */}
                <div className="text-center space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-accent">
                    AI Commercial Studio
                  </p>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight font-display">
                    Tell me about your business.
                  </h2>
                  <p className="text-xs sm:text-sm text-text-secondary max-w-md mx-auto leading-relaxed">
                    Paste your website URL or enter your services. We will create a high-converting animated commercial ad in 30 seconds.
                  </p>
                </div>

                {/* Primary Business Input Card */}
                <div className="rounded-2xl border border-border-subtle bg-surface p-5 sm:p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4 pb-2.5 border-b border-border-subtle">
                    <span className="text-[11px] font-bold text-text-primary uppercase tracking-wider">
                      Business Input
                    </span>

                    {/* Mode Toggle */}
                    <div className="flex bg-surface-raised p-0.5 rounded-lg text-xs font-medium">
                      <button
                        type="button"
                        onClick={() => {
                          setInputMode('url');
                          setErrorMessage(null);
                        }}
                        className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer text-xs ${
                          inputMode === 'url' ? 'bg-surface text-text-primary font-semibold shadow-xs' : 'text-text-secondary hover:text-text-primary'
                        }`}
                      >
                        Website URL
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setInputMode('manual');
                          setErrorMessage(null);
                        }}
                        className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer text-xs ${
                          inputMode === 'manual' ? 'bg-surface text-text-primary font-semibold shadow-xs' : 'text-text-secondary hover:text-text-primary'
                        }`}
                      >
                        Manual Details
                      </button>
                    </div>
                  </div>

                  {inputMode === 'url' ? (
                    <div className="space-y-3">
                      <div className="relative flex items-center">
                        <Globe className="absolute left-3.5 h-4 w-4 text-text-tertiary" />
                        <input
                          type="url"
                          placeholder="e.g. yourbusiness.com or https://mybrand.in"
                          value={urlInput}
                          onChange={(e) => {
                            setUrlInput(e.target.value);
                            setErrorMessage(null);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !isScraping) {
                              handleAnalyzeBusiness();
                            }
                          }}
                          disabled={isScraping}
                          className="w-full pl-10 pr-24 py-2.5 rounded-xl bg-surface-raised border border-border-subtle text-xs text-text-primary placeholder-text-tertiary focus:outline-none focus:border-accent transition-colors"
                        />
                        <button
                          onClick={handleAnalyzeBusiness}
                          disabled={isScraping || !urlInput.trim()}
                          className="absolute right-1.5 px-3.5 py-1.5 rounded-lg bg-accent hover:bg-accent-hover disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-1 transition-all shadow-xs cursor-pointer"
                        >
                          {isScraping ? (
                            <>
                              <RefreshCw className="h-3 w-3 animate-spin" />
                              <span>Analysing...</span>
                            </>
                          ) : (
                            <>
                              <span>Analyse</span>
                              <SendHorizontal className="h-3 w-3" />
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <div>
                          <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block mb-1">
                            Business Name *
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Fresh Bites Café or Apex Fitness"
                            value={manualForm.name}
                            onChange={(e) => setManualForm({ ...manualForm, name: e.target.value })}
                            className="w-full px-3 py-2 rounded-xl bg-surface-raised border border-border-subtle text-xs text-text-primary placeholder-text-tertiary focus:outline-none focus:border-accent"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block mb-1">
                            Category
                          </label>
                          <select
                            value={manualForm.category}
                            onChange={(e) => setManualForm({ ...manualForm, category: e.target.value })}
                            className="w-full px-3 py-2 rounded-xl bg-surface-raised border border-border-subtle text-xs text-text-primary focus:outline-none focus:border-accent"
                          >
                            <option value="Retail & Shopping">Retail & Shopping</option>
                            <option value="Food & Beverage">Food & Beverage</option>
                            <option value="Healthcare & Clinic">Healthcare & Clinic</option>
                            <option value="Education & Coaching">Education & Coaching</option>
                            <option value="Real Estate & Housing">Real Estate & Housing</option>
                            <option value="Salon & Beauty">Salon & Beauty Care</option>
                            <option value="Automobile & Repairs">Automobile & Repairs</option>
                            <option value="Tech & Services">Tech & Professional Services</option>
                            <option value="Other">Other Category</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block mb-1">
                          Offerings / Services (comma-separated)
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Organic Smoothies, Cold Brew, Home Delivery"
                          value={manualForm.productsOffering}
                          onChange={(e) => setManualForm({ ...manualForm, productsOffering: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl bg-surface-raised border border-border-subtle text-xs text-text-primary placeholder-text-tertiary focus:outline-none focus:border-accent"
                        />
                      </div>

                      <div className="flex justify-end pt-1">
                        <button
                          onClick={handleAnalyzeBusiness}
                          disabled={isScraping || !manualForm.name.trim()}
                          className="px-4 py-2 rounded-xl bg-accent hover:bg-accent-hover disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                        >
                          {isScraping ? <RefreshCw className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                          <span>Generate Ad Profile</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {errorMessage && (
                    <div className="mt-3 p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 text-xs flex items-center gap-2">
                      <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                      <span>{errorMessage}</span>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* ANALYZED / GENERATING / DONE FEED VIEW */}
            {(workspaceState === 'analyzed' || workspaceState === 'generating' || workspaceState === 'done') && (
              <motion.div
                key="workspace-flow"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="space-y-8"
              >
                {/* Step 1 Review Card */}
                <div className="rounded-2xl border border-border-subtle bg-surface p-5 sm:p-6 shadow-sm space-y-3">
                  <div className="flex items-center justify-between border-b border-border-subtle pb-2.5">
                    <span className="text-[11px] font-bold text-text-primary uppercase tracking-wider">
                      Business Profile Found
                    </span>
                    <span className="text-xs font-semibold text-accent">
                      {businessProfile.category}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-text-primary font-display">{businessProfile.name}</h3>
                    <p className="text-xs text-text-secondary mt-0.5 leading-relaxed">{businessProfile.description}</p>
                  </div>

                  {businessProfile.products && businessProfile.products.length > 0 && (
                    <div className="pt-1">
                      <div className="flex flex-wrap gap-1.5">
                        {businessProfile.products.map((p, i) => (
                          <span
                            key={i}
                            className="text-xs font-medium px-2 py-0.5 rounded-lg bg-surface-raised text-text-secondary"
                          >
                            • {p}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Step 2 Script & Customizer Card */}
                <div className="rounded-2xl border border-border-subtle bg-surface p-5 sm:p-6 shadow-sm space-y-5">
                  <div className="flex items-center justify-between border-b border-border-subtle pb-2.5">
                    <span className="text-[11px] font-bold text-text-primary uppercase tracking-wider">
                      Commercial Script & Voice Setup
                    </span>
                    <button
                      onClick={() => generateSalesScript(businessProfile, selectedLanguage)}
                      disabled={isGeneratingScript || workspaceState === 'generating'}
                      className="text-xs text-accent hover:underline font-semibold flex items-center gap-1 cursor-pointer disabled:opacity-50"
                    >
                      <RefreshCw className={`h-3 w-3 ${isGeneratingScript ? 'animate-spin' : ''}`} />
                      <span>Regenerate Copy</span>
                    </button>
                  </div>

                  {/* Verbatim Script Textarea */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block">
                      Spoken Verbatim Script:
                    </label>
                    <textarea
                      rows={3}
                      value={promptScriptText}
                      onChange={(e) => setPromptScriptText(e.target.value)}
                      disabled={workspaceState === 'generating'}
                      placeholder="AI generated spoken sales script will appear here..."
                      className="w-full p-3 rounded-xl bg-surface-raised border border-border-subtle text-xs text-text-primary leading-relaxed focus:outline-none focus:border-accent transition-colors"
                    />
                  </div>

                  {/* Language (32 Indian Languages) & Voice Style Toggle */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Language Selector */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block">
                        Language (32 Languages)
                      </label>
                      <select
                        value={selectedLanguage}
                        onChange={(e) => {
                          setSelectedLanguage(e.target.value);
                          generateSalesScript(businessProfile, e.target.value);
                        }}
                        disabled={workspaceState === 'generating'}
                        className="w-full px-3 py-2 rounded-xl bg-surface-raised border border-border-subtle text-xs text-text-primary focus:outline-none focus:border-accent"
                      >
                        {SUPPORTED_LANGUAGES.map((lang) => (
                          <option key={lang.code} value={lang.code}>
                            {lang.flag} {lang.name} ({lang.nativeName}) — {lang.region}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Voice Style Toggle */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block">
                        Voice Style:
                      </label>
                      <div className="grid grid-cols-2 gap-1.5 bg-surface-raised p-0.5 rounded-xl text-xs font-semibold">
                        <button
                          type="button"
                          onClick={() => setSelectedVoiceStyle('professional')}
                          disabled={workspaceState === 'generating'}
                          className={`py-1.5 px-2.5 rounded-lg transition-all cursor-pointer text-xs ${
                            selectedVoiceStyle === 'professional'
                              ? 'bg-accent text-white shadow-xs'
                              : 'text-text-secondary hover:text-text-primary'
                          }`}
                        >
                          <span>👔 Professional</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedVoiceStyle('local')}
                          disabled={workspaceState === 'generating'}
                          className={`py-1.5 px-2.5 rounded-lg transition-all cursor-pointer text-xs ${
                            selectedVoiceStyle === 'local'
                              ? 'bg-accent text-white shadow-xs'
                              : 'text-text-secondary hover:text-text-primary'
                          }`}
                        >
                          <span>🗣️ Casual Local</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Character Presenter Selector */}
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-text-secondary uppercase tracking-wider block">
                      Presenter Character:
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {CONTINUOUS_MOTION_CHARACTERS.map((char) => {
                        const isSelected = selectedCharacterId === char.id;
                        return (
                          <button
                            key={char.id}
                            type="button"
                            onClick={() => setSelectedCharacterId(char.id)}
                            disabled={workspaceState === 'generating'}
                            className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                              isSelected
                                ? 'border-accent bg-accent/10 shadow-sm'
                                : 'border-border-subtle bg-surface-raised hover:border-accent/40'
                            }`}
                          >
                            <div className="aspect-square rounded-xl overflow-hidden mb-2 bg-slate-900 border border-border-subtle">
                              <img
                                src={char.avatarUrl}
                                alt={char.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div>
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-xs text-text-primary truncate">{char.name.split(' ')[0]}</span>
                                {isSelected && <Check className="h-3.5 w-3.5 text-accent" />}
                              </div>
                              <p className="text-[10px] text-text-tertiary truncate">{char.style}</p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Duration & Token Pricing Selector */}
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-text-secondary uppercase tracking-wider block">
                      Duration & Cost:
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {([30, 45, 60] as VideoLength[]).map((len) => {
                        const cost = VIDEO_LENGTH_COSTS[len];
                        const isSelected = selectedVideoLength === len;
                        const canAfford = credits >= cost;

                        return (
                          <button
                            key={len}
                            type="button"
                            onClick={() => setSelectedVideoLength(len)}
                            disabled={workspaceState === 'generating'}
                            className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                              isSelected
                                ? 'border-accent bg-accent/10 text-text-primary'
                                : 'border-border-subtle bg-surface-raised text-text-secondary hover:border-accent/40'
                            } ${!canAfford ? 'opacity-50' : ''}`}
                          >
                            <p className="text-sm font-bold text-text-primary">{len}s</p>
                            <p className="text-xs font-semibold text-accent mt-0.5">
                              {cost} credits
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Generate Button */}
                  <div className="pt-2">
                    <button
                      onClick={handleGenerateVideo}
                      disabled={workspaceState === 'generating' || isSubmittingJob || !promptScriptText.trim()}
                      className="w-full py-4 px-6 rounded-2xl font-bold text-sm uppercase tracking-wider text-white bg-accent hover:bg-accent-hover shadow-lg shadow-accent/20 flex items-center justify-center gap-2.5 transition-all cursor-pointer disabled:opacity-50"
                    >
                      <Sparkles className="h-4 w-4" />
                      <span>
                        Generate {selectedVideoLength}s Commercial ({VIDEO_LENGTH_COSTS[selectedVideoLength]} credits)
                      </span>
                    </button>
                  </div>
                </div>

                {/* Step 3 Live Generation Progress */}
                {workspaceState === 'generating' && (
                  <div className="rounded-3xl border border-border-subtle bg-surface p-8 shadow-elevated text-center space-y-4">
                    <div className="h-12 w-12 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto text-accent">
                      <Clock className="h-6 w-6 animate-spin" />
                    </div>

                    <div>
                      <h4 className="text-base font-bold text-text-primary font-display">Rendering Animated Commercial</h4>
                      <p className="text-xs text-text-secondary mt-1">
                        Applying continuous motion gestures, verbatim voiceover, and 3D character lip-sync
                      </p>
                    </div>

                    <div className="grid grid-cols-3 gap-3 max-w-md mx-auto pt-2 text-xs font-semibold">
                      <div className="p-2 rounded-xl bg-accent/10 text-accent border border-accent/20">
                        1. Queued
                      </div>
                      <div className={`p-2 rounded-xl border ${generationJobStatus === 'generating_voice' || generationJobStatus === 'rendering_video' ? 'bg-accent/10 text-accent border-accent/20' : 'bg-surface-raised text-text-tertiary border-border-subtle'}`}>
                        2. Voice Synced
                      </div>
                      <div className={`p-2 rounded-xl border ${generationJobStatus === 'rendering_video' ? 'bg-accent/10 text-accent border-accent/20 animate-pulse' : 'bg-surface-raised text-text-tertiary border-border-subtle'}`}>
                        3. Rendering
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 4 Completed Video Result */}
                {workspaceState === 'done' && renderedVideoUrl && (
                  <div className="rounded-3xl border border-border-subtle bg-surface p-6 sm:p-8 shadow-elevated space-y-5">
                    <div className="flex items-center justify-between border-b border-border-subtle pb-3">
                      <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
                        Commercial Ready (v{currentVersion})
                      </span>
                      <span className="text-xs text-text-secondary">
                        {selectedVideoLength}s Duration
                      </span>
                    </div>

                    {/* HD Video Player */}
                    <div className="aspect-video rounded-2xl overflow-hidden bg-black shadow-inner border border-border-subtle relative">
                      <video
                        key={renderedVideoUrl}
                        src={renderedVideoUrl}
                        controls
                        autoPlay
                        playsInline
                        preload="auto"
                        className="w-full h-full object-contain"
                      />
                    </div>

                    {/* Spoken Quote Box */}
                    <div className="p-4 rounded-2xl bg-surface-raised text-xs text-text-secondary italic leading-relaxed">
                      "{promptScriptText}"
                    </div>

                    {/* Action Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={async () => {
                            if (!renderedVideoUrl) return;
                            setIsDownloading(true);
                            try {
                              const response = await fetch(renderedVideoUrl);
                              const blob = await response.blob();
                              const blobUrl = window.URL.createObjectURL(blob);
                              const a = document.createElement('a');
                              a.href = blobUrl;
                              const safeName = (businessProfile?.name || 'adanimai_commercial').replace(/[^a-zA-Z0-9_-]/g, '_');
                              a.download = `${safeName}_v${currentVersion}.mp4`;
                              document.body.appendChild(a);
                              a.click();
                              document.body.removeChild(a);
                              setTimeout(() => window.URL.revokeObjectURL(blobUrl), 1000);
                            } catch (err) {
                              console.error('Direct download failed, opening link:', err);
                              window.open(renderedVideoUrl, '_blank');
                            } finally {
                              setIsDownloading(false);
                            }
                          }}
                          disabled={isDownloading}
                          className="px-4 py-2 rounded-xl text-xs font-semibold text-text-primary bg-surface-raised hover:bg-surface border border-border-subtle flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                        >
                          {isDownloading ? (
                            <RefreshCw className="h-3.5 w-3.5 animate-spin text-accent" />
                          ) : (
                            <Download className="h-3.5 w-3.5 text-accent" />
                          )}
                          <span>{isDownloading ? 'Downloading...' : 'Download MP4'}</span>
                        </button>

                        <button
                          onClick={() => {
                            if (renderedVideoUrl) {
                              navigator.clipboard.writeText(renderedVideoUrl);
                              setCopiedLink(true);
                              setTimeout(() => setCopiedLink(false), 2000);
                            }
                          }}
                          className="px-4 py-2 rounded-xl text-xs font-semibold text-text-primary bg-surface-raised hover:bg-surface border border-border-subtle flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          {copiedLink ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Share2 className="h-3.5 w-3.5 text-accent" />}
                          <span>{copiedLink ? 'Copied!' : 'Share'}</span>
                        </button>
                      </div>

                      <button
                        onClick={() => {
                          setWorkspaceState('analyzed');
                        }}
                        className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-accent hover:bg-accent-hover flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                        <span>Generate Another Ad</span>
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <div ref={chatBottomRef} />
        </div>
      </main>
    </div>
  );
}

export default function WorkspacePage() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 flex items-center justify-center min-h-[70vh] bg-canvas text-text-secondary">
          <div className="text-center space-y-3">
            <RefreshCw className="h-8 w-8 text-accent animate-spin mx-auto" />
            <p className="text-xs font-semibold uppercase tracking-wider">Loading Ad Studio Workspace...</p>
          </div>
        </div>
      }
    >
      <WorkspaceContent />
    </Suspense>
  );
}
