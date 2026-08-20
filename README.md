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
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/route.ts  # NextAuth endpoint
│   │   ├── businesses/route.ts          # History & business archive
│   │   ├── scrape/route.ts              # URL scraping & Pass 1 LLM extraction
│   │   ├── script/generate/route.ts     # Pass 2 persuasive ad copy generator
│   │   ├── video/generate/route.ts      # Video job creation & queue dispatcher
│   │   └── video/status/[id]/route.ts   # Video job status polling
│   ├── create/page.tsx                  # Screens 2, 3, 4, 5 creation wizard
│   ├── dashboard/page.tsx               # Screen 6 dashboard & history
│   ├── login/page.tsx                   # Screen 1 authentication
│   ├── layout.tsx                       # Root layout & navigation
│   └── page.tsx                         # Landing page & presenter showcase
├── lib/
│   ├── queue/videoQueue.ts              # Background job processing & polling
│   ├── services/
│   │   ├── avatar.ts                    # HeyGen / D-ID & character catalog
│   │   ├── llm.ts                       # Claude Pass 1 & Pass 2 copy generation
│   │   ├── scraper.ts                   # Web scraping with Firecrawl & fallback
│   │   └── tts.ts                       # Supported language & neural voice mappings
│   ├── prisma.ts                        # Prisma database client singleton
│   ├── types.ts                         # Data types and interfaces
│   └── utils.ts                         # Utility functions & URL validation
└── prisma/
    └── schema.prisma                    # User, Business, and VideoProject schema
```
