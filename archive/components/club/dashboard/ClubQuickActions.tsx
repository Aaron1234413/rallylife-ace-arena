import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Plus, 
  Users, 
  Calendar, 
  MessageSquare,
  Search,
  Trophy
} from 'lucide-react';

interface ClubQuickActionsProps {
  clubId: string;
}

export function ClubQuickActions({ clubId }: ClubQuickActionsProps) {
  const navigate = useNavigate();

  const quickActions = [
    {
      icon: Plus,
      label: 'Create Session',
      action: () => navigate(`/club/${clubId}/sessions/create`),
      variant: 'default' as const,
      className: 'bg-tennis-green-primary hover:bg-tennis-green-dark'
    },
    {
      icon: Search,
      label: 'Find Partner',
      action: () => {
        // Navigate to looking to play section or open availability dialog
        console.log('Find partner clicked');
      },
      variant: 'outline' as const
    },
    {
      icon: Calendar,
      label: 'Book Court',
      action: () => {
        // Navigate to court booking
        console.log('Book court clicked');
      },
      variant: 'outline' as const
    },
    {
      icon: Trophy,
      label: 'Challenges',
      action: () => {
        // Navigate to challenges
        console.log('Challenges clicked');
      },
      variant: 'outline' as const
    }
  ];

  return (
    <>
      <Card className="shadow-lg">
        <CardContent className="p-4">
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((action, index) => (
              <Button
                key={index}
                variant={action.variant}
                onClick={action.action}
                className={`h-16 flex-col gap-2 text-xs font-medium ${action.className || ''}`}
              >
                <action.icon className="h-5 w-5" />
                <span>{action.label}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </>
  );
}