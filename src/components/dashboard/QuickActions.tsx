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
  const cardColors = [
    'bg-gradient-to-br from-green-500 to-green-600',
    'bg-gradient-to-br from-purple-500 to-purple-600', 
    'bg-gradient-to-br from-orange-500 to-orange-600'
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {actions.map((action, index) => (
        <Card key={index} className={`${cardColors[index]} border-none shadow-lg hover:shadow-xl transition-shadow cursor-pointer`} onClick={action.onClick}>
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-white/20 rounded-full mx-auto mb-3">
              <span className="text-2xl">{action.icon}</span>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">{action.label}</h3>
            <Button 
              variant="secondary"
              className="w-full bg-white/20 hover:bg-white/30 text-white border-none"
            >
              Go
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}