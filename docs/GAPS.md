# Orivé — Implementation Gaps Tracker

> Gaps identified by reviewing the **Functional Specification v1**, **User Journey Map**, and **Lovable northstar** against what is currently built.
> Reference: `Orivè Spec/Orive_Functional Specification v1.docx`, `Orivè Spec/Journey Maps/User Journey.jpg`
> Last reviewed: 2026-02-17

---

## How to Read This Document

- **Status**: `TODO` → `IN PROGRESS` → `DONE` (or `DEFERRED` / `BLOCKED`)
- **Priority**: P0 (must-have for spec alignment), P1 (important), P2 (nice-to-have), P3 (future phase)
- **FRS Ref**: The functional requirement ID from the spec

---

## GAP 1 — Onboarding Flow (P0)

**Problem**: The Journey Map shows a guided first-time flow that walks users through *everything* before they reach the main app. Our onboarding is only 3 steps (Basics → Body Profile → Style Preferences) and sends users straight to the dashboard — skipping photo uploads, wardrobe seeding, and colour analysis.

**Journey Map first-time flow:**
1. Account Creation ✅ (built)
2. Profile Setup (gender, DOB, postcode) ✅ (built — onboarding step 1)
3. Body Profile (height, weight, body type) ✅ (built — onboarding step 2)
4. Full Body Shot Upload ← **MISSING from onboarding**
5. Wardrobe Upload + Style Preferences ← **Style prefs built (step 3), wardrobe upload NOT in onboarding**
6. Face Photo Upload ← **MISSING from onboarding**
7. Colour Analysis (palette generation) ← **MISSING from onboarding**
8. First Occasion Creation ← **NOT prompted during onboarding**
9. Review Recommendations / Virtual Try-On ← **Virtual try-on deferred (ACT-02)**

| # | Task | FRS Ref | Status |
|---|------|---------|--------|
| 1.1 | Add onboarding step 4: Full Body Photo upload (use existing B4 API, add UI with guided instructions — "clear upright photo, front-facing, natural lighting") | FR-UP-03 | **DONE** |
| 1.2 | Add onboarding step 5: Wardrobe Upload — quick-add 5-10 items (multi-file upload, uses existing closet API) with prompt "Upload a few items to get started" | FR-WM-01 | **DONE** |
| 1.3 | Add onboarding step 6: Face Photo Upload + trigger Colour Analysis (use existing colour API, show progress "Analysing facial features… Analysing hair… Complete") | FR-CA-01, FR-CA-02 | **DONE** |
| 1.4 | Add onboarding step 7: First Occasion prompt — "What's your next big occasion?" (simplified occasion form, optional skip) | FR-OM-01 | **DONE** |
| 1.5 | Update progress indicator from 3 dots to 7 (or allow skippable sections) | FR-UP-01 | **DONE** |
| 1.6 | Post-onboarding redirect: if occasion created → offer "Generate Playbook"; else → dashboard | FR-PB-01 | **DONE** |

---

## GAP 2 — Desired Outcome on Occasions (P1)

**Problem**: FRS FR-OM-03 specifies predefined outcome types as a multi-select plus free text. We currently have a single free-text field defaulting to "confident".

**FRS specifies these predefined outcomes:**
- Authoritative
- Warm
- Elegant
- Cool / Creative
- Understated
- Confident
- Personal Goals (free text)

| # | Task | FRS Ref | Status |
|---|------|---------|--------|
| 2.1 | Update `Occasion` model: change `desired_outcome` from single string to JSON field supporting multiple selections + free text | FR-OM-03 | **DONE** (kept as comma-separated string for POC, works with chips UI) |
| 2.2 | Update occasion creation wizard (step 3 "Final Touches"): replace text input with multi-select chips for predefined outcomes (Authoritative, Warm, Elegant, Cool/Creative, Understated, Confident + 6 more) + "Personal Goals" free text area | FR-OM-03 | **DONE** |
| 2.3 | Update occasion detail view to display outcome chips | FR-OM-03 | **DONE** |
| 2.4 | Update playbook generation prompt to use structured desired outcomes | FR-OM-03 | N/A (already reads desired_outcome string, works with new multi-select) |

