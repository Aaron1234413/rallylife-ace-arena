import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  Activity, 
  Calendar, 
  Trophy,
  Plus,
  Zap,
  GraduationCap,
  Heart
} from 'lucide-react';
import { LiveClubActivityFeed } from './LiveClubActivityFeed';
import { WhoIsLookingToPlay } from './WhoIsLookingToPlay';
import { SessionManagement } from './SessionManagement';

interface ClubMobileDashboardProps {
  club: {
    id: string;
    name: string;
    description?: string;
    member_count: number;
    is_public: boolean;
  };
  isMember: boolean;
}

export function ClubMobileDashboard({ club, isMember }: ClubMobileDashboardProps) {
  const navigate = useNavigate();

  const sessionTypes = [
    {
      type: 'match',
      label: 'Tennis Match',
      icon: Zap,
      color: 'bg-blue-500',
      description: 'Competitive match with scoring'
    },
    {
      type: 'training',
      label: 'Training Session',
      icon: GraduationCap,
      color: 'bg-green-500',
      description: 'Practice and skill development'
    },
    {
      type: 'social_play',
      label: 'Social Play',
      icon: Users,
      color: 'bg-purple-500',
      description: 'Casual play with friends'
    },
    {
      type: 'wellbeing',
      label: 'Wellbeing Session',
      icon: Heart,
      color: 'bg-pink-500',
      description: 'Recovery and wellness'
    }
  ];

  const handleCreateSession = (sessionType: string) => {
    navigate(`/sessions/create?type=${sessionType}`);
  };

  if (!isMember) {
    return (
      <div className="space-y-4">
        <Card>
          <CardContent className="text-center py-8">
            <h3 className="font-medium mb-2 text-tennis-green-dark">Join to Access Club Features</h3>
            <p className="text-sm text-tennis-green-medium">
              Become a member to see who's looking to play, join sessions, and access all club features.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Quick Session Creation Actions */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-tennis-green-dark">
            <Plus className="h-5 w-5 text-tennis-green-primary" />
            Create Club Session
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {sessionTypes.map((session) => {
              const IconComponent = session.icon;
              return (
                <Button
                  key={session.type}
                  variant="outline"
                  onClick={() => handleCreateSession(session.type)}
                  className="h-auto p-4 flex flex-col items-center gap-2 hover:shadow-md transition-all"
                >
                  <div className={`w-8 h-8 rounded-full ${session.color} flex items-center justify-center`}>
                    <IconComponent className="h-4 w-4 text-white" />
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-sm">{session.label}</div>
                    <div className="text-xs text-muted-foreground">{session.description}</div>
                  </div>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Session Management Widget - Core functionality */}
      <SessionManagement clubId={club.id} />
      
      {/* Live Activity & Member Status */}
      <LiveClubActivityFeed clubId={club.id} />
      
      <WhoIsLookingToPlay clubId={club.id} />
    </div>
  );
}