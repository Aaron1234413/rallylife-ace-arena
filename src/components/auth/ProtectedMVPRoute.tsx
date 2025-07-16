import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import { ROUTES } from '@/utils/routes';

interface ProtectedMVPRouteProps {
  children: React.ReactNode;
}

export function ProtectedMVPRoute({ children }: ProtectedMVPRouteProps) {
  const { user, loading: authLoading } = useAuth();
  const location = useLocation();

  // Query user profile for role and onboarding status
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }
      
      return data;
    },
    enabled: !!user?.id,
  });

  // Show loading spinner while checking authentication and profile
  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-tennis-green-bg via-white to-tennis-green-subtle">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-tennis-green-primary mx-auto mb-4" />
          <p className="text-tennis-green-medium">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to auth if not authenticated
  if (!user) {
    return <Navigate to={ROUTES.AUTH} state={{ from: location }} replace />;
  }

  // Redirect to auth if profile not found
  if (!profile) {
    return <Navigate to={ROUTES.AUTH} state={{ from: location }} replace />;
  }

  // Check if onboarding is completed
  if (!profile.onboarding_completed) {
    // Allow access to profile page for completing onboarding
    if (location.pathname === ROUTES.PROFILE) {
      return <>{children}</>;
    }
    
    return <Navigate to={ROUTES.PROFILE} state={{ from: location }} replace />;
  }

  // Role verification - MVP is for players only
  if (profile.role !== 'player') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-tennis-green-bg via-white to-tennis-green-subtle">
        <div className="text-center max-w-md p-8 bg-white rounded-2xl shadow-lg border border-tennis-green-light/20">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🚫</span>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Restricted</h2>
          <p className="text-gray-600 mb-4">
            This MVP version is designed for players only. 
            {profile.role === 'coach' && ' Coach features are coming soon!'}
          </p>
          <button 
            onClick={() => window.location.href = ROUTES.PROFILE}
            className="px-4 py-2 bg-tennis-green-primary text-white rounded-lg hover:bg-tennis-green-medium transition-colors"
          >
            Go to Profile
          </button>
        </div>
      </div>
    );
  }

  // UTR status check - warn if not set but don't block access
  if (!profile.utr_rating) {
    // For play route, show a more prominent UTR missing warning
    if (location.pathname === ROUTES.PLAY) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-tennis-green-bg via-white to-tennis-green-subtle">
          <div className="pt-20 px-4">
            <div className="max-w-md mx-auto bg-white rounded-2xl shadow-lg border border-tennis-green-light/20 p-8 text-center">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⚠️</span>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">UTR Required</h2>
              <p className="text-gray-600 mb-6">
                You need to set your UTR (Universal Tennis Rating) to access matchmaking features.
              </p>
              <div className="space-y-3">
                <button 
                  onClick={() => window.location.href = ROUTES.PROFILE}
                  className="w-full px-4 py-2 bg-tennis-green-primary text-white rounded-lg hover:bg-tennis-green-medium transition-colors"
                >
                  Set UTR in Profile
                </button>
                <button 
                  onClick={() => window.location.href = ROUTES.DASHBOARD}
                  className="w-full px-4 py-2 border border-tennis-green-light text-tennis-green-medium rounded-lg hover:bg-tennis-green-bg transition-colors"
                >
                  Go to Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // For other routes, show a dismissible banner
    return (
      <div className="min-h-screen bg-gradient-to-br from-tennis-green-bg via-white to-tennis-green-subtle">
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-3">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center">
              <span className="text-amber-600 mr-2">⚠️</span>
              <span className="text-sm text-amber-800">
                Complete your profile by setting your UTR to unlock all features.
              </span>
            </div>
            <button 
              onClick={() => window.location.href = ROUTES.PROFILE}
              className="text-sm bg-amber-100 text-amber-800 px-3 py-1 rounded-md hover:bg-amber-200 transition-colors"
            >
              Set UTR
            </button>
          </div>
        </div>
        {children}
      </div>
    );
  }

  // All checks passed - render the protected content
  return <>{children}</>;
}