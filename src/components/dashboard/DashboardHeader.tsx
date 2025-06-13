
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { 
  LogOut, 
  Settings, 
  Trophy, 
  Activity, 
  MessageSquare, 
  Users,
  Rss
} from 'lucide-react';

export function DashboardHeader() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-tennis-green-dark">
              Welcome back to RallyLife! 🎾
            </h1>
            <p className="text-muted-foreground">
              Track your progress, connect with players, and level up your game
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/feed')}
              className="flex items-center gap-2"
            >
              <Rss className="h-4 w-4" />
              Feed
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/activities')}
              className="flex items-center gap-2"
            >
              <Activity className="h-4 w-4" />
              Activities
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/achievements')}
              className="flex items-center gap-2"
            >
              <Trophy className="h-4 w-4" />
              Achievements
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/messages')}
              className="flex items-center gap-2"
            >
              <MessageSquare className="h-4 w-4" />
              Messages
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={signOut}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
