
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, Clock, Trophy, Zap, Heart, Calendar } from 'lucide-react';
import { useSocialPlaySessions } from '@/hooks/useSocialPlaySessions';

export const EventAnalytics = () => {
  const { sessions, isLoading } = useSocialPlaySessions();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-8 bg-gray-200 rounded mb-2" />
              <div className="h-4 bg-gray-200 rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const completedSessions = sessions.filter(session => session.status === 'completed');
  
  // Calculate analytics
  const totalSessions = completedSessions.length;
  
  const totalMinutes = completedSessions.reduce((total, session) => {
    if (!session.start_time || !session.end_time) return total;
    const start = new Date(session.start_time);
    const end = new Date(session.end_time);
    const diffMs = end.getTime() - start.getTime();
    return total + Math.floor(diffMs / (1000 * 60));
  }, 0);
  
  const totalHours = Math.floor(totalMinutes / 60);
  const remainingMinutes = totalMinutes % 60;
  
  // Estimate XP earned (using similar logic to useDurationRewards)
  const estimatedXP = completedSessions.reduce((total, session) => {
    if (!session.start_time || !session.end_time) return total;
    const start = new Date(session.start_time);
    const end = new Date(session.end_time);
    const diffMs = end.getTime() - start.getTime();
    const minutes = Math.floor(diffMs / (1000 * 60));
    
    // Base XP calculation
    const quarterHours = Math.floor(minutes / 15);
    const baseXP = quarterHours * 25;
    
    // Bonus for longer sessions
    let bonusMultiplier = 1;
    if (minutes >= 60) bonusMultiplier = 1.5;
    if (minutes >= 120) bonusMultiplier = 2.0;
    
    // Social bonus (playing with friends)
    const socialBonus = 1.5;
    
    return total + Math.floor(baseXP * bonusMultiplier * socialBonus);
  }, 0);
  
  // Session type breakdown
  const sessionTypes = completedSessions.reduce((acc, session) => {
    acc[session.session_type] = (acc[session.session_type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  // Monthly data for chart
  const monthlyData = completedSessions.reduce((acc, session) => {
    if (!session.end_time) return acc;
    
    const date = new Date(session.end_time);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const monthName = date.toLocaleString('default', { month: 'short', year: '2-digit' });
    
    if (!acc[monthKey]) {
      acc[monthKey] = { month: monthName, sessions: 0 };
    }
    acc[monthKey].sessions += 1;
    
    return acc;
  }, {} as Record<string, { month: string; sessions: number }>);
  
  const chartData = Object.values(monthlyData).slice(-6); // Last 6 months

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-600" />
              <div>
                <div className="text-2xl font-bold">{totalSessions}</div>
                <div className="text-sm text-muted-foreground">Sessions Played</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-green-600" />
              <div>
                <div className="text-2xl font-bold">
                  {totalHours > 0 ? `${totalHours}h` : `${remainingMinutes}m`}
                </div>
                <div className="text-sm text-muted-foreground">Time Played</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-purple-600" />
              <div>
                <div className="text-2xl font-bold">{estimatedXP.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">XP Earned</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-red-600" />
              <div>
                <div className="text-2xl font-bold">
                  {totalMinutes > 0 ? Math.floor(estimatedXP * 0.4).toLocaleString() : '0'}
                </div>
                <div className="text-sm text-muted-foreground">HP Restored</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Session Types */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Session Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            {Object.entries(sessionTypes).map(([type, count]) => (
              <div key={type} className="text-center">
                <Badge variant="outline" className="mb-2 capitalize">
                  {type}
                </Badge>
                <div className="text-2xl font-bold">{count}</div>
                <div className="text-sm text-muted-foreground">sessions</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* Monthly Activity Chart */}
      {chartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Monthly Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="sessions" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
