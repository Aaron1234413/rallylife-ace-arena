
import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EnhancedLoadingProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'spinner' | 'dots' | 'pulse';
  message?: string;
  className?: string;
  fullScreen?: boolean;
}

export function EnhancedLoading({ 
  size = 'md', 
  variant = 'spinner',
  message,
  className,
  fullScreen = false
}: EnhancedLoadingProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  const containerClasses = fullScreen 
    ? "min-h-screen flex items-center justify-center bg-gradient-to-br from-tennis-green-dark via-tennis-green-medium to-tennis-green-light"
    : "p-12 text-center";

  const LoadingContent = () => {
    switch (variant) {
      case 'dots':
        return (
          <div className="flex space-x-2">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={cn(
                  "rounded-full bg-tennis-green-primary animate-pulse",
                  size === 'sm' ? 'w-2 h-2' : size === 'md' ? 'w-3 h-3' : 'w-4 h-4'
                )}
                style={{ animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </div>
        );
      case 'pulse':
        return (
          <div className={cn(
            "rounded-full bg-tennis-green-primary animate-pulse",
            sizeClasses[size]
          )} />
        );
      default:
        return (
          <Loader2 className={cn(
            "animate-spin text-tennis-green-primary",
            sizeClasses[size]
          )} />
        );
    }
  };

  return (
    <div className={cn(containerClasses, className)}>
      <div className="flex flex-col items-center space-y-4">
        <LoadingContent />
        {message && (
          <p className={cn(
            "text-tennis-green-dark font-medium",
            fullScreen ? "text-white" : "",
            size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-lg' : 'text-base'
          )}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
