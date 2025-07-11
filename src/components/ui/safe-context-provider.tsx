import React, { ReactNode, useState, useEffect } from 'react';
// import { UIErrorBoundary } from './error-boundary';
import { EnhancedLoading } from './enhanced-loading';
import { useAuth } from '@/hooks/useAuth';

interface SafeContextProviderProps {
  children: ReactNode;
  requireAuth?: boolean;
  loadingMessage?: string;
  fallbackComponent?: ReactNode;
  retryOnError?: boolean;
}

export function SafeContextProvider({ 
  children, 
  requireAuth = true,
  loadingMessage = "Loading context...",
  fallbackComponent,
  retryOnError = true
}: SafeContextProviderProps) {
  const { user, loading: authLoading } = useAuth();
  const [retryCount, setRetryCount] = useState(0);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Add a small delay to ensure auth state is fully settled
    const timer = setTimeout(() => {
      if (!requireAuth || (!authLoading && user)) {
        setIsReady(true);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [user, authLoading, requireAuth]);

  const handleError = (error: Error, errorInfo: React.ErrorInfo) => {
    console.error('SafeContextProvider error:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      retryCount,
      requireAuth,
      userId: user?.id,
      timestamp: new Date().toISOString()
    });
  };

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    setIsReady(false);
    
    // Reset ready state after a brief delay
    setTimeout(() => {
      if (!requireAuth || user) {
        setIsReady(true);
      }
    }, 500);
  };

  // Show loading while auth is loading or context is not ready
  if (authLoading || !isReady) {
    return (
      <EnhancedLoading 
        message={loadingMessage}
        variant="spinner"
        size="md"
      />
    );
  }

  // If auth is required but user is not logged in, render fallback
  if (requireAuth && !user) {
    return fallbackComponent || (
      <div className="text-center p-8">
        <p className="text-muted-foreground">Authentication required</p>
      </div>
    );
  }

  return (
    <div>
      {children}
    </div>
  );
}