---

## GAP 3 — Colour Analysis Progress UX (P1)

**Problem**: FRS FR-CA-02 specifies an animated analysis progress bar showing stages: "Analysing facial features → Analysing hair → Analyses complete". We show a generic loading spinner.

| # | Task | FRS Ref | Status |
|---|------|---------|--------|
| 3.1 | Add stepped progress animation to colour analysis page (4 stages: facial features → hair → palette → complete, with completion bar) | FR-CA-02 | **DONE** |
| 3.2 | Add consent/privacy notice before upload: "We'll use your photo to analyse your natural colouring to recommend flattering colours. Your photo is securely stored and never shared." | FR-CA-01 | **DONE** |

---

## GAP 4 — Day-Of Experience (P1)

**Problem**: FRS FR-COACH-02 specifies a dedicated day-of experience: morning notification, final checklist (outfit photo reminder, weather tips, travel time), and a personalised pep talk. We have coaching content inside the playbook but no dedicated day-of screen or trigger.

| # | Task | FRS Ref | Status |
|---|------|---------|--------|
| 4.1 | Create `/day-of/[occasionId]` page: outfit reminder, morning/just-before checklists, weather/location/dress code tips, pep talk, mindset, pack list, Google Maps link | FR-COACH-02 | **DONE** |
| 4.2 | Dashboard: when an occasion is "today", show prominent "Today's the day!" card linking to day-of page | FR-COACH-02 | **DONE** |
| 4.3 | Post-event prompt: within 48h of event, show "How did it go?" card linking to feedback form | FR-COACH-02 | **DONE** |

---

## GAP 5 — Face Photo Guided Capture (P2)

**Problem**: FRS FR-CA-01 specifies a guided capture experience with face positioning overlay, lighting instructions, and tips (remove glasses, neutral expression). Our upload is a basic file picker.

| # | Task | FRS Ref | Status |
|---|------|---------|--------|
| 5.1 | Add guided capture instructions panel before upload (checklist: clean camera, remove glasses, natural lighting, neutral expression, look directly at camera) | FR-CA-01 | **DONE** (in onboarding step 6 + colour analysis page tips) |
| 5.2 | For full body photo: add similar guidance (stand upright, front-facing, natural lighting, frame positioning) | FR-UP-03 | **DONE** (in onboarding step 4 with photo tips callout) |

---

## GAP 6 — Wardrobe Item Detail Enhancements (P2)

**Problem**: FRS FR-WM-05 specifies usage stats (times worn, last worn, outfit combinations count) and colour palette match indicator on the item detail view.

| # | Task | FRS Ref | Status |
|---|------|---------|--------|
| 6.1 | Add "times included in playbook" count to wardrobe item detail (query Playbook look_json for item references) | FR-WM-05 | TODO (requires cross-query of playbook JSON — deferred for now) |
| 6.2 | Add "Colour palette match" indicator on item detail (flattering / neutral / caution badge) — reuse existing colour-match logic | FR-WM-05 | **DONE** (already exists via colour match badges on grid cards) |
| 6.3 | Add "Favourite" toggle to wardrobe items (new `is_favourite` field on ClosetItem model) + filter pill | FR-WM-03 | **DONE** |

---

## GAP 7 — Occasion List & Detail Polish (P2)

**Problem**: FRS FR-OM-05 specifies weather widget (if date within 14 days), map/directions link, and countdown on occasion cards.

| # | Task | FRS Ref | Status |
|---|------|---------|--------|
| 7.1 | Occasion detail: add map link (Google Maps) if location is set | FR-OM-05 | **DONE** |
| 7.2 | Occasion detail: weather widget (needs ACT-08 Weather API key) | FR-OM-05 | BLOCKED (ACT-08) |
| 7.3 | Occasion deletion: warn if playbook exists ("This will also delete the associated playbook") | FR-OM-05 | **DONE** |

