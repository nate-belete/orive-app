# Questions & Action Items for Product Manager (Duduzile)

> Running list of items that need clarification or action from the product owner.
> Reference: `Orivè Spec/Orive_Functional Specification v1.docx`

---

## PM Action Items — Keys, Accounts & Assets Needed

These are things we need from the PM to unlock features that are currently running on **mock/placeholder** mode. The app works without them, but real AI features require the keys below.

| # | Item Needed | What It Unblocks | Urgency | Status |
|---|-------------|------------------|---------|--------|
| **ACT-01** | **OpenAI API Key** | AI garment tagging (Phase C), Colour analysis (Phase D), Playbook generation (Phase F). Currently running in `mock` mode with sample data. Set `AI_MODE=llm` and `OPENAI_API_KEY=sk-...` in `backend/.env` | **HIGH** — needed to test real AI features | NEEDED |
| **ACT-02** | **Fashn.ai API Key** | Virtual try-on (Phase F3). Not built yet but endpoint will need `FASHN_API_KEY` env var. Sign up at fashn.ai. $0.075/image, no subscription. | MEDIUM — Phase F | NEEDED |
| **ACT-03** | **Google OAuth Client ID + Secret** | Google social login (Phase A6, deferred). Requires Google Cloud Console project + OAuth consent screen. Need `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`. | LOW — deferred feature | NEEDED |
| **ACT-04** | **Google Calendar API credentials** | Calendar import/sync for occasions (Phase E4). Requires Google Cloud Console + Calendar API enabled. Need OAuth credentials or service account. | MEDIUM — Phase E | NEEDED |
| **ACT-05** | **AWS account + SES setup** | Real email delivery (password reset, notifications). Currently printing reset links to server console. Need AWS credentials + verified SES domain/sender. | LOW — local dev works without it | NEEDED |
| **ACT-06** | **AWS S3 bucket** | Production image storage. Currently using local filesystem (`backend/data/uploads/`). Need S3 bucket name + IAM credentials for production deploy. | LOW — only for deployment | NEEDED |
| **ACT-07** | **Brand photography / hero images** | Landing page hero image, marketing assets. Currently using placeholder text. Need approved brand photos or stock image license. | LOW — cosmetic | NEEDED |
| **ACT-08** | **Weather API key** (optional) | Weather widget on occasion detail (Phase E). OpenWeatherMap free tier is sufficient. Need `WEATHER_API_KEY`. | LOW — nice-to-have | NEEDED |
| **ACT-09** | **Domain name + hosting** | Production deployment. Need domain (e.g., `app.orive.com`), SSL cert, DNS config. | LOW — post-MVP | NEEDED |
| **ACT-10** | **JWT Secret (production)** | Auth security. Currently using a dev placeholder. Need a strong random secret for production. Generate with: `openssl rand -hex 32` | MEDIUM — before deploy | NEEDED |

### How to Activate AI Features (for testing)

1. Get an OpenAI API key from https://platform.openai.com/api-keys
2. Create `backend/.env` file (copy from `backend/.env.example`)
3. Set these values:
   ```
   AI_MODE=llm
   OPENAI_API_KEY=sk-your-key-here
   ```
4. Restart the backend — AI tagging and colour analysis will use real GPT-4 Vision

### Current Environment Variables

| Variable | Description | Default | Required For |
|----------|-------------|---------|-------------|
| `APP_ENV` | Environment (`local` / `production`) | `local` | Always |
| `DATABASE_URL` | SQLite/Postgres connection string | `sqlite:///./data/app.db` | Always |
| `CORS_ORIGINS` | Allowed frontend origins (comma-separated) | `http://localhost:3000,http://localhost:5173` | Always |
| `JWT_SECRET_KEY` | Secret for signing JWT tokens | Dev placeholder | Always (change for prod!) |
| `AI_MODE` | AI service mode (`mock` / `llm`) | `mock` | AI features |
| `LLM_PROVIDER` | AI provider (`openai`) | `openai` | AI features |
| `OPENAI_API_KEY` | OpenAI API key | None | AI features (when `AI_MODE=llm`) |
| `OPENAI_MODEL` | OpenAI model name | `gpt-4o-mini` | AI features |
| `FASHN_API_KEY` | Fashn.ai API key | None | Virtual try-on (future) |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | None | Google login (future) |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | None | Google login (future) |
| `AWS_ACCESS_KEY_ID` | AWS IAM access key | None | S3 + SES (production) |
| `AWS_SECRET_ACCESS_KEY` | AWS IAM secret key | None | S3 + SES (production) |
| `AWS_S3_BUCKET` | S3 bucket name | None | Image storage (production) |
| `AWS_SES_REGION` | AWS SES region | None | Email (production) |
| `WEATHER_API_KEY` | OpenWeatherMap API key | None | Weather widget (future) |

---

## Status Key
- **OPEN** — Needs answer before we reach that phase
- **ANSWERED** — Resolved
- **DEFERRED** — Parked for later phase

---

## Authentication & Users

