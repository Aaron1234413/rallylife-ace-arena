import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  AlertTriangle, 
  Wifi, 
  RefreshCw, 
  Home, 
  Clock,
  Shield,
  Database
} from 'lucide-react';

interface SessionErrorDisplayProps {
  error: Error | string;
  onRetry?: () => void;
  onNavigateHome?: () => void;
  context?: string;
  variant?: 'card' | 'alert' | 'inline';
}

/**
 * Display component for session-related errors with contextual messaging
 */
export function SessionErrorDisplay({ 
  error, 
  onRetry, 
  onNavigateHome,
  context = 'loading sessions',
  variant = 'card'
}: SessionErrorDisplayProps) {
  
  const errorMessage = typeof error === 'string' ? error : error.message;
  
  // Determine error type and appropriate messaging
  const getErrorContext = () => {
    if (errorMessage.toLowerCase().includes('network') || errorMessage.toLowerCase().includes('fetch')) {
      return {
        icon: Wifi,
        title: 'Connection Error',
        description: 'Unable to connect to the server. Please check your internet connection.',
        primaryAction: { label: 'Retry', action: onRetry }
      };
    }
    
    if (errorMessage.toLowerCase().includes('permission') || errorMessage.toLowerCase().includes('auth')) {
      return {
        icon: Shield,
        title: 'Access Denied',
        description: 'You don\'t have permission to access this session.',
        primaryAction: { label: 'Go Home', action: onNavigateHome }
      };
    }
    
    if (errorMessage.toLowerCase().includes('timeout')) {
      return {
        icon: Clock,
        title: 'Request Timeout',
        description: 'The request took too long to complete. Please try again.',
        primaryAction: { label: 'Retry', action: onRetry }
      };
    }
    
    if (errorMessage.toLowerCase().includes('database') || errorMessage.toLowerCase().includes('server')) {
      return {
        icon: Database,
        title: 'Server Error',
        description: 'We\'re experiencing technical difficulties. Please try again in a moment.',
        primaryAction: { label: 'Retry', action: onRetry }
      };
    }
    
    // Generic error
    return {
      icon: AlertTriangle,
      title: 'Something went wrong',
      description: `Error ${context}: ${errorMessage}`,
      primaryAction: { label: 'Retry', action: onRetry }
    };
  };
  
  const errorContext = getErrorContext();
  const Icon = errorContext.icon;

  if (variant === 'alert') {
    return (
      <Alert className="border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive">
        <Icon className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <span>{errorContext.description}</span>
          {errorContext.primaryAction && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={errorContext.primaryAction.action}
              className="ml-4 h-8"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              {errorContext.primaryAction.label}
            </Button>
          )}
        </AlertDescription>
      </Alert>
    );
  }
  
  if (variant === 'inline') {
    return (
      <div className="flex items-center gap-3 p-4 rounded-lg border border-destructive/20 bg-destructive/5">
        <Icon className="h-5 w-5 text-destructive flex-shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-medium text-destructive">{errorContext.title}</p>
          <p className="text-xs text-muted-foreground">{errorContext.description}</p>
        </div>
        {errorContext.primaryAction && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={errorContext.primaryAction.action}
          >
            {errorContext.primaryAction.label}
          </Button>
        )}
      </div>
    );
  }

  // Default card variant
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-destructive">
          <Icon className="h-5 w-5" />
          {errorContext.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          {errorContext.description}
        </p>
        
        {/* Error details (collapsible) */}
        {typeof error === 'object' && error.stack && (
          <details className="text-xs text-muted-foreground">
            <summary className="cursor-pointer hover:text-foreground">Technical details</summary>
            <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto max-h-32">
              {error.stack}
            </pre>
          </details>
        )}
        
        <div className="flex gap-2">
          {errorContext.primaryAction && (
            <Button 
              onClick={errorContext.primaryAction.action} 
              variant="outline" 
              className="flex-1"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              {errorContext.primaryAction.label}
            </Button>
          )}
          
          {onNavigateHome && (
            <Button 
              onClick={onNavigateHome} 
              variant="default" 
              className="flex-1"
            >
              <Home className="h-4 w-4 mr-2" />
              Go Home
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}