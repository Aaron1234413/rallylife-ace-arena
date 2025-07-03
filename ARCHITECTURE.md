# RallyLife Tennis App - Architecture Documentation

## Overview
RallyLife is a comprehensive tennis coaching and player management platform built as a React-based web application with Supabase backend. The app serves both players and coaches with distinct dashboards and functionality.

## Technology Stack

### Frontend
- **React 18.3.1** - Component-based UI framework
- **TypeScript** - Type safety and better developer experience
- **Vite** - Build tool and development server
- **Tailwind CSS** - Utility-first CSS framework with custom design system
- **Shadcn UI** - Pre-built component library
- **React Router Dom** - Client-side routing
- **React Query** - Server state management and caching
- **React Hook Form** - Form handling and validation

### Backend & Database
- **Supabase** - Backend-as-a-Service providing:
  - PostgreSQL database
  - Authentication
  - Real-time subscriptions
  - Edge functions
  - File storage
- **Row Level Security (RLS)** - Database-level access control

### State Management
- **React Context** - Global auth state and session contexts
- **Custom Hooks** - Encapsulated business logic and data fetching
- **Local Component State** - Component-specific state management

## Application Architecture

### 1. Entry Point & Routing (`src/App.tsx`)
```
App.tsx
├── QueryClientProvider (React Query)
├── Session Providers (Training, Match, Social Play)
├── BrowserRouter
├── AppLayout (Navigation wrapper)
├── NewUserGuide (Onboarding overlay)
└── Route definitions
```

**Key Routes:**
- `/` - Landing page for unauthenticated users
- `/dashboard` - Main player dashboard
- `/coach-dashboard` - Coach-specific dashboard
- `/auth` - Authentication flows
- `/onboarding` - User setup process
- Protected routes with `ProtectedRoute` wrapper

### 2. Authentication Flow (`src/hooks/useAuth.tsx`)

```
Authentication System
├── Supabase Auth Integration
├── Session Management (User + Session objects)
├── Email/Password signup with profile creation
├── Automatic redirect handling
└── Persistent session storage
```

**Auth Features:**
- Email/password authentication
- Profile creation with role selection (player/coach)
- Automatic session persistence
- Protected route enforcement
- Role-based access control

### 3. User Roles & Dashboards

#### Player Dashboard (`src/pages/Index.tsx`)
```
Player Dashboard
├── WelcomeBanner
├── PlayerVitalsHero (HP, XP, Tokens)
├── EnhancedQuickActions (Training, Matches, etc.)
├── UpcomingCourtBookings
└── Error boundaries for each section
```

**Player Features:**
- HP (Health Points) system with decay/restoration
- XP (Experience Points) with leveling
- Token economy (regular + premium tokens)
- Avatar customization system
- Activity logging and tracking
- Academy progress with quizzes
- Achievement system

#### Coach Dashboard (`src/pages/CoachDashboard.tsx`)
```
Coach Dashboard
├── Coach Overview Cards (CXP, CRP, Tokens)
├── Coach Quick Actions
├── Coach Interaction Panel
└── Client management tools
```

**Coach Features:**
- CXP (Coach Experience Points) system
- CRP (Coach Reputation Points) system
- CTK (Coach Token) economy
- Client management and assignments
- Training plan creation
- Progress tracking and feedback
- Professional avatar customization

### 4. Database Architecture

#### Core Tables
```
Users & Profiles
├── auth.users (Supabase managed)
├── profiles (User profiles with roles)
├── player_* tables (Player-specific data)
└── coach_* tables (Coach-specific data)
```

#### Player Data Model
- `player_hp` - Health points system
- `player_xp` - Experience and leveling
- `token_balances` - Token economy
- `player_avatar_*` - Avatar customization
- `academy_progress` - Learning progress
- `achievements` & `player_achievements` - Achievement system

#### Coach Data Model
- `coach_cxp` - Coach experience system
- `coach_crp` - Reputation system
- `coach_tokens` - Coach token economy
- `coach_avatar_*` - Professional avatar system
- `training_plans` - Coach-created training programs
- `player_training_assignments` - Assigned training

#### Shared Systems
- `activity_logs` - Universal activity tracking
- `appointments` & `appointment_requests` - Scheduling system
- `clubs` & `club_*` tables - Club management
- `messages` & `conversations` - Communication system

### 5. Component Architecture

#### Design System (`src/index.css` & `tailwind.config.ts`)
```
Design System
├── Semantic color tokens (HSL-based)
├── Custom gradient definitions
├── Typography scale
├── Consistent spacing system
└── Dark/light mode support
```

