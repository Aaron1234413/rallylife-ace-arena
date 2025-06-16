
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface DashboardCardProps {
  title?: string;
  children: React.ReactNode;
  priority?: 'high' | 'medium' | 'low';
  className?: string;
  collapsible?: boolean;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  icon?: React.ReactNode;
}

export function DashboardCard({
  title,
  children,
  priority = 'medium',
  className,
  collapsible = false,
  isCollapsed = false,
  onToggleCollapse,
  icon
}: DashboardCardProps) {
  const priorityStyles = {
    high: 'border-l-4 border-l-yellow-500 bg-gradient-to-r from-yellow-50 to-white',
    medium: 'border-l-4 border-l-tennis-green-light bg-gradient-to-r from-tennis-green-bg to-white',
    low: 'border-l-4 border-l-gray-300 bg-gradient-to-r from-gray-50 to-white'
  };

  return (
    <Card className={cn(
      'w-full h-full min-h-[200px] transition-all duration-300',
      priorityStyles[priority],
      className
    )}>
      {title && (
        <CardHeader 
          className={cn(
            'pb-3',
            collapsible && 'cursor-pointer hover:bg-muted/30'
          )}
          onClick={collapsible ? onToggleCollapse : undefined}
        >
          <CardTitle className="flex items-center justify-between text-lg">
            <div className="flex items-center gap-2">
              {icon}
              {title}
            </div>
            {collapsible && (
              <div className={cn(
                'transform transition-transform duration-200',
                isCollapsed ? 'rotate-180' : 'rotate-0'
              )}>
                ▼
              </div>
            )}
          </CardTitle>
        </CardHeader>
      )}
      <CardContent className={cn(
        'transition-all duration-300',
        isCollapsed ? 'h-0 overflow-hidden p-0' : 'p-6 pt-0'
      )}>
        {children}
      </CardContent>
    </Card>
  );
}
