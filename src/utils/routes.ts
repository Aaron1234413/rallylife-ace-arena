// Central route configuration for the MVP application
export const ROUTES = {
  // Public routes (no auth required)
  LANDING: '/',
  AUTH: '/auth',
  
  // MVP-only protected routes (auth required)
  DASHBOARD: '/dashboard',
  PLAY: '/play',
  MESSAGES: '/messages',
  STORE: '/store',
  LEADERBOARDS: '/leaderboards',
  PROFILE: '/profile',
  
  // Non-MVP routes (archived)
  // COACH_DASHBOARD: '/coach-dashboard',
  // ACADEMY: '/academy', 
  // CLUBS: '/clubs',
  // SEARCH: '/search',
  // SCHEDULING: '/scheduling',
  // MAPS: '/maps',
  // SESSIONS: '/sessions',
  // PULSE: '/pulse',
} as const;

// Public routes where navigation/guide should be hidden
export const PUBLIC_ROUTES = [
  ROUTES.LANDING,
  ROUTES.AUTH,
];

// MVP-only protected app routes 
export const APP_ROUTES = [
  ROUTES.DASHBOARD,
  ROUTES.PLAY,
  ROUTES.MESSAGES,
  ROUTES.STORE,
  ROUTES.LEADERBOARDS,
  ROUTES.PROFILE,
];

// Dashboard routes for tour auto-start
export const DASHBOARD_ROUTES = [
  ROUTES.DASHBOARD,
];

// Helper functions
export const isPublicRoute = (pathname: string): boolean => {
  return PUBLIC_ROUTES.includes(pathname as any);
};

export const isAppRoute = (pathname: string): boolean => {
  return APP_ROUTES.some(route => pathname.startsWith(route));
};

export const isDashboardRoute = (pathname: string): boolean => {
  return DASHBOARD_ROUTES.includes(pathname as any);
};

export const shouldHideNavigation = (pathname: string): boolean => {
  return isPublicRoute(pathname);
};