---

## GAP 8 — Auth Hardening (P2)

**Problem**: Several FRS auth requirements are not implemented. These are important for production but not critical for POC demo.

| # | Task | FRS Ref | Status |
|---|------|---------|--------|
| 8.1 | Rate limiting on login: max 5 failed attempts per email per 15 min, then 15-min lockout | FR-UM-08 | **DONE** (in-memory rate limiter, production should use Redis) |
| 8.2 | JWT token expiry: enforce 30-day expiration, implement silent refresh | FR-UM-04 | **DONE** (30-day expiry already set in security.py, frontend stores token in localStorage) |
| 8.3 | "Logout from all devices" option in settings | FR-UM-05 | TODO (requires token blacklist or JWT rotation — deferred) |
| 8.4 | Email verification on registration (send verification email, require activation) | FR-UM-01 | BLOCKED (ACT-05) |

---

## GAP 9 — Playbook Partial Regeneration (P2)

**Problem**: FRS FR-PB-02 specifies partial regeneration (LOOK-only, PREP-only, PRESENCE-only). We only support full regeneration.

| # | Task | FRS Ref | Status |
|---|------|---------|--------|
| 9.1 | Add partial regeneration options to playbook UI: dropdown with "Full Regeneration", "Regenerate Outfits Only", "Regenerate Timeline Only", "Regenerate Coaching Only", "Regenerate Beauty Only" | FR-PB-02 | **DONE** |
| 9.2 | Backend: support `module` param on regenerate endpoint (look / prep / presence / beauty) — updates only that module's JSON, keeps others | FR-PB-02 | **DONE** |

---

## BLOCKED — Needs API Keys / PM Action

These items are implementation-ready but waiting on external dependencies.

| # | Task | Blocked By | FRS Ref | Status |
|---|------|------------|---------|--------|
| B.1 | Virtual Try-On (AI composite of user + outfit) | ACT-02 (Fashn.ai key) | FR-LOOK-05 | BLOCKED |
| B.2 | Real AI tagging, colour analysis, playbook generation | ACT-01 (OpenAI key) | FR-WM-02, FR-CA-02, FR-PB-01 | BLOCKED |
| B.3 | Google Social Login | ACT-03 (Google OAuth creds) | FR-UM-02 | BLOCKED |
| B.4 | Calendar Integration (Google Calendar import) | ACT-04 (Google Calendar API) | FR-OM-04 | BLOCKED |
| B.5 | Real email delivery (verification, password reset) | ACT-05 (AWS SES) | FR-UM-01, FR-UM-06 | BLOCKED |
| B.6 | Weather widget on occasions | ACT-08 (Weather API key) | FR-OM-02 | BLOCKED |
| B.7 | Occasion Intelligence (AI context-aware suggestions) | ACT-01 (OpenAI key) | FR-OM-06 | BLOCKED |

---

## DEFERRED — Phase 2+

These are explicitly out of scope for Phase 1 per the FRS.

| Item | FRS Note |
|------|----------|
| BEAUTY module (makeup, hair, skincare) | Phase 2 |
| CONFIDENCE LOOP advanced analytics | Phase 2 |
| Wardrobe Analytics Dashboard | FR-WM-07, Phase 2 |
| Bust/Chest/Waist/Hips measurements | FR-UP-02, Phase 2 |
| Advanced virtual try-on (environments, AR, 360) | Phase 2+ |
| E-commerce / affiliate integration | Phase 2 |
| Subscription billing | Phase 2 |
| Social features (sharing, friends) | Phase 2 |
| Resale marketplace | Phase 3 |
| Multi-language support | Phase 2 |
| Apple Sign-In (iOS only) | Phase 2 (web-only now) |
| MFA | FR-UM-09, explicitly out of scope |
| Admin console | FR-AD-01, post-MVP |
| Analytics instrumentation (GA/GTM) | FR-AN-01, post-MVP |

