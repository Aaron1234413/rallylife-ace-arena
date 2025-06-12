
# ✅ RallyLife Full Build To-Do List (Phase-by-Phase)

**Status: Starting Phase 1 MVP** | **Last Updated:** Initial Creation

---

## 🚀 Phase 1: MVP Core Systems

**Goal:** Launch a fully working player experience for match/session logging, stat progression, and profile viewing.

### 1. Authentication
- [ ] **To-Do:** Implement Supabase email/password auth (no social auth needed at MVP)
- **🔧 How:**
  - Use Supabase's built-in auth.signUp() and auth.signInWithPassword() in the frontend
  - On successful login, store session in context/provider
  - Redirect user to onboarding via useNavigate()

### 2. Onboarding Flow (Player Setup)
- [ ] **To-Do:** Capture play style, favorite pro, and generate avatar description
- **🔧 How:**
  - Build 3-question form (see: 01_Onboarding_Desktop.png)
  - Map answers to a stylized avatar descriptor (e.g. "Aggressive Baseliner with max forehand power")
  - Save data into players table using Supabase client insert()
  - Direct user to Dashboard

### 3. Dashboard Core (Gamified View)
- [ ] **To-Do:** Create gamified dashboard with XP/HP bar, quick actions, and activity feed
- **🔧 How:**
  - Use progress bar components for XP/HP with animated updates
  - Recreate layout as in 04_Dashboard_Desktop.png: left = stats, right = activity feed
  - Cards: "Log Match", "Log Session", "Restore HP" (each triggers modal)
  - Display most recent matches/sessions in feed

### 4. Match Logging
- [ ] **To-Do:** Manual match input with win/loss outcome
- **🔧 How:**
  - Modal: opponent input, win/loss radio, optional notes
  - Compute XP (+20 win, +5 loss), HP delta (-10 on loss)
  - Write to matches table and patch players.hp and players.xp

### 5. Session Logging
- [ ] **To-Do:** Drill name + time + notes input form
- **🔧 How:**
  - Modal with select + input + textarea (see Dashboard "Log Session" CTA)
  - On submit, restore +10 HP and +15 XP (caps apply)
  - Write to sessions table

### 6. Profile Page
- [ ] **To-Do:** Show stylized avatar card, performance stats, graph
- **🔧 How:**
  - Build layout matching 12_Profile_Desktop.png
  - Display play style, weapon, motto, and XP rings
  - Render badge grid with locked/unlocked visuals
  - Plot HP/XP over time using Recharts

### 7. Backend Setup
- [ ] **To-Do:** Create all necessary Supabase tables and backend logic
- **🔧 How:**
  - Tables: users, players, matches, sessions
  - Use Supabase Edge Function to run a weekly cron that checks inactivity and applies -5 HP decay
  - Store stats as integers and XP thresholds in constants

---

## 🌟 Phase 2: Enhanced Loop & Engagement

**Goal:** Introduce community, token economy, and achievements.

### 1. Feed System
- [ ] **To-Do:** Create a shared feed with player stats and match/session posts
- **🔧 How:**
  - Reference 08_Feed_Desktop.png
  - feed_posts table with post_type (match/session), description, delta_xp/hp, player_id
  - Comments on post = separate comments table
  - Feed card includes XP/HP outcome flags visually

### 2. Messaging System
- [ ] **To-Do:** Enable direct player-to-player messaging
- **🔧 How:**
  - UI based on 21_Messages_Desktop.png
  - messages table with sender, receiver, content, timestamp
  - Use Supabase Realtime for live chat OR poll with SWR for fallback
  - Typing indicator with local state toggle

### 3. Token Store & Purchases
- [ ] **To-Do:** Players can buy HP packs, cosmetic upgrades with tokens
- **🔧 How:**
  - UI: Modal store page with token cost (not visualized in mockup)
  - Add token_transactions table and modify players.tokens
  - Tokens = reward from XP streaks, challenges, or direct purchase (Phase 3)

### 4. Badges + Leaderboards
- [ ] **To-Do:** Reward badges and show global XP ranks
- **🔧 How:**
  - Add badges table with player_id, name, awarded_at
  - Compute badge eligibility on new match/session insert
  - Leaderboard = query players ordered by xp DESC
  - Support filters via dropdown (play style, country)

### 5. Avatar Customization
- [ ] **To-Do:** Token-unlocked bio upgrades or asset toggles
- **🔧 How:**
  - avatar_customizations table (player_id, item_name, unlocked)
  - Render conditionally based on token unlock
  - Include unlockable badges, motto lines, visual elements

---

## 🌍 Phase 3: Real World + Coaching

**Goal:** Add local engagement, court tracking, and coach verification

### 1. Court Map System
- [ ] **To-Do:** Map view with courts, player activity, and check-in
- **🔧 How:**
  - Reference 18_Maps_Desktop.png
  - Use Mapbox with courts table (id, name, lat, lng, type)
  - On check-in, write to check_ins table with timestamp + XP
  - Leaderboard module: users ranked by plays/check-ins at that court

### 2. Match Location Logging
- [ ] **To-Do:** Link match or session to a court
- **🔧 How:**
  - Add court_id foreign key to matches and sessions
  - Autofill nearest court using geolocation or allow manual select
  - Match history includes court name tag

### 3. Coach Integration
- [ ] **To-Do:** Add coach account type and approve session logs
- **🔧 How:**
  - users.role enum: 'player' or 'coach'
  - Coach UI = simple dashboard of linked players with session approval toggles
  - Session gets approved_by field and timestamp

### 4. Video Upload (future-facing)
- [ ] **To-Do:** Upload training videos for future AI tagging
- **🔧 How:**
  - videos table (player_id, title, url, status)
  - Upload to Supabase Storage or Bunny CDN
  - Tag with "Analysis Pending" and prepare for future AI integration

### 5. Challenges & Events
- [ ] **To-Do:** Weekly XP/token quests and dynamic events
- **🔧 How:**
  - quests and quest_completions tables
  - Dashboard module: current weekly challenges, reward shown
  - Evaluate client-side for XP/token grants or use RPC trigger

---

## 🛠 Global Engineering To-Dos

- [ ] 🔧 Build reusable component lib (cards, modals, input blocks)
- [ ] 🔧 Supabase schema with validation and RLS for all tables
- [ ] 🔧 Responsive layout via Tailwind and mobile-first breakpoints
- [ ] 🔧 LocalStorage fallback for XP/HP UI in low network
- [ ] 🔧 Add analytics (e.g. XP events, token transactions)
- [ ] 🔧 Set up PWA manifest and service worker

---

## 📊 Progress Tracking

**Phase 1 Completion:** 0/7 tasks
**Phase 2 Completion:** 0/5 tasks  
**Phase 3 Completion:** 0/5 tasks
**Global Tasks:** 0/6 tasks

**Overall Progress:** 0% (0/23 total tasks)

---

*This document will be updated as tasks are completed and new requirements are identified.*
