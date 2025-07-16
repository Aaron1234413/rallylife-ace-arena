import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

interface QuickAction {
  icon: string;
  label: string;
  onClick: () => void;
}

interface QuickActionsProps {
  actions: QuickAction[];
}

export function QuickActions({ actions }: QuickActionsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {actions.map((action, index) => (
        <Card key={index} className="bg-white/95 backdrop-blur-sm border-white/20 shadow-xl">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-tennis-green-dark">
              <span className="text-xl">{action.icon}</span>
              {action.label}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={action.onClick}
              className="w-full bg-tennis-green-primary hover:bg-tennis-green-medium"
            >
              Get Started
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}