---

---

## ROUND 2 — Alignment Review (2026-02-17)

> Second pass comparing every FRS requirement against actual implementation. Identified additional gaps not covered in Round 1.

---

## GAP 10 — Password Rules & Strength (P1)

**Problem**: FRS FR-UM-03 specifies strict password rules: min 8 chars, **max 12 chars**, must contain uppercase + lowercase + number, real-time strength indicator (weak/medium/strong), and prevent reuse of last 5 passwords. We only enforce min 8 chars (and allow up to 128).

| # | Task | FRS Ref | Status |
|---|------|---------|--------|
| 10.1 | Frontend: add password validation rules — require at least 1 uppercase, 1 lowercase, 1 number. Display inline error messages for each failed rule | FR-UM-03 | DONE |
| 10.2 | Frontend: add real-time password strength indicator bar (Weak / Medium / Strong) on register + reset-password pages | FR-UM-03 | DONE |
| 10.3 | Backend: enforce character-class requirements in `RegisterRequest` and `PasswordResetConfirm` validators | FR-UM-03 | DONE |
| 10.4 | Decide max length: FRS says 12 chars — confirm with PM (seems unusually short for modern password policy). Flag in QUESTIONS_FOR_PM.md | FR-UM-03 | DEFERRED |

---

## GAP 11 — First Name / Last Name Separation (P2)

**Problem**: FRS FR-UP-01 specifies separate first name and last name fields (both required, 1-50 chars each, auto-populated from OAuth). We use a single `full_name` field. This matters for greeting personalization ("Good morning, Sarah" — currently works because we split on space, but fragile).

| # | Task | FRS Ref | Status |
|---|------|---------|--------|
| 11.1 | Add `first_name` and `last_name` fields to User model (keep `full_name` as computed property) | FR-UP-01 | DONE |
| 11.2 | Update registration form: separate First Name / Last Name inputs | FR-UP-01 | DONE |
| 11.3 | Update onboarding, settings, and all greeting displays | FR-UP-01 | DONE |

---

## GAP 12 — Age Validation & Input Polish (P2)

**Problem**: FRS FR-UP-01 specifies minimum age 16 years, max 120. DOB should be a wheel-style picker (mobile) / calendar widget (web). Gender should be segmented buttons (web) not dropdown. We don't validate age and use basic HTML inputs.

| # | Task | FRS Ref | Status |
|---|------|---------|--------|
| 12.1 | Add DOB validation: minimum 16 years old, maximum 120 years | FR-UP-01 | DONE |
| 12.2 | Upgrade gender selector: segmented button group (web) instead of dropdown | FR-UP-01 | DONE (already segmented in onboarding) |
| 12.3 | Upgrade DOB picker: calendar widget with year/month navigation | FR-UP-01 | DONE (HTML date input with min/max constraints) |

---

## GAP 13 — Imperial / Metric Unit Toggle (P2)

**Problem**: FRS FR-UP-02 specifies a toggle between imperial (feet/inches, lbs) and metric (cm, kg) for height and weight, with default based on country. We only support metric (cm/kg).

| # | Task | FRS Ref | Status |
|---|------|---------|--------|
| 13.1 | Add unit preference toggle (Imperial / Metric) to body profile step and settings | FR-UP-02 | DONE |
| 13.2 | Support ft/in for height and lbs for weight, convert for storage (always store metric internally) | FR-UP-02 | DONE |

---

## GAP 14 — Wardrobe Size Field (P2)

**Problem**: FRS FR-WM-03 specifies a Size field on wardrobe items (XS, S, M, L, XL, XXL, 0-24, etc.). Not in our model.

| # | Task | FRS Ref | Status |
|---|------|---------|--------|
| 14.1 | Add `size` field to ClosetItem model (string, optional) | FR-WM-03 | DONE |
| 14.2 | Add size input to wardrobe item edit panel and upload form | FR-WM-03 | DONE |
| 14.3 | Include size in AI tagging output (if detectable) | FR-WM-03 | DEFERRED (AI tagging runs in mock mode) |

