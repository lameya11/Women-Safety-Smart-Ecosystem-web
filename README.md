<<<<<<< HEAD
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
=======
# 🛡️ SafeGuard — Women Safety Smart Ecosystem

A complete, hackathon-ready women's safety application with proactive Prevention, Detection, and Response capabilities.

---

## 🌐 Live Demo

| Service | URL |
|---------|-----|
| **Frontend** | Deploy to Netlify: [Instructions Below](#deployment) |
| **Backend API** | Deploy to Render: [Instructions Below](#deployment) |
| **API Health** | `https://your-backend.onrender.com/health` |

---

## 🎯 Features

### Core MVP
- ✅ **User Dashboard** — Status, risk score, SOS button, contacts summary
- ✅ **Safety Map** — Leaflet/OpenStreetMap with danger zones, risk heatmap, community reports
- ✅ **SOS Emergency** — One-tap SOS with countdown confirmation, GPS, alarm
- ✅ **Trusted Contacts** — Add/edit/delete emergency contacts
- ✅ **Travel Safety Mode** — Periodic check-ins, auto-SOS on no response
- ✅ **Safety Reports** — Community crowdsourced unsafe area reporting
- ✅ **Alert History** — Full SOS history with risk scores
- ✅ **Fake Incoming Call** — Realistic escape mechanism screen
- ✅ **Demo Mode** — Hackathon demo controls for all scenarios
- ✅ **AI Risk Engine** — Rule-based risk scoring (0–100) with explainable factors

### Detection Module
- ✅ **Shake-to-SOS** — Accelerometer shake detection
- ✅ **Sudden Movement** — Unusual acceleration patterns
- ✅ **Inactivity Detection** — Long stillness triggers safety check
- ✅ **Emergency Countdown** — 10-second cancellable countdown before SOS
- ✅ **Configurable Sensitivity** — Low / Medium / High thresholds

### Response Module
- ✅ **GPS Location** — Live location tracking and backend updates
- ✅ **Emergency Alarm** — Web Audio API generated alarm (no files needed)
- ✅ **Fake Call Screen** — Accept/decline with ringtone
- ✅ **Emergency Helplines** — Police 100, Women Helpline 1091, Emergency 112
- ✅ **[SIMULATED] SMS/WhatsApp** — Twilio integration ready (demo mode)

---

## 🏗️ Architecture

```
safeguard/
├── backend/                    # Node.js + Express API
│   ├── src/
│   │   ├── config/
│   │   │   └── firebase.js     # Firebase Admin SDK init
│   │   ├── middleware/
│   │   │   └── auth.js         # JWT authentication
│   │   ├── routes/
│   │   │   ├── auth.js         # Register/login/profile
│   │   │   ├── contacts.js     # Trusted contacts CRUD
│   │   │   ├── sos.js          # SOS creation/management
│   │   │   ├── location.js     # GPS location updates
│   │   │   ├── reports.js      # Safety reports
│   │   │   └── risk.js         # Risk calculation endpoint
│   │   ├── services/
│   │   │   ├── dataStore.js    # Firebase/in-memory abstraction
│   │   │   └── riskEngine.js   # AI/rule-based risk engine
│   │   └── server.js           # Main Express app
│   ├── .env.example
│   └── package.json
│
├── frontend/                   # React SPA
│   ├── src/
│   │   ├── context/
│   │   │   └── AppContext.js   # Global state (auth, SOS, location, risk)
│   │   ├── pages/
│   │   │   ├── Dashboard.js    # Home dashboard
│   │   │   ├── SafetyMap.js    # Interactive map
│   │   │   ├── SOSPage.js      # Emergency SOS
│   │   │   ├── TrustedContacts.js
│   │   │   ├── TravelSafety.js # Travel mode
│   │   │   ├── SafetyReports.js
│   │   │   ├── AlertHistory.js
│   │   │   ├── SettingsPage.js
│   │   │   └── DemoMode.js     # Hackathon demo controls
│   │   ├── components/
│   │   │   ├── TopNav.js
│   │   │   ├── BottomNav.js
│   │   │   ├── EmergencyCountdown.js  # Countdown modal
│   │   │   ├── SOSOverlay.js          # Full-screen SOS
│   │   │   ├── FakeCallScreen.js      # Fake call UI
│   │   │   ├── NotificationToast.js
│   │   │   ├── RiskScoreRing.js
│   │   │   ├── QuickActions.js
│   │   │   ├── LocationCard.js
│   │   │   └── RecentAlerts.js
│   │   ├── services/
│   │   │   ├── api.js           # Axios API client
│   │   │   ├── sensorService.js # Accelerometer/motion
│   │   │   ├── locationService.js # GPS tracking
│   │   │   └── audioService.js  # Alarm/ringtone
│   │   ├── styles/
│   │   │   └── global.css       # Mobile-first dark theme
│   │   └── App.js               # Router + layout
│   └── package.json
│
├── netlify.toml                 # Frontend deployment config
├── render.yaml                  # Backend deployment config
└── README.md
```

---

## 🚀 Local Development Setup

### Prerequisites
- Node.js 18+
- npm 8+

### 1. Clone & Install

```bash
# Clone the repository
git clone <your-repo-url>
cd women-safety

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Configure Backend Environment

```bash
cd backend
cp .env.example .env
```

Edit `.env`:

```env
PORT=5000
NODE_ENV=development
JWT_SECRET=your-super-strong-secret-key-change-this
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:3000

# Firebase (optional - falls back to in-memory if not set)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY_ID=your-key-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@your-project.iam.gserviceaccount.com
FIREBASE_DATABASE_URL=https://your-project-rtdb.firebaseio.com
```

**Note:** The app works without Firebase using an in-memory store (demo mode). Firebase adds persistence across restarts.

### 3. Configure Frontend Environment

```bash
cd frontend
cp .env.example .env.local
```

Edit `.env.local`:

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_NAME=SafeGuard
```

### 4. Start Both Servers

**Terminal 1 — Backend:**
```bash
cd backend
npm run dev
# API running at http://localhost:5000
# Health check: http://localhost:5000/health
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm start
# App running at http://localhost:3000
```

---

## 🌐 Deployment (Public Access)

### Option A: Netlify (Frontend) + Render (Backend) — Recommended Free Tier

#### Step 1: Deploy Backend to Render.com

1. Go to [render.com](https://render.com) → New Web Service
2. Connect your GitHub repository
3. Configure:
   - **Root Directory:** `backend`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Region:** Oregon (or nearest)
4. Add Environment Variables in Render Dashboard:
   ```
   NODE_ENV=production
   JWT_SECRET=<generate-strong-secret>
   FRONTEND_URL=https://your-app.netlify.app
   PORT=10000
   ```
5. Deploy → Get your URL: `https://your-app.onrender.com`

#### Step 2: Deploy Frontend to Netlify

1. Go to [netlify.com](https://netlify.com) → New Site
2. Connect GitHub repo
3. Configure:
   - **Base directory:** `frontend`
   - **Build command:** `npm run build`
   - **Publish directory:** `frontend/build`
4. Add Environment Variables in Netlify Dashboard:
   ```
   REACT_APP_API_URL=https://your-app.onrender.com/api
   ```
5. Deploy → Get your URL: `https://your-app.netlify.app`

#### Step 3: Update CORS

In Render dashboard, update `FRONTEND_URL`:
```
FRONTEND_URL=https://your-app.netlify.app
```

### Option B: Vercel (Both)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy backend
cd backend
vercel --prod

# Deploy frontend
cd ../frontend
REACT_APP_API_URL=https://your-backend.vercel.app/api vercel --prod
```

### Option C: Railway.app

1. Create project at [railway.app](https://railway.app)
2. Deploy backend as Node.js service
3. Deploy frontend as static site
4. Configure environment variables in Railway dashboard

---

## 🔐 Security Configuration

### CORS
Backend automatically allows origins matching:
- Configured `FRONTEND_URL` environment variable
- `*.vercel.app`, `*.netlify.app`, `*.render.com`, `*.railway.app`
- `localhost:3000`, `localhost:5173` (development)

### Authentication
- JWT tokens with configurable expiry (default 7 days)
- Passwords hashed with bcrypt (12 rounds)
- Token required for all private endpoints

### Rate Limiting
- Global: 200 requests per 15 minutes
- Auth endpoints: 20 requests per 15 minutes

### What Is Never Exposed
- Passwords (hashed, never returned)
- Other users' private data
- API keys or secrets
- Database credentials
- Internal service URLs

---

## 🗄️ Database Setup

### Firebase Firestore (Recommended for Production)

1. Create project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable Firestore Database
3. Create service account: Settings → Service Accounts → Generate New Private Key
4. Add credentials to backend `.env`:
   ```env
   FIREBASE_PROJECT_ID=your-project-id
   FIREBASE_PRIVATE_KEY_ID=your-key-id
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
   FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
   FIREBASE_DATABASE_URL=https://your-project-rtdb.firebaseio.com
   ```
5. Set Firestore security rules (optional for server-side only access):
   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /{document=**} {
         allow read, write: if false; // Server-side only
       }
     }
   }
   ```

### Collections Created Automatically
- `users` — User accounts and profiles
- `trusted_contacts` — Emergency contacts per user
- `sos_alerts` — SOS events with location and risk data
- `location_updates` — Live GPS tracking
- `safety_reports` — Community unsafe area reports
- `danger_zones` — Seeded risk zones
- `emergency_events` — Audit log

### In-Memory Fallback (Demo/Dev)
If Firebase credentials are not configured, the app automatically uses in-memory storage. Data is lost on restart but fully functional for demos.

---

## 📱 API Reference

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Login → JWT token |
| GET | `/api/auth/me` | Get current user |
| PUT | `/api/auth/profile` | Update profile |

### SOS
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/sos` | Activate SOS |
| GET | `/api/sos/active` | Get active SOS |
| GET | `/api/sos/history` | SOS history |
| PUT | `/api/sos/:id/cancel` | Cancel SOS |
| PUT | `/api/sos/:id/resolve` | Mark resolved |

### Location
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/location` | Update GPS location |
| GET | `/api/location/current` | Latest location |
| GET | `/api/location/history` | Location trail |
| GET | `/api/location/track/:userId` | Track user (trusted contacts) |

### Reports & Map
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/reports` | All safety reports |
| POST | `/api/reports` | Submit report |
| GET | `/api/reports/danger-zones` | Danger zone list |
| GET | `/api/reports/nearby?lat=&lng=` | Nearby reports |
| POST | `/api/risk/calculate` | Calculate risk score |

---

## 🎮 Hackathon Demo Scenario

**End-to-end demo flow (5 minutes):**

1. Open public link on phone/laptop → Demo account auto-login
2. Navigate to **Demo Mode** page
3. Press **"Simulate Unsafe Location"** → Risk score jumps to HIGH, map updates
4. Press **"Start Travel Safety Mode"** → Travel mode activates, countdown starts
5. Press **"Simulate Shake Detection"** → Emergency countdown appears (10 seconds)
6. **Do not press "I'm Safe"** → SOS activates automatically
7. Show **SOS screen** — alarm plays, contacts shown, GPS displayed
8. Press **"Trigger Fake Call"** — Realistic incoming call screen appears
9. Accept the call → escape mechanism demonstrated
10. Press **"I'm Safe — Cancel SOS"** → Returns to safe state

**Demo Mode badge** appears on all simulated actions so judges can distinguish real from mocked features.

---

## ⚙️ Feature Status

| Feature | Status | Notes |
|---------|--------|-------|
| User auth (register/login) | ✅ Real | JWT + bcrypt |
| GPS location tracking | ✅ Real | Browser Geolocation API |
| Safety map with zones | ✅ Real | Leaflet + OpenStreetMap |
| Risk engine | ✅ Real | Rule-based, pluggable ML |
| SOS activation | ✅ Real | Backend persisted |
| Trusted contacts | ✅ Real | Full CRUD |
| Travel safety mode | ✅ Real | Timer-based check-ins |
| Community reports | ✅ Real | Backend persisted |
| Shake detection | ✅ Real | Device motion API |
| Emergency alarm | ✅ Real | Web Audio API |
| Fake call screen | ✅ Real | Web Audio API ringtone |
| SMS/WhatsApp alerts | ⚠️ Simulated | Needs Twilio credentials |
| Audio recording | ⚠️ Simulated | Requires microphone permission |
| Video recording | ⚠️ Simulated | Requires camera permission |
| Police API | ⚠️ Simulated | No public police API available |
| Push notifications | ⚠️ Simulated | Needs Firebase Cloud Messaging |

---

## 📱 Testing on Devices

### On a Mobile Phone
1. Open the public URL in Chrome/Safari
2. Allow location permission when prompted
3. Allow motion permission (iOS: tap prompt)
4. Enable Safety Mode on dashboard
5. Test shake detection by shaking the phone
6. Test fake call from Quick Actions

### On a Laptop/Desktop
1. Open the public URL in any modern browser
2. Allow location (simulated via IP if GPS unavailable)
3. Use Demo Mode for all sensor simulations
4. Test all features via keyboard and mouse

### Browser Support
- Chrome 90+ ✅
- Firefox 90+ ✅
- Safari 14+ ✅ (iOS motion requires HTTPS)
- Edge 90+ ✅

**Note:** HTTPS is required for GPS and motion sensors in production. Render.com and Netlify provide free HTTPS automatically.

---

## 🔧 Real Integration Setup (Post-Hackathon)

### Twilio (SMS Alerts)
```bash
npm install twilio
```
```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_PHONE_NUMBER=+1234567890
```

### Firebase Cloud Messaging (Push Notifications)
```bash
npm install firebase
```
Configure in Firebase Console → Cloud Messaging

### Google Maps (Replace OpenStreetMap)
```env
REACT_APP_GOOGLE_MAPS_KEY=AIzaSy...
>>>>>>> 4ef9d0960db7756cd33cefba68f0a19ba6b5e4c6
```

---

<<<<<<< HEAD
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
=======
## 🛠️ Development Scripts

```bash
# Backend
npm run dev      # Start with nodemon (hot reload)
npm start        # Production start

# Frontend
npm start        # Development server (http://localhost:3000)
npm run build    # Production build
npm test         # Run tests
```

---

## 🔒 Privacy & Security Notes

- User locations are only accessible to the user and their trusted contacts
- Emergency GPS coordinates are shared only when SOS is active
- Community reports are anonymized (no user identity attached)
- All API communication over HTTPS in production
- Passwords never stored in plaintext
- JWT tokens expire after 7 days
- Sensitive recordings would need explicit user consent and auto-deletion policy

---

## 📄 License

Built for hackathon demonstration purposes. All rights reserved.

---

**SafeGuard** — *Proactive Prevention. Smart Detection. Swift Response.*
>>>>>>> 4ef9d0960db7756cd33cefba68f0a19ba6b5e4c6
