import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Users, Clock, Star } from 'lucide-react';

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

interface LocationBasedRecommendationsProps {
  recommendations: RecommendedSession[];
  onJoinSession: (sessionId: string) => void;
  loading: boolean;
}

export const LocationBasedRecommendations: React.FC<LocationBasedRecommendationsProps> = ({
  recommendations,
  onJoinSession,
  loading
}) => {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            Smart Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-gray-200 rounded-lg"></div>
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
            Smart Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-center py-4">
            No personalized recommendations available. Try enabling location services for better matches.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="h-5 w-5 text-yellow-500" />
          Smart Recommendations
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {recommendations.map((session) => (
          <div
            key={session.id}
            className="border rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h4 className="font-semibold text-lg">{session.title}</h4>
                <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    <span>{session.distance_km.toFixed(1)}km away</span>
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
              <div className="flex flex-col items-end gap-2">
                <Badge variant="outline" className="text-xs">
                  {session.session_type}
                </Badge>
                <Badge 
                  variant="secondary" 
                  className="text-xs bg-yellow-100 text-yellow-800"
                >
                  {Math.round(session.recommendation_score * 100)}% match
                </Badge>
              </div>
            </div>
            
            <div className="mb-3">
              <p className="text-sm text-blue-600 bg-blue-50 px-3 py-2 rounded-md">
                💡 {session.recommendation_reason}
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                <span>{session.location}</span>
                {session.stakes_amount > 0 && (
                  <span className="ml-2 text-yellow-600">
                    • {session.stakes_amount} tokens
                  </span>
                )}
              </div>
              <Button
                size="sm"
                onClick={() => onJoinSession(session.id)}
                className="bg-tennis-green-primary hover:bg-tennis-green-medium"
              >
                Join Session
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};