| # | Question | Context | Phase | Status |
|---|----------|---------|-------|--------|
| PM-01 | **Session limits**: FRS says "maximum 3 active sessions per user" — is that still the desired limit, or should we allow unlimited? | FRS FR-UM-04 mentions this but marks it as "I don't know what best practice is" | A | OPEN |
| PM-02 | **Apple Sign-In**: Requires Apple Developer Program ($99/year). When should we prioritize this? | FRS FR-UM-02 lists it as required on iOS. We're web-only for now. | A | DEFERRED |
| PM-03 | **Password max length**: FRS says 12 characters max. Industry standard is 64-128 chars. Should we increase? 12 is unusually short. We've implemented 128 char max. | FRS FR-UM-03 | A | ANSWERED (implemented 128) |
| PM-04 | **Rate limiting specifics**: FRS suggests 5 failed logins per 15 min then 15-min lockout. Is this still desired? | FRS FR-UM-08 marks this as "not sure what best practice is" | A | OPEN |

## Onboarding & Profile

| # | Question | Context | Phase | Status |
|---|----------|---------|-------|--------|
| PM-05 | **Minimum age**: FRS says 16 years. Should this be 13 (COPPA) or 18? Different compliance requirements. | FRS FR-UP-01 | B | OPEN |
| PM-06 | **Address lookup provider**: FRS suggests Google Places API for postcode → address. Are there budget constraints for this API? | FRS FR-UP-01 | B | OPEN |
| PM-07 | **Body type illustrations**: The spec references body type illustrations (Hourglass, Triangle, etc.). Do we have licensed illustrations, or should we create/source them? | FRS FR-UP-02, Style DNA competitor screenshot | B | OPEN |
| PM-08 | **What is Step 4 vs Step 5?**: The Lovable onboarding has 5 steps. We've implemented 3 (Basics, Body, Style). Should we add dedicated photo upload steps? | FRS 4.2, Lovable shows 5 dots | B | OPEN |
| PM-09 | **Photo requirements**: Implemented min 640x480, max 10MB, JPEG/PNG/WebP. Does PM want different limits? | FRS FR-UP-03, FR-WM-01 | B | ANSWERED (implemented defaults) |

## Wardrobe

| # | Question | Context | Phase | Status |
|---|----------|---------|-------|--------|
| PM-10 | **Garment subcategories**: Currently using top-level categories (top, bottom, dress, outerwear, shoes, accessory, bag, jewellery). Should we add subcategories? | FRS FR-WM-02 | C | OPEN |
| PM-11 | **Brand detection**: AI attempts brand detection from photos (accuracy varies). Currently working in mock mode. Will need real OpenAI key to test accuracy. | FRS FR-WM-02 | C | OPEN (needs ACT-01) |
| PM-12 | **Wardrobe item limit**: No limit currently. Should we set one for Phase 1? | FRS 2.3.2 Data Assumptions | C | OPEN |

## Colour Analysis

| # | Question | Context | Phase | Status |
|---|----------|---------|-------|--------|
| PM-13 | **12-season accuracy**: GPT-4 Vision approximates seasonal analysis. Is approximate classification acceptable for MVP? Currently returns mock "Warm Autumn" without real API key. | FRS FR-CA-02 | D | OPEN (needs ACT-01) |
| PM-14 | **Colour palette size**: Implemented 12 best colours + 5 neutrals + 5 avoid. FRS said 6-8 each. Is 12+5+5 acceptable? | FRS FR-CA-02/03 | D | ANSWERED (implemented 12+5+5) |

## Occasions

| # | Question | Context | Phase | Status |
|---|----------|---------|-------|--------|
| PM-15 | **Calendar integration priority**: For web-only Phase 1, starting with Google Calendar only. Need Google API credentials (ACT-04). | FRS FR-OM-04 | E | OPEN (needs ACT-04) |
| PM-16 | **Weather API**: Recommending OpenWeatherMap free tier. Need API key (ACT-08). Is weather data a Phase 1 requirement or nice-to-have? | FRS FR-OM-02, FR-OM-05 | E | OPEN |
| PM-26 | **Occasion types**: FRS lists many types (Work, Social, Formal, Wedding, Interview, Date, etc.). Should we use the full FRS list or start with a smaller set? | FRS FR-OM-01 | E | OPEN |
| PM-27 | **Budget field**: FRS includes a budget field on occasions. Is this for outfit budget, event budget, or both? Currency assumption: USD? | FRS FR-OM-01 | E | OPEN |
| PM-28 | **Password max length**: FRS FR-UM-03 specifies max 12 characters for passwords. This is unusually short for modern password policy — most standards recommend allowing 64-128+ chars. We've implemented min 8, max 128 with strength rules (upper/lower/number). Confirm the intended max length. | FRS FR-UM-03 | Auth | OPEN |

## Playbooks & Virtual Try-On

