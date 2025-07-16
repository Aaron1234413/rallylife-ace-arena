import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Gamepad2, 
  Users, 
  Trophy, 
  Activity,
  Zap,
  Calendar,
  Target,
  ArrowRight,
  Play
} from 'lucide-react';
import { usePlayerTokens } from '@/hooks/usePlayerTokens';
import { usePlayerXP } from '@/hooks/usePlayerXP';
import { usePlayerHP } from '@/hooks/usePlayerHP';
import { useMatchmaking } from '@/hooks/useMatchmaking';

const Dashboard = () => {
  const { user } = useAuth();
  const { regularTokens, loading: tokensLoading } = usePlayerTokens();
  const { xpData, loading: xpLoading } = usePlayerXP();
  const { hpData, loading: hpLoading } = usePlayerHP();
  const { 
    getPendingChallenges,
    getActiveMatches,
    isLoading: matchesLoading 
  } = useMatchmaking();

  const pendingChallenges = getPendingChallenges();
  const activeMatches = getActiveMatches();

  const totalPendingChallenges = pendingChallenges.length;
  const totalActiveMatches = activeMatches.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-tennis-green-dark via-tennis-green-medium to-tennis-green-light">
      <div className="container mx-auto px-4 py-6 sm:py-8">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8 space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-white rounded-full shadow-lg">
            <span className="text-xl">🎾</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            Welcome back, {user?.email?.split('@')[0]}!
          </h1>
          <p className="text-tennis-green-bg/90">Ready to play some tennis?</p>
        </div>

        <div className="max-w-6xl mx-auto space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-white/95 backdrop-blur-sm border-white/20 shadow-xl">
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center w-10 h-10 bg-tennis-green-light/20 rounded-full mx-auto mb-2">
                  <Trophy className="h-5 w-5 text-tennis-green-medium" />
                </div>
                <p className="text-2xl font-bold text-tennis-green-dark">
                  {xpLoading ? '...' : xpData?.current_level || 1}
                </p>
                <p className="text-xs text-tennis-green-dark/70">Level</p>
              </CardContent>
            </Card>

            <Card className="bg-white/95 backdrop-blur-sm border-white/20 shadow-xl">
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center w-10 h-10 bg-tennis-green-light/20 rounded-full mx-auto mb-2">
                  <Zap className="h-5 w-5 text-tennis-green-medium" />
                </div>
                <p className="text-2xl font-bold text-tennis-green-dark">
                  {hpLoading ? '...' : `${hpData?.current_hp || 100}%`}
                </p>
                <p className="text-xs text-tennis-green-dark/70">Energy</p>
              </CardContent>
            </Card>

            <Card className="bg-white/95 backdrop-blur-sm border-white/20 shadow-xl">
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center w-10 h-10 bg-tennis-green-light/20 rounded-full mx-auto mb-2">
                  <Target className="h-5 w-5 text-tennis-green-medium" />
                </div>
                <p className="text-2xl font-bold text-tennis-green-dark">
                  {tokensLoading ? '...' : regularTokens}
                </p>
                <p className="text-xs text-tennis-green-dark/70">Tokens</p>
              </CardContent>
            </Card>

            <Card className="bg-white/95 backdrop-blur-sm border-white/20 shadow-xl">
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center w-10 h-10 bg-tennis-green-light/20 rounded-full mx-auto mb-2">
                  <Gamepad2 className="h-5 w-5 text-tennis-green-medium" />
                </div>
                <p className="text-2xl font-bold text-tennis-green-dark">
                  {matchesLoading ? '...' : totalActiveMatches + totalPendingChallenges}
                </p>
                <p className="text-xs text-tennis-green-dark/70">Matches</p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Play Tennis */}
            <Card className="bg-white/95 backdrop-blur-sm border-white/20 shadow-xl">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-tennis-green-dark">
                  <Play className="h-5 w-5" />
                  Play Tennis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-tennis-green-dark/70">
                  Find sessions and players near you
                </p>
                <Button asChild className="w-full bg-tennis-green-primary hover:bg-tennis-green-medium">
                  <Link to="/play">
                    Browse Sessions
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Matchmaking */}
            <Card className="bg-white/95 backdrop-blur-sm border-white/20 shadow-xl">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-tennis-green-dark">
                  <Gamepad2 className="h-5 w-5" />
                  Find Opponents
                  {totalPendingChallenges > 0 && (
                    <Badge className="bg-red-500 text-white">{totalPendingChallenges}</Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-tennis-green-dark/70">
                  Challenge players to competitive matches
                </p>
                <Button asChild variant="outline" className="w-full border-tennis-green-medium text-tennis-green-dark hover:bg-tennis-green-light/20">
                  <Link to="/play?tab=matchmaking">
                    Find Players
                    <Users className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Leaderboards */}
            <Card className="bg-white/95 backdrop-blur-sm border-white/20 shadow-xl">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-tennis-green-dark">
                  <Activity className="h-5 w-5" />
                  Leaderboards
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-tennis-green-dark/70">
                  See how you rank against other players
                </p>
                <Button asChild variant="outline" className="w-full border-tennis-green-medium text-tennis-green-dark hover:bg-tennis-green-light/20">
                  <Link to="/leaderboards">
                    View Rankings
                    <Trophy className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Active Matches Section */}
          {(totalPendingChallenges > 0 || totalActiveMatches > 0) && (
            <Card className="bg-white/95 backdrop-blur-sm border-white/20 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-tennis-green-dark">
                  <Gamepad2 className="h-5 w-5" />
                  Your Matches
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {totalPendingChallenges > 0 && (
                  <div className="flex items-center justify-between p-3 bg-tennis-green-bg/50 rounded-lg">
                    <div>
                      <p className="font-medium text-tennis-green-dark">Pending Challenges</p>
                      <p className="text-sm text-tennis-green-dark/70">
                        {totalPendingChallenges} challenge{totalPendingChallenges !== 1 ? 's' : ''} waiting for response
                      </p>
                    </div>
                    <Button asChild size="sm">
                      <Link to="/play?tab=matchmaking">
                        View All
                      </Link>
                    </Button>
                  </div>
                )}

                {totalActiveMatches > 0 && (
                  <div className="flex items-center justify-between p-3 bg-tennis-green-bg/50 rounded-lg">
                    <div>
                      <p className="font-medium text-tennis-green-dark">Active Matches</p>
                      <p className="text-sm text-tennis-green-dark/70">
                        {totalActiveMatches} ongoing match{totalActiveMatches !== 1 ? 'es' : ''}
                      </p>
                    </div>
                    <Button asChild size="sm">
                      <Link to="/play?tab=matchmaking">
                        View All
                      </Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Recent Activity */}
          <Card className="bg-white/95 backdrop-blur-sm border-white/20 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-tennis-green-dark">
                <Calendar className="h-5 w-5" />
                Quick Start
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Button asChild variant="outline" className="border-tennis-green-medium text-tennis-green-dark hover:bg-tennis-green-light/20">
                <Link to="/play">
                  <Play className="h-4 w-4 mr-2" />
                  Browse Sessions
                </Link>
              </Button>
              <Button asChild variant="outline" className="border-tennis-green-medium text-tennis-green-dark hover:bg-tennis-green-light/20">
                <Link to="/play?tab=matchmaking">
                  <Users className="h-4 w-4 mr-2" />
                  Find Players
                </Link>
              </Button>
              <Button asChild variant="outline" className="border-tennis-green-medium text-tennis-green-dark hover:bg-tennis-green-light/20">
                <Link to="/profile">
                  <Target className="h-4 w-4 mr-2" />
                  Edit Profile
                </Link>
              </Button>
              <Button asChild variant="outline" className="border-tennis-green-medium text-tennis-green-dark hover:bg-tennis-green-light/20">
                <Link to="/leaderboards">
                  <Trophy className="h-4 w-4 mr-2" />
                  View Rankings
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;