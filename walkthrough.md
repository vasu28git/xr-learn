# XR Learning Platform — Complete Project Walkthrough

## What We Built

A **browser-based XR learning platform** where students learn Augmented & Virtual Reality concepts through 6 structured modules. Each module has theory + a hands-on 3D workspace with a live code editor and AI tutor.

**No headset required. No installation. Everything runs in the browser.**

---

## Tech Stack

| Technology | Purpose |
|---|---|
| **React + Vite** | Frontend framework & build tool |
| **React Three Fiber + Three.js** | 3D scenes in the browser |
| **@react-three/drei** | 3D helpers (OrbitControls, Html labels) |
| **Monaco Editor** | In-browser VS Code-style code editor |
| **Supabase Auth** | Login / Signup |
| **Supabase Database** | Student progress storage |
| **Supabase Edge Functions** | AI tutor proxy (keeps API key secret) |
| **React Router DOM** | Page navigation |

---

## Complete File Structure

```
xr-learning/
│
├── .env                          ← Supabase credentials (actual, used by Vite)
├── .env.example                  ← Template for env vars
├── index.html                    ← HTML entry point (Google Fonts, meta tags, SEO)
├── package.json                  ← Dependencies & scripts
├── vite.config.js                ← Vite configuration
│
├── public/                       ← Static assets
│
├── src/                          ← ALL APPLICATION CODE
│   │
│   ├── main.jsx                  ← React 18 entry point (createRoot)
│   ├── App.jsx                   ← Router with 5 routes
│   ├── index.css                 ← Complete design system (CSS variables, all styles)
│   │
│   ├── lib/
│   │   └── supabase.js           ← Supabase client init (graceful fallback if no creds)
│   │
│   ├── config/
│   │   └── modules/
│   │       ├── module1.js        ← What Is XR? (visual-only, click objects)
│   │       ├── module2.js        ← 3D Space & Coordinates (move box to target)
│   │       ├── module3.js        ← Scene Hierarchy (parent-child relationships)
│   │       ├── module4.js        ← Lighting & Materials (match target appearance)
│   │       ├── module5.js        ← Interaction & Input (add click handler)
│   │       └── module6.js        ← Build Your First XR Scene (synthesis)
│   │
│   ├── pages/
│   │   ├── Landing.jsx           ← Hero + features + CTAs (public)
│   │   ├── Login.jsx             ← Email/password sign-in
│   │   ├── Signup.jsx            ← Name/email/password sign-up
│   │   ├── Dashboard.jsx         ← 6 module cards + progress bar
│   │   └── ModulePage.jsx        ← Theory + lazy-loaded workspace
│   │
│   ├── components/
│   │   ├── auth/
│   │   │   └── ProtectedRoute.jsx  ← Redirects to /login if not authenticated
│   │   │
│   │   ├── dashboard/
│   │   │   └── ModuleCard.jsx      ← Card with status (completed/available/locked)
│   │   │
│   │   ├── theory/
│   │   │   └── TheorySection.jsx   ← Renders heading/text/highlight/list sections
│   │   │
│   │   └── workspace/
│   │       ├── Workspace.jsx       ← 3-panel layout (AI | 3D | Code) + completion logic
│   │       ├── Scene.jsx           ← R3F Canvas (fog, grid, lights, OrbitControls)
│   │       ├── SceneObjects.jsx    ← Per-module 3D objects with correct styling
│   │       ├── CodeEditor.jsx      ← Monaco editor (vs-dark, JetBrains Mono)
│   │       └── AIPanel.jsx         ← Chat bubbles + Need Help + hint prompt
│   │
│   ├── hooks/
│   │   ├── useAuth.js            ← Auth state (session, user, signOut)
│   │   ├── useSandbox.js         ← Code→Scene bridge (Proxy API, new Function execution)
│   │   └── useAI.js              ← AI conversation state + hint system
│   │
│   ├── services/
│   │   └── ai.js                 ← Calls Supabase Edge Function for AI responses
│   │
│   └── utils/
│       ├── progress.js           ← getModuleStatus(), getCompletedCount()
│       └── checkCompletion.js    ← Per-module completion checks with tolerance
│
├── supabase/
│   └── functions/
│       └── ai-tutor/
│           └── index.ts          ← Deno Edge Function (Gemini/Claude, progressive hints)
│
└── dist/                         ← Production build output
```

**Total: 29 source files + 1 edge function**

---

## Routes

| Path | Page | Auth Required |
|---|---|---|
| `/` | Landing page | ❌ |
| `/login` | Login form | ❌ |
| `/signup` | Signup form | ❌ |
| `/dashboard` | Module cards + progress | ✅ |
| `/module/:id` | Theory + workspace | ✅ |

---

## The 6 Modules

