
# 🧠 RallyLife Gamified Tennis Platform – Full PRD

## 🎯 Executive Summary

RallyLife is a standalone, gamified tennis app that blends real-world match and training data with RPG-inspired progression mechanics. It motivates players to train, compete, and re-engage through visual rewards (HP, XP, tokens), stylized avatars, and interactive dashboards — all powered by a clean, scalable backend and built for community.

## 🖥️ UI Flow Reference (Based on Uploaded Mockups)

| Screen | Desktop View | Tablet View | Mobile View |
|--------|-------------|-------------|-------------|
| Onboarding | 01_Onboarding_Desktop.png | 02_Onboarding_Tablet.png | 03_Onboarding_Phone.png |
| Dashboard | 04_Dashboard_Desktop.png | 05_Dashboard_Tablet.png | 06_Dashboard_Phone.png |
| Dashboard (Annotated) | 07_Dashboard_Annotated.png | | |
| Feed | 08_Feed_Desktop.png | 09_Feed_Tablet.png | 10_Feed_Phone.png |
| Feed (Annotated) | 11_Feed_Annotated.png | | |
| Profile | 12_Profile_Desktop.png | 13_Profile_Tablet.png | 14_Profile_Phone.png |
| Search | 15_Search_Desktop.png | 16_Search_Tablet.png | 17_Search_Phone.png |
| Maps | 18_Maps_Desktop.png | 19_Maps_Tablet.png | 20_Maps_Phone.png |
| Messages | 21_Messages_Desktop.png | 22_Messages_Tablet.png | 23_Messages_Phone.png |

## 🧩 Component Inventory

### Global Components
- **Top Nav Bar**: Displays player name, HP/XP/token stats, and avatar icon
- **Bottom Tab Menu (Mobile)**: Navigation between Dashboard, Feed, Search, Messages, Profile
- **Page Containers**: Responsive layout blocks with left-sidebar logic for tablets/desktops

### Dashboard Components
- **HP Heart Meter**: Depletes on loss/inactivity, fills via session logs, animated on change
- **XP Progress Bar**: Horizontal bar that fills per XP gain; triggers level-up animation
- **Token Counter**: Top-right balance display with hover/click to go to token store
- **Quick Action Cards**: "Log Match", "Log Session", "Get HP" with icon/tooltip
- **Match Activity Tiles**: Log of recent matches with outcome, XP/HP effects, time
- **Session Tile**: Drill name + time + player comment + recovery stat effect

### Feed Components
- **Player Feed Card**: Avatar, rank, XP, post (text/image/video), token or stat icon
- **Outcome Flags**: Match win/loss badge that shows stat result (e.g., +20 XP, -10 HP)
- **Comments/Actions**: Comment bar, like/favorite, emoji react, challenge CTA

### Profile Components
- **Player Bio Card**: Rank title, avatar style, play style, weapon tag, motto
- **Performance Rings**: Circular stat blocks for XP, win %, matches played
- **Badges Grid**: Visual trophy wall of achievements (unlocked + locked badges)
- **Stat Chart**: Weekly stat graph (HP, XP, wins)

### Search Components
- **Search Results Card**: Avatar + XP/HP bar + play style + match/challenge button
- **Sort/Filter Panel**: Dropdown + toggle group for filtering by rank, style, region

### Maps Components
- **Court Pin Map**: Court name + match history + check-in bonus + nearby users
- **Check-in Button**: Earn XP or token, flag as visited, log match here
- **Leaderboard Ribbon**: Top 3 users who've played there with XP overlay

### Messages Components
- **Chat Thread**: User list sidebar + conversation window + typing bubble + status dot
- **Coach Tip Message**: Marked tag with special icon, expandable to view tip details

## ⚙️ Gamification System (HP / XP / Tokens)

### HP (Health Points)
- **Max HP**: 100
- **Loss** = -10 HP
- **No match for 7 days** = -5 HP (passive decay)
- **Session Log** = +10 HP
- **Max weekly restore** = 20 HP unless override by token

### XP (Experience Points)
- **Win** = +20 XP
- **Loss** = +5 XP
- **Coaching Session** = +15 XP
- **Level up** = +100 XP milestone
- **Rank Badge** auto-updates by XP tier

### Tokens
- **Earned** by winning matches, coaching others, completing streaks
- **Spent** on HP refill, avatar upgrades, challenge entries
- **Purchasable** via store (freemium economy model)

## 👥 Onboarding Flow

1. Sign up/login
2. Answer 3-player style questions
3. Pick your favorite pro (inspires avatar traits)
4. Avatar stylized bio card created
5. Directed to Dashboard with default stats

## 🧱 Feature Build Plan

### Phase 1: MVP
- Auth (email/password, username)
- Avatar Creation Flow
- HP/XP System Logic
- Match Logging (Manual: Win/Loss)
- Session Logging (Time + Notes)
- Dashboard Stats + Quick Action Tiles
- Profile Page with Bio + Stats

### Phase 2: Enhanced
- Messages (Coach → Player)
- Token Store + Economy
- Badges/Achievements
- Leaderboard & XP Rank System
- Feed (Basic + Stat Posts)
- Avatar Customization Options

### Phase 3: Full Expansion
- Court Map Integration
- Location-Based XP Drops
- Check-in Leaderboards
- Video Upload for AI Feedback (partner w/ SwingVision)
- Coach Verification of Sessions
- Animated Avatars (optional)

## 🗃️ Database (Supabase)

### Tables
- **users** (id, username, email, password, role)
- **players** (user_id, avatar_style, xp, hp, tokens, play_style, weapon, special_move)
- **matches** (id, player_1, player_2, result, hp_delta, xp_delta, timestamp)
- **sessions** (id, player_id, type, time_logged, notes, hp_restored, xp_earned)
- **messages** (id, from_user, to_user, content, timestamp, seen)
- **courts** (id, name, lat, lng, type)
- **check_ins** (id, court_id, player_id, xp_bonus, timestamp)
- **badges** (id, player_id, name, condition_met, awarded_at)
- **logs** (event, metadata, created_at)

## 🧠 Final Notes

- **MVP** should emphasize quick gratification and easy engagement: XP popups, token glow, level-up flashes
- Keep UI **playful but clean** — closer to Duolingo than Fortnite
- Store early progress in **local storage/cache** to reduce friction
- **Modular component system** for ease of scaling into Phase 3

Built for RallyLife — a fresh gamified journey into real-world tennis. 🎾
