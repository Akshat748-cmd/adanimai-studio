# AdAnimAI — AI Animated Ad Video Generator Platform

A SaaS platform that lets business owners automatically generate AI animated-character advertisement videos from their business website URL or manual business details.

---

## 🌟 Key Features & Guarantees

1. **Continuous Motion Avatars**: Character avatars have body/hand gestures, idle animation, and natural movement throughout the video (dynamic cartoon presenters, not static talking heads).
2. **100% Verbatim Script Execution**: Whatever text is present in the prompt textarea at the moment "Generate Video" is clicked is converted to speech and lipsynced word-for-word without alterations or omissions.
3. **Dual Language-Avatar Voice Parity**: Language selection (Hindi, English, Punjabi, Marathi, Tamil, Telugu, Bengali, Gujarati, etc.) simultaneously controls the generated sales script and native neural avatar voice model.
4. **Persuasive Sales-Driven Ad Copy**: AI script generation (Claude) produces high-converting, sales-oriented commercial copy tailored with specific USPs and product freshness/purity (e.g. *"is dukaan ka juice sabse achha aur pure hai"*).
5. **Exact 6-Screen Sequential Flow**:
   - **Screen 1 (Auth)**: Email/Password, Continue with Google, Persistent Session.
   - **Screen 2 (Business Input)**: URL with "Analyse" button (validated & auto-fallback on error) vs Manual Business Form.
   - **Screen 3 (Business Details Review & Script Setup)**: Editable business summary, auto-generated sales script, "Regenerate Prompt", Language selector, and Continuous-Motion Character selector.
   - **Screen 4 (Video Generation State)**: Async queue processing with live status tracker (`Queued` → `Generating Voice` → `Rendering Video` → `Done`).
   - **Screen 5 (Preview & Versioned Editing)**: Video player with controls, verbatim script display, "Edit & Regenerate" (creates new version, preserving history), Download MP4, and Share link.
   - **Screen 6 (Dashboard & History)**: User's business profiles, multi-version video archives, and one-click project reopening.

---

## 🛠 Tech Stack

- **Frontend**: Next.js 14+ (App Router), TypeScript, Tailwind CSS, Lucide Icons, Canvas Confetti
- **Backend**: Next.js App Router API Routes
- **Database & ORM**: SQLite (Development) / PostgreSQL with Prisma ORM
- **Queue/Background Jobs**: Asynchronous background worker engine with persistent database progress tracking
- **Authentication**: NextAuth.js (Google Sign-In + Credentials / Email)
- **Scraping API**: Firecrawl API with resilient fallback extractor
- **LLM API**: Anthropic Claude API (`claude-3-5-sonnet-20241022`)
- **Avatar Video API**: HeyGen API & D-ID API with continuous-motion animated cartoon avatar library and multi-language neural voices

---

## 🚀 Getting Started

### 1. Installation
```bash
npm install
```

### 2. Environment Setup
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Fill in your respective API keys:
- `ANTHROPIC_API_KEY`: Anthropic Claude API key.
- `FIRECRAWL_API_KEY`: Firecrawl web scraping API key.
- `ELEVENLABS_API_KEY`: ElevenLabs TTS key.
- `SARVAM_API_KEY`: Sarvam AI Indian languages TTS key.
- `HEYGEN_API_KEY`: HeyGen animated avatar API key.
- `DID_API_KEY`: D-ID video API key.

> **Note**: The application includes built-in realistic mock/preview fallbacks so all screens, workflows, and versioning can be developed and tested immediately even before setting paid external API keys.

### 3. Database Migration
```bash
npx prisma db push
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📂 Project Architecture

```
d:/App/App/
├── package.json               # Root monorepo orchestrator (npm workspaces: frontend, backend, shared)
├── .env                       # Unified master environment configuration
├── README.md
│
├── frontend/                  # Next.js 14 Web Application (Port 3000)
│   ├── package.json
│   ├── next.config.mjs        # Proxies /api/scrape, /api/script/*, /api/video/*, /api/businesses, /api/cron/* to BACKEND_API_URL
│   ├── app/
│   │   ├── layout.tsx         # Root layout & navigation
│   │   ├── page.tsx           # Landing page & character showcase
│   │   ├── create/page.tsx    # Multi-step video ad creation wizard
│   │   ├── dashboard/page.tsx # Commercial campaign history & video player
│   │   ├── login/page.tsx     # NextAuth authentication UI
│   │   └── api/auth/[...nextauth]/route.ts
│   ├── components/            # UI components (Navbar, SessionWrapper)
│   └── lib/                   # NextAuth options & frontend utilities
│
├── backend/                   # Express + TypeScript + Prisma API Service (Port 5000)
│   ├── package.json
│   ├── tsconfig.json
│   ├── prisma/                # Prisma schema (SQLite dev.db & PostgreSQL)
│   └── src/
│       ├── server.ts          # Express API server with CORS & root .env loader
│       ├── routes/            # /api/scrape, /api/script, /api/video, /api/businesses, /api/cron
│       ├── services/          # Multi-LLM provider, Scraper, Continuous-Motion Avatar & TTS
│       ├── queue/             # Video render queue processor & background worker
│       ├── prisma.ts          # Backend Prisma database client
│       └── utils.ts
│
└── shared/                    # Shared Workspace Package (@adanimai/shared)
    ├── package.json
    ├── index.ts               # Re-exports all shared modules
    ├── types.ts               # BusinessProfile, CharacterOption, LanguageOption, VideoJobStatus, VideoProjectData
    ├── languages.ts           # SUPPORTED_LANGUAGES catalog
    └── characters.ts          # CONTINUOUS_MOTION_CHARACTERS display data & static fallback IDs
```
