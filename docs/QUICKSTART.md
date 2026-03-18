# Orivé — Quick Start Guide

## Prerequisites
- Python 3.11+
- Node.js 18+
- npm

## Setup (5 minutes)

### 1. Backend

```bash
cd backend
python -m venv .venv

# Windows:
.venv\Scripts\activate

# macOS/Linux:
source .venv/bin/activate

pip install -U pip
pip install -e .

# Create .env file
copy .env.example .env    # Windows
# cp .env.example .env    # macOS/Linux

# Run backend
uvicorn app.main:app --reload --port 8000
```

### 2. Frontend (in a new terminal)

```bash
cd frontend
npm install
npm run dev
```

The frontend runs on **http://localhost:3000** by default.

### 3. Open the App

1. Go to **http://localhost:3000** — you'll see the Orivé landing page
2. Click **Get Started** to register a new account
3. Complete the 3-step onboarding (Basics → Body Profile → Style Preferences)
4. You'll land on the Dashboard

## Demo Accounts (Auto-Seeded)

The app auto-seeds 3 fully populated demo accounts on first startup. Each has a complete wardrobe (~24 items with placeholder images), colour analysis, occasions, and playbooks.

| Name | Email | Password | City | Colour Season | Wardrobe |
|------|-------|----------|------|---------------|----------|
| **Sarah Belete** | `sarah@orive.com` | `Test1234` | London | Warm Autumn | 24 items (tailored, corporate chic) |
| **Nate Belete** | `nate@orive.com` | `Test1234` | New York | Cool Winter | 23 items (classic menswear) |
| **Duduzile Jele** | `duduzile@orive.com` | `Test1234` | San Francisco | Deep Winter | 24 items (bold minimalist) |

Each account also has:
- 5-6 occasions (mix of past, upcoming, and far-future events)
- 3 pre-generated playbooks (for their highest-importance upcoming occasions)
- Full 12-season colour palette with best colours, neutrals, colours to avoid, and styling tips
- Completed onboarding profile (body type, style preferences, go-tos/no-goes)

> **To reset demo data:** Delete `backend/data/app.db` and `backend/data/uploads/wardrobe/`, then restart the backend. Fresh data will auto-seed.

## Features Available Today

| Feature | How to Access | Notes |
|---------|--------------|-------|
| **Landing page** | `/` | Public, redirects to dashboard if logged in |
| **Register** | `/register` | Creates account + redirects to onboarding |
| **Login** | `/login` | Email/password auth |
| **Password reset** | `/forgot-password` | Reset link printed to backend terminal (no email yet) |
| **Onboarding** | `/onboarding` | 3-step wizard (auto-redirected after register) |
| **Dashboard** | `/dashboard` | Real-data stats, next occasion hero card, quick actions, recent activity feed |
| **Wardrobe** | `/wardrobe` | Upload photos (drag-drop or click), AI auto-tags items, filter/search/edit, colour palette badges |
| **Colour Analysis** | `/colour-analysis` | Upload face photo → 12-season palette, colour swatches, wardrobe harmony score |
| **Occasions** | `/occasions` | 3-step creation wizard, status tabs, countdown, importance, inline edit/delete |
| **Occasion Detail** | `/occasions/[id]` | Full detail grid, inline editing, delete, playbook CTA |
| **Playbooks** | `/playbooks/[occasionId]` | 4-tab view: LOOK (3 outfits + upgrades), PREP (timeline + checklists), PRESENCE (coaching + pep talk), BEAUTY |
| **Settings** | `/settings` | 3-tab profile editor (Personal, Style Preferences, Account) |
| **Virtual Try-On** | `/virtual-try-on` | Coming soon (needs Fashn.ai API key — ACT-02) |

## Environment Variables

Copy `backend/.env.example` to `backend/.env` and configure:

```env
# Required
APP_ENV=local
DATABASE_URL=sqlite:///./data/app.db
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
JWT_SECRET_KEY=orive-dev-secret-change-in-production

# AI features (optional — app works without these using mock data)
AI_MODE=mock          # Change to "llm" to use real AI
OPENAI_API_KEY=       # Required when AI_MODE=llm
OPENAI_MODEL=gpt-4o-mini
```

### Enabling Real AI Features

To switch from mock data to real AI-powered features:

1. Get an OpenAI API key from https://platform.openai.com/api-keys
2. In `backend/.env`, set:
   ```
   AI_MODE=llm
   OPENAI_API_KEY=sk-your-key-here
   ```
3. Restart the backend

This enables:
- Real garment auto-tagging (GPT-4 Vision analyzes uploaded photos)
- Real colour analysis (GPT-4 Vision determines your seasonal palette)
- AI-powered playbook generation

## API Documentation

With the backend running, visit **http://localhost:8000/docs** for the interactive Swagger UI showing all API endpoints.

## Common Issues

| Problem | Solution |
|---------|----------|
| **CORS errors** | Make sure `CORS_ORIGINS` in `.env` includes your frontend URL |
| **Port in use** | Change ports in the commands or config |
| **Database errors** | Delete `backend/data/app.db` to reset (loses all data) |
| **"next" not found** | Run `npm install` in the `frontend/` directory |
| **bcrypt errors** | Ensure `bcrypt==4.2.1` is installed: `pip install bcrypt==4.2.1` |
| **Password reset link** | Check the backend terminal output — links are printed there (no email in local dev) |

## Project Structure

```
Style/
├── backend/
│   ├── app/
│   │   ├── auth/          # JWT auth, login, register, password reset
│   │   ├── routers/       # API routes (closet, occasions, playbooks, colour, feedback)
│   │   ├── services/      # Storage, AI tagger, colour analysis
│   │   ├── ai/            # Playbook generation
│   │   ├── models.py      # Database models (User, ClosetItem, Occasion, Playbook, Feedback)
│   │   ├── main.py        # FastAPI app entry point
│   │   └── settings.py    # Environment config
│   ├── data/uploads/      # Uploaded images (local storage)
│   └── .env.example       # Environment template
├── frontend/
│   ├── app/               # Next.js pages (App Router)
│   │   ├── components/    # Shared UI (AppShell, Loading, ErrorState, EmptyState, Logo)
│   │   ├── dashboard/     # Dashboard with real data
│   │   ├── wardrobe/      # Wardrobe management + colour badges
│   │   ├── colour-analysis/ # 12-season colour palette analysis
│   │   ├── occasions/     # Occasion wizard, list, detail, edit
│   │   ├── playbooks/     # 4-tab playbook viewer (LOOK/PREP/PRESENCE/BEAUTY)
│   │   ├── settings/      # Profile settings (3-tab editor)
│   │   └── ...
│   ├── lib/               # API client, auth context, hooks, utilities
│   └── tailwind.config.js # Orivé design tokens
├── IMPLEMENTATION.md      # Living implementation plan & progress tracker
├── LAYOUTS.md             # Screen inventory & design system documentation
├── QUESTIONS_FOR_PM.md    # PM action items, API keys needed, open questions
└── QUICKSTART.md          # This file
```
