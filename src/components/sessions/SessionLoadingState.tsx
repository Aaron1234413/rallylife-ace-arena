import React from 'react';
import { Loader2, Clock, Users, Play } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SessionLoadingStateProps {
  variant?: 'spinner' | 'dots' | 'pulse' | 'skeleton';
  size?: 'sm' | 'md' | 'lg';
  message?: string;
  context?: 'loading' | 'joining' | 'starting' | 'updating';
  className?: string;
}

/**
 * Flexible loading state component for session operations
 */
export function SessionLoadingState({ 
  variant = 'spinner',
  size = 'md',
  message,
  context = 'loading',
  className
}: SessionLoadingStateProps) {
  
  const getContextMessage = () => {
    switch (context) {
      case 'joining':
        return 'Joining session...';
      case 'starting':
        return 'Starting session...';
      case 'updating':
        return 'Updating session...';
      default:
        return 'Loading sessions...';
    }
  };
  
  const getContextIcon = () => {
    switch (context) {
      case 'joining':
        return Users;
      case 'starting':
        return Play;
      case 'updating':
        return Clock;
      default:
        return Loader2;
    }
  };
  
  const displayMessage = message || getContextMessage();
  const Icon = getContextIcon();
  
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  };
  
  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  if (variant === 'dots') {
    return (
      <div className={cn('flex items-center gap-3', className)}>
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={cn(
                'rounded-full bg-primary animate-pulse',
                size === 'sm' ? 'h-2 w-2' : size === 'lg' ? 'h-4 w-4' : 'h-3 w-3'
              )}
              style={{
                animationDelay: `${i * 0.2}s`,
                animationDuration: '1.4s'
              }}
            />
          ))}
        </div>
        <span className={cn('text-muted-foreground', textSizeClasses[size])}>
          {displayMessage}
        </span>
      </div>
    );
  }
  
  if (variant === 'pulse') {
    return (
      <div className={cn('flex items-center gap-3', className)}>
        <div className={cn(
          'rounded-full bg-primary/20 animate-pulse',
          sizeClasses[size]
        )} />
        <span className={cn('text-muted-foreground animate-pulse', textSizeClasses[size])}>
          {displayMessage}
        </span>
      </div>
    );
  }
  
  if (variant === 'skeleton') {
    return (
      <div className={cn('flex items-center gap-3 animate-pulse', className)}>
        <div className={cn('rounded bg-muted', sizeClasses[size])} />
        <div className={cn(
          'h-4 bg-muted rounded',
          size === 'sm' ? 'w-24' : size === 'lg' ? 'w-36' : 'w-32'
        )} />
      </div>
    );
  }

  // Default spinner variant
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <Icon className={cn('animate-spin text-primary', sizeClasses[size])} />
      <span className={cn('text-muted-foreground', textSizeClasses[size])}>
        {displayMessage}
      </span>
    </div>
  );
}