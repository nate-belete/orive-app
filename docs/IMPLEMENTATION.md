# Orivé Implementation Plan

> Living document tracking the transformation from "Occasion OS" POC to the full Orivé Phase 1 product.
> Northstar reference: https://orivedraft1.lovable.app/
> Spec reference: `Orivè Spec/Orive_Functional Specification v1.docx`

---

## Current State vs. Northstar Gap Analysis

### What the POC has today
- Basic FastAPI backend with SQLite, 4 models (ClosetItem, Occasion, Playbook, Feedback)
- Text-only closet management (no images, no AI tagging)
- Simple occasion creation (no calendar integration, limited fields)
- Mock playbook generation (hardcoded structure, optional OpenAI fallback)
- Basic feedback form
- Next.js 14 frontend with Tailwind, React Query
- No authentication, no user profiles, no onboarding
- No branding (still labeled "Occasion OS")

### What the northstar Lovable app shows
- Orivé branding: warm gold/cream aesthetic, serif typography, luxury feel
- Landing page with value proposition and 4 feature pillars
- Auth: email/password + Google + Apple social login
- Protected routes (dashboard, wardrobe, occasions, playbooks, profile, onboarding)
- 5-step onboarding flow (Welcome → Basics → Measurements → Body Photo → Style Prefs)

