/**
 * Navigation utilities for handling session-aware routing and deep linking
 */

export interface SessionNavigationOptions {
  sessionId?: string;
  invitationId?: string;
  returnTo?: string;
}

/**
 * Generate URL for active match page with optional parameters
 */
export const getActiveMatchUrl = (options: SessionNavigationOptions = {}): string => {
  const params = new URLSearchParams();
  
  if (options.sessionId) {
    params.set('session', options.sessionId);
  }
  
  if (options.invitationId) {
    params.set('invitation', options.invitationId);
  }
  
  if (options.returnTo) {
    params.set('returnTo', options.returnTo);
  }
  
  const queryString = params.toString();
  return `/active-match${queryString ? `?${queryString}` : ''}`;
};

/**
 * Generate URL for active social play page with optional parameters
 */
export const getActiveSocialPlayUrl = (options: SessionNavigationOptions = {}): string => {
  const params = new URLSearchParams();
  
  if (options.sessionId) {
    params.set('session', options.sessionId);
  }
  
  if (options.invitationId) {
    params.set('invitation', options.invitationId);
  }
  
  if (options.returnTo) {
    params.set('returnTo', options.returnTo);
  }
  
  const queryString = params.toString();
  return `/active-social-play${queryString ? `?${queryString}` : ''}`;
};

/**
 * Generate URL for viewing a specific invitation
 */
export const getInvitationUrl = (invitationId: string): string => {
  return `/invitation/${invitationId}`;
};

/**
 * Parse session navigation parameters from URL search params
 */
export const parseSessionNavigation = (searchParams: URLSearchParams): SessionNavigationOptions => {
  return {
    sessionId: searchParams.get('session') || undefined,
    invitationId: searchParams.get('invitation') || undefined,
    returnTo: searchParams.get('returnTo') || undefined,
  };
};

/**
 * Get the appropriate return URL based on current context
 */
export const getReturnUrl = (defaultUrl: string = '/dashboard'): string => {
  // In the future, this could analyze the current path and determine
  // the most appropriate return destination
  return defaultUrl;
};

/**
 * Navigate to session based on invitation category
 */
export const getSessionUrlForInvitation = (
  invitationCategory: string,
  options: SessionNavigationOptions = {}
): string => {
  if (invitationCategory === 'match') {
    return getActiveMatchUrl(options);
  } else {
    return getActiveSocialPlayUrl(options);
  }
};

/**
 * Check if current path is a session-related page
 */
export const isSessionPage = (pathname: string): boolean => {
  return [
    '/active-match',
    '/active-social-play',
    '/start-match',
    '/start-social-play',
    '/end-match',
    '/end-training'
  ].some(path => pathname.startsWith(path));
};

/**
 * Get breadcrumb data for current session page
 */
export const getSessionBreadcrumbs = (pathname: string) => {
  const breadcrumbs = [
    { label: 'Dashboard', path: '/dashboard' }
  ];

  if (pathname.startsWith('/active-match')) {
    breadcrumbs.push({ label: 'Active Match', path: '/active-match' });
  } else if (pathname.startsWith('/active-social-play')) {
    breadcrumbs.push({ label: 'Active Social Play', path: '/active-social-play' });
  } else if (pathname.startsWith('/invitation/')) {
    breadcrumbs.push({ label: 'Invitation', path: pathname });
  } else if (pathname.startsWith('/start-match')) {
    breadcrumbs.push({ label: 'Start Match', path: '/start-match' });
  } else if (pathname.startsWith('/start-social-play')) {
    breadcrumbs.push({ label: 'Start Social Play', path: '/start-social-play' });
  }

  return breadcrumbs;
};