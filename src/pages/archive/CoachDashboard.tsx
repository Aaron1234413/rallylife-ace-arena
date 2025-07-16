
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useCoachProfile } from '@/hooks/useCoachProfile';
import { usePlayerHP } from '@/hooks/usePlayerHP';
import { usePlayerXP } from '@/hooks/usePlayerXP';
import { useTokens } from '@/hooks/useTokens';
import { HPCard } from '@/components/hp/HPDisplay';
import { XPCard } from '@/components/xp/XPCard';
import { TokenCard } from '@/components/tokens/TokenCard';
import { CoachProfileCard } from '@/components/coach/CoachProfileCard';
import { UpcomingSessions } from '@/components/coach/UpcomingSessions';
import { CoachToolsPanel } from '@/components/coach/CoachToolsPanel';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp } from 'lucide-react';

const CoachDashboard = () => {
  const { user } = useAuth();
  const { hpData, loading: hpLoading } = usePlayerHP();
  const { xpData, loading: xpLoading } = usePlayerXP();
  const { value: tokenValue } = useTokens();

  // Extract first name from user data
  const firstName = user?.user_metadata?.full_name?.split(' ')[0] || 'Coach';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <div className="p-3 sm:p-4 max-w-7xl mx-auto space-y-6">
        {/* Welcome Header */}
        <div className="text-center space-y-4 animate-fade-in">
          {/* Badges */}
          <div className="flex justify-center gap-2 flex-wrap">
            <Badge variant="secondary" className="bg-orange-100 text-orange-800 border-orange-200">
              🔥 Coaching Streak!
            </Badge>
            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-200">
              ⭐ Coach LVL {xpData?.current_level || 1}
            </Badge>
          </div>

          {/* Welcome Message */}
          <div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-2">
              Welcome back, {firstName}! ⭐
            </h1>
            <div className="flex items-center justify-center gap-2 text-lg text-gray-600">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <span>+{xpData?.total_xp_earned || 0} XP earned total</span>
              <span className="text-blue-500">• Ready to coach your next player?</span>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mt-8">
            {/* HP Card */}
            {hpData ? (
              <div className="bg-gradient-to-br from-red-50 to-pink-50 border border-red-200 rounded-2xl p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="bg-red-500 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white text-xl">❤️</span>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{hpData.current_hp}</div>
                <div className="text-sm text-red-700 font-medium mb-3">Health Points</div>
                <div className="w-full bg-red-200 rounded-full h-2">
                  <div 
                    className="bg-red-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${(hpData.current_hp / hpData.max_hp) * 100}%` }}
                  ></div>
                </div>
                <div className="mt-2 text-xs text-red-600 font-semibold">
                  💪 Peak Performance!
                </div>
              </div>
            ) : (
              <Card className="bg-gradient-to-br from-red-50 to-pink-50 border-red-200">
                <CardContent className="p-6 text-center">
                  <p className="text-center text-sm">Loading HP data...</p>
                </CardContent>
              </Card>
            )}

            {/* XP Card */}
            {xpData ? (
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="bg-blue-500 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white text-xl">⚡</span>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">Level {xpData.current_level}</div>
                <div className="text-sm text-blue-700 font-medium mb-3">Experience</div>
                <div className="w-full bg-blue-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${xpData.xp_to_next_level > 0 ? ((xpData.current_xp / (xpData.current_xp + xpData.xp_to_next_level)) * 100) : 100}%` }}
                  ></div>
                </div>
                <div className="mt-2 text-xs text-blue-600 font-semibold">
                  {xpData.xp_to_next_level > 0 ? `${xpData.xp_to_next_level} XP to next level` : 'Max Level!'}
                </div>
              </div>
            ) : (
              <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
                <CardContent className="p-6 text-center">
                  <p className="text-center text-sm">Loading XP data...</p>
                </CardContent>
              </Card>
            )}

            {/* Tokens Card */}
            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200 rounded-2xl p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="bg-yellow-500 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-xl">🔗</span>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">{tokenValue || 0}</div>
              <div className="text-sm text-yellow-700 font-medium mb-3">Tokens</div>
              <div className="w-full bg-purple-200 rounded-full h-2">
                <div className="bg-purple-500 h-2 rounded-full transition-all duration-500 w-0"></div>
              </div>
              <div className="mt-2 text-xs text-purple-600 font-semibold">
                • 0 Premium •
              </div>
            </div>
          </div>
        </div>

        {/* Coach Action Section */}
        <div className="text-center animate-fade-in">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-2">
              🎾 Choose Your Coaching Adventure
            </h2>
            <p className="text-gray-600 mb-6">What challenge will you conquer today?</p>
            
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="bg-green-500 text-white rounded-xl p-4 hover:bg-green-600 transition-colors cursor-pointer">
                <div className="text-2xl mb-2">🎾</div>
                <div className="font-semibold">Join Session</div>
              </div>
              <div className="bg-gray-100 text-gray-700 rounded-xl p-4 hover:bg-gray-200 transition-colors cursor-pointer">
                <div className="text-2xl mb-2">🔗</div>
                <div className="font-semibold">Manage Players</div>
              </div>
              <div className="bg-gray-100 text-gray-700 rounded-xl p-4 hover:bg-gray-200 transition-colors cursor-pointer">
                <div className="text-2xl mb-2">👥</div>
                <div className="font-semibold">Find Sessions</div>
              </div>
              <div className="bg-gray-100 text-gray-700 rounded-xl p-4 hover:bg-gray-200 transition-colors cursor-pointer relative">
                <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">NEW</div>
                <div className="text-2xl mb-2">🏢</div>
                <div className="font-semibold">Create Club</div>
              </div>
            </div>
          </div>
        </div>

        {/* Coach Specific Sections */}
        <div className="grid gap-6 lg:grid-cols-2 animate-fade-in">
          {/* Left Column */}
          <div className="space-y-6">
            <CoachProfileCard />
            <CoachToolsPanel />
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <UpcomingSessions />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoachDashboard;
