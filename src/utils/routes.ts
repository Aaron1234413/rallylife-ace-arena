// Central route configuration for the application
export const ROUTES = {
  // Public routes (no auth required)
  LANDING: '/',
  AUTH: '/auth',
  
  
  // Protected routes (auth required)
  DASHBOARD: '/dashboard',
  COACH_DASHBOARD: '/coach-dashboard',
  PROFILE: '/profile',
  STORE: '/store',
  ACADEMY: '/academy',
  CLUBS: '/clubs',
  SEARCH: '/search',
  SCHEDULING: '/scheduling',
  MESSAGES: '/messages',
  MAPS: '/maps',
  SESSIONS: '/sessions',
  PULSE: '/pulse',
} as const;

// Public routes where navigation/guide should be hidden
export const PUBLIC_ROUTES = [
  ROUTES.LANDING,
  ROUTES.AUTH,
  
];

// Protected app routes where onboarding guide can appear
export const APP_ROUTES = [
  ROUTES.DASHBOARD,
  ROUTES.COACH_DASHBOARD,
  ROUTES.PROFILE,
  ROUTES.STORE,
  ROUTES.ACADEMY,
  ROUTES.CLUBS,
  ROUTES.SEARCH,
  ROUTES.SCHEDULING,
  ROUTES.MESSAGES,
  ROUTES.MAPS,
  ROUTES.SESSIONS,
  ROUTES.PULSE,
];

// Dashboard routes for tour auto-start
export const DASHBOARD_ROUTES = [
  ROUTES.DASHBOARD,
  ROUTES.COACH_DASHBOARD,
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