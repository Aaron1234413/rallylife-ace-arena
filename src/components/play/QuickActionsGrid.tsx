import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Gamepad2, 
  Plus, 
  History, 
  Trophy,
  Zap,
  Target
} from 'lucide-react';
import { Link } from 'react-router-dom';

export interface QuickActionsGridProps {
  onFindMatch?: () => void;
  onCreateSession?: () => void;
  className?: string;
}

export function QuickActionsGrid({ onFindMatch, onCreateSession, className }: QuickActionsGridProps) {
  const actions = [
    {
      id: 'find-match',
      title: 'Find Match',
      description: 'UTR-based matchmaking',
      icon: Gamepad2,
      color: 'from-tennis-green-primary to-tennis-green-accent',
      onClick: onFindMatch,
      disabled: false
    },
    {
      id: 'create-session',
      title: 'Create Session',
      description: 'Start a new game',
      icon: Plus,
      color: 'from-tennis-green-accent to-tennis-green-primary',
      onClick: onCreateSession,
      disabled: false
    },
    {
      id: 'match-history',
      title: 'Match History',
      description: 'View past matches',
      icon: History,
      color: 'from-tennis-green-medium to-tennis-green-primary',
      link: '/history',
      disabled: false
    },
    {
      id: 'tournaments',
      title: 'Tournaments',
      description: 'Coming soon',
      icon: Trophy,
      color: 'from-tennis-neutral-400 to-tennis-neutral-500',
      disabled: true
    }
  ];

  return (
    <div className={`grid grid-cols-2 gap-4 ${className}`}>
      {actions.map((action) => {
        const IconComponent = action.icon;
        const content = (
          <Card className={`group hover:shadow-xl transition-all duration-300 ${
            action.disabled 
              ? 'opacity-50 cursor-not-allowed' 
              : 'hover:scale-[1.02] cursor-pointer'
          }`}>
            <CardContent className="p-4 text-center">
              <div className={`
                w-12 h-12 mx-auto mb-3 rounded-xl flex items-center justify-center text-white
                bg-gradient-to-br ${action.color}
                ${!action.disabled && 'group-hover:scale-110 transition-transform duration-300'}
              `}>
                <IconComponent className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-sm mb-1">{action.title}</h3>
              <p className="text-xs text-muted-foreground">{action.description}</p>
              {action.disabled && (
                <div className="flex items-center justify-center gap-1 mt-2">
                  <Zap className="h-3 w-3 text-tennis-yellow-dark" />
                  <span className="text-xs text-tennis-yellow-dark font-medium">Coming Soon</span>
                </div>
              )}
            </CardContent>
          </Card>
        );

        if (action.disabled) {
          return <div key={action.id}>{content}</div>;
        }

        if (action.link) {
          return (
            <Link key={action.id} to={action.link}>
              {content}
            </Link>
          );
        }

        return (
          <div 
            key={action.id} 
            onClick={action.onClick}
            className="cursor-pointer"
          >
            {content}
          </div>
        );
      })}
    </div>
  );
}