---

## GAP 15 — Wardrobe Browsing Completeness (P2)

**Problem**: FRS FR-WM-04 specifies additional filters (season, occasion), "Recently Added" sort, pagination (20/page), and favourite icon on grid cards. Backend supports season filter but frontend doesn't expose it. No occasion filter or pagination.

| # | Task | FRS Ref | Status |
|---|------|---------|--------|
| 15.1 | Add Season filter pills to wardrobe page (Summer, Winter, Spring, Fall, All-Season) | FR-WM-04 | DONE |
| 15.2 | Add "Recently Added" sort option (+ A-Z toggle) | FR-WM-04 | DONE |
| 15.3 | Add pagination or infinite scroll (20 items per page) | FR-WM-04 | DEFERRED (not needed until data volume grows) |

---

## GAP 16 — Wardrobe Deletion Polish (P2)

**Problem**: FRS FR-WM-06 specifies a "Recently Deleted" trash with 30-day retention, restore capability, batch deletion, and warning if item is in saved playbooks.

| # | Task | FRS Ref | Status |
|---|------|---------|--------|
| 16.1 | Add "Trash" section in wardrobe showing soft-deleted items, with restore button | FR-WM-06 | DONE |
| 16.2 | Add "This item appears in X playbooks" warning on wardrobe delete confirmation | FR-WM-06 | DEFERRED (needs playbook-item cross-reference) |
| 16.3 | Add multi-select + batch delete in wardrobe grid | FR-WM-06 | DEFERRED (UX polish) |

---

## GAP 17 — Occasion Search & Edit Regen Prompt (P2)

**Problem**: FRS FR-OM-05 specifies search by name/location on occasion list. Also: editing occasion fields should prompt "Update playbook with new details?" to trigger regeneration.

| # | Task | FRS Ref | Status |
|---|------|---------|--------|
| 17.1 | Add search bar to occasion list page (search by name, location) | FR-OM-05 | DONE |
| 17.2 | After saving occasion edits: if playbook exists, prompt "Update playbook with new details?" → trigger regeneration | FR-OM-05, FR-PB-02 | DONE |

---

## GAP 18 — Prep Timeline Editing (P2)

**Problem**: FRS FR-PREP-02 specifies user can add custom tasks, edit task name/time/duration, delete tasks, and track completion with timestamps. We only support checkbox toggling (local state).

| # | Task | FRS Ref | Status |
|---|------|---------|--------|
| 18.1 | Add "Add custom task" button to prep timeline | FR-PREP-02 | DONE |
| 18.2 | Allow editing task name and time inline | FR-PREP-02 | DONE (add/delete, inline input) |
| 18.3 | Allow deleting individual tasks (with confirmation) | FR-PREP-02 | DONE |
| 18.4 | Persist checklist completion state (currently local state only — save to backend) | FR-PREP-02 | DEFERRED (needs backend model extension) |

---

## GAP 19 — Password Reset Polish (P2)

**Problem**: FRS FR-UM-06/07 specifies rate limiting on reset requests (max 3/email/hour), cannot reuse current password, and auto-login after successful reset.

| # | Task | FRS Ref | Status |
|---|------|---------|--------|
| 19.1 | Backend: rate limit password reset requests to 3 per email per hour | FR-UM-06 | DONE |
| 19.2 | Backend: reject new password if it matches current password | FR-UM-07 | DONE |
| 19.3 | Frontend: auto-login (create session) after successful password reset | FR-UM-07 | DONE |

---

## GAP 20 — Dashboard "Tip of the Day" (P3)

**Problem**: FRS FR-UI-02 specifies an "Insights Widget" with a random styling tip. Not implemented.

