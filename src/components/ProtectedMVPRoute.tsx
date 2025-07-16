import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { APP_ROUTES } from '@/utils/routes';

interface ProtectedMVPRouteProps {
  children: React.ReactNode;
}

/**
 * MVP Route Protection Wrapper
 * Ensures only authenticated users can access MVP features
 * Redirects to auth if not logged in
 */
export function ProtectedMVPRoute({ children }: ProtectedMVPRouteProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-tennis-green-bg flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 bg-tennis-green-primary rounded-full flex items-center justify-center mb-4 mx-auto">
            <span className="text-white text-xl">🎾</span>
          </div>
          <p className="text-tennis-green-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
}