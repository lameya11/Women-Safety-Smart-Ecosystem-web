# SHE SAFE — Women Safety Smart Ecosystem

A complete, hackathon-ready women safety web application with 12 screens, real authentication, SOS workflows, trusted contacts, travel safety mode, and a demo mode for presentations.

**Production URL:** https://safegaurd-women-safety.vercel.app  
**Tech Stack:** React 18 · TypeScript · Tailwind CSS · Vite · React Router v6

---

## Quick Start

```bash
# Install dependencies
npm install

# Start development server (http://localhost:5173)
npm run dev

# Production build
npm run build

# Preview production build locally
npm run preview
```

---

## Environment Variables

Copy `.env.example` to `.env` and configure:

| Variable | Required | Purpose |
|---|---|---|
| `VITE_GOOGLE_MAPS_API_KEY` | Optional | Interactive map on the Safety Map screen. Without it, a simulated map placeholder is shown. |
| `VITE_FIREBASE_API_KEY` | Optional | Google Sign-In and real-time data sync via Firebase. Without it, local auth works fully. |
| `VITE_FIREBASE_AUTH_DOMAIN` | Optional | Firebase auth domain |
| `VITE_FIREBASE_PROJECT_ID` | Optional | Firebase project ID |
| `VITE_FIREBASE_APP_ID` | Optional | Firebase app ID |
| `VITE_TWILIO_ACCOUNT_SID` | Optional | SMS to trusted contacts during SOS. Without it, contact alerts are queued locally only. |
| `VITE_TWILIO_AUTH_TOKEN` | Optional | Twilio auth token |
| `VITE_TWILIO_PHONE_NUMBER` | Optional | Twilio sender number |
| `VITE_APP_URL` | Recommended | App base URL for sharing/PWA |

> **Security note:** All `VITE_` variables are bundled into client JS. Never put private server secrets in `VITE_` variables. Twilio credentials should be handled server-side via a backend API.

---

## Application Screens (12 total)

| # | Screen | Route | Status |
|---|---|---|---|
| 1 | Welcome / Landing | `/` | ✅ Complete |
| 2 | Login | `/login` | ✅ Complete |
| 2 | Registration | `/register` | ✅ Complete (preserved route) |
| 3 | Safety Dashboard | `/dashboard` | ✅ Complete |
| 4 | Safety Map | `/map` | ✅ Complete (simulated risk data) |
| 5 | Safety Check | `/safety-check` | ✅ Complete |
| 6 | SOS Emergency | `/sos` | ✅ Complete |
| 7 | Trusted Contacts | `/contacts` | ✅ Complete |
| 8 | Travel Safety Mode | `/travel` | ✅ Complete |
| 9 | Fake Incoming Call | `/fake-call` | ✅ Complete |
| 10 | Alert History | `/history` | ✅ Complete |
| 11 | Settings | `/settings` | ✅ Complete |
| 12 | Demo Mode | `/demo` | ✅ Complete |

---

## Feature Notes & Limitations

### What works without any API keys
- Full registration/login/logout flow with local storage auth
- Safety status (SAFE/CAUTION/DANGER) display and toggle
- SOS press-and-hold activation (3 seconds) → SOS screen
- Safety Check countdown (10 seconds) with I'm Safe / SOS Now
- Trusted contacts — Add, Edit, Delete with validation
- Travel Safety Mode — countdown timer, check-in, escalation
- Alert History — logged events with filter and resolve actions
- Settings — dark mode, notifications toggle, profile editing
- Demo Mode — 6 simulations with clear labeling, reset state
- Fake Incoming Call with accept/decline/end-call simulation
- Simulated Safety Map with 5 risk zone cards

### What requires API configuration
- **Real interactive map** — requires `VITE_GOOGLE_MAPS_API_KEY`
- **Google Sign-In** — requires Firebase configuration
- **SMS contact alerts during SOS** — requires Twilio (server-side integration recommended)
- **Password reset emails** — requires email service backend
- **Background timer (Travel Mode)** — browser limitation; app must remain open

