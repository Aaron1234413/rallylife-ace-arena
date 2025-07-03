import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlayerLeaderboard, CoachLeaderboard } from '@/components/leaderboards';
import { usePlayerHP } from '@/hooks/usePlayerHP';
import { useAuth } from '@/hooks/useAuth';
import { 
  Bolt, 
  Sparkles, 
  Users,
  Trophy,
  Zap,
  Activity
} from 'lucide-react';

const Pulse = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('players');
  const [refreshKey, setRefreshKey] = useState(Date.now());
  
  // Auto-refresh every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshKey(Date.now());
    }, 60000); // 60 seconds

    return () => clearInterval(interval);
  }, []);
  
  // Fetch HP data for energy level
  const { hpData } = usePlayerHP();

  // Calculate condensed activity intelligence data
  const getCondensedActivityIntelligence = () => {
    // Simplified data for condensed widget
    const hpPercentage = hpData ? (hpData.current_hp / hpData.max_hp) * 100 : 0;
    const energyLevel = hpPercentage > 80 ? 'High' : 
                       hpPercentage > 60 ? 'Good' : 
                       hpPercentage > 40 ? 'Moderate' : 
                       hpPercentage > 20 ? 'Low' : 'Critical';
    
    const energyColor = hpPercentage > 80 ? 'text-green-600' : 
                       hpPercentage > 60 ? 'text-blue-600' : 
                       hpPercentage > 40 ? 'text-yellow-600' : 
                       hpPercentage > 20 ? 'text-orange-600' : 'text-red-600';
    
    return {
      energyLevel,
      energyColor,
      hpPercentage: Math.round(hpPercentage)
    };
  };

  const activityIntelligence = getCondensedActivityIntelligence();

  return (
    <div className="min-h-screen bg-tennis-green-bg">
      <div className="p-2 sm:p-4 max-w-6xl mx-auto space-y-4 sm:space-y-6">
        {/* Header Section */}
        <Card className="bg-white/95 backdrop-blur-sm border-tennis-green-light shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-tennis-green-primary to-tennis-green-accent flex items-center justify-center">
                    <Bolt className="h-4 w-4 text-white" />
                  </div>
                  <span className="orbitron-heading text-heading-lg text-tennis-green-dark">Pulse</span>
                  <Zap className="h-5 w-5 text-tennis-yellow-dark" />
                </CardTitle>
                <p className="poppins-body text-body text-tennis-green-medium mt-1">
                  Live leaderboards and community activity • Auto-refreshes every minute
                </p>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Condensed Activity Intelligence Widget */}
        <Card className="bg-gradient-to-r from-white to-tennis-green-subtle border-tennis-green-light shadow-md backdrop-blur-sm">
          <CardContent className="p-3 sm:p-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-tennis-green-primary to-tennis-green-accent text-white shadow-md">
                  <Activity className="h-4 w-4" />
                </div>
                <div>
                  <span className="orbitron-heading font-bold text-tennis-green-dark text-sm sm:text-base">
                    Tennis Energy
                  </span>
                  <p className="poppins-body text-tennis-green-medium text-xs sm:text-sm">
                    Current player status
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 bg-white/90 rounded-lg px-3 py-2 shadow-sm border border-tennis-green-light backdrop-blur-sm w-full sm:w-auto">
                <Sparkles className="h-4 w-4 text-tennis-yellow-dark" />
                <div className="text-left sm:text-right">
                  <div className="text-xs text-tennis-green-medium">Energy Level</div>
                  <div className={`font-bold text-sm ${activityIntelligence.energyColor}`}>
                    {activityIntelligence.energyLevel} ({activityIntelligence.hpPercentage}%)
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Mobile-Optimized Leaderboard Layout */}
        <div className="w-full">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            {/* Mobile-First Tab Navigation */}
            <Card className="bg-white/95 backdrop-blur-sm border-tennis-green-light shadow-lg">
              <CardContent className="p-3 sm:p-4">
                <TabsList className="grid w-full grid-cols-2 bg-tennis-green-bg/20 h-12">
                  <TabsTrigger 
                    value="players" 
                    className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-tennis-green-dark text-sm font-medium h-10"
                  >
                    <Users className="h-4 w-4" />
                    <span className="hidden sm:inline">Players</span>
                    <span className="sm:hidden">Players</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="coaches" 
                    className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-tennis-green-dark text-sm font-medium h-10"
                  >
                    <Trophy className="h-4 w-4" />
                    <span className="hidden sm:inline">Coaches</span>
                    <span className="sm:hidden">Coaches</span>
                  </TabsTrigger>
                </TabsList>
              </CardContent>
            </Card>

            <TabsContent value="players" className="mt-4">
              <PlayerLeaderboard 
                key={`players-${refreshKey}`}
                maxEntries={50}
                showFilters={true}
                compact={false}
                mobileOptimized={true}
              />
            </TabsContent>

            <TabsContent value="coaches" className="mt-4">
              <CoachLeaderboard 
                key={`coaches-${refreshKey}`}
                maxEntries={50}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Pulse;