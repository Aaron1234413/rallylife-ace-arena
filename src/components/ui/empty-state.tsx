
import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
  iconClassName?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  className,
  iconClassName
}: EmptyStateProps) {
  return (
    <div className={cn("text-center py-12", className)}>
      <div className={cn(
        "w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6",
        iconClassName || "bg-tennis-green-bg/30"
      )}>
        <Icon className="h-8 w-8 text-tennis-green-medium" />
      </div>
      <h3 className="text-xl font-semibold text-tennis-green-dark mb-3">
        {title}
      </h3>
      <p className="text-tennis-green-dark/70 text-lg mb-6 max-w-md mx-auto">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button
          onClick={onAction}
          className="bg-gradient-to-r from-tennis-green-primary to-tennis-green-medium hover:from-tennis-green-medium hover:to-tennis-green-primary text-white shadow-md hover:shadow-lg transition-all duration-200"
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
