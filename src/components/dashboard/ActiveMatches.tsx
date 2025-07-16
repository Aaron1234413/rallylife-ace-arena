import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Gamepad2 } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Match {
  id: string;
  status: string;
  created_at: string;
  opponent_name?: string;
  match_type?: string;
  challenger_id?: string;
  opponent_id?: string;
  court_location?: string;
}

interface ActiveMatchesProps {
  matches: Match[];
}

export function ActiveMatches({ matches }: ActiveMatchesProps) {
  return (
    <Card className="bg-white/95 backdrop-blur-sm border-white/20 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-tennis-green-dark">
          <Gamepad2 className="h-5 w-5" />
          Upcoming Matches
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {matches.length > 0 ? (
          <>
            {matches.slice(0, 3).map((match) => (
              <div key={match.id} className="flex items-center justify-between p-3 bg-tennis-green-bg/50 rounded-lg">
                <div>
                  <p className="font-medium text-tennis-green-dark">
                    {match.opponent_name ? `vs ${match.opponent_name}` : 'Match Challenge'}
                  </p>
                  <p className="text-sm text-tennis-green-dark/70">
                    {match.match_type || 'Challenge'} • {match.status}
                  </p>
                </div>
                <Badge className="bg-tennis-green-primary text-white">
                  {match.status}
                </Badge>
              </div>
            ))}
            {matches.length > 3 && (
              <Button asChild size="sm" variant="outline" className="w-full border-tennis-green-medium text-tennis-green-dark hover:bg-tennis-green-light/20">
                <Link to="/play?tab=matchmaking">
                  View All {matches.length} Matches
                </Link>
              </Button>
            )}
          </>
        ) : (
          <div className="text-center py-6">
            <Gamepad2 className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-tennis-green-dark/70 mb-3">No upcoming matches</p>
            <Button asChild size="sm" className="bg-tennis-green-primary hover:bg-tennis-green-medium">
              <Link to="/play?tab=matchmaking">
                Find Your Next Match
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}