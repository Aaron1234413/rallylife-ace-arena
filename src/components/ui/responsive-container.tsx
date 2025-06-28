
import React from 'react';
import { cn } from '@/lib/utils';

interface ResponsiveContainerProps {
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  className?: string;
  padding?: boolean;
}

export function ResponsiveContainer({ 
  children, 
  size = 'lg', 
  className,
  padding = true 
}: ResponsiveContainerProps) {
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
    full: 'max-w-full'
  };

  return (
    <div className={cn(
      "container mx-auto",
      sizeClasses[size],
      padding && "px-4 py-6",
      className
    )}>
      {children}
    </div>
  );
}
