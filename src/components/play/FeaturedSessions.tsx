import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Star, 
  Users, 
  MapPin, 
  Coins,
  Trophy,
  Zap,
  Target
} from 'lucide-react';
import { useStandardSessionFetch } from '@/hooks/useStandardSessionFetch';
import { useJoinSessionState } from '@/hooks/useJoinSessionState';

export function FeaturedSessions() {
  const { 
    availableSessions, 
    loading, 
    joinSession 
  } = useStandardSessionFetch({
    includeNonClubSessions: true
  });
  
  const { isJoining, startJoining, stopJoining } = useJoinSessionState();

  // Get featured sessions (top 3 by participants or recent)
  const featuredSessions = availableSessions
    .sort((a, b) => (b.participant_count || 0) - (a.participant_count || 0))
    .slice(0, 3);

  const handleJoinSession = async (sessionId: string) => {
    if (isJoining(sessionId)) return;
    
    startJoining(sessionId);
    try {
      await joinSession(sessionId);
    } catch (error) {
      console.error('Failed to join session:', error);
    } finally {
      stopJoining();
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'match': return Trophy;
      case 'social': return Users;
      case 'training': return Star;
      default: return Star;
    }
  };

  const getRewardPreview = (stakes: number, type: string) => {
    const baseXP = type === 'match' ? 50 : type === 'training' ? 30 : 20;
    const stakesBonus = Math.floor(stakes * 0.1);
    return {
      xp: baseXP + stakesBonus,
      tokens: Math.floor(stakes * 1.5) || 10
    };
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-tennis-green-primary" />
            Featured Sessions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-muted rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (featuredSessions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-tennis-green-primary" />
            Featured Sessions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <Star className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              No featured sessions available right now
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="h-5 w-5 text-tennis-green-primary" />
          Featured Sessions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {featuredSessions.map((session) => {
          const TypeIcon = getTypeIcon(session.session_type);
          const reward = getRewardPreview(session.stakes_amount || 0, session.session_type);
          const joining = isJoining(session.id);

          return (
            <div 
              key={session.id}
              className="p-3 bg-gradient-to-br from-tennis-green-subtle to-tennis-green-bg rounded-lg border border-tennis-green-primary/20 hover:border-tennis-green-primary/40 transition-all duration-300 hover:scale-[1.01]"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2 flex-1">
                  <TypeIcon className="h-4 w-4 text-tennis-green-primary" />
                  <h4 className="font-medium text-sm line-clamp-1">
                    {session.session_type} Session
                  </h4>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    {session.participant_count || 0}/{session.max_players || 4}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 mb-2 text-xs text-muted-foreground">
                {session.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    <span className="line-clamp-1">{session.location}</span>
                  </div>
                )}
                {session.creator?.full_name && (
                  <span>by {session.creator.full_name}</span>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {session.stakes_amount && session.stakes_amount > 0 && (
                    <div className="flex items-center gap-1 text-xs font-medium text-tennis-yellow-dark">
                      <Coins className="h-3 w-3" />
                      <span>{session.stakes_amount}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1 text-xs font-medium text-tennis-green-accent">
                    <Zap className="h-3 w-3" />
                    <span>+{reward.xp} XP</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs font-medium text-tennis-green-primary">
                    <Target className="h-3 w-3" />
                    <span>+{reward.tokens}</span>
                  </div>
                </div>
                
                <Button 
                  size="sm" 
                  className="h-7 px-3 text-xs bg-tennis-green-primary hover:bg-tennis-green-accent"
                  onClick={() => handleJoinSession(session.id)}
                  disabled={joining}
                >
                  {joining ? 'Joining...' : 'Join'}
                </Button>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}