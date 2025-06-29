
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface EnhancedCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  glow?: boolean;
  tech?: boolean;
}

export function EnhancedCard({ 
  children, 
  className, 
  hover = true, 
  glow = false,
  tech = false 
}: EnhancedCardProps) {
  return (
    <Card 
      className={cn(
        "transition-all duration-300",
        hover && "hover:scale-105 transform",
        glow && "hover:shadow-lg hover:shadow-tennis-green-primary/25",
        tech && "border-tennis-green-light/30 bg-gradient-to-br from-white via-tennis-green-bg/10 to-tennis-green-subtle/20 backdrop-blur-sm",
        "motion-reduce:transform-none motion-reduce:transition-none",
        className
      )}
    >
      {children}
    </Card>
  );
}

export { CardContent, CardHeader, CardTitle, CardDescription };
