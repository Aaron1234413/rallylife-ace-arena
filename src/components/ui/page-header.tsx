
import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  iconClassName?: string;
  className?: string;
  children?: React.ReactNode;
}

export function PageHeader({ 
  title, 
  subtitle, 
  icon: Icon, 
  iconClassName, 
  className,
  children 
}: PageHeaderProps) {
  return (
    <div className={cn(
      "bg-white/95 backdrop-blur-sm border-b border-white/20 shadow-lg",
      className
    )}>
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {Icon && (
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center shadow-lg",
                iconClassName || "bg-tennis-green-primary"
              )}>
                <Icon className="w-5 h-5 text-white" />
              </div>
            )}
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-tennis-green-dark">
                {title}
              </h1>
              {subtitle && (
                <p className="text-tennis-green-dark/70 text-sm sm:text-base">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
