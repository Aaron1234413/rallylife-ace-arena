
import React from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface CardWithAnimationProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  delay?: number;
}

export function CardWithAnimation({ 
  children, 
  className, 
  delay = 0,
  ...props 
}: CardWithAnimationProps) {
  return (
    <Card
      className={cn(
        'animate-fade-in transform transition-all duration-300 hover:shadow-lg hover:-translate-y-1',
        className
      )}
      style={{ animationDelay: `${delay}ms` }}
      {...props}
    >
      {children}
    </Card>
  );
}
