'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Globe,
  Building2,
  Sparkles,
  ArrowRight,
  RefreshCw,
  Play,
  Pause,
  RotateCcw,
  Download,
  Share2,
  CheckCircle2,
  AlertTriangle,
  Layers,
  ChevronLeft,
  Volume2,
  VolumeX,
  Copy,
  Sliders,
  Sparkle,
  Check,
  Clock,
  Video
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CONTINUOUS_MOTION_CHARACTERS } from '@/lib/services/avatar';
import { SUPPORTED_LANGUAGES } from '@/lib/config/languages';
import { BusinessProfile, CharacterOption, LanguageOption, VideoJobStatus } from '@/lib/types';
import { isValidUrl, formatUrl } from '@/lib/utils';

function CreateWizardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Screen State: 2 = Input, 3 = Review & Script, 4 = Generating, 5 = Preview
  const [currentStep, setCurrentStep] = useState<2 | 3 | 4 | 5>(2);

  // Screen 2: Mode A (url) vs Mode B (manual)
  const [inputMode, setInputMode] = useState<'url' | 'manual'>('url');
  const [urlInput, setUrlInput] = useState('');
  const [manualForm, setManualForm] = useState({
    name: '',
    category: 'Food & Beverage',
    customCategory: '',
    productsOffering: '',
    location: '',
    usp: '',
  });

  // Validation & Error States
  const [urlError, setUrlError] = useState<string | null>(null);
  const [manualErrors, setManualErrors] = useState<{ [key: string]: string }>({});
  const [generalError, setGeneralError] = useState<string | null>(null);

  // Screen 3: Business Details & Script Review
  const [businessProfile, setBusinessProfile] = useState<BusinessProfile>({
    name: '',
    category: '',
    description: '',
    products: [],
    tone: 'Energetic',
    location: '',
    sourceType: 'url',
  });
  const [productsInput, setProductsInput] = useState('');
  const [promptScriptText, setPromptScriptText] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('hi'); // Default Hindi / Multi-lang
  const [selectedCharacterId, setSelectedCharacterId] = useState<string>('char_cartoon_maya');
  const [selectedTone, setSelectedTone] = useState<string>('Energetic');

  // Screen 4: Generation State & Queue Polling
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [activeBusinessId, setActiveBusinessId] = useState<string | null>(null);
  const [jobStatus, setJobStatus] = useState<VideoJobStatus | string>('queued');
  const [jobErrorMessage, setJobErrorMessage] = useState<string | null>(null);
  const [currentVersion, setCurrentVersion] = useState<number>(1);

  // Screen 5: Video Result
  const [renderedVideoUrl, setRenderedVideoUrl] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Loading States
  const [isScraping, setIsScraping] = useState(false);
  const [isGeneratingScript, setIsGeneratingScript] = useState(false);
  const [isSubmittingJob, setIsSubmittingJob] = useState(false);

  // Read URL query parameter for pre-selected character if provided
  useEffect(() => {
    const charParam = searchParams.get('character');
    if (charParam && CONTINUOUS_MOTION_CHARACTERS.some((c) => c.id === charParam)) {
      setSelectedCharacterId(charParam);
    }
  }, [searchParams]);

  // Categories list
  const CATEGORIES = [
    'Food & Beverage / Restaurant',
    'Juice Bar & Café',
    'Retail Store & Fashion',
    'Health & Wellness / Clinic',
    'Beauty, Salon & Spa',
    'Automobile & Repair',
    'Education & Coaching',
    'Real Estate & Construction',
    'Tech & Digital Services',
    'Other',
  ];

  const TONES = [
    'Energetic (High-conversion sales)',
    'Friendly (Warm & welcoming)',
    'Professional (Trust & authority)',
    'Excited (Festive / Big offers)',
  ];

  // Auto-generate script on language or tone change if on Screen 3
  const fetchPersuasiveScript = async (profile: BusinessProfile, lang: string, tone: string) => {
    setIsGeneratingScript(true);
    try {
      const res = await fetch('/api/script/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          business: profile,
          languageCode: lang,
          customTone: tone,
        }),
      });
      const data = await res.json();
      if (data.success && data.promptText) {
        setPromptScriptText(data.promptText);
      }
    } catch (err) {
      console.error('Failed to generate script:', err);
    } finally {
      setIsGeneratingScript(false);
    }
  };

  // SCREEN 2: Handle URL "Analyse"
  const handleAnalyseUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    setUrlError(null);
    setGeneralError(null);

    if (!urlInput.trim()) {
      setUrlError('Please enter a website URL like https://mybusiness.com');
      return;
    }

    const formatted = formatUrl(urlInput);
    if (!isValidUrl(formatted)) {
      setUrlError('Please enter a valid URL like https://example.com');
      return;
    }

    setIsScraping(true);

    try {
      const res = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: formatted }),
      });

      const data = await res.json();

      if (!data.success) {
        setGeneralError(data.errorMessage || "We couldn't fetch details from this URL. Please try again or enter details manually.");
        if (data.autoSwitchToManual) {
          setInputMode('manual');
          setManualForm((prev) => ({ ...prev, name: '' }));
        }
        setIsScraping(false);
        return;
      }

      // Success: populate Screen 3 data
      const extracted: BusinessProfile = {
        name: data.data.name || 'My Business',
        category: data.data.category || 'Retail & Services',
        description: data.data.description || '',
        products: data.data.products || ['Special Products'],
        tone: data.data.suggestedTone || 'Energetic',
        location: data.data.location || '',
        sourceType: 'url',
        url: data.data.url,
      };

      setBusinessProfile(extracted);
      setProductsInput(extracted.products.join(', '));
      setSelectedTone(extracted.tone || 'Energetic');

      // Fetch initial persuasive sales ad script in selected language
      await fetchPersuasiveScript(extracted, selectedLanguage, extracted.tone || 'Energetic');

      setCurrentStep(3); // Advance to Screen 3
    } catch (err: any) {
      setGeneralError('Network error while analyzing URL. Switched to manual entry.');
      setInputMode('manual');
    } finally {
      setIsScraping(false);
    }
  };

  // SCREEN 2: Handle Manual Form Submit
  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setManualErrors({});
    setGeneralError(null);

    const errors: { [key: string]: string } = {};
    if (!manualForm.name.trim()) errors.name = 'Business Name is required.';
    if (!manualForm.productsOffering.trim()) errors.productsOffering = 'What your business sells/offers is required.';

    if (Object.keys(errors).length > 0) {
      setManualErrors(errors);
      return;
    }

    const category = manualForm.category === 'Other' && manualForm.customCategory.trim()
      ? manualForm.customCategory.trim()
      : manualForm.category;

    const parsedProducts = manualForm.productsOffering
      .split(/,|\n/)
      .map((p) => p.trim())
      .filter((p) => p.length > 0);

    const profile: BusinessProfile = {
      name: manualForm.name.trim(),
      category,
      description: manualForm.usp.trim()
        ? `${manualForm.productsOffering.trim()}. Speciality: ${manualForm.usp.trim()}`
        : manualForm.productsOffering.trim(),
      products: parsedProducts.length > 0 ? parsedProducts : [manualForm.productsOffering.trim()],
      tone: selectedTone,
      location: manualForm.location.trim(),
      sourceType: 'manual',
    };

    setBusinessProfile(profile);
    setProductsInput(profile.products.join(', '));

    // Generate persuasive sales script in chosen language
    await fetchPersuasiveScript(profile, selectedLanguage, selectedTone);

    setCurrentStep(3); // Advance to Screen 3
  };

  // SCREEN 3: Handle script regeneration
  const handleRegenerateScript = () => {
    const updatedProfile: BusinessProfile = {
      ...businessProfile,
      products: productsInput.split(',').map((p) => p.trim()).filter((p) => p.length > 0),
      tone: selectedTone,
    };
    fetchPersuasiveScript(updatedProfile, selectedLanguage, selectedTone);
  };

  // SCREEN 3: Trigger Video Generation (advances to Screen 4)
  const handleStartVideoGeneration = async () => {
    if (!promptScriptText.trim()) {
      setGeneralError('Prompt script text cannot be empty.');
      return;
    }

    setIsSubmittingJob(true);
    setGeneralError(null);

    const updatedProfile: BusinessProfile = {
      ...businessProfile,
      products: productsInput.split(',').map((p) => p.trim()).filter((p) => p.length > 0),
      tone: selectedTone,
    };

    try {
      const res = await fetch('/api/video/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId: activeBusinessId,
          businessData: updatedProfile,
          promptText: promptScriptText.trim(), // VERBATIM prompt text
          language: selectedLanguage,
          characterId: selectedCharacterId,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        setGeneralError(data.errorMessage || 'Failed to initialize video generation.');
        setIsSubmittingJob(false);
        return;
      }

      setActiveProjectId(data.projectId);
      setActiveBusinessId(data.businessId);
      setCurrentVersion(data.version || 1);
      setJobStatus('queued');
      setJobErrorMessage(null);
      setCurrentStep(4); // Advance to Screen 4
    } catch (err: any) {
      setGeneralError('Network error while dispatching video generation.');
    } finally {
      setIsSubmittingJob(false);
    }
  };

  // SCREEN 4: Poll Video Generation Status
  useEffect(() => {
    if (currentStep !== 4 || !activeProjectId) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/video/status/${activeProjectId}`);
        const data = await res.json();

        if (data.success && data.project) {
          const status = data.project.status;
          setJobStatus(status);

          if (status === 'completed' && data.project.videoUrl) {
            setRenderedVideoUrl(data.project.videoUrl);
            clearInterval(interval);
            setTimeout(() => {
              setCurrentStep(5); // Advance to Screen 5
              confetti({
                particleCount: 90,
                spread: 70,
                origin: { y: 0.6 },
              });
            }, 700);
          } else if (status === 'failed') {
            setJobErrorMessage(data.project.errorMessage || 'Video generation failed.');
            clearInterval(interval);
          }
        }
      } catch (err) {
        console.error('Polling error:', err);
      }
    }, 2500);

    return () => clearInterval(interval);
  }, [currentStep, activeProjectId]);

  // SCREEN 5: Edit & Regenerate -> returns to Screen 3 with existing data
  const handleEditAndRegenerate = () => {
    setCurrentStep(3);
  };

  // Copy share link
  const handleCopyShareLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
    }
  };

  return (
    <div className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* 5-Step Stepper Header */}
      <div className="mb-8 sm:mb-10">
        <div className="flex items-center justify-between max-w-2xl mx-auto px-4 relative">
          <div className="absolute left-10 right-10 top-1/2 -translate-y-1/2 h-[2px] bg-slate-200 -z-0" />
          
          {/* Step 1 Indicator */}
          <div className="flex flex-col items-center gap-1.5 relative z-10">
            <div
              className={`h-9 w-9 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                currentStep === 2
                  ? 'bg-violet-600 text-white ring-4 ring-violet-500/20 shadow-md shadow-violet-500/30'
                  : currentStep > 2
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white border border-slate-300 text-slate-400'
              }`}
            >
              {currentStep > 2 ? <Check className="h-4 w-4 stroke-[3]" /> : '1'}
            </div>
            <span className="text-[11px] font-semibold text-slate-700">01 Business</span>
          </div>

          {/* Step 2 Indicator */}
          <div className="flex flex-col items-center gap-1.5 relative z-10">
            <div
              className={`h-9 w-9 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                currentStep === 3
                  ? 'bg-violet-600 text-white ring-4 ring-violet-500/20 shadow-md shadow-violet-500/30'
                  : currentStep > 3
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white border border-slate-300 text-slate-400'
              }`}
            >
              {currentStep > 3 ? <Check className="h-4 w-4 stroke-[3]" /> : '2'}
            </div>
            <span className="text-[11px] font-semibold text-slate-700">02 Script</span>
          </div>

          {/* Step 3 Indicator */}
          <div className="flex flex-col items-center gap-1.5 relative z-10">
            <div
              className={`h-9 w-9 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                currentStep >= 4
                  ? currentStep === 5
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/30'
                    : 'bg-violet-600 text-white ring-4 ring-violet-500/20 animate-pulse'
                  : 'bg-white border border-slate-300 text-slate-400'
              }`}
            >
              {currentStep === 5 ? <Check className="h-4 w-4 stroke-[3]" /> : '3'}
            </div>
            <span className="text-[11px] font-semibold text-slate-700">
              {currentStep === 5 ? '03 Preview' : '03 Render'}
            </span>
          </div>
        </div>
      </div>

      {/* Global Error Banner */}
      {generalError && (
        <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-sm flex items-start gap-3 shadow-sm">
          <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-bold text-amber-900">Attention</p>
            <p className="text-xs text-amber-800 mt-0.5">{generalError}</p>
          </div>
          <button
            onClick={() => setGeneralError(null)}
            className="text-xs text-amber-800 hover:text-amber-950 font-semibold underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SCREEN 2 — Business Input (Mode A: URL vs Mode B: Manual)                 */}
      {/* ========================================================================= */}
      {currentStep === 2 && (
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/90 shadow-xl shadow-slate-900/5 relative">
          <div className="text-center max-w-xl mx-auto mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-50 border border-violet-200 text-violet-700 text-xs font-semibold mb-3">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Step 1: Business Information</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Tell us about your business
            </h2>
            <p className="text-sm text-slate-500 mt-2">
              Provide your website or enter details manually. Our AI will analyze your offerings and generate a high-converting sales ad script.
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="max-w-md mx-auto mb-8 p-1.5 rounded-2xl bg-slate-100 border border-slate-200 grid grid-cols-2 gap-1.5">
            <button
              type="button"
              onClick={() => {
                setInputMode('url');
                setUrlError(null);
                setGeneralError(null);
              }}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                inputMode === 'url'
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Globe className="h-4 w-4 text-violet-600" />
              <span>I have a website URL</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setInputMode('manual');
                setUrlError(null);
                setGeneralError(null);
              }}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                inputMode === 'manual'
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Building2 className="h-4 w-4 text-violet-600" />
              <span>Enter Manually</span>
            </button>
          </div>

          {/* MODE A: URL Input Form */}
          {inputMode === 'url' ? (
            <form onSubmit={handleAnalyseUrl} className="max-w-xl mx-auto space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Business Website URL
                </label>
                <div className="relative">
                  <Globe className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input
                    type="text"
                    value={urlInput}
                    onChange={(e) => {
                      setUrlInput(e.target.value);
                      if (urlError) setUrlError(null);
                    }}
                    placeholder="https://myjuiceshop.com or www.mybrand.in"
                    className={`w-full pl-12 pr-4 py-3.5 rounded-2xl bg-slate-50 border text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:bg-white transition-all ${
                      urlError
                        ? 'border-rose-500 focus:ring-2 focus:ring-rose-500/20'
                        : 'border-slate-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20'
                    }`}
                  />
                </div>
                {urlError && (
                  <p className="mt-2 text-xs text-rose-600 flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-rose-600" />
                    {urlError}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isScraping}
                className="w-full py-4 px-6 rounded-2xl text-white font-bold text-sm gradient-button flex items-center justify-center gap-2 shadow-lg shadow-violet-500/20 transition-all disabled:opacity-50"
              >
                {isScraping ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Analyzing your business URL...</span>
                  </>
                ) : (
                  <>
                    <span>Analyse Website & Craft Ad →</span>
                  </>
                )}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setInputMode('manual')}
                  className="text-xs font-semibold text-slate-500 hover:text-violet-700 transition-colors"
                >
                  No website? Switch to manual business entry →
                </button>
              </div>
            </form>
          ) : (
            /* MODE B: Manual Input Form */
            <form onSubmit={handleManualSubmit} className="max-w-2xl mx-auto space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Business Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Business Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={manualForm.name}
                    onChange={(e) => setManualForm({ ...manualForm, name: e.target.value })}
                    placeholder="e.g. Royal Fresh Juice Corner"
                    className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:bg-white ${
                      manualErrors.name
                        ? 'border-rose-500'
                        : 'border-slate-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20'
                    }`}
                  />
                  {manualErrors.name && (
                    <p className="mt-1 text-[11px] text-rose-600">{manualErrors.name}</p>
                  )}
                </div>

                {/* Category Dropdown */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Business Category <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={manualForm.category}
                    onChange={(e) => setManualForm({ ...manualForm, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:bg-white focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {manualForm.category === 'Other' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Specify Category</label>
                  <input
                    type="text"
                    value={manualForm.customCategory}
                    onChange={(e) => setManualForm({ ...manualForm, customCategory: e.target.value })}
                    placeholder="e.g. Handmade Organic Pottery"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:bg-white focus:border-violet-500 focus:outline-none"
                  />
                </div>
              )}

              {/* Products & Offerings */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  What does your business sell / offer? <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  value={manualForm.productsOffering}
                  onChange={(e) => setManualForm({ ...manualForm, productsOffering: e.target.value })}
                  placeholder="e.g. 100% pure fresh seasonal fruit juices, cold-pressed smoothies, mango shakes, and fruit salads with no added artificial sugars"
                  className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:bg-white ${
                    manualErrors.productsOffering
                      ? 'border-rose-500'
                      : 'border-slate-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20'
                  }`}
                />
                {manualErrors.productsOffering && (
                  <p className="mt-1 text-[11px] text-rose-600">{manualErrors.productsOffering}</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* City / Location */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    City / Location (Optional)
                  </label>
                  <input
                    type="text"
                    value={manualForm.location}
                    onChange={(e) => setManualForm({ ...manualForm, location: e.target.value })}
                    placeholder="e.g. Connaught Place, New Delhi"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:bg-white focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                  />
                </div>

                {/* USP / Offer */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    USP / Special Offers
                  </label>
                  <input
                    type="text"
                    value={manualForm.usp}
                    onChange={(e) => setManualForm({ ...manualForm, usp: e.target.value })}
                    placeholder="e.g. 100% natural, farm-fresh fruit & Buy 1 Get 1 free on weekends"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:bg-white focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isGeneratingScript}
                className="w-full py-4 px-6 rounded-2xl text-white font-bold text-sm gradient-button flex items-center justify-center gap-2 shadow-lg shadow-violet-500/20 mt-4 disabled:opacity-50"
              >
                {isGeneratingScript ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Preparing Sales Script...</span>
                  </>
                ) : (
                  <>
                    <span>Continue to Review & Script →</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* SCREEN 3 — Business Details Review & Script Setup                         */}
      {/* ========================================================================= */}
      {currentStep === 3 && (
        <div className="space-y-6">
          {/* Back button */}
          <button
            onClick={() => setCurrentStep(2)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Back to Business Input</span>
          </button>

          {/* Section 1: Business Details Review (Editable) */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm">
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-violet-600" />
                  <span>Business Summary & Profile</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Review and edit the extracted business attributes below:
                </p>
              </div>
              <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-violet-50 text-violet-700 border border-violet-200">
                Auto-Extracted
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Business Name</label>
                <input
                  type="text"
                  value={businessProfile.name}
                  onChange={(e) => setBusinessProfile({ ...businessProfile, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:border-violet-500 focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                <input
                  type="text"
                  value={businessProfile.category}
                  onChange={(e) => setBusinessProfile({ ...businessProfile, category: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:border-violet-500 focus:bg-white focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">Description / Summary</label>
                <textarea
                  rows={2}
                  value={businessProfile.description}
                  onChange={(e) => setBusinessProfile({ ...businessProfile, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:border-violet-500 focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Key Products / Offerings (comma-separated)</label>
                <input
                  type="text"
                  value={productsInput}
                  onChange={(e) => setProductsInput(e.target.value)}
                  placeholder="e.g. Fresh Mango Juice, Orange Punch, Seasonal Specials"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:border-violet-500 focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tone Style</label>
                <select
                  value={selectedTone}
                  onChange={(e) => setSelectedTone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:border-violet-500 focus:bg-white focus:outline-none"
                >
                  {TONES.map((tone) => (
                    <option key={tone} value={tone}>
                      {tone}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Video Ad Script (Verbatim Prompt Textarea) */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-violet-600" />
                    <span>Auto-Generated Advertisement Script</span>
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Sales-Optimized
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  The animated character will speak this <span className="text-violet-700 font-bold">EXACT verbatim text</span> in the video. You can edit every word freely:
                </p>
              </div>

              {/* Regenerate Script Button */}
              <button
                type="button"
                onClick={handleRegenerateScript}
                disabled={isGeneratingScript}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-all shrink-0"
              >
                <RotateCcw className={`h-3.5 w-3.5 ${isGeneratingScript ? 'animate-spin' : ''}`} />
                <span>Regenerate Prompt</span>
              </button>
            </div>

            {/* Editable Script Textarea */}
            <div className="relative mb-6">
              <textarea
                rows={5}
                value={promptScriptText}
                onChange={(e) => setPromptScriptText(e.target.value)}
                placeholder="Write or edit the exact spoken advertisement script here..."
                className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 text-base leading-relaxed focus:bg-white focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 focus:outline-none"
              />
              <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1.5 px-1">
                <span className="font-medium text-violet-700">⚡ Word-for-word spoken verbatim copy</span>
                <span>{promptScriptText.trim().split(/\s+/).filter(Boolean).length} words</span>
              </div>
            </div>

            {/* Section 3: Language & Continuous-Motion Avatar Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-slate-100">
              {/* Language Selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2.5 flex items-center gap-2">
                  <Volume2 className="h-4 w-4 text-violet-600" />
                  <span>Spoken Voice Language</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {SUPPORTED_LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => {
                        setSelectedLanguage(lang.code);
                        fetchPersuasiveScript(businessProfile, lang.code, selectedTone);
                      }}
                      className={`p-2.5 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                        selectedLanguage === lang.code
                          ? 'border-violet-600 bg-violet-50 text-violet-900 shadow-sm ring-1 ring-violet-600'
                          : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      <span className="text-xl leading-none">{lang.flag}</span>
                      <span className="text-xs font-bold mt-1 text-slate-900">{lang.name}</span>
                      <span className="text-[10px] text-slate-500">{lang.nativeName}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Character Selector with Continuous Motion requirement */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2.5 flex items-center gap-2">
                  <Video className="h-4 w-4 text-indigo-600" />
                  <span>Continuous-Motion Character</span>
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  {CONTINUOUS_MOTION_CHARACTERS.map((char) => (
                    <div
                      key={char.id}
                      onClick={() => setSelectedCharacterId(char.id)}
                      className={`p-2.5 rounded-2xl border cursor-pointer transition-all flex items-start gap-2.5 ${
                        selectedCharacterId === char.id
                          ? 'border-violet-600 bg-violet-50 shadow-sm ring-1 ring-violet-600'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <img
                        src={char.avatarUrl}
                        alt={char.name}
                        className="h-10 w-10 rounded-xl object-cover border border-slate-200 shrink-0"
                      />
                      <div className="overflow-hidden">
                        <p className="text-xs font-bold text-slate-900 truncate">{char.name.split(' ')[0]}</p>
                        <p className="text-[10px] text-violet-700 font-semibold truncate">{char.style}</p>
                        <span className="inline-block text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 font-bold mt-1">
                          Active Gestures
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Generate Video Action Button */}
            <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={handleStartVideoGeneration}
                disabled={isSubmittingJob || !promptScriptText.trim()}
                className="w-full sm:w-auto py-4 px-8 rounded-2xl text-white font-bold text-sm gradient-button flex items-center justify-center gap-2.5 shadow-lg shadow-violet-500/25 disabled:opacity-50"
              >
                {isSubmittingJob ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Queuing Video Job...</span>
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 fill-white" />
                    <span>Generate Video Ad Now →</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SCREEN 4 — Video Generation (Async Queue Processing State)                */}
      {/* ========================================================================= */}
      {currentStep === 4 && (
        <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-xl shadow-slate-900/5 border border-slate-200/90 text-center max-w-xl mx-auto">
          {/* Animated Spinner Icon */}
          <div className="relative mb-6 inline-flex">
            <div className="h-20 w-20 rounded-3xl bg-violet-50 border border-violet-200 flex items-center justify-center animate-pulse">
              <Sparkles className="h-10 w-10 text-violet-600 animate-spin-slow" />
            </div>
          </div>

          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Rendering Your Animated Video Ad
          </h2>
          <p className="text-xs text-slate-500 mt-2 mb-8">
            Our multi-stage pipeline is generating voice audio, continuous gesture animation, and verbatim lipsync.
          </p>

          {/* Multi-stage Progress Indicators */}
          <div className="space-y-3 text-left max-w-md mx-auto mb-8">
            {/* Stage 1: Queued */}
            <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div
                className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  jobStatus !== 'failed'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-200 text-slate-500'
                }`}
              >
                ✓
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold text-slate-800">Job Queued</p>
                <p className="text-[10px] text-slate-500">Task registered in background queue</p>
              </div>
            </div>

            {/* Stage 2: Generating Voice */}
            <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div
                className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  jobStatus === 'generating_voice' || jobStatus === 'rendering_video' || jobStatus === 'completed'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-200 text-slate-500'
                }`}
              >
                {jobStatus === 'generating_voice' ? (
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  '2'
                )}
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold text-slate-800">Generating Script Voice</p>
                <p className="text-[10px] text-slate-500">Synthesizing native language audio</p>
              </div>
            </div>

            {/* Stage 3: Rendering Video */}
            <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div
                className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  jobStatus === 'rendering_video' || jobStatus === 'completed'
                    ? jobStatus === 'completed'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-violet-600 text-white animate-pulse'
                    : 'bg-slate-200 text-slate-500'
                }`}
              >
                {jobStatus === 'rendering_video' ? (
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  '3'
                )}
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold text-slate-800">Rendering Continuous Motion Video</p>
                <p className="text-[10px] text-slate-500">Animating gestures, facial expressions & lipsync</p>
              </div>
            </div>
          </div>

          {/* Failure Handling */}
          {jobStatus === 'failed' && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs mb-6 text-left">
              <p className="font-bold text-rose-800">Generation Failed</p>
              <p className="mt-1 text-rose-700">{jobErrorMessage || 'An unexpected error occurred during rendering.'}</p>
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={handleStartVideoGeneration}
                  className="px-3.5 py-1.5 rounded-xl bg-rose-600 text-white font-bold hover:bg-rose-700"
                >
                  Retry Job
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-200 text-slate-700 hover:bg-slate-300 font-semibold"
                >
                  Edit Script & Settings
                </button>
              </div>
            </div>
          )}

          <p className="text-[11px] text-slate-400">
            You can safely navigate away; background processing will continue and update your Dashboard.
          </p>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SCREEN 5 — Preview & Download Video Commercial                            */}
      {/* ========================================================================= */}
      {currentStep === 5 && (() => {
        const selectedCharObj = CONTINUOUS_MOTION_CHARACTERS.find((c) => c.id === selectedCharacterId) || CONTINUOUS_MOTION_CHARACTERS[0];
        const selectedLangObj = SUPPORTED_LANGUAGES.find((l) => l.code === selectedLanguage) || SUPPORTED_LANGUAGES[0];

        const togglePlayback = () => {
          if (videoRef.current) {
            if (videoRef.current.paused) {
              videoRef.current.play().then(() => setIsVideoPlaying(true)).catch(() => {});
            } else {
              videoRef.current.pause();
              setIsVideoPlaying(false);
            }
          }
        };

        return (
          <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-xl shadow-slate-900/5 border border-slate-200/90 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div>
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <Check className="h-4 w-4 stroke-[3]" />
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                    Video Commercial Ready for Review
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-violet-100 text-violet-700">
                    Version {currentVersion}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-1.5">
                  <span>Business: <strong className="text-slate-800">{businessProfile.name}</strong></span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <span>{selectedLangObj.flag}</span>
                    <strong className="text-slate-800">{selectedLangObj.name} ({selectedLangObj.nativeName})</strong>
                  </span>
                  <span>•</span>
                  <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.2 rounded-full">
                    1080p HD Ready
                  </span>
                </div>
              </div>

              {/* Top Quick Actions */}
              <div className="flex items-center gap-2">
                {renderedVideoUrl && (
                  <a
                    href={renderedVideoUrl}
                    download={`adanimai_${businessProfile.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_v${currentVersion}.mp4`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white gradient-button shadow-md shadow-violet-500/25 transition-all"
                  >
                    <Download className="h-4 w-4" />
                    <span>Download MP4</span>
                  </a>
                )}

                <button
                  type="button"
                  onClick={handleCopyShareLink}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-all"
                >
                  {copiedLink ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <Share2 className="h-4 w-4" />}
                  <span>{copiedLink ? 'Link Copied!' : 'Share'}</span>
                </button>
              </div>
            </div>

            {/* Video Player Display with Poster & Interactive Overlay */}
            <div className="relative rounded-2xl overflow-hidden bg-slate-950 aspect-video max-w-3xl mx-auto border border-slate-200 shadow-2xl group">
              {renderedVideoUrl ? (
                <>
                  <video
                    ref={videoRef}
                    src={renderedVideoUrl}
                    poster={selectedCharObj.avatarUrl}
                    controls
                    playsInline
                    preload="auto"
                    onPlay={() => setIsVideoPlaying(true)}
                    onPause={() => setIsVideoPlaying(false)}
                    className="w-full h-full object-contain cursor-pointer"
                    onClick={togglePlayback}
                  />

                  {/* Centered Large Play Button Overlay when paused */}
                  {!isVideoPlaying && (
                    <button
                      type="button"
                      onClick={togglePlayback}
                      className="absolute inset-0 m-auto h-18 w-18 sm:h-20 sm:w-20 rounded-full bg-white/95 text-violet-600 flex items-center justify-center shadow-2xl hover:scale-110 transition-transform cursor-pointer border border-white/80"
                      title="Play Video Ad"
                    >
                      <Play className="h-8 w-8 sm:h-9 sm:w-9 fill-violet-600 ml-1 text-violet-600" />
                    </button>
                  )}

                  {/* Top Overlay Badge */}
                  <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white text-xs font-bold flex items-center gap-2 pointer-events-none">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                    <span>{selectedCharObj.name} — Continuous Motion</span>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-slate-400 p-8 text-center">
                  <RefreshCw className="h-8 w-8 animate-spin text-violet-500 mb-3" />
                  <p className="text-sm font-semibold text-white">Preparing video preview player...</p>
                </div>
              )}
            </div>

            {/* Quality Checklist Row */}
            <div className="max-w-3xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-center text-xs">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center gap-2 justify-center text-slate-700 font-medium">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>Continuous Gesture Motion</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center gap-2 justify-center text-slate-700 font-medium">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>100% Verbatim Native Speech</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center gap-2 justify-center text-slate-700 font-medium">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>Commercial Sales-Optimized</span>
              </div>
            </div>

            {/* Verbatim Script Used Display */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 max-w-3xl mx-auto">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Volume2 className="h-4 w-4 text-violet-600" />
                  <span>Exact Verbatim Script Spoken in Video</span>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(promptScriptText);
                    setCopiedLink(true);
                    setTimeout(() => setCopiedLink(false), 2000);
                  }}
                  className="text-xs text-violet-700 hover:text-violet-900 font-bold flex items-center gap-1 bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-sm"
                >
                  <Copy className="h-3 w-3" />
                  <span>Copy Script</span>
                </button>
              </div>
              <p className="text-sm text-slate-800 italic leading-relaxed bg-white p-4 rounded-xl border border-slate-200/80">
                "{promptScriptText}"
              </p>
            </div>

            {/* Bottom Primary Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-5 border-t border-slate-100 max-w-3xl mx-auto">
              <button
                type="button"
                onClick={handleEditAndRegenerate}
                className="w-full sm:w-auto py-3.5 px-6 rounded-2xl text-sm font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 flex items-center justify-center gap-2 transition-all"
              >
                <RotateCcw className="h-4 w-4 text-violet-600" />
                <span>Edit Prompt & Regenerate (Version {currentVersion + 1})</span>
              </button>

              <button
                type="button"
                onClick={() => router.push('/dashboard')}
                className="w-full sm:w-auto py-3.5 px-6 rounded-2xl text-sm font-bold gradient-button text-white flex items-center justify-center gap-2 shadow-md shadow-violet-500/20"
              >
                <Layers className="h-4 w-4" />
                <span>View All Projects in Dashboard</span>
              </button>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

export default function CreateWizardPage() {
  return (
    <Suspense fallback={
      <div className="flex-1 flex items-center justify-center p-12 text-slate-500">
        <RefreshCw className="h-8 w-8 animate-spin text-violet-600" />
      </div>
    }>
      <CreateWizardContent />
    </Suspense>
  );
}
