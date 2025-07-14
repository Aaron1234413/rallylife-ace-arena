import { useState } from "react";
import { SessionDiscoveryTabs } from "@/components/play/SessionDiscoveryTabs";
import { SessionFlowManager } from "@/components/play/SessionFlowManager";
import { SessionHistoryTimeline } from "@/components/play/SessionHistoryTimeline";
import { SessionCreationFlow } from "@/components/play/SessionCreationFlow";
import { SessionCompletionFlow } from "@/components/play/SessionCompletionFlow";
import { ActiveMatchCard } from "@/components/play/ActiveMatchCard";
import { QuickStatsCard } from "@/components/play/QuickStatsCard";
import { RecentActivityCard } from "@/components/play/RecentActivityCard";
import { PlayerStatusCard } from "@/components/play/PlayerStatusCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Play, History, TrendingUp, Users, Clock, Star, Plus, Search, Calendar, Trophy, Target, Zap } from "lucide-react";

export function PlayMockup() {
  const [currentView, setCurrentView] = useState<"dashboard" | "session" | "discovery" | "history">("dashboard");
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCompletionFlow, setShowCompletionFlow] = useState(false);
  const [completedSessionData, setCompletedSessionData] = useState<any>(null);
  const [userStats, setUserStats] = useState({
    currentRating: 4.2,
    totalSessions: 23,
    winRate: 68,
    weeklyGoal: 75,
    currentStreak: 5
  });

  const handleJoinSession = (sessionId: string) => {
    setActiveSessionId(sessionId);
    setCurrentView("session");
  };

  const handleCreateSession = (sessionData: any) => {
    // In a real app, this would create the session
    console.log("Creating session:", sessionData);
    setCurrentView("dashboard");
  };

  const handleEndSession = (sessionData: any) => {
    setCompletedSessionData(sessionData);
    setShowCompletionFlow(true);
  };

  const handleCompleteSession = () => {
    setActiveSessionId(null);
    setCurrentView("dashboard");
    setShowCompletionFlow(false);
    // Update stats
    setUserStats(prev => ({
      ...prev,
      totalSessions: prev.totalSessions + 1,
      currentStreak: prev.currentStreak + 1
    }));
  };

  const handleBackToLobby = () => {
    setActiveSessionId(null);
    setCurrentView("dashboard");
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Enhanced Header with Player Status */}
      <div className="relative overflow-hidden bg-gradient-to-r from-primary/10 via-blue-500/5 to-purple-500/10 rounded-2xl p-6 border border-primary/20">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="relative">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                Ready to Dominate? 🎾
              </h1>
              <p className="text-muted-foreground text-sm md:text-base">
                Find players, courts, and start your journey to victory
              </p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 mb-1">
                <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                <span className="text-xl font-bold">{userStats.currentRating}</span>
                <Badge variant="secondary" className="bg-green-500/10 text-green-500 border-green-500/20">
                  +0.3
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">Current Rating</p>
            </div>
          </div>
          
          {/* Quick Stats Bar */}
          <div className="grid grid-cols-4 gap-4 mt-4">
            <div className="text-center">
              <div className="font-bold text-lg">{userStats.totalSessions}</div>
              <div className="text-xs text-muted-foreground">Sessions</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-lg text-green-600">{userStats.winRate}%</div>
              <div className="text-xs text-muted-foreground">Win Rate</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-lg text-orange-500">{userStats.currentStreak}</div>
              <div className="text-xs text-muted-foreground">Streak</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-lg text-purple-600">#{userStats.weeklyGoal}</div>
              <div className="text-xs text-muted-foreground">Weekly Goal</div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Quick Action Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card 
          className="group hover-scale cursor-pointer border-primary/20 hover:border-primary/50 transition-all duration-300 hover:shadow-lg relative overflow-hidden"
          onClick={() => setCurrentView("discovery")}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <CardContent className="p-6 text-center relative">
            <div className="w-12 h-12 mx-auto mb-3 bg-blue-500/10 rounded-xl flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
              <Search className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-sm mb-1">Find Match</h3>
            <p className="text-xs text-muted-foreground">Join live sessions</p>
            <Badge variant="secondary" className="mt-2 text-xs">23 active</Badge>
          </CardContent>
        </Card>

        <Card 
          className="group hover-scale cursor-pointer border-primary/20 hover:border-primary/50 transition-all duration-300 hover:shadow-lg relative overflow-hidden"
          onClick={() => setShowCreateModal(true)}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <CardContent className="p-6 text-center relative">
            <div className="w-12 h-12 mx-auto mb-3 bg-green-500/10 rounded-xl flex items-center justify-center group-hover:bg-green-500/20 transition-colors">
              <Plus className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-sm mb-1">Create Session</h3>
            <p className="text-xs text-muted-foreground">Start your own</p>
            <Badge variant="secondary" className="mt-2 text-xs">Quick setup</Badge>
          </CardContent>
        </Card>

        <Card 
          className="group hover-scale cursor-pointer border-primary/20 hover:border-primary/50 transition-all duration-300 hover:shadow-lg relative overflow-hidden"
          onClick={() => setCurrentView("history")}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <CardContent className="p-6 text-center relative">
            <div className="w-12 h-12 mx-auto mb-3 bg-purple-500/10 rounded-xl flex items-center justify-center group-hover:bg-purple-500/20 transition-colors">
              <History className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-sm mb-1">Match History</h3>
            <p className="text-xs text-muted-foreground">Track progress</p>
            <Badge variant="secondary" className="mt-2 text-xs">{userStats.totalSessions} matches</Badge>
          </CardContent>
        </Card>

        <Card 
          className="group hover-scale cursor-pointer border-primary/20 hover:border-primary/50 transition-all duration-300 hover:shadow-lg relative overflow-hidden"
          onClick={() => console.log("View tournaments")}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <CardContent className="p-6 text-center relative">
            <div className="w-12 h-12 mx-auto mb-3 bg-yellow-500/10 rounded-xl flex items-center justify-center group-hover:bg-yellow-500/20 transition-colors">
              <Trophy className="w-6 h-6 text-yellow-600" />
            </div>
            <h3 className="font-semibold text-sm mb-1">Tournaments</h3>
            <p className="text-xs text-muted-foreground">Compete & win</p>
            <Badge variant="secondary" className="mt-2 text-xs">3 upcoming</Badge>
          </CardContent>
        </Card>
      </div>

      {/* Mobile-First Layout: Single column on mobile, side-by-side on desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Matches */}
          <ActiveMatchCard 
            onJoinMatch={handleJoinSession}
            onResumeMatch={handleJoinSession}
          />

          {/* Recent Activity */}
          <RecentActivityCard 
            onViewHistory={() => setCurrentView("history")}
          />
        </div>

        {/* Right Column - Stats & Profile */}
        <div className="space-y-6">
          {/* Player Status */}
          <PlayerStatusCard 
            onEditProfile={() => console.log("Edit profile")}
            onViewAchievements={() => console.log("View achievements")}
          />

          {/* Quick Stats */}
          <QuickStatsCard 
            onViewFullStats={() => console.log("View full stats")}
          />
        </div>
      </div>

      {/* Featured Sessions - Mobile Optimized */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Featured Sessions
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={() => setCurrentView("discovery")}>
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg bg-gradient-to-r from-blue-500/10 to-purple-500/10 cursor-pointer hover:bg-muted/50 transition-colors">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="font-medium">Singles Tournament</h4>
                  <p className="text-sm text-muted-foreground">Today 6:00 PM</p>
                </div>
                <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20">
                  8 players
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Target className="w-4 h-4" />
                <span>4.0+ Rating</span>
                <span>•</span>
                <span>$25 entry</span>
              </div>
            </div>

            <div className="p-4 border rounded-lg bg-gradient-to-r from-green-500/10 to-blue-500/10 cursor-pointer hover:bg-muted/50 transition-colors">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="font-medium">Doubles Match</h4>
                  <p className="text-sm text-muted-foreground">Tomorrow 10:00 AM</p>
                </div>
                <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
                  2 spots left
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="w-4 h-4" />
                <span>Open Level</span>
                <span>•</span>
                <span>Free</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="container mx-auto p-4">
      {/* Navigation */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          {currentView !== "dashboard" && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setCurrentView("dashboard")}
            >
              ← Back to Dashboard
            </Button>
          )}
        </div>
      </div>

      {/* Main Content */}
      {currentView === "dashboard" && renderDashboard()}
      
      {currentView === "discovery" && (
        <SessionDiscoveryTabs 
          onJoinSession={handleJoinSession}
          onCreateSession={() => setShowCreateModal(true)}
        />
      )}
      
      {currentView === "session" && activeSessionId && (
        <SessionFlowManager
          sessionId={activeSessionId}
          onEndSession={handleEndSession}
          onBackToLobby={handleBackToLobby}
        />
      )}
      
      {currentView === "history" && (
        <SessionHistoryTimeline 
          onViewSession={(sessionId) => console.log("View session:", sessionId)}
        />
      )}

      {/* Modals */}
      <SessionCreationFlow
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        onCreateSession={handleCreateSession}
      />

      <SessionCompletionFlow
        open={showCompletionFlow}
        onOpenChange={setShowCompletionFlow}
        sessionData={completedSessionData}
        onComplete={handleCompleteSession}
      />
    </div>
  );
}