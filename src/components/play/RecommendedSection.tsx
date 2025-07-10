import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, MapPin, Users, Clock, Lightbulb } from 'lucide-react';

interface RecommendedSession {
  id: string;
  title: string;
  distance_km: number;
  session_type: string;
  max_players: number;
  participant_count: number;
  creator_name: string;
  location: string;
  stakes_amount: number;
  created_at: string;
  recommendation_score: number;
  recommendation_reason: string;
}

interface RecommendedSectionProps {
  recommendations: RecommendedSession[];
  onJoinSession: (sessionId: string) => void;
  loading: boolean;
}

export function RecommendedSection({ recommendations, onJoinSession, loading }: RecommendedSectionProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            Recommended for You
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="h-16 bg-muted rounded-lg"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (recommendations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            Recommended for You
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-muted-foreground">
            <Lightbulb className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No personalized recommendations available right now.</p>
            <p className="text-sm">Try enabling location services for better matches.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="h-5 w-5 text-yellow-500" />
          Recommended for You
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {recommendations.slice(0, 2).map((session) => (
          <div
            key={session.id}
            className="border rounded-lg p-3 hover:shadow-sm transition-shadow"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <h4 className="font-medium text-sm">{session.title}</h4>
                <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    <span>{session.distance_km.toFixed(1)}km</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    <span>{session.participant_count}/{session.max_players}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{new Date(session.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <Badge variant="secondary" className="text-xs">
                  {Math.round(session.recommendation_score * 100)}% match
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {session.session_type}
                </Badge>
              </div>
            </div>
            
            <div className="mb-2">
              <p className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                💡 {session.recommendation_reason}
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-xs text-muted-foreground">
                <span>{session.location}</span>
                {session.stakes_amount > 0 && (
                  <span className="ml-2 text-yellow-600">
                    • {session.stakes_amount} tokens
                  </span>
                )}
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onJoinSession(session.id)}
                className="text-xs h-6 px-2"
              >
                Join
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}