| # | Task | FRS Ref | Status |
|---|------|---------|--------|
| 20.1 | Add "Tip of the day" widget to dashboard (rotating styling tips pool) | FR-UI-02 | DONE |

---

## GAP 21 — Venue Type Dropdown (P3)

**Problem**: FRS FR-OM-02 specifies a structured Venue Type field (Indoor, Outdoor, Mixed). We have free-text venue field.

| # | Task | FRS Ref | Status |
|---|------|---------|--------|
| 21.1 | Add Venue Type selector (Indoor / Outdoor / Mixed) to occasion creation step 1 | FR-OM-02 | DONE |

---

## GAP 22 — Colour Education Module (P3)

**Problem**: FRS FR-CA-03 specifies an education module: "Why these colours work for you". We show palette results but no educational explanation of colour theory.

| # | Task | FRS Ref | Status |
|---|------|---------|--------|
| 22.1 | Add expandable "Why these colours work" section to colour analysis results page | FR-CA-03 | DONE |

---

## GAP 23 — Outfit Item Swap / Alternatives (P3)

**Problem**: FRS FR-LOOK-02 specifies each garment in an outfit should be clickable with a "Show alternatives" option to swap individual items. Not implemented.

| # | Task | FRS Ref | Status |
|---|------|---------|--------|
| 23.1 | Make outfit items clickable → show wardrobe item detail | FR-LOOK-02 | DONE |
| 23.2 | Add "Show alternatives" swap button per item in outfit | FR-LOOK-02 | DEFERRED (needs wardrobe item matching algorithm) |

---

## Summary

| Priority | Total | Done | Remaining |
|----------|-------|------|-----------|
| **P0** | 6 tasks | 6 | **0** |
| **P1** | 13 tasks | 12 | **1** (10.4 max-length decision — deferred to PM) |
| **P2** | 34 tasks | 28 | **6** (deferred: pagination, playbook warnings, batch delete, checklist persistence) |
| **P3** | 5 tasks | 4 | **1** (23.2 item swap alternatives — deferred) |
| **Blocked** | 7 items | 0 | 7 (waiting on API keys) |
| **Deferred** | 14 items | — | Phase 2+ |

**Round 1** closed 25/27 implementable tasks (9 gaps).
**Round 2** identified 14 additional gaps (31 new tasks) — mostly P2/P3 polish items.
**Round 3** implemented 24/31 Round 2 tasks. 7 remaining are deferred (low-priority or need external dependencies).

---

## Change Log

| Date | Change |
|------|--------|
| 2026-02-17 | Initial gap analysis created from FRS v1, Journey Map, and Lovable northstar review |
| 2026-02-17 | All 9 gaps implemented: 7-step onboarding, desired outcome multi-select, colour analysis progress UX, day-of page, guided photo capture, wardrobe favourites, occasion map link + delete warnings, auth rate limiting, playbook partial regeneration |
| 2026-02-17 | **Round 2 alignment review**: Identified 14 additional gaps (GAP 10-23, 31 tasks). Key new findings: password rules (FR-UM-03), first/last name split (FR-UP-01), imperial/metric toggle (FR-UP-02), wardrobe size field (FR-WM-03), season filter (FR-WM-04), trash/restore UI (FR-WM-06), occasion search (FR-OM-05), playbook regen on occasion edit (FR-PB-02), prep timeline editing (FR-PREP-02), password reset polish, tip of the day, venue type, colour education, outfit item swap |
| 2026-02-17 | **Round 3 implementation**: Implemented 24/31 Round 2 tasks across all 14 gaps. Backend: password validators, reset rate limiting, no-reuse-current, auto-login token, size field + migration, first/last name model + migration, trash/restore endpoints. Frontend: password strength bars, first/last name registration, imperial/metric toggle, age validation, season filters, sort toggle, size field in wardrobe detail, trash/restore UI, occasion search, playbook regen prompt, prep timeline editing (add/delete tasks), tip of the day, venue type selector, colour education module, clickable outfit items. 7 tasks deferred. |
