import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, Star, Zap } from 'lucide-react';

const Leaderboards = () => {
  return (
    <div className="min-h-screen bg-tennis-green-bg p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-tennis-green-dark mb-2">
            🏆 Leaderboards
          </h1>
          <p className="text-tennis-green-medium">
            See how you rank against other players
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Top Players by Level */}
          <Card className="border-tennis-green-light">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-tennis-green-dark">
                <Star className="h-5 w-5" />
                Top Players
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((rank) => (
                  <div key={rank} className="flex items-center justify-between p-2 rounded-lg bg-tennis-green-bg/50">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-tennis-green-primary text-white text-sm flex items-center justify-center">
                        {rank}
                      </span>
                      <span className="font-medium">Player {rank}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold">Level {15 - rank}</div>
                      <div className="text-xs text-tennis-green-medium">{5000 - rank * 500} XP</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top Token Earners */}
          <Card className="border-tennis-green-light">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-tennis-green-dark">
                <Zap className="h-5 w-5" />
                Token Leaders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((rank) => (
                  <div key={rank} className="flex items-center justify-between p-2 rounded-lg bg-tennis-green-bg/50">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-yellow-500 text-white text-sm flex items-center justify-center">
                        {rank}
                      </span>
                      <span className="font-medium">Player {rank}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold">{(10000 - rank * 1000).toLocaleString()} ⚡</div>
                      <div className="text-xs text-tennis-green-medium">tokens</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Match Winners */}
          <Card className="border-tennis-green-light">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-tennis-green-dark">
                <Trophy className="h-5 w-5" />
                Match Winners
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((rank) => (
                  <div key={rank} className="flex items-center justify-between p-2 rounded-lg bg-tennis-green-bg/50">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-green-500 text-white text-sm flex items-center justify-center">
                        {rank}
                      </span>
                      <span className="font-medium">Player {rank}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold">{20 - rank * 2} wins</div>
                      <div className="text-xs text-tennis-green-medium">this month</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Coming Soon Notice */}
        <Card className="mt-8 border-dashed border-tennis-green-light">
          <CardContent className="text-center p-8">
            <Trophy className="h-12 w-12 text-tennis-green-medium mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-tennis-green-dark mb-2">
              Real Leaderboards Coming Soon!
            </h3>
            <p className="text-tennis-green-medium">
              Connect with more players and start climbing the ranks. Real data will power these leaderboards once you begin playing matches.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Leaderboards;