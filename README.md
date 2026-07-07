# ✳ NoteFlow

A progressive web app for note-taking — sleek, minimal, and offline-first. Rich-text editing, to-do lists, voice recording, camera capture, freehand drawing, AI text assistance, and full offline storage via IndexedDB.

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Dexie](https://img.shields.io/badge/Dexie-4-4B8BBE?logo=javascript&logoColor=white)](https://dexie.org)
[![Zustand](https://img.shields.io/badge/Zustand-5-443E38?logo=react&logoColor=white)](https://github.com/pmndrs/zustand)
[![Framer Motion](https://img.shields.io/badge/Framer_Motion-12-0055FF?logo=framer&logoColor=white)](https://www.framer.com/motion)
[![PWA](https://img.shields.io/badge/PWA-✓-5A0FC8?logo=pwa&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         NoteFlow                             │
│                                                             │
│  ┌──────────────────┐      ┌──────────────────┐            │
│  │   React 19 App   │      │  Service Worker   │            │
│  │  (Vite + PWA)    │      │  (Offline Cache)  │            │
│  └────────┬──────────┘      └────────┬──────────┘            │
│           │                           │                       │
│           └──────────┬────────────────┘                       │
│                      ▼                                       │
│  ┌─────────────────────────────────────────────────┐         │
│  │          IndexedDB (Dexie.js)                    │         │
│  │          Local persistence                        │         │
│  │          No backend required                      │         │
│  └─────────────────────────────────────────────────┘         │
│                                                             │
│  ┌──────────────────────────────────────────────────────────┐│
│  │  External: OpenRouter API  │  Browser APIs: Camera, Mic ││
│  │  (AI text assistance)      │  Canvas, File System       ││
│  └──────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| **React 19** | UI framework |
| **Vite 8** | Build tool & dev server |
| **Tailwind CSS 3** | Utility-first styling |
| **Dexie.js** | IndexedDB wrapper for offline storage |
| **Zustand** | Lightweight state management |
| **Framer Motion** | Page transitions & animations |
| **react-router-dom** | Client-side routing |
| **vite-plugin-pwa** | PWA manifest & service worker |
| **uuid** | Unique note identifiers |
| **oxlint** | Rust-based linter |

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm

### Setup

```bash
# Clone the repository
git clone https://github.com/mtahanaeem/noteflow.git
cd noteflow

# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

Open **http://localhost:5173** in your browser.

---

## 📱 Features

| Feature | Description |
|---|---|
| **Rich-text editor** | Bold, italic, headings, lists, highlight with keyboard shortcuts |
| **To-Do lists** | Check/uncheck items with progress tracking |
| **Voice recording** | Record audio notes via MediaRecorder API with waveform |
| **Camera capture** | In-app camera with front/back toggle, retake flow |
| **Drawing canvas** | Free-draw with 6 colors & 4 brush sizes; handwriting mode |
| **Image insertion** | Upload from gallery or capture from camera |
| **File attachments** | Attach PDFs, docs, images, and audio files |
| **AI text assistance** | Expand, summarize, rephrase, or continue text via OpenRouter |
| **Full-text search** | Search across titles, body text, and tags |
| **Filtering** | Filter by type: All, To-Do, Images, Audio, Files, PDF |
| **Multi-select** | Long-press / right-click to bulk delete |
| **Pin notes** | Pin important notes to the top |
| **Duplicate notes** | Create copies with "(copy)" appended |
| **Dark mode** | Toggle dark/light theme with persistent preference |
| **Auto-save** | Debounced save (1.5s) with "Saved" indicator |
| **Offline-first** | All data stored locally in IndexedDB |
| **PWA installable** | Install on mobile or desktop home screen |
| **RTL support** | Automatic text direction detection |
| **Animated UI** | Glassmorphism design with spring animations |

---

## 📁 Project Structure

```
noteflow/
├── public/
│   ├── favicon.svg
│   ├── icons.svg
│   ├── manifest.json
│   └── icons/
├── src/
│   ├── main.jsx              # React entry point
│   ├── App.jsx               # Root component with routing
│   ├── index.css             # Tailwind + custom styles
│   ├── pages/
│   │   ├── Splash.jsx        # Animated splash screen
│   │   ├── Home.jsx          # Notes grid with filters
│   │   ├── Editor.jsx        # Full note editor
│   │   ├── NoteDetail.jsx    # Read-only note view
│   │   └── Search.jsx        # Full-text search
│   ├── components/
│   │   ├── notes/
│   │   │   ├── NoteCard.jsx  # Note card display
│   │   │   └── Waveform.jsx  # Audio waveform
│   │   └── ui/
│   │       ├── AIAssistPanel.jsx   # AI text assistant
│   │       ├── CameraModal.jsx     # Camera capture
│   │       ├── DrawModal.jsx       # Drawing canvas
│   │       ├── FloatingActionBar.jsx # Bottom action bar
│   │       ├── GlassCard.jsx       # Glassmorphism card
│   │       └── PillButton.jsx     # Filter button
│   ├── hooks/
│   │   └── useAutoSave.js    # Auto-save hook
│   ├── services/
│   │   └── ai.js             # OpenRouter API client
│   └── store/
│       └── useNotesStore.js  # Zustand store + Dexie CRUD
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── README.md
```

---

## 🌐 PWA Features

| Feature | Implementation |
|---|---|
| **Manifest** | Web app manifest with icons, theme color, display mode |
| **Service Worker** | Auto-generated via vite-plugin-pwa with Workbox |
| **Offline support** | Google Fonts cached; app shell available offline |
| **Install prompt** | Mobile & desktop installable via beforeinstallprompt |
| **Icons** | SVG icons at 192x192 and 512x512 |

---

## 📝 Pages

| Page | Route | Description |
|---|---|---|
| **Splash** | `/` | Animated welcome screen (first visit only) |
| **Home** | `/home` | Notes grid with filter pills & FAB |
| **Editor** | `/note/:id` | Rich-text editor with auto-save |
| **Note Detail** | `/note/:id/view` | Read-only note viewer |
| **Search** | `/search` | Full-text search across all notes |

---

## 🔧 Troubleshooting

| Issue | Solution |
|---|---|
| Camera not working | Ensure browser has camera permissions; app falls back to file picker |
| Audio recording fails | Check microphone permissions in browser settings |
| App not installing | Open in Chrome/Edge; ensure HTTPS or localhost |
| IndexedDB cleared | Data is stored in browser storage; clearing site data removes notes |
| AI assistance fails | Check OpenRouter API key in `src/services/ai.js` |

---

## 👤 Author

- Muhammad Taha

---

**Your sleek, minimal notes app — where ideas flow.**