### Important safety disclaimers built into the app
- SOS screen: does NOT auto-call emergency services. Always call 112 directly.
- Contact notifications: require SMS backend, clearly labeled as "Pending" without it
- Audio recording: stays in browser, upload requires backend
- Map risk data: clearly labeled "SIMULATED DATA"
- Demo Mode: clearly labeled, never contacts real services

---

## Deployment to Existing Vercel Project

### ⚠️ Important: Existing Project at https://safegaurd-women-safety.vercel.app

The Vercel project and GitHub repository were not accessible from this environment. The application has been built locally. To deploy to the **existing** Vercel project without creating a new one:

#### Option A: Deploy via existing GitHub repository (recommended)
1. Push this code to the GitHub repository connected to the existing Vercel project:
   ```bash
   git init  # if needed
   git remote add origin <YOUR_EXISTING_GITHUB_REPO_URL>
   git add .
   git commit -m "Build: SHE SAFE complete application v1.0"
   git push origin main
   ```
2. Vercel will auto-deploy via the existing GitHub integration.
3. The domain `safegaurd-women-safety.vercel.app` is preserved automatically.

#### Option B: Deploy via Vercel CLI to existing project
```bash
# Install Vercel CLI if not installed
npm install -g vercel

# Login to Vercel
vercel login

# Link to the existing project (do NOT create a new project)
vercel link --project safegaurd-women-safety

# Deploy to production
vercel --prod
```
When prompted "Set up and deploy?", select the **existing project** not "Create a new project".

#### Option C: Manual upload
1. Run `npm run build`
2. Go to https://vercel.com/dashboard → your project `safegaurd-women-safety`
3. Click "Deploy" → drag and drop the `dist/` folder

### Environment Variables on Vercel
Add in Vercel Dashboard → Project → Settings → Environment Variables:
- `VITE_GOOGLE_MAPS_API_KEY` (optional)
- `VITE_FIREBASE_API_KEY` (optional)
- (other optional vars from .env.example)

### vercel.json
The included `vercel.json` configures SPA routing (all paths → `index.html`) and security headers. It works for all React Router v6 routes.

---

## Architecture

```
src/
├── context/
│   ├── AuthContext.tsx      # User auth, settings, localStorage persistence
│   └── SafetyContext.tsx    # Safety status, location, SOS, contacts, alerts
├── pages/
│   ├── WelcomePage.tsx
│   ├── LoginPage.tsx
│   ├── RegisterPage.tsx
│   ├── DashboardPage.tsx
│   ├── MapPage.tsx
│   ├── SafetyCheckPage.tsx
│   ├── SOSPage.tsx
│   ├── ContactsPage.tsx
│   ├── TravelSafetyPage.tsx
│   ├── FakeCallPage.tsx
│   ├── HistoryPage.tsx
│   ├── SettingsPage.tsx
│   └── DemoPage.tsx
├── components/
│   ├── BottomNav.tsx        # 5-tab persistent navigation
│   ├── PageLayout.tsx       # Header + content wrapper
│   └── ProtectedRoute.tsx   # Auth guard
├── types/
│   └── index.ts             # All TypeScript interfaces
└── utils/
    └── storage.ts           # localStorage wrapper with prefix
```

---

## Test Checklist

- [x] Build passes (`npm run build`) — 0 errors
- [x] `/register` route accessible (preserved requirement)
- [x] Register → Login → Dashboard flow
- [x] SOS press-and-hold (3s) → navigates to SOS screen
- [x] Safety Check countdown → I'm Safe cancels, expires triggers SOS
- [x] Add/Edit/Delete trusted contacts
- [x] Travel mode start → check-in → stop
- [x] Alert history loads real records, empty state when none
- [x] Demo Mode 6 simulations — clearly labeled
- [x] Fake call accept/decline/end
- [x] Settings dark mode toggle persists
- [x] Bottom navigation all 5 tabs work
- [x] Responsive layout (mobile-first)
- [x] `vercel.json` SPA routing for all paths
