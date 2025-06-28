
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ContentCardProps {
  title?: string;
  subtitle?: string;
  icon?: LucideIcon;
  iconClassName?: string;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
  children: React.ReactNode;
  variant?: 'default' | 'gradient' | 'glass';
}

export function ContentCard({ 
  title, 
  subtitle, 
  icon: Icon, 
  iconClassName,
  className,
  headerClassName,
  contentClassName,
  children,
  variant = 'default'
}: ContentCardProps) {
  const cardVariants = {
    default: "bg-white/95 backdrop-blur-sm border-tennis-green-bg/30 shadow-lg",
    gradient: "bg-gradient-to-br from-white/95 to-tennis-green-bg/20 backdrop-blur-sm border-white/30 shadow-xl",
    glass: "bg-white/90 backdrop-blur-sm border-white/30 shadow-lg hover:shadow-xl transition-all duration-300"
  };

  return (
    <Card className={cn(cardVariants[variant], className)}>
      {(title || subtitle || Icon) && (
        <CardHeader className={cn("pb-4", headerClassName)}>
          <CardTitle className="flex items-center gap-3">
            {Icon && (
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center",
                iconClassName || "bg-gradient-to-br from-tennis-green-primary to-tennis-green-medium"
              )}>
                <Icon className="h-4 w-4 text-white" />
              </div>
            )}
            <div>
              {title && (
                <span className="text-lg sm:text-xl text-tennis-green-dark">
                  {title}
                </span>
              )}
              {subtitle && (
                <p className="text-sm text-tennis-green-dark/70 font-normal mt-1">
                  {subtitle}
                </p>
              )}
            </div>
          </CardTitle>
        </CardHeader>
      )}
      <CardContent className={cn("space-y-6", contentClassName)}>
        {children}
      </CardContent>
    </Card>
  );
}
