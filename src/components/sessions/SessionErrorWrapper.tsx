import React from 'react';
import { SessionErrorBoundary } from './SessionErrorBoundary';
import { toast } from 'sonner';

interface SessionErrorWrapperProps {
  children: React.ReactNode;
  onError?: (error: Error) => void;
  onRetry?: () => void;
  fallback?: React.ReactNode;
  context?: string;
}

/**
 * Enhanced session error boundary with automatic error reporting and user feedback
 */
export function SessionErrorWrapper({ 
  children, 
  onError, 
  onRetry, 
  fallback,
  context = 'session'
}: SessionErrorWrapperProps) {
  
  const handleError = (error: Error) => {
    // Log error with context
    console.error(`Session error in ${context}:`, error);
    
    // Show user-friendly toast notification
    toast.error(`Error in ${context}`, {
      description: error.message || 'Something went wrong. Please try again.',
      duration: 5000,
      action: onRetry ? {
        label: 'Retry',
        onClick: onRetry
      } : undefined
    });
    
    // Call custom error handler if provided
    onError?.(error);
  };

  const handleReset = () => {
    toast.success('Retrying...', { duration: 2000 });
    onRetry?.();
  };

  return (
    <SessionErrorBoundary 
      onReset={handleReset}
      fallback={fallback}
    >
      {children}
    </SessionErrorBoundary>
  );
}