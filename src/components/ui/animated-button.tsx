
import React from 'react';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { cn } from '@/lib/utils';

interface AnimatedButtonProps extends React.ComponentProps<typeof Button> {
  loading?: boolean;
  successState?: boolean;
  children: React.ReactNode;
}

export function AnimatedButton({ 
  loading = false, 
  successState = false, 
  children, 
  className,
  disabled,
  ...props 
}: AnimatedButtonProps) {
  return (
    <Button
      className={cn(
        'transition-all duration-300 transform hover:scale-105 active:scale-95',
        successState && 'bg-green-600 hover:bg-green-700',
        loading && 'cursor-not-allowed opacity-75',
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      <div className="flex items-center gap-2">
        {loading && <LoadingSpinner size="sm" />}
        {successState && <span className="text-lg">✓</span>}
        <span className={cn(loading && 'opacity-70')}>
          {children}
        </span>
      </div>
    </Button>
  );
}
