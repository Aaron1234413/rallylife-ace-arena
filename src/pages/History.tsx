import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Trophy, 
  Calendar, 
  MapPin, 
  Clock, 
  TrendingUp,
  ArrowLeft,
  Target,
  Award
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useMatchHistory } from '@/hooks/useMatchHistory';
import { format } from 'date-fns';

const History = () => {
  const { matchHistory, loading } = useMatchHistory();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-tennis-green-bg/20 to-tennis-green-subtle/30">
        <div className="container mx-auto px-4 py-6">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-48" />
            <div className="grid md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-24 bg-muted rounded" />
              ))}
            </div>
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-32 bg-muted rounded" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-tennis-green-bg/20 to-tennis-green-subtle/30">
      <div className="container mx-auto px-4 py-6 pb-24">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link to="/play">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Play
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">🏆 Match History</h1>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-gradient-to-r from-tennis-green-primary to-tennis-green-accent text-white">
            <CardContent className="p-4 text-center">
              <Trophy className="h-6 w-6 mx-auto mb-2" />
              <div className="text-2xl font-bold">{matchHistory.totalMatches}</div>
              <div className="text-sm opacity-90">Total Matches</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardContent className="p-4 text-center">
              <Award className="h-6 w-6 mx-auto mb-2" />
              <div className="text-2xl font-bold">{matchHistory.matchesWon}</div>
              <div className="text-sm opacity-90">Wins</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white">
            <CardContent className="p-4 text-center">
              <Target className="h-6 w-6 mx-auto mb-2" />
              <div className="text-2xl font-bold">{matchHistory.matchesLost}</div>
              <div className="text-sm opacity-90">Losses</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardContent className="p-4 text-center">
              <TrendingUp className="h-6 w-6 mx-auto mb-2" />
              <div className="text-2xl font-bold">{matchHistory.winRate}%</div>
              <div className="text-sm opacity-90">Win Rate</div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Matches */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Recent Matches
            </CardTitle>
          </CardHeader>
          <CardContent>
            {matchHistory.recentMatches.length === 0 ? (
              <div className="text-center py-8">
                <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No matches yet</h3>
                <p className="text-muted-foreground mb-4">
                  Start playing to build your match history!
                </p>
                <Link to="/play">
                  <Button>
                    Find a Match
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {matchHistory.recentMatches.map((match) => (
                  <div 
                    key={match.id} 
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-3 h-3 rounded-full ${
                        match.result === 'won' 
                          ? 'bg-green-500' 
                          : match.result === 'lost' 
                          ? 'bg-red-500' 
                          : 'bg-yellow-500'
                      }`} />
                      
                      <div>
                        <div className="font-semibold">
                          vs {match.opponent_name}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(match.completed_at), 'MMM dd, yyyy')}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {format(new Date(match.completed_at), 'h:mm a')}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <Badge 
                        variant={match.result === 'won' ? 'default' : 'secondary'}
                        className={
                          match.result === 'won' 
                            ? 'bg-green-500 hover:bg-green-600' 
                            : match.result === 'lost'
                            ? 'bg-red-500 hover:bg-red-600'
                            : 'bg-yellow-500 hover:bg-yellow-600'
                        }
                      >
                        {match.result === 'won' ? 'Won' : match.result === 'lost' ? 'Lost' : 'Draw'}
                      </Badge>
                      <div className="text-sm text-muted-foreground mt-1">
                        {match.final_score || 'No score recorded'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default History;