| # | Title | Task | Completion Check |
|---|---|---|---|
| 1 | What Is XR? | Click floating (VR) and anchored (AR) objects | Both objects clicked |
| 2 | 3D Space & Coordinates | Move blue box to green target at (3, 2, -1) | Position within 0.15 tolerance |
| 3 | Scene Hierarchy | Parent boxes to table, then move table | Parent set + table moved |
| 4 | Lighting & Materials | Match target sphere appearance | Color + roughness + metalness match |
| 5 | Interaction & Input | Add click handler to toggle box color | Click handler registered |
| 6 | Build Your First XR Scene | Build scene with 2+ objects, hierarchy, interaction | All requirements met |

---

## How Each Piece Connects

```
Student writes code in Monaco
         │
         ▼
   useSandbox.js
   (builds Proxy API objects per module,
    executes code via new Function())
         │
         ▼
   React State (sceneState)
         │
    ┌────┴────┐
    ▼         ▼
 SceneObjects    checkCompletion.js
 (R3F renders    (checks if target
  3D objects)     state reached)
                      │
                      ▼
               Supabase update
               (marks module complete)
```

```
Student asks AI for help
         │
         ▼
   useAI.js (builds context packet:
   code, scene state, target, errors)
         │
         ▼
   services/ai.js
   (calls Supabase Edge Function)
         │
         ▼
   ai-tutor/index.ts
   (Deno function, calls Gemini/Claude
    with progressive hint system prompt)
         │
         ▼
   Response shown in AIPanel.jsx
```

---

## Design System

All styling uses CSS variables in [`index.css`](file:///d:/E_drive/PEC hacks/xr-learning/src/index.css):

| Variable | Value | Usage |
|---|---|---|
| `--bg-primary` | `#0a0e1a` | Page backgrounds |
| `--bg-panel` | `#111827` | Panel backgrounds |
| `--bg-card` | `#1a2040` | Cards, chat bubbles |
| `--accent-blue` | `#4488ff` | Primary actions, links |
| `--accent-green` | `#44ff88` | Success, targets |
| `--accent-purple` | `#8866ff` | Gradients, accents |
| `--success` | `#22c55e` | Completed status |
| `--error` | `#ef4444` | Errors |

**3D Scene styling:** Dark navy bg (`#0a0e1a`), grid floor, blue-tinted ambient light, fog for depth, `MeshStandardMaterial` everywhere.

---

## Workspace Layout

```
┌─────────────────────────────────────────────────────────────────┐
│ 🎯 Task description                                    ← Theory │
├───────────────┬──────────────────────────┬──────────────────────┤
│ 🤖 AI TUTOR   │                          │ 💻 CODE EDITOR       │
│   (20%)       │    🌐 3D SCENE (50%)     │   (30%)              │
│               │                          │                      │
│ Chat bubbles  │  Three.js canvas         │  Monaco editor       │
│ Need Help?    │  Orbit, zoom, pan        │  Run Code button     │
│ Send message  │  Per-module objects      │  Error display       │
├───────────────┴──────────────────────────┴──────────────────────┤
│ ● In Progress                                    Attempts: 3    │
└─────────────────────────────────────────────────────────────────┘
```

---

## Supabase Tables (Pre-existing)

| Table | Purpose |
|---|---|
| `profiles` | Student name, created_at |
| `module_progress` | Per-module: completed, hints_used, attempts |
| `ai_conversations` | Chat history storage |

A trigger auto-creates profile + 6 progress rows on signup.

---

## How to Run

```bash
# 1. Install dependencies (already done)
npm install

# 2. Create .env with Supabase credentials (already done)
# VITE_SUPABASE_URL=...
# VITE_SUPABASE_ANON_KEY=...

# 3. Start dev server
npm run dev

# 4. Open http://localhost:5173
```

## How to Deploy the Edge Function

```bash
# In Supabase Dashboard → Edge Functions → Secrets, add:
# AI_API_KEY = your Gemini API key
# AI_PROVIDER = gemini

# Then deploy:
supabase functions deploy ai-tutor
```

---

## Current Status

| Component | Status |
|---|---|
| Project scaffolding | ✅ Complete |
| Design system (CSS) | ✅ Complete |
| Landing page | ✅ Complete |
| Login / Signup | ✅ Complete |
| Protected routes | ✅ Complete |
| Dashboard + module cards | ✅ Complete |
| Module configs (all 6) | ✅ Complete |
| Theory rendering | ✅ Complete |
| 3D Scene (R3F) | ✅ Complete |
| Monaco code editor | ✅ Complete |
| useSandbox (code→scene) | ✅ Complete |
| Completion checking | ✅ Complete |
| AI panel UI | ✅ Complete |
| useAI hook | ✅ Complete |
| Edge Function (ai-tutor) | ✅ Complete |
| Supabase client | ✅ Complete |
| Production build | ✅ Verified (0 errors) |
