
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { PlayerLeaderboard, CoachLeaderboard } from '@/components/leaderboards';
import { LeaderboardActivityFeed } from '@/components/leaderboards/LeaderboardActivityFeed';
import { usePlayerHP } from '@/hooks/usePlayerHP';
import { useAuth } from '@/hooks/useAuth';
import { 
  Bolt, 
  Clock, 
  TrendingUp, 
  Sparkles, 
  AlertTriangle,
  Users,
  Trophy,
  RefreshCw,
  Zap,
  Activity
} from 'lucide-react';

const Pulse = () => {
  const { user } = useAuth();
  const [leaderboardView, setLeaderboardView] = useState<'split' | 'tabbed' | 'unified'>('split');
  const [activeTab, setActiveTab] = useState('players');
  const [lastRefresh, setLastRefresh] = useState(Date.now());
  
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

  const handleRefreshAll = () => {
    setLastRefresh(Date.now());
  };

  const renderLeaderboardLayout = () => {
    if (leaderboardView === 'split') {
      return (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div>
            <PlayerLeaderboard 
              maxEntries={50}
              showFilters={true}
              compact={false}
            />
          </div>
          <div>
            <CoachLeaderboard 
              defaultType="cxp"
              defaultPeriod="all_time"
              maxEntries={50}
            />
          </div>
        </div>
      );
    }

    if (leaderboardView === 'tabbed') {
      return (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <Card className="bg-white/95 backdrop-blur-sm border-tennis-green-light shadow-lg">
            <CardContent className="p-4">
              <TabsList className="grid w-full grid-cols-2 bg-tennis-green-bg/20">
                <TabsTrigger value="players" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-tennis-green-dark">
                  <Users className="h-4 w-4" />
                  Players
                </TabsTrigger>
                <TabsTrigger value="coaches" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-tennis-green-dark">
                  <Trophy className="h-4 w-4" />
                  Coaches
                </TabsTrigger>
              </TabsList>
            </CardContent>
          </Card>

          <TabsContent value="players">
            <PlayerLeaderboard 
              maxEntries={50}
              showFilters={true}
              compact={false}
            />
          </TabsContent>

          <TabsContent value="coaches">
            <CoachLeaderboard 
              defaultType="cxp"
              defaultPeriod="all_time"
              maxEntries={50}
            />
          </TabsContent>
        </Tabs>
      );
    }

    // Unified view would be implemented here in the future
    // For now, default to split view
    return (
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div>
          <PlayerLeaderboard 
            maxEntries={50}
            showFilters={true}
            compact={false}
          />
        </div>
        <div>
          <CoachLeaderboard 
            defaultType="cxp"
            defaultPeriod="all_time"
            maxEntries={50}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-tennis-green-bg">
      <div className="p-3 sm:p-4 max-w-7xl mx-auto space-y-6">
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
                  Live leaderboards and community activity
                </p>
              </div>
              
              <div className="flex items-center gap-4">
                {/* Layout Toggle Buttons */}
                <div className="hidden md:flex items-center gap-2 p-1 bg-tennis-green-bg/20 rounded-lg">
                  <Button
                    variant={leaderboardView === 'split' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setLeaderboardView('split')}
                    className="text-xs"
                  >
                    Split View
                  </Button>
                  <Button
                    variant={leaderboardView === 'tabbed' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setLeaderboardView('tabbed')}
                    className="text-xs"
                  >
                    Tabbed
                  </Button>
                </div>
                
                <Button
                  onClick={handleRefreshAll}
                  variant="ghost"
                  size="sm"
                  className="text-tennis-green-medium hover:text-tennis-green-dark"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Condensed Activity Intelligence Widget */}
        <Card className="bg-gradient-to-r from-white to-tennis-green-subtle border-tennis-green-light shadow-md backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-tennis-green-primary to-tennis-green-accent text-white shadow-md">
                  <Activity className="h-4 w-4" />
                </div>
                <div>
                  <span className="orbitron-heading font-bold text-tennis-green-dark text-heading-sm">
                    Tennis Energy
                  </span>
                  <p className="poppins-body text-tennis-green-medium text-body-sm">
                    Current player status
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 bg-white/90 rounded-lg px-4 py-2 shadow-sm border border-tennis-green-light backdrop-blur-sm">
                <Sparkles className="h-4 w-4 text-tennis-yellow-dark" />
                <div className="text-right">
                  <div className="text-caption text-tennis-green-medium">Energy Level</div>
                  <div className={`font-bold text-body-sm ${activityIntelligence.energyColor}`}>
                    {activityIntelligence.energyLevel} ({activityIntelligence.hpPercentage}%)
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Leaderboard Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Leaderboards - Takes up 3/4 of the space */}
          <div className="lg:col-span-3">
            {renderLeaderboardLayout()}
          </div>

          {/* Social Activity Feed - Takes up 1/4 of the space */}
          <div className="lg:col-span-1">
            <LeaderboardActivityFeed maxItems={8} />
          </div>
        </div>

        {/* Mobile Layout Toggle */}
        <div className="md:hidden">
          <Card className="bg-white/95 backdrop-blur-sm border-tennis-green-light shadow-lg">
            <CardContent className="p-4">
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant={leaderboardView === 'split' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setLeaderboardView('split')}
                  className="text-sm"
                >
                  Split View
                </Button>
                <Button
                  variant={leaderboardView === 'tabbed' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setLeaderboardView('tabbed')}
                  className="text-sm"
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Pulse;