| # | Question | Context | Phase | Status |
|---|----------|---------|-------|--------|
| PM-17 | **Virtual try-on scope**: For Phase 1 MVP, is a single static composite image per outfit sufficient? Needs Fashn.ai key (ACT-02). | FRS FR-LOOK-05 | F | OPEN (needs ACT-02) |
| PM-18 | **External outfit suggestions**: If wardrobe is insufficient, should we show purchase links or just "add more items" message? | FRS FR-LOOK-01 | F | OPEN |
| PM-19 | **Prep timeline start date**: FRS calculates by importance (5-star = 7-14 days before, 1-star = 1-2 days). Confirm this logic. | FRS FR-PREP-01 | F | OPEN |
| PM-20 | **Coaching tone**: FRS says "Encouraging, actionable, non-patronising." Any brand voice guide or example phrases? | FRS FR-COACH-01 | F | OPEN |

## General

| # | Question | Context | Phase | Status |
|---|----------|---------|-------|--------|
| PM-21 | **Notification channel**: For web Phase 1: in-app only, browser push, email, or combination? | FRS FR-UP-04 | B | OPEN |
| PM-22 | **Analytics tool**: FRS mentions Google Analytics + GTM. Defer to after MVP? | FRS FR-AN-01 | G | DEFERRED |
| PM-23 | **Admin console**: FRS includes basic admin portal. Defer to after user-facing app? | FRS FR-AD-01 | G | DEFERRED |
| PM-24 | **Geographic scope**: FRS says "initially US." Impacts date formats, measurement units, currency. Currently using metric + international formats. | FRS 2.3.2 | A | OPEN |
| PM-25 | **Brand photography**: Need approved brand photos for landing page hero and marketing materials. | Landing page hero | A | OPEN (see ACT-07) |

---

## Progress Summary (for PM visibility)

| Phase | Status | Key Deliverables |
|-------|--------|-----------------|
| **A: Foundation & Branding** | COMPLETE | Orivé rebrand, JWT auth, landing page, login/register/password-reset, sidebar navigation |
| **B: Onboarding & Profile** | COMPLETE | 3-step onboarding wizard, photo upload APIs, profile settings page (3-tab editor), notifications placeholder |
| **C: Wardrobe Management** | COMPLETE | Image upload (drag-drop + batch), AI auto-tagging (mock), photo grid, filters, edit/delete |
| **D: Colour Analysis** | COMPLETE | Face photo upload, AI analysis (mock), palette display, wardrobe harmony matching |
| **E: Enhanced Occasions** | COMPLETE | 3-step creation wizard, list with countdown/status/badges, detail view with edit/delete |
| **F: Playbook Overhaul** | COMPLETE | LOOK (3 outfits + upgrades), PREP (6-phase timeline + checklists), PRESENCE (coaching + pep talk), BEAUTY (skin/hair/fragrance/grooming) |
| **G: Dashboard & Polish** | COMPLETE | Real-data dashboard, responsive design (mobile nav + bottom tabs), accessibility audit, loading/error/empty state components |

### What Works Today (with mock data)
- Full user registration + login + password reset flow + **login rate limiting** (5 attempts/15 min)
- **7-step onboarding** (basics, body profile, style preferences, full body photo, wardrobe upload, face photo + colour analysis, first occasion) — matches Journey Map
- Profile settings page (edit personal info, body profile, style preferences, account overview)
- Wardrobe photo upload with mock AI tagging, filters, search, edit/delete, colour palette badges, **favourites toggle + filter**
- Colour analysis with mock seasonal palette + wardrobe harmony score + **staged progress UX** + privacy consent
- Occasion creation with **multi-select desired outcomes** (Authoritative, Warm, Elegant, etc.), **Google Maps link**, **playbook-aware delete warning**
- Full playbook generation with **partial regeneration** (per-module: outfits / timeline / coaching / beauty)
- **Day-of experience page** (`/day-of`) with outfit reminder, weather/location tips, morning checklist, pep talk
- Dashboard with **"Today's the day" card** + **post-event feedback prompt** + real data stats + activity feed
- Responsive design (mobile bottom nav + hamburger drawer, desktop sidebar)
- Accessibility features (skip-to-content, aria labels, focus management)

### What Needs API Keys to Test Real AI
- Real garment tagging accuracy → needs **ACT-01** (OpenAI key)
- Real colour season classification → needs **ACT-01** (OpenAI key)
- Real playbook outfit recommendations → needs **ACT-01** (OpenAI key)
- Virtual try-on → needs **ACT-02** (Fashn.ai key)

---

## Change Log

| Date | Change |
|------|--------|
| 2026-02-17 | Initial questions compiled from FRS review and implementation planning |
| 2026-02-17 | Major update: Added PM Action Items section (ACT-01 through ACT-10) tracking API keys, accounts, and assets needed. Added env variable reference table. Added progress summary. Updated question statuses to reflect implemented defaults. Added new occasion questions (PM-26, PM-27). |
| 2026-02-17 | Final update: All phases marked COMPLETE. Updated "What Works Today" to include settings page, dashboard with real data, responsive design, and accessibility. |
| 2026-02-17 | FRS gap closure: Updated "What Works Today" with 9 implemented gaps — 7-step onboarding, desired outcome multi-select, colour analysis progress UX, day-of page, favourites, map link, rate limiting, partial playbook regen. See GAPS.md for full tracker. |
| 2026-02-17 | Round 2 gap closure: Added PM-28 (password max length). 24 of 31 Round 2 tasks implemented. See GAPS.md for details. |