#### Component Organization
```
src/components/
├── ui/ (Shadcn base components)
├── dashboard/ (Dashboard-specific components)
├── auth/ (Authentication components)
├── academy/ (Learning system components)
├── achievements/ (Achievement system)
├── avatar/ (Avatar customization)
├── coach/ (Coach-specific components)
├── player/ (Player-specific components)
├── training/ (Training system)
├── messages/ (Communication)
├── clubs/ (Club management)
└── layout/ (App layout components)
```

### 6. Data Flow Patterns

#### Authentication Flow
```
1. User visits app
2. useAuth hook checks Supabase session
3. If authenticated: redirect to appropriate dashboard
4. If not: show landing page with auth options
5. Profile fetching determines user role and permissions
```

#### Player Progression Flow
```
1. Player completes activity (training, match, etc.)
2. Activity logged via custom hooks
3. Automatic XP/token calculation
4. HP impact calculation
5. Achievement check triggers
6. Real-time UI updates
7. Database persistence
```

#### Coach-Player Interaction Flow
```
1. Coach creates training plan/assignment
2. Notification sent to player
3. Player completes assignment
4. Progress reported back to coach
5. Coach provides feedback
6. CRP/CXP rewards calculated
7. Relationship metrics updated
```

## Current Limitations

### 1. State Management Complexity
- Multiple context providers creating prop drilling
- No centralized state management for complex flows
- Repetitive data fetching patterns across components

### 2. Error Handling
- Inconsistent error boundaries
- Limited offline functionality
- No retry mechanisms for failed requests

### 3. Performance Issues
- Large bundle size due to component library
- No code splitting for route-based components
- Inefficient re-renders in dashboard components

### 4. Database Design
- Some circular dependencies in relationships
- Limited indexing strategy
- No caching layer for frequently accessed data

### 5. Testing Coverage
- No unit tests for critical business logic
- No integration tests for user flows
- No end-to-end testing strategy

## Suggested Improvements

### 1. State Management Refactor
- **Implement Zustand or Redux Toolkit** for global state
- **Create dedicated stores** for user data, notifications, real-time updates
- **Implement optimistic updates** for better UX

### 2. Performance Optimization
- **Code splitting** by routes and user roles
- **React.lazy** for heavy components
- **Memoization** for expensive calculations
- **Virtual scrolling** for large lists

### 3. Real-time Features Enhancement
- **WebSocket integration** for live coaching sessions
- **Real-time notifications** system
- **Live match scoring** capabilities
- **Collaborative training planning**

### 4. Offline Capabilities
- **Service Worker** implementation
- **Local storage** for critical data
- **Sync mechanism** for offline actions
- **Progressive Web App** features

### 5. Testing Strategy
- **Unit tests** for hooks and utilities
- **Component testing** with React Testing Library
- **E2E tests** with Playwright
- **API contract testing** for Supabase integration

### 6. Developer Experience
- **Storybook** for component documentation
- **Type-safe API client** generation
- **ESLint/Prettier** configuration improvements
- **Git hooks** for code quality

### 7. Security Enhancements
- **Rate limiting** on sensitive operations
- **Input validation** improvements
- **Audit logging** for administrative actions
- **CSRF protection** for forms

### 8. Scalability Improvements
- **Database query optimization**
- **CDN integration** for static assets
- **Horizontal scaling** preparation
- **Monitoring and alerting** system

## Data Flow Diagram

```
┌─────────────┐    ┌──────────────┐    ┌─────────────┐
│   Browser   │    │    React     │    │  Supabase   │
│             │◄──►│  Application │◄──►│  Backend    │
└─────────────┘    └──────────────┘    └─────────────┘
                           │
                           ▼
                   ┌──────────────┐
                   │ Custom Hooks │
                   │ - useAuth    │
                   │ - usePlayerXP│
                   │ - useCoachCXP│
                   │ - etc.       │
                   └──────────────┘
                           │
                           ▼
                   ┌──────────────┐
                   │  Components  │
                   │ - Dashboard  │
                   │ - Academy    │
                   │ - Training   │
                   │ - etc.       │
                   └──────────────┘
```

## Conclusion

The RallyLife app demonstrates a solid foundation with clear separation of concerns between players and coaches. The architecture leverages modern React patterns and Supabase's powerful backend capabilities. However, there are opportunities for improvement in state management, performance, and testing that would significantly enhance the developer experience and user satisfaction.

The modular component structure and hook-based data management provide a good foundation for scaling, but implementing the suggested improvements would prepare the application for production use and future feature expansion.