### What the FRS v1 specifies for Phase 1
- **Auth & Users**: Email registration, social login (Google/Apple), password rules, session management, account recovery
- **Profile & Onboarding**: Name, gender, DOB, address/ZIP, body measurements, body type, full-body photo, style preferences (go-tos, no-goes, can't-wear)
- **Wardrobe**: Photo upload (camera/gallery), AI auto-tagging (garment type, colour, pattern, formality, brand), manual editing, grid browsing with filters/search, item detail views, deletion with soft-delete
- **Colour Analysis**: Face photo upload with guided capture, AI colour palette generation (12 seasons), best colours + best neutrals, palette applied to wardrobe matching
- **Occasions**: Rich creation form (name, date, type dropdown, location, venue, dress code, budget, duration, importance, attendees, desired outcome), calendar integration (Google/Apple/Outlook), occasion intelligence (AI context-aware suggestions)
- **Playbooks**: LOOK module (3 outfit options from wardrobe, reasoning, upgrade suggestions, virtual try-on), PREP TIMELINE module (multi-day countdown schedule, hour-by-hour day-of, task checkboxes), PRESENCE COACHING module (mindset prep, practical tips, occasion-specific advice, day-of pep talk)
- **Virtual Try-On**: AI-generated visualisation of user in outfits using their body photo
- **Dashboard**: Next occasion card, quick actions, recent activity, insights
- **Admin**: Basic admin console for user management and app health

---

## Proposed Implementation Phases

### Phase A: Foundation & Branding (Milestone 1)
Rebuild the foundation to match the Orivé identity and architecture.

| # | Task | Status |
|---|------|--------|
| A1 | Rebrand to Orivé (logo, typography, colour scheme: warm gold/cream) | **done** |
| A2 | Implement auth system (email/password registration & login) | **done** |
| A3 | Add user model to backend (profiles, sessions, JWT) | **done** |
| A4 | Build landing page matching Lovable northstar | **done** |
| A5 | Protected route middleware (frontend + backend) | **done** |
| A6 | Social login (Google OAuth) | deferred |
| A7 | Password reset / account recovery flow | **done** |

### Phase B: Onboarding & Profile (Milestone 2)
Multi-step onboarding wizard per the FRS.

| # | Task | Status |
|---|------|--------|
| B1 | Onboarding step 1: The Basics (gender, DOB, postcode/ZIP) | **done** |
| B2 | Onboarding step 2: Body Profile (height, weight, body type presets) | **done** |
| B3 | Onboarding step 3: Style Preferences (go-tos, no-goes, can't-wear) | **done** |
| B4 | Full-body photo upload (backend endpoint done, UI pending) | **done** (API) |
| B5 | Face photo upload (backend endpoint done, UI pending) | **done** (API) |
| B6 | Profile settings page (`/settings`) — 3-tab layout (Profile / Style Preferences / Account), editable personal info, body profile, style prefs, account overview, notification placeholder | **done** |
| B7 | Notification preferences — placeholder in Account tab (future: per-type toggles when push notifications enabled) | **done** |

### Phase C: Wardrobe Management (Milestone 3)
Full wardrobe system with image upload and AI tagging.

| # | Task | Status |
|---|------|--------|
| C1 | Image upload for wardrobe items (drag-drop + file picker, multi-file) | **done** |
| C2 | Image storage backend (local filesystem, S3-swappable service) | **done** |
| C3 | AI auto-tagging on upload (GPT-4 Vision: name, category, colour, pattern, formality, season, fabric, brand) | **done** |
| C4 | Manual tag editing interface (slide-over panel with inline form) | **done** |
| C5 | Wardrobe grid view with photo thumbnails (3:4 aspect ratio cards) | **done** |
| C6 | Filter & search (category pills + text search on name/colour/brand) | **done** |
| C7 | Item detail view (full image, all tags, edit mode, delete) | **done** |
| C8 | Soft-delete (is_deleted flag, items hidden from queries) | **done** |
| C9 | Batch upload support (multi-file select, sequential processing) | **done** |

### Phase D: Colour Analysis (Milestone 4)
AI-powered colour palette from face photo.

| # | Task | Status |
|---|------|--------|
| D1 | Face photo upload with guided capture instructions (tips: natural light, no makeup, face forward) | **done** |
| D2 | AI colour analysis engine (GPT-4 Vision: skin/eye/hair → 12-season classification + rich palette) | **done** |
| D3 | Palette generation (12-season model, best colours × 12, best neutrals × 5, avoid × 5, styling tips × 5) | **done** |
| D4 | Palette display UI (season hero card, colour swatches with click-to-copy hex, styling tips list) | **done** |
| D5 | Wardrobe colour matching (fuzzy colour-family matching, "In Palette" / "Off Palette" badges, filter pills, harmony score bar on analysis page) | **done** |
| D6 | Retake/update palette flow (re-upload face photo or reanalyse existing) | **done** |

### Phase E: Enhanced Occasions (Milestone 5)
Rich occasion creation and management per FRS.

| # | Task | Status |
|---|------|--------|
| E1 | Expanded occasion form — 3-step wizard (Basics → Details → Final Touches) with all FRS fields: name, 14 occasion types, venue, end time, dress code pills, role selector, importance 1-5, attendees, budget, weather hint, multi-select desired outcomes, comfort level, description | **done** |
| E2 | Occasion list view — status tabs (All/Upcoming/Today/Past), auto-status calculation, countdown strings, importance dots, playbook status badge, soft-delete from list, sorted by status+date | **done** |
| E3 | Occasion detail view (`/occasions/[id]`) — full detail grid, inline editing, delete, playbook CTA card, back navigation | **done** |
| E4 | Calendar integration (Google Calendar import) — needs ACT-04 | deferred |
| E5 | Occasion Intelligence (AI context-aware suggestions) — needs ACT-01 | deferred |

### Phase F: Playbook Overhaul (Milestone 6)
Full LOOK, PREP, and PRESENCE modules.

| # | Task | Status |
|---|------|--------|
| F1 | LOOK module: wardrobe-aware outfit generation — 3 options with outfit pieces grid, reasoning, styling notes, accessories, risk flags. Outfit selector pills UI. | **done** |
| F2 | LOOK module: upgrade suggestions — prioritised missing items list (high/medium/low) with reasoning, cream cards UI | **done** |
| F3 | LOOK module: virtual try-on (AI composite of user + outfit) — needs ACT-02 Fashn.ai | deferred |
| F4 | PREP TIMELINE module: multi-day preparation schedule — 6 phases (week before → just before + pack list), scaled by occasion importance (1-5) | **done** |
| F5 | PREP TIMELINE module: interactive checklist — timeline UI with gold dots, strikethrough on check, local state | **done** |
| F6 | PRESENCE COACHING module: 4 sections — mindset (numbered tips), body language (bullets), conversation guide (openers, topics, graceful exits), all with rich formatting | **done** |
| F7 | PRESENCE COACHING module: personalised pep talk card (gradient gold background, italic quote), grooming checklist in beauty tab | **done** |
| F8 | Playbook regeneration — force=true flag, deletes old playbook and generates fresh, marks occasion.playbook_generated=true | **done** |

### Phase G: Dashboard & Polish (Milestone 7)
Home experience and UX refinement.

| # | Task | Status |
|---|------|--------|
| G1 | Dashboard: next occasion card with countdown — gold-tinted hero card with name, date, location, countdown pill, importance dots, playbook status CTA | **done** |
| G2 | Dashboard: quick actions (Add to Wardrobe, Plan an Occasion, Colour Analysis) — 3-card grid | **done** |
| G3 | Dashboard: recent activity feed — merged timeline of wardrobe additions + occasion creations, sorted by date, up to 8 items, typed icons, timestamps | **done** |
| G4 | Dashboard: personalised greeting ("Good morning/afternoon/evening, [First Name]") + stats grid with real data (wardrobe count, upcoming, playbooks, colour season) | **done** |
| G5 | Responsive design audit — mobile header + hamburger drawer + bottom tab bar (5 items, 48px touch targets, safe-area-bottom), desktop sidebar sticky, responsive padding + grid breakpoints across all pages | **done** |
| G6 | Loading states (spinner + aria status), error handling (icon + message + retry), empty states (EmptyState component with icon + title + description + action) — polished shared components | **done** |
| G7 | Accessibility audit — skip-to-content link, aria-current on nav, aria-labels on all buttons/inputs, aria-hidden on decorative icons, role=status on loading, role=alert on errors, semantic nav/main/header elements, focus-visible ring utility | **done** |

---

## Technical Decisions (Resolved)

### 1. Backend Architecture
**Decision:** Keep FastAPI as the core backend. Bolt auth and image storage onto it.
- JWT-based authentication with bcrypt password hashing
- FastAPI handles all API logic, auth, AI orchestration
- Next.js frontend communicates exclusively through FastAPI REST API

### 2. Authentication
**Decision:** Custom JWT auth in FastAPI
- `python-jose` for JWT token creation/verification
- `passlib[bcrypt]` for password hashing
- httpOnly cookies for session tokens (30-day expiry with refresh)
- Google OAuth via `authlib` (Apple deferred — requires Apple Developer account)
- Password reset via time-limited email tokens

### 3. Database
**Decision:** SQLite for local development, designed for easy PostgreSQL migration
- SQLModel ORM (already in use) makes migration straightforward
- Add Alembic for schema migrations now (future-proofs for Postgres/AWS)
- User model added as the foundation for all other models (foreign keys)

### 4. Image Storage
**Decision:** Local filesystem now, abstraction layer for AWS S3 later
- Storage service interface: `save_image()`, `get_image_url()`, `delete_image()`
- Local implementation stores in `backend/data/uploads/`
- S3 implementation swappable via config when deploying to AWS
- Images served via FastAPI static file mount (local) or pre-signed URLs (S3)

### 5. AI/ML Services
**Decision:** OpenAI GPT-4 Vision for tagging and colour analysis, Fashn.ai for virtual try-on
- Garment tagging: GPT-4 Vision (send photo → structured JSON tags)
- Colour analysis: GPT-4 Vision (face photo → season + palette)
- Virtual try-on: **Fashn.ai API** (recommended after research — see rationale below)
- All AI features behind mock fallback (works without API keys)

**Virtual Try-On Provider: Fashn.ai** (Recommended)
- Supports user's own body photo (critical for Orivé — user uploads their photo during onboarding)
- Preserves natural body proportions (no distortion)
- Works with flat-lay garment images (what users upload to wardrobe)
- API well-documented at docs.fashn.ai, Python/JS examples
- Processing: 5-17 seconds per outfit
- Pricing: $0.075/image on-demand (100 images = $7.50 minimum), no subscription required
- Alternatives considered:
  - Revery.ai: More e-commerce focused, free tier but less flexible for custom body photos
  - IDM-VTON: Open-source but requires self-hosted GPU infrastructure
  - Kolors: Similar GPU hosting requirement

### 6. Platform Strategy
**Decision:** Web-only (responsive) with multi-platform off-ramp
- Next.js 14 with App Router (current stack)
- Responsive design: mobile-first, breakpoints at 640/768/1024/1280px
- Architecture decisions favour future React Native port (shared types, API-first)
- No PWA for now, but can add service worker later

### 7. Deployment
**Decision:** Local development now, AWS in the future
- Local: `uvicorn` (backend) + `next dev` (frontend) on ports 8000/5173
- Future AWS: ECS/Fargate (backend), Amplify or S3+CloudFront (frontend), RDS Postgres, S3 (images)

### 8. Design System
**Decision:** Match Lovable northstar closely
- Extract exact design tokens (colours, typography, spacing) from the live app
- Tailwind CSS with custom theme config matching Orivé brand
- See `LAYOUTS.md` for full design token table

---

## Resolved Questions

| # | Question | Answer |
|---|----------|--------|
| Q1 | Lovable authenticated pages | Not accessible — use Orivé Spec folder mockups + FRS for internal page design |
| Q2 | OpenAI API key | Available — wire up real AI features (with mock fallback) |
| Q3 | Virtual try-on provider | **Fashn.ai** — best fit for user-photo try-on, API-based, $0.075/image |
| Q4 | Email service | **AWS SES** (console-print for local dev, SES for production) |
| Q5 | Google OAuth | Deferred — start with email/password only, add Google later |
| Q6 | Fonts | Extract from Lovable app + Orivé Spec: Playfair Display (headings) + Inter (body) |
| Q7 | Fashn.ai account | Build with mock placeholders first, off-ramp ready for Fashn.ai when API key available |
| Q8 | AWS SES setup | Future state — print reset links to terminal for local dev |
| Q9 | Hero image | Use placeholder from Orivé Spec folder or stock image |
| Q10 | App navigation | Sidebar (desktop) + bottom tabs (mobile), aligned with Orivé Spec folder patterns |

## PM Blockers & Dependencies

> Items that need PM action to unlock features. Full details in [`QUESTIONS_FOR_PM.md`](QUESTIONS_FOR_PM.md).

| Priority | Item | Blocks | Status |
|----------|------|--------|--------|
| **HIGH** | OpenAI API Key (`ACT-01`) | Real AI tagging, colour analysis, playbook generation | NEEDED |
| **MEDIUM** | Fashn.ai API Key (`ACT-02`) | Virtual try-on feature | NEEDED |
| **MEDIUM** | Google Calendar credentials (`ACT-04`) | Calendar integration in Phase E | NEEDED |
| **MEDIUM** | Production JWT secret (`ACT-10`) | Secure auth in production | NEEDED |
| **LOW** | Google OAuth credentials (`ACT-03`) | Social login (deferred) | NEEDED |
| **LOW** | AWS credentials (`ACT-05`, `ACT-06`) | Production deployment (S3, SES) | NEEDED |
| **LOW** | Brand photography (`ACT-07`) | Landing page hero image | NEEDED |
| **LOW** | Weather API key (`ACT-08`) | Weather widget on occasions | NEEDED |
| **LOW** | Domain + hosting (`ACT-09`) | Production deployment | NEEDED |

### Demo Data (Auto-Seeded)
On first startup (empty database), the app auto-seeds 3 fully-fleshed demo accounts:
- **Sarah Belete** (sarah@orive.com) — London, Warm Autumn, 24 wardrobe items, 6 occasions, 3 playbooks
- **Nate Belete** (nate@orive.com) — New York, Cool Winter, 23 wardrobe items, 5 occasions, 3 playbooks
- **Duduzile Jele** (duduzile@orive.com) — San Francisco, Deep Winter, 24 wardrobe items, 6 occasions, 3 playbooks

All accounts use password `Test1234`. Each has colour analysis, completed onboarding, placeholder wardrobe images, and realistic occasion/playbook data. See `backend/app/utils/seed.py` for full data definitions.

### What Works Without Any Keys
Everything runs in **mock mode** by default. The full user flow (register → onboard → upload wardrobe → colour analysis → create occasion → view playbook) works with sample AI data. No API keys needed for development.

### What Needs Keys to Fully Test
Set `AI_MODE=llm` and `OPENAI_API_KEY=sk-...` in `backend/.env` to enable real AI. See [`QUESTIONS_FOR_PM.md`](QUESTIONS_FOR_PM.md) for the full env var reference.

## Open Questions (Remaining)

> See `QUESTIONS_FOR_PM.md` for the full list of 27 questions. No hard blockers for continuing development.

---

---

## Cross-References

- **Gap Tracker:** See [`GAPS.md`](GAPS.md) for FRS alignment gaps, blocked items, and deferred Phase 2+ features
- **Layouts & Screens:** See [`LAYOUTS.md`](LAYOUTS.md) for full screen inventory (30+ screens), shared components, navigation map, and design tokens
- **PM Questions:** See [`QUESTIONS_FOR_PM.md`](QUESTIONS_FOR_PM.md) for items needing product manager clarification
- **FRS:** See `Orivè Spec/Orive_Functional Specification v1.docx` for full functional requirements
- **Northstar:** https://orivedraft1.lovable.app/

---

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2026-02-17 | Initial implementation plan created from spec review | AI |
| 2026-02-17 | Resolved technical decisions (FastAPI auth, local+S3 storage, web-only, AWS future), added open questions | AI |
| 2026-02-17 | Created LAYOUTS.md with 30 screens, 4 layout shells, shared components, design tokens | AI |
| 2026-02-17 | Resolved Q1-Q6: OpenAI confirmed, Fashn.ai for try-on, AWS SES, email-only auth first, fonts from spec | AI |
| 2026-02-17 | Updated design tokens from real Lovable screenshots — corrected button colours (black public, gold internal) | AI |
| 2026-02-17 | Resolved Q7-Q10: mock try-on first, SES future, placeholder hero, sidebar+tabs nav. Created QUESTIONS_FOR_PM.md | AI |
| 2026-02-17 | NO DARK MODE rule: all surfaces cream/white per PM's spec. Updated LAYOUTS.md tokens. Regenerated mockups with light sidebar | AI |
| 2026-02-17 | **Phase A COMPLETE**: Rebrand (Tailwind theme + Playfair/Inter fonts + gold/cream tokens), JWT auth (register/login/me/password-reset), User model with profile fields, landing page, login/register/forgot-password/reset-password pages, AppShell sidebar layout, Dashboard, 3-step onboarding flow, wardrobe/occasions/playbooks pages reskinned, colour-analysis + virtual-try-on placeholder pages, all backend routers user-scoped | AI |
| 2026-02-17 | **Phase C COMPLETE**: Image storage service (local, S3-swappable), wardrobe image upload (multipart form, drag-drop + file picker, batch), GPT-4 Vision AI auto-tagging (name/category/colour/pattern/formality/season/fabric/brand), manual tag editing (slide-over panel), photo grid with thumbnails, filter + search, item detail view, soft-delete, retag endpoint, body/face photo upload endpoints (B4-B5). Enhanced ClosetItem model with pattern/fabric/brand/ai_tagged/is_deleted fields. | AI |
| 2026-02-17 | **Phase D COMPLETE**: Colour analysis AI service (GPT-4 Vision → 12-season classification with best colours/neutrals/avoid/tips), 3 API endpoints (analyse, results, reanalyse), full colour analysis page with guided upload instructions, rich results display (season card, swatch grids with click-to-copy hex, styling tips), retake flow, wardrobe colour matching utility (fuzzy colour-family matching), "In Palette"/"Off Palette" badges on wardrobe items, colour match filter pills, Wardrobe Harmony section with stats bar + harmony score on analysis page. | AI |
| 2026-02-17 | **Documentation audit**: Overhauled QUESTIONS_FOR_PM.md with PM Action Items section (ACT-01 through ACT-10) tracking API keys/accounts/assets needed, env variable reference table, progress summary for PM visibility. Updated QUICKSTART.md with current app features, test account, project structure, troubleshooting. Updated .env.example with all current + future env vars. Added PM Blockers & Dependencies section to IMPLEMENTATION.md. | AI |
| 2026-02-17 | **Phase E COMPLETE** (core): Expanded Occasion model with 15+ fields (name, venue, end_datetime, description, importance, attendees, role, status, playbook_generated, is_deleted, updated_at). Added OccasionUpdate schema + PATCH/DELETE endpoints. 3-step creation wizard, occasion list with status tabs/countdown/badges, detail page with inline edit/delete, playbook CTA. Calendar (E4) and AI Intelligence (E5) deferred pending API credentials (ACT-04, ACT-01). DB reset with new schema. | AI |
| 2026-02-17 | **Phase F COMPLETE** (core): Full playbook overhaul. LOOK module — 3 wardrobe-aware outfits with pieces grid, reasoning, styling notes, accessories, risk flags, upgrade suggestions. PREP TIMELINE — 6-phase multi-day timeline scaled by importance (week before → just before + pack list), interactive checkboxes with strikethrough. PRESENCE COACHING — mindset tips, body language, conversation guide (openers/topics/exits), personalised pep talk card. BEAUTY — skin prep steps, hair/fragrance cards, grooming checklist. Richer AI prompt with user profile + colour season + all occasion fields. Mock generator produces gender-aware, importance-scaled content. Regeneration with force flag + playbook_generated status on occasions. Virtual try-on (F3) deferred pending ACT-02. | AI |
| 2026-02-17 | **Phase B COMPLETE**: Profile settings page (`/settings`) with 3-tab layout (Profile, Style Preferences, Account). Editable personal info (name, gender, DOB, postcode), body profile (height, weight, body type), style preferences (go-tos, no-goes, can't-wear), account overview (email, member since), password reset link, notifications placeholder. Settings added to sidebar nav. | AI |
| 2026-02-17 | **Phase G COMPLETE**: Dashboard overhauled with real API data — Next Occasion hero card (gold-tinted, countdown pill, importance dots, playbook CTA), stats grid (live wardrobe count, upcoming occasions, playbooks, colour season), upcoming occasions list, merged recent activity feed (wardrobe + occasions timeline). Responsive design audit — mobile header + hamburger slide-out drawer + bottom tab bar (5 items, 48px touch targets, safe-area-bottom), desktop sticky sidebar, responsive padding/grid breakpoints. Loading/Error/Empty shared components polished (Loading with aria status, ErrorState with alert role + icon, new EmptyState component). Accessibility — skip-to-content link in layout, aria-current on nav, aria-labels on all interactive elements, aria-hidden on decorative icons, semantic HTML roles (nav, main, header), focus-visible ring utility. | AI |
| 2026-02-17 | **ALL PHASES COMPLETE** — Implementation plan fully delivered. Remaining deferred items are external dependencies (API keys, accounts) tracked in QUESTIONS_FOR_PM.md. | AI |
| 2026-02-17 | **Demo data seeder**: 3 fully-fleshed personas (Sarah Belete/London/Warm Autumn, Nate Belete/NYC/Cool Winter, Duduzile Jele/SF/Deep Winter). Each with ~24 wardrobe items (brands, fabrics, patterns), 5-6 occasions (past/upcoming/future), 3 pre-generated playbooks, full 12-season colour palette, completed onboarding. Pure-Python PNG placeholder images. Auto-seeds on first backend startup. | AI |
| 2026-02-17 | **FRS Gap Closure (9 gaps, 27 tasks)**: Created GAPS.md tracker. Implemented: (1) 7-step onboarding flow matching Journey Map (body photo, wardrobe upload, face photo + colour analysis, first occasion), (2) desired outcome multi-select chips per FR-OM-03, (3) colour analysis staged progress UX per FR-CA-02, (4) day-of experience page `/day-of/[id]` with outfit/weather/location/checklist/pep-talk per FR-COACH-02, (5) guided photo capture instructions per FR-CA-01/FR-UP-03, (6) wardrobe favourites toggle + filter per FR-WM-03, (7) occasion map link + playbook-aware delete warning per FR-OM-05, (8) login rate limiting (5 attempts/15 min) per FR-UM-08, (9) playbook partial regeneration (per-module) per FR-PB-02. Dashboard updated with "Today's the day" card + post-event feedback prompt. | AI |
| 2026-02-17 | **FRS Round 2 Gap Closure (14 gaps, 24/31 tasks)**: Implemented GAPs 10-23. Backend: password strength validators, reset rate limiting (3/hr), no-reuse-current, auto-login token, size field, first/last name model + migration, trash/restore endpoints. Frontend: password strength bar, first/last name registration + settings, DOB age validation, imperial/metric toggle, season filters, sort toggle, size field, trash/restore UI, occasion search, regen prompt, prep timeline editing, tip of the day, venue type selector, colour education module, clickable outfit items. 7 tasks deferred. | AI |

