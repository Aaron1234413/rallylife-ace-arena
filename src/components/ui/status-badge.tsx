
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: string;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  icon?: LucideIcon;
  className?: string;
}

export function StatusBadge({ status, variant = 'default', icon: Icon, className }: StatusBadgeProps) {
  const variantClasses = {
    default: 'bg-gray-100 text-gray-800 border-gray-200',
    success: 'bg-green-100 text-green-800 border-green-200',
    warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    error: 'bg-red-100 text-red-800 border-red-200',
    info: 'bg-blue-100 text-blue-800 border-blue-200'
  };

  return (
    <Badge 
      className={cn(
        variantClasses[variant],
        'border-0 shadow-sm flex items-center gap-1',
        className
      )}
    >
      {Icon && <Icon className="h-3 w-3" />}
      {status}
    </Badge>
  );
}
