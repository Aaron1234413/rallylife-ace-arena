
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: string;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  icon?: LucideIcon;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
  pulse?: boolean;
}

export function StatusBadge({ 
  status, 
  variant = 'default', 
  icon: Icon, 
  className,
  size = 'md',
  animated = false,
  pulse = false
}: StatusBadgeProps) {
  const variantClasses = {
    default: 'bg-muted text-muted-foreground border-border',
    success: 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800',
    warning: 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-300 dark:border-yellow-800',
    error: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800',
    info: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800'
  };

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-sm px-2.5 py-1 gap-1.5',
    lg: 'text-base px-3 py-1.5 gap-2'
  };

  const iconSizes = {
    sm: 'h-2.5 w-2.5',
    md: 'h-3 w-3',
    lg: 'h-4 w-4'
  };

  return (
    <Badge 
      className={cn(
        'transition-all duration-300 border font-medium shadow-sm flex items-center',
        variantClasses[variant],
        sizeClasses[size],
        animated && 'hover:scale-105 hover:shadow-md',
        pulse && variant === 'success' && 'animate-pulse',
        pulse && variant === 'warning' && 'animate-bounce',
        pulse && variant === 'error' && 'animate-pulse',
        className
      )}
    >
      {Icon && (
        <Icon 
          className={cn(
            iconSizes[size],
            animated && 'transition-transform duration-200',
            pulse && 'animate-pulse'
          )} 
        />
      )}
      <span className={cn(animated && 'transition-colors duration-200')}>
        {status}
      </span>
    </Badge>
  );
}
