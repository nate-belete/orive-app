# Orivé Layouts & Screens

> Complete inventory of every layout and screen needed for Phase 1.
> Aligned to the Lovable northstar (https://orivedraft1.lovable.app/) and FRS v1.

---

## Layout System (Shells)

The app uses **4 distinct layout shells** that wrap individual pages:

### L1. Public Layout
- **Used by:** Landing, Login, Register, Forgot Password, Reset Password, 404
- **Structure:** Minimal top bar with "ORIVÉ" logo (links to `/`), no sidebar, no bottom nav
- **Style:** Clean, centered content, cream/warm background
- **No auth required**

### L2. Auth Card Layout
- **Used by:** Login, Register, Forgot Password, Reset Password
- **Structure:** Inherits Public Layout, content rendered as a centered card on cream background
- **Components:** Logo above card, form inside card, social login buttons, footer link (switch between login/register)

### L3. Onboarding Layout
- **Used by:** All 5 onboarding steps
- **Structure:** Step progress indicator (dots + "Step X of 5") at top, centered content area, Back/Continue buttons at bottom, "Skip for now" link
- **Style:** Full-height, no sidebar, progress dots in gold
- **Auth required, shown only before onboarding is complete**

### L4. App Layout (Main Shell) — **BUILT (responsive)**
- **Used by:** All authenticated post-onboarding pages
- **Structure (desktop, md+ breakpoint):**
  - **Side navigation:** 256px white sidebar, sticky, with Orivé logo, 6 nav items (Dashboard, Wardrobe, Occasions, Playbooks, Colours, Settings), user avatar + email, sign-out button
  - **Main content area:** Scrollable, max-w-5xl, responsive padding (px-4 → px-6 → px-8)
- **Structure (mobile, <md breakpoint):**
  - **Top bar:** Orivé logo (left) + hamburger menu (right)
  - **Slide-out drawer:** Full nav + user section + sign out (right-aligned overlay)
  - **Bottom tab bar:** 5 quick-access tabs (Dashboard, Wardrobe, Occasions, Playbooks, Colours), 48px min touch targets, safe-area-bottom padding for notched devices
  - **Main content:** Extra bottom padding (pb-20) to avoid bottom nav overlap
- **Accessibility:** Skip-to-content link, aria-current on active nav, aria-labels on all interactive elements, semantic nav/main/header roles
- **Auth required, onboarding must be complete**
- **IMPORTANT — No dark mode / dark backgrounds:**
  - Sidebar: **white/cream** background (`#FFFFFF` or `#FAF8F5`), NOT dark
  - Active nav item: subtle cream/gold highlight (`#F5F0E8`), gold text — NOT a dark fill
  - Inactive nav items: charcoal text on light background
  - The entire app stays in the warm cream/light palette established by the Lovable northstar and the Orivé Spec folder
  - The ONLY dark panel in the entire app is the login page right-side inspiration panel (per the Lovable northstar screenshot)

---

## Screen Inventory

### Public Pages (Unauthenticated)

#### P1. Landing Page `/`
- **Layout:** L1 (Public)
- **Nav bar:** Sticky, cream bg. "ORIVÉ" (left, letter-spaced serif). "Sign In" (text, right). "Get Started" (black pill button, right).
- **Sections:**
  1. **Hero:** Asymmetric two-column layout
     - **Left (~50%):** 
       - Overline: "AI-POWERED OCCASION PREPARATION" (gold, uppercase, letter-spaced)
       - Heading: "Show up" (Playfair Display, dark, large) + line break + "*unmistakably you.*" (Playfair Display italic, gold)
       - Body: "Your wardrobe, your style, your confidence — orchestrated for life's biggest and every day moments."
       - CTA: "Start Your Journey →" (BLACK pill button with arrow)
     - **Right (~50%):** Full-height fashion photograph (man in tan suit, or brand photography)
  2. **How It Works:** Centred section
     - Overline: "HOW IT WORKS" (gold, uppercase, letter-spaced)
     - Heading: "Preparation, *perfected.*" (Playfair Display, italic on "perfected")
     - 4 feature cards in a row (grid):
       - Each card: gold-tinted icon badge (40x40 rounded square) + heading (bold Inter) + description (grey Inter)
       - Smart Wardrobe (hanger icon), Colour Analysis (palette icon), AI Playbooks (sparkle icon), Virtual Try-On (eye icon)
  3. **Final CTA:** Grey background section (`#F5F3F0`), centred
     - Heading: "Ready to own *every room* you walk into?" (Playfair Display, italic on "every room")
     - Subtext: "Join ORIVÉ and transform how you prepare and show up for life's moments."
     - CTA: "Create Your Profile →" (dark/charcoal pill button with arrow)
  4. **Footer:** Cream bg, "ORIVÉ" (left), "© 2026 Orivé. All rights reserved." (right)
- **Ref:** Lovable landing screenshots (hero, how it works, footer CTA, footer)

#### P2. Register Page `/register`
- **Layout:** L2 (Auth Card) — centred card on cream background
- **Content:**
  - Heading: "Join ORIVÉ" (Playfair Display serif)
  - Subheading: "Create your personal styling profile" (grey, Inter)
  - Form fields:
    - Full Name (with person icon)
    - Email (with envelope icon, gold border when focused)
    - Password (with lock icon, eye toggle for show/hide)
  - "Create Account" button (**gold gradient**, full-width, pill-shaped)
  - Divider: "OR CONTINUE WITH" (overline style, uppercase, letter-spaced)
  - Social button: Continue with Google (outlined, G icon) — shown but disabled until Phase A6
  - Footer: "Already have an account? **Sign in**" (gold link)
- **Validation:** Real-time email format, password strength indicator (8-12 chars, upper/lower/number)
- **Note:** Registration uses gold gradient button (not black) — user is entering the "personal" space
- **Ref:** Lovable `/register`, FRS spec mockup image4.png, FRS FR-UM-01/02/03

#### P3. Login Page `/login`
- **Layout:** Custom split layout (NOT the standard Auth Card)
- **Structure:** Two-panel split — ~45% form panel (left) / ~55% inspiration panel (right)
- **Left panel (form):**
  - "ORIVÉ" logo (top left)
  - Heading: "Welcome back" (Playfair Display serif)
  - Subheading: "Sign in to continue your journey" (grey, Inter)
  - Form fields:
    - Email (with envelope icon, placeholder "you@example.com")
    - Password (with lock icon, eye toggle for show/hide)
  - "Sign In" button (BLACK, full-width, pill-shaped)
  - "Forgot password?" link (below button, gold text)
  - Divider: horizontal lines with "OR" text between
  - Social button: Continue with Google (outlined, G icon) — shown but disabled until Phase A6
  - Footer: "Don't have an account? **Create one**" (gold link)
- **Right panel (inspiration):**
  - Dark fashion photograph (full-height, covers entire panel)
  - Dark overlay with centred text:
    - "Your confidence, *curated*." (Playfair Display, white, italic on "curated")
    - "AI-powered styling that understands your wardrobe, your body, and your goals." (Inter, white, smaller)
  - This panel is **hidden on mobile** (form goes full-width)
- **Ref:** Lovable `/login` screenshot, FRS FR-UM-01/02/04

#### P4. Forgot Password Page `/forgot-password`
- **Layout:** L2 (Auth Card)
- **Content:**
  - Heading: "Reset your password"
  - Subheading: "Enter your email and we'll send you a reset link"
  - Form field: Email
  - "Send Reset Link" button
  - Footer: "Remember your password? Sign in"
- **Ref:** FRS FR-UM-06

#### P5. Reset Password Page `/reset-password?token=...`
- **Layout:** L2 (Auth Card)
- **Content:**
  - Heading: "Create new password"
  - Form fields: New Password, Confirm Password
  - Password requirements checklist (live validation)
  - "Reset Password" button
  - Success state: "Password updated! Redirecting to login..."
- **Ref:** FRS FR-UM-07

#### P6. 404 Page (any invalid route)
- **Layout:** L1 (Public)
- **Content:**
  - Large "404"
  - "Oops! Page not found"
  - "Return to Home" button
- **Ref:** Lovable 404 page

---

### Onboarding Pages (Authenticated, Pre-Completion)

#### O1. Onboarding Step 1: Welcome `/onboarding`
- **Layout:** L3 (Onboarding) — Step 1 of 5
- **Content:**
  - Gold sparkle/star icon (centered)
  - Heading: "Welcome to ORIVÉ"
  - Subtext: "Let's set up your profile so we can create personalised outfit recommendations just for you."
  - "Get Started →" button (gold gradient, full-width)
- **Ref:** FRS mockup image1.png

#### O2. Onboarding Step 2: The Basics `/onboarding/basics`
- **Layout:** L3 (Onboarding) — Step 2 of 5
- **Content:**
  - Heading: "The Basics"
  - Fields:
    - Full Name (pre-populated from registration or OAuth)
    - Gender: Segmented button (Female / Male / Non-binary)
    - Date of Birth: Date picker
    - Postcode/ZIP: Text input with placeholder "For local weather & recommendations"
  - Back / Continue buttons
  - "Skip for now" link
- **Ref:** FRS FR-UP-01, mockup image5.png

#### O3. Onboarding Step 3: Measurements `/onboarding/measurements`
- **Layout:** L3 (Onboarding) — Step 3 of 5
- **Content:**
  - Heading: "Your Measurements"
  - Subtitle: "Optional — helps us recommend better fits"
  - Fields:
    - Height (cm or ft/in with unit toggle)
    - Weight (kg or lbs with unit toggle)
  - Body type presets: Visual card grid (Hourglass, Triangle, Inverted Triangle, Rectangle, Round) with body illustrations
  - Privacy note: "This information is private and used only to improve recommendations"
  - Back / Continue buttons
  - "Skip for now" link
- **Ref:** FRS FR-UP-02, mockup image6.png, image7.jpeg (Style DNA body type UI)

#### O4. Onboarding Step 4: Photos `/onboarding/photos`
- **Layout:** L3 (Onboarding) — Step 4 of 5
- **Content:**
  - Heading: "Your Photos"
  - Two upload sections:
    1. **Full-Body Photo** — "For virtual try-ons"
       - Upload area (drag & drop or click to browse)
       - Guidelines: "Stand upright, front-facing, in natural lighting"
       - Camera capture option (uses device camera)
    2. **Face Photo** — "For colour analysis"
       - Upload area
       - Guidelines: "Clear photo, neutral expression, no glasses, natural lighting"
       - Camera capture option with face guide overlay
  - Privacy consent: "Your photos are securely stored and never shared"
  - Back / Continue buttons
  - "Skip for now" link
- **Ref:** FRS FR-UP-03, FR-CA-01, mockup image8.png

#### O5. Onboarding Step 5: Style Preferences `/onboarding/style`
- **Layout:** L3 (Onboarding) — Step 5 of 5
- **Content:**
  - Heading: "Your Style"
  - Three text areas:
    1. "What do you usually wear?" (style go-tos)
    2. "What don't you usually wear?" (style no-goes)
    3. "What can't you wear?" (restrictions/constraints)
  - Each with placeholder examples
  - Back / "Complete Setup →" button (gold, final step)
  - "Skip for now" link
- **Ref:** FRS FR-WM-08

---

### Main App Pages (Authenticated, Post-Onboarding)

#### A1. Dashboard `/dashboard` — **BUILT**
- **Layout:** L4 (App)
- **Sections:**
  1. **Greeting bar:** "Good morning/afternoon/evening, [First Name]" with "Here's your style overview"
  2. **Next Occasion Card:** (if upcoming) — gold-tinted card with name, date, location, countdown pill, importance dots, playbook status, and generate CTA
  3. **Stats Grid:** 4 real-data cards (Wardrobe count, Upcoming occasions, Playbooks created, Colour Season) with links to respective pages
  4. **Quick Actions:** 3-card row — Add to Wardrobe, Plan an Occasion, Colour Analysis
  5. **Upcoming Occasions:** List of next 3 occasions (if >1 upcoming) with date, countdown, link
  6. **Recent Activity Feed:** Merged timeline of recent wardrobe additions and occasion creations (up to 8 items), sorted by date, with typed icons and timestamps
- **Empty states:** Dynamic per section — friendly prompts to add first item/plan first occasion
- **Ref:** FRS FR-UI-02

#### A2. Wardrobe Browse `/wardrobe`
- **Layout:** L4 (App)
- **Sections:**
  1. **Top bar:** "My Wardrobe" heading, item count, "+ Add Item" button
  2. **Search bar:** Full-width text search
  3. **Filter chips:** Category, Colour, Season, Occasion, Favourites
  4. **Item grid:** 3 columns (mobile), 4-6 columns (desktop)
     - Each card: Photo thumbnail, item name, category badge, favourite heart icon
  5. **Infinite scroll** or pagination (20 items/page)
- **Empty state:** "Your wardrobe is empty. Add your first item!"
- **Ref:** FRS FR-WM-04

#### A3. Wardrobe Add Item `/wardrobe/add`
- **Layout:** L4 (App) — could also be a modal/drawer overlay
- **Flow:**
  1. **Upload step:** Camera capture or gallery upload (multi-select)
     - Photo preview with remove (X) button
     - Upload progress indicator
  2. **Tagging step:** (shown after upload, pre-populated by AI)
     - AI-detected tags shown with edit capability
     - Fields: Item Name, Category (dropdown), Brand (autocomplete), Colour (multi-select), Pattern, Formality (casual→formal slider), Season, Occasion tags, Notes
     - "Accept All" or edit individual tags
  3. **Confirmation:** "Item added to wardrobe!" success state
- **Ref:** FRS FR-WM-01/02/03

#### A4. Wardrobe Item Detail `/wardrobe/[id]`
- **Layout:** L4 (App)
- **Sections:**
  1. **Hero image:** Full-width item photo (zoomable)
  2. **Item name** (editable inline) + favourite toggle
  3. **Tags section:** Category badge, colour swatches, season, occasion tags, brand, size
  4. **Colour Palette Match:** Visual indicator (Flattering / Neutral / Caution)
  5. **Usage stats:** Times worn, last worn date, outfit combinations count
  6. **Notes:** Editable text area
  7. **Actions:** Edit, Delete (with confirmation dialog)
- **Ref:** FRS FR-WM-05

#### A5. Wardrobe Item Edit `/wardrobe/[id]/edit`
- **Layout:** L4 (App) — or inline edit on A4
- **Content:** Same fields as A3 tagging step, pre-populated with current values
- **Ref:** FRS FR-WM-03

#### A6. Colour Analysis `/colour-analysis` — **BUILT**
- **Layout:** L4 (App)
- **States:**
  1. **No analysis yet:** Centered card with palette icon, "Find Your Perfect Palette" heading, "Upload Face Photo" gold CTA button. Below: 3 tip cards (Natural Light, No Makeup, Face Forward) in a 3-column grid with icons and descriptions.
  2. **Analysis in progress:** Spinning gold border loader, "Analysing your colouring..." heading, sub-copy explaining the process.
  3. **Results view:**
     - **Season hero card:** Left: face photo (aspect-auto on desktop, aspect-square on mobile). Right: overline "Your Season", large season name (e.g., "Warm Autumn"), 2-3 sentence personalised description, inline characteristics (Undertone, Eyes, Hair), "Retake Analysis" outline button.
     - **Your Best Colours:** 12 colour swatches in a 4→6→12 col responsive grid. Each swatch: square with rounded corners + colour name below. Click to copy hex code.
     - **Your Best Neutrals:** 5 larger swatches in a 5-col grid, same click-to-copy interaction.
     - **Colours to Avoid:** 5 swatches at 60% opacity to visually de-emphasise.
     - **Styling Tips:** Card with 5 numbered tips, each with a gold-tinted circle number badge.
     - **Wardrobe Harmony:** Card with stacked progress bar (emerald → grey → light grey → red), legend grid (In Palette, Universal Neutrals, Unmatched, Off Palette), and Harmony Score percentage with "View Wardrobe" outline CTA.
- **Ref:** FRS FR-CA-02/03

#### A7. Occasions List `/occasions` — **BUILT**
- **Layout:** L4 (App)
- **Sections:**
  1. **Top bar:** "Occasions" heading + subtitle, gold "+ New Occasion" button
  2. **Status filter tabs:** All / Upcoming / Today / Past — pill buttons, charcoal active state
  3. **Occasion cards:** (sorted by status then date)
     - Status badge (upcoming=blue, today=gold, past=grey, cancelled=red)
     - Importance dots (1-5 gold dots)
     - "Playbook Ready" emerald badge if generated
     - Occasion name (heading, gold on hover)
     - Date/time with calendar icon, location with pin icon, dress code
     - Countdown string on right (e.g., "In 3 days", "Tomorrow", "Earlier today")
     - Hover-reveal delete button + chevron arrow
  4. **Empty state:** Calendar icon in gold circle, contextual message, CTA button
- **Ref:** FRS FR-OM-05

#### A8. Occasion Create `/occasions/new` — **BUILT**
- **Layout:** L4 (App)
- **3-step wizard** with numbered step indicator (gold active, check for complete, grey for pending):
  1. **Step 1 — The Basics:**
     - Occasion Type: 14 types as a 2×3→3 col grid of bordered buttons (gold highlight on select)
     - Name: optional text input ("we'll generate one if you skip this")
     - When: datetime-local input (required)
     - Ends at: optional datetime-local
     - Location + Venue: side-by-side text inputs
  2. **Step 2 — Details:**
     - Dress Code: 8 pill buttons (charcoal active)
     - Your Role: 7 pill buttons (guest, host, speaker, etc.)
     - Importance: 1-5 numbered square buttons (gold fill when selected), helper text about prep timeline
     - Attendees: textarea
     - Budget: $ prefixed number input + Weather hint: text input (side by side)
  3. **Step 3 — Final Touches:**
     - Desired Outcomes: 10 multi-select pill buttons (Confident, Professional, Approachable, etc.) with gold border when selected, plus free-text input below
     - Comfort Level: 3 radio cards (Minimal/Balanced/Maximum) with descriptions
     - Description: textarea for additional context
  - Navigation: Cancel/Back on left, Continue/Create Occasion on right
- **Ref:** FRS FR-OM-01/02/03

#### A9. Occasion Detail `/occasions/[id]` — **BUILT**
- **Layout:** L4 (App)
- **Sections:**
  1. Back link ("← All Occasions")
  2. Status badge + countdown string, large occasion name heading, Edit + Delete buttons
  3. Detail grid card (2→3 col responsive):
     - Type, Date & Time, End time, Location, Venue, Dress Code, Role, Comfort, Importance (bar chart), Budget, Weather, Desired Outcome (full width), Attendees (full width), Notes (full width)
  4. Inline edit mode: text/textarea inputs for all editable fields, Save/Cancel buttons
  5. Playbook CTA card: "Generate a Playbook" or "Your Playbook" with gold CTA button
  4. Weather widget (if event within 14 days) — FUTURE (needs ACT-08)
  5. Playbook status + link
  6. AI context-aware suggestions ("Based on this occasion, we suggest: Business Formal")
  7. Actions: Edit, Delete, "Generate Playbook" / "View Playbook"
- **Ref:** FRS FR-OM-05/06

#### A10. Occasion Edit `/occasions/[id]/edit`
- **Layout:** L4 (App)
- **Content:** Same form as A8, pre-populated
- **On save:** Prompt "Update playbook with new details?"
- **Ref:** FRS FR-OM-05

#### A11. Playbook View `/playbooks/[occasionId]` — **BUILT**
- **Layout:** L4 (App)
- **Header:** Back link to occasion, overline "Playbook", occasion name as h1, date/location subtitle, Regenerate outline button
- **Tab bar:** 4 tabs (Look, Prep Timeline, Presence, Beauty) in a white rounded card with charcoal active state
- **Generate CTA:** If no playbook exists — sparkle icon in gold circle, heading, description, gold "Generate Playbook" button. Loading state with spinner + "Building your playbook..." message.
- **Structure:**

  **Tab 1: LOOK**
  - **Outfit selector pills:** Option A / B / C as gold pill buttons
  - **Selected outfit card:**
    - Title (h2 heading)
    - "Outfit Pieces" overline → responsive grid (2→3→4 col) of cream cards showing item name + category
    - "Why This Works" section with reasoning paragraph
    - "Styling Notes" section with specific how-to-wear advice
    - "Accessories" section with suggestions
    - Risk flags in amber alert box (if any)
  - **Wardrobe Upgrade Suggestions** card: prioritised items list with gold/amber/grey dots by priority, item name + reasoning on cream backgrounds

  **Tab 2: PREP TIMELINE**
  - Vertical timeline with gold dot markers and connecting grey lines
  - 6 phases (shown if non-empty): Week Before → 3 Days Before → Day Before → Morning Of → Just Before → Pack List
  - Each phase: icon in gold circle, bold label, checklist items below
  - Interactive checkboxes: gold accent, strikethrough text on check
  - Phase visibility scales with occasion importance (1-5)

  **Tab 3: PRESENCE**
  - **Pep Talk card** (highlight): gold gradient background, overline "Your Pep Talk", italic quote text
  - **Mindset** card: numbered gold circle tips (1, 2, 3, 4)
  - **Body Language** card: gold bullet tips
  - **Conversation Guide** card with 3 sub-sections:
    - Openers: italic quotes in cream cards
    - Topics to Explore: gold bullet list
    - Graceful Exits: italic quotes in cream cards

  **Tab 4: BEAUTY**
  - **Skin Prep** card: numbered steps with gold circles
  - **Hair + Fragrance**: side-by-side cards on sm+ screens
  - **Grooming Checklist** card: interactive checkboxes with strikethrough
  - Backwards-compatible with old `notes` format

- **Ref:** FRS FR-LOOK-01/02/04, FR-PREP-01/02, FR-COACH-01

#### A12. Virtual Try-On `/playbooks/[occasionId]/tryon`
- **Layout:** L4 (App) — could be full-screen overlay
- **Content:**
  - AI-generated image: user wearing the selected outfit
  - Outfit selector: switch between Look 1 / Look 2 / Look 3
  - Full-screen image with zoom/pan
  - "Save to Device" button
  - "Share" button (OS share sheet)
  - Loading state: "Generating your look..." with progress
- **Ref:** FRS FR-LOOK-05, FR-LK-02/03, mockup image11.png

#### A13. Feedback Form `/feedback/[occasionId]`
- **Layout:** L4 (App)
- **Content:**
  - Occasion name + date (read-only header)
  - "How did it go?" heading
  - Fields:
    - Did you wear the recommended outfit? (Yes/No toggle)
    - Confidence rating (1-5 stars)
    - Notes (free text: "What worked? What didn't?")
    - Would you repeat this outfit? (Yes/No toggle)
  - "Submit Feedback" button
- **Ref:** FRS FR-COACH-02 (post-event prompt), current POC feedback model

#### A14. History `/history`
- **Layout:** L4 (App)
- **Content:**
  - Chronological list of past occasions
  - Each card: occasion name, date, type, feedback summary (confidence rating, wore-it badge)
  - Click → occasion detail with playbook + feedback
  - Filter/search
- **Ref:** Current POC history page concept

#### A15. Profile & Settings `/settings` — **BUILT**
- **Layout:** L4 (App)
- **3-tab layout** (Profile / Style Preferences / Account):
  1. **Profile tab:** Personal info (full name, email read-only, gender, DOB, postcode/ZIP), Body profile (height cm, weight kg, body type select), Colour season (read-only with link to palette page)
  2. **Style Preferences tab:** Go-tos, No-goes, Can't-wear textareas — saved to user profile for AI personalisation
  3. **Account tab:** Email + member since, Notifications placeholder (future), Password reset link
- **Save button** per tab with success/error feedback
- **Ref:** FRS FR-UP-01/02/03/04, FR-UM-05

---

## Screen Count Summary

| Category | Screens | IDs |
|----------|---------|-----|
| Public | 6 | P1–P6 |
| Onboarding | 5 | O1–O5 |
| Main App | 15 | A1–A15 |
| Layout Shells | 4 | L1–L4 |
| **Total** | **30** (26 pages + 4 shells) | |

---

## Shared Components (Used Across Multiple Screens)

| Component | Used In | Description |
|-----------|---------|-------------|
| `OriveLogo` | All | "ORIVÉ" text logotype (Playfair Display, letter-spaced), links to `/` or `/dashboard` |
| `BlackButton` | Public pages | Primary CTA: black bg, white text, pill-shaped, arrow icon |
| `GoldButton` | Authenticated pages | Primary CTA: gold gradient bg, white text, pill-shaped, arrow icon |
| `OutlineButton` | All | Secondary button: transparent bg, charcoal text, grey border |
| `FormInput` | Auth, Onboarding, Forms | Text input with label, validation, error state |
| `FormSelect` | Forms | Dropdown select with label |
| `FormTextarea` | Forms | Multi-line text input |
| `DatePicker` | Onboarding, Occasions | Date selection widget |
| `StarRating` | Occasions, Feedback | 1-5 star rating input |
| `PhotoUpload` | Onboarding, Wardrobe, Colour | Camera/gallery upload with preview |
| `StepIndicator` | Onboarding | Dot progress indicator with step label |
| `FilterChips` | Wardrobe, Occasions | Horizontal scrollable filter buttons |
| `ItemCard` | Wardrobe | Photo thumbnail + name + category badge |
| `OccasionCard` | Dashboard, Occasions | Name + date + countdown + status |
| `PlaybookTab` | Playbook | Tab navigation (LOOK / PREP / PRESENCE) |
| `OutfitCard` | Playbook LOOK | Outfit composition + reasoning + actions |
| `TimelineTask` | Playbook PREP | Checkbox + task name + time + duration |
| `CoachingCard` | Playbook PRESENCE | Swipeable content card |
| `ColourSwatch` | Colour Analysis, Wardrobe | Colour circle + name + hex |
| `ConfirmDialog` | Delete actions | Modal with confirm/cancel |
| `EmptyState` | Lists | Illustration + message + CTA |
| `LoadingSpinner` | Async operations | Branded loading indicator |
| `Toast` | All | Success/error notification |
| `Avatar` | Nav, Profile | User profile image circle |
| `Badge` | Wardrobe, Occasions | Small status/category label |
| `SearchBar` | Wardrobe, Occasions | Text input with search icon |

---

## Navigation Map

```
Landing (P1)
├── Register (P2) → Onboarding (O1→O5) → Dashboard (A1)
├── Login (P3) → Dashboard (A1)
├── Forgot Password (P4) → Reset Password (P5) → Login (P3)
└── 404 (P6)

Dashboard (A1)
├── Wardrobe (A2) → Add Item (A3) → Item Detail (A4) → Edit (A5)
├── Colour Analysis (A6)
├── Occasions (A7) → Create (A8) → Detail (A9) → Edit (A10)
├── Playbooks (A11) → Virtual Try-On (A12)
├── Feedback (A13)
├── History (A14)
└── Profile (A15)
```

---

## Design Tokens (Extracted from Lovable Screenshots + Spec Mockups)

> Sourced from the 4 Lovable screenshots (landing, login, how it works, footer CTA)
> and the Orivé Spec mockups (onboarding steps 1-3, registration form).

### Colours

> **DESIGN PRINCIPLE: NO DARK MODE.** The entire app uses a warm, light cream/white palette.
> There are NO dark backgrounds, dark sidebars, or dark panels anywhere in the app —
> except the login page's right-side inspiration panel (per the Lovable northstar).
> The sidebar, nav bars, cards, and all surfaces are cream (#FAF8F5) or white (#FFFFFF).
> This aligns with the Orivé Spec folder mockups and the Lovable app screenshots provided by the product manager.

| Token | Value | Usage |
|-------|-------|-------|
| `--color-cream` | `#FAF8F5` | Primary page background (all pages) |
| `--color-cream-dark` | `#F0EDE8` | Card backgrounds, input backgrounds |
| `--color-grey-bg` | `#F5F3F0` | CTA section background (footer CTA area) |
| `--color-white` | `#FFFFFF` | Card surfaces, form card on login |
| `--color-charcoal` | `#1A1A1A` | Primary text, primary buttons on public pages |
| `--color-grey-700` | `#374151` | Secondary headings |
| `--color-grey-500` | `#6B7280` | Body text, subtitles, "Sign in to continue your journey" |
| `--color-grey-400` | `#9CA3AF` | Placeholder text, disabled states |
| `--color-grey-300` | `#D1D5DB` | Borders, dividers, "OR" separator line |
| `--color-gold` | `#C4A265` | Accent text ("AI-POWERED OCCASION PREPARATION"), active step dots, icon tints |
| `--color-gold-italic` | `#C9A96E` | Italic emphasis ("unmistakably you.", "perfected.", "curated.") |
| `--color-gold-gradient-start` | `#C4A265` | Gold gradient button left/top (onboarding & registration) |
| `--color-gold-gradient-end` | `#D4B87A` | Gold gradient button right/bottom |
| `--color-gold-border` | `#C4A265` | Active input border (registration email field) |
| `--color-dark-panel` | `#2D2926` | Login right panel ONLY (dark image overlay) — not used anywhere else in the app |
| `--color-nav-active-bg` | `#F5F0E8` | Sidebar active nav item background (subtle warm cream, NOT dark) |
| `--color-success` | `#22C55E` | Success states |
| `--color-error` | `#EF4444` | Error states, required field indicators |
| `--color-warning` | `#F59E0B` | Caution colour match warnings |
| `--color-link` | `#C4A265` | "Sign in" / "Create one" links (gold) |

### Button Styles (Important: Two Distinct Systems)

| Button Type | Background | Text | Border | Used Where |
|-------------|-----------|------|--------|------------|
| **Public Primary** | `#1A1A1A` (charcoal/black) | white | none | "Start Your Journey", "Get Started", "Sign In", "Create Your Profile" |
| **Public Primary Hover** | `#374151` (slightly lighter) | white | none | Hover state |
| **Internal Primary** | Gold gradient (`#C4A265` → `#D4B87A`) | white | none | "Get Started" (onboarding), "Continue", "Create Account" |
| **Internal Primary Hover** | Gold gradient (slightly darker) | white | none | Hover state |
| **Secondary / Outline** | transparent | charcoal | `#D1D5DB` | "← Back", social login buttons |
| **Text Link** | none | `#C4A265` (gold) | none | "Skip for now", "Sign in", "Create one" |

> **Key design insight:** Public-facing pages (landing, login, register) use **black** primary buttons.
> Authenticated pages (onboarding, internal app) use **gold gradient** primary buttons.
> This creates a visual transition from "brand authority" (black) to "warm personal" (gold) once the user enters the app.

### Typography

| Token | Value | Usage |
|-------|-------|-------|
| `--font-heading` | `'Playfair Display', serif` | H1, H2, H3 headings |
| `--font-body` | `'Inter', sans-serif` | Body text, labels, buttons, inputs |
| `--font-logo` | `'Playfair Display', serif` (letter-spaced) | "ORIVÉ" logotype |
| `--text-hero` | `48px / 56px` | Landing page main heading |
| `--text-h1` | `36px / 44px` | Page headings ("Welcome back", "The Basics") |
| `--text-h2` | `28px / 36px` | Section headings ("Preparation, perfected.") |
| `--text-h3` | `20px / 28px` | Card headings ("Smart Wardrobe") |
| `--text-body` | `16px / 24px` | Body text |
| `--text-small` | `14px / 20px` | Labels, captions, meta text |
| `--text-overline` | `12px / 16px`, uppercase, `tracking-widest` | "AI-POWERED OCCASION PREPARATION", "HOW IT WORKS", "OR CONTINUE WITH" |
| `--text-label` | `14px / 20px`, `font-semibold` | Form labels ("Full Name", "Email", "Password") |

### Typography Patterns

- **Headings:** Playfair Display, often with one word in *italic* for emphasis ("unmistakably *you*", "Preparation, *perfected*", "Your confidence, *curated*")
- **Overlines:** Uppercase, letter-spaced, small, gold colour
- **Body:** Inter, regular weight, grey-500 to grey-700
- **Logo "ORIVÉ":** Playfair Display, uppercase, letter-spaced ~0.15em, normal weight

### Spacing & Sizing

| Token | Value | Usage |
|-------|-------|-------|
| `--radius-sm` | `6px` | Small elements, badges |
| `--radius-md` | `8px` | Inputs, filter chips |
| `--radius-lg` | `12px` | Cards |
| `--radius-xl` | `24px` | Buttons (pill-shaped) |
| `--radius-full` | `9999px` | Circular elements (step dots, avatars) |
| `--shadow-sm` | `0 1px 2px rgba(0,0,0,0.05)` | Subtle elevation |
| `--shadow-card` | `0 1px 3px rgba(0,0,0,0.08)` | Feature cards (How It Works) |
| `--shadow-md` | `0 4px 6px rgba(0,0,0,0.07)` | Form cards, modals |
| `--max-width-content` | `1200px` | Main content area |
| `--max-width-form` | `480px` | Form card width (login/register) |
| `--max-width-onboarding` | `560px` | Onboarding content width |

### Layout-Specific Design Notes

**Landing Page (from screenshots):**
- Nav height: ~64px, sticky, cream background, subtle bottom border
- Hero: asymmetric 50/50 split — text left, full-height fashion photo right
- "How It Works" icons: 40x40px rounded squares with gold/warm tint background
- Feature cards: ~equal width, subtle border or shadow, generous padding (~24px)
- Footer CTA section: grey-bg (`#F5F3F0`), centered text, generous vertical padding (~80px)
- Footer: cream background, "ORIVÉ" left, copyright right, minimal height (~48px)

**Login Page (from screenshot):**
- Split layout: ~45% form (cream/white bg) / ~55% image panel (dark overlay)
- Form panel: "ORIVÉ" top left, form centered vertically
- Image panel: dark fashion photo with text overlay ("Your confidence, *curated*.")
- Social buttons: full-width, outlined, icon + text, ~48px height
- "OR" divider: horizontal lines left/right of "OR" text, grey-300

**Onboarding (from spec mockups):**
- Step dots: 5 circles at top, ~8px diameter, gold when active/complete, grey-300 when pending
- "Step X of 5" text below dots, grey-500, small
- Content: centered, max-width ~560px
- Bottom bar: "← Back" (outline) left, "Continue →" (gold gradient) right, "Skip for now" centered below
- Form inputs: full-width, ~48px height, rounded-md border, grey-300 border, gold border on focus
- Gender selector: 3 segmented buttons (equal width), outline style, selected = filled

**Registration (from spec mockup):**
- Card-style form (no split layout, unlike login)
- Input icons: left-aligned inside input (envelope for email, lock for password)
- Eye toggle for password visibility (right side)
- "Create Account" button: gold gradient, full-width, ~48px height
- "OR CONTINUE WITH" overline divider
- "Continue with Google" button: outlined, Google G icon, full-width
- "Already have an account? **Sign in**" footer text with gold link

---

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2026-02-17 | Initial layouts inventory created from FRS + Lovable review | AI |
| 2026-02-17 | Refined design tokens from real Lovable screenshots: corrected button system (black public / gold internal), added split login layout, precise typography specs, layout-specific notes | AI |
| 2026-02-17 | **NO DARK MODE rule added.** Sidebar/nav is white/cream, NOT dark. All surfaces stay light. Only exception: login right panel. Updated L4 shell, design tokens, regenerated mockups | AI |
