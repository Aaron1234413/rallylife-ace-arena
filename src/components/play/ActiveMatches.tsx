import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Trophy, 
  Clock, 
  MapPin, 
  User,
  Calendar,
  ArrowRight
} from 'lucide-react';
import { useMatchmaking } from '@/hooks/useMatchmaking';
import { Link } from 'react-router-dom';

export function ActiveMatches() {
  const { getActiveMatches, getPendingChallenges, isLoading } = useMatchmaking();
  
  const activeMatches = getActiveMatches();
  const pendingChallenges = getPendingChallenges();
  
  const allMatches = [...activeMatches, ...pendingChallenges];

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-tennis-green-primary" />
            Active Matches
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="h-16 bg-muted rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (allMatches.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-tennis-green-primary" />
            Active Matches
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground mb-4">
              No active matches yet
            </p>
            <Link to="/play?tab=matchmaking">
              <Button size="sm" className="bg-tennis-green-primary hover:bg-tennis-green-accent">
                Find Your First Match
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-tennis-green-primary" />
            Active Matches
          </div>
          <Badge variant="outline" className="bg-tennis-green-subtle text-tennis-green-dark">
            {allMatches.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {allMatches.slice(0, 3).map((match) => (
          <div 
            key={match.id}
            className="flex items-center justify-between p-3 bg-tennis-green-bg/30 rounded-lg border border-tennis-green-primary/20 hover:border-tennis-green-primary/40 transition-colors"
          >
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <div className="flex items-center gap-1">
                  <User className="h-3 w-3 text-muted-foreground" />
                <span className="text-sm font-medium">
                  vs {(match as any).opponent?.full_name || (match as any).challenger?.full_name || 'Unknown Player'}
                </span>
                </div>
                <Badge 
                  variant="outline" 
                  className={`text-xs ${
                    match.status === 'pending' 
                      ? 'bg-tennis-yellow-subtle text-tennis-yellow-dark border-tennis-yellow-primary/30'
                      : 'bg-tennis-green-subtle text-tennis-green-dark border-tennis-green-primary/30'
                  }`}
                >
                  {match.status}
                </Badge>
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                {match.scheduled_time && (
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>{new Date(match.scheduled_time).toLocaleDateString()}</span>
                  </div>
                )}
                {match.court_location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    <span>{match.court_location}</span>
                  </div>
                )}
                {match.stake_amount && match.stake_amount > 0 && (
                  <div className="flex items-center gap-1">
                    <Trophy className="h-3 w-3" />
                    <span>{match.stake_amount} tokens</span>
                  </div>
                )}
              </div>
            </div>
            <Link to={`/matches/${match.id}`}>
              <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        ))}
        
        {allMatches.length > 3 && (
          <Link to="/matches">
            <Button variant="outline" size="sm" className="w-full mt-2">
              View All Matches ({allMatches.length})
            </Button>
          </Link>
        )}
      </CardContent>
    </Card>
  );
}