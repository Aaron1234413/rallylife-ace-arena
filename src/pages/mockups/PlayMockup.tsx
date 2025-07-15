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
      {/* Mobile-First Header */}
      <div className="text-center space-y-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Ready to Play?</h1>
          <p className="text-muted-foreground text-sm md:text-base">Find players, courts, and start your session</p>
        </div>
      </div>

      {/* Quick Action Cards - Mobile First Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <Card 
          className="hover-scale cursor-pointer border-primary/20 hover:border-primary/50 transition-all"
          onClick={() => setCurrentView("discovery")}
        >
          <CardContent className="p-4 text-center">
            <Search className="w-8 h-8 mx-auto mb-2 text-primary" />
            <h3 className="font-semibold text-sm">Find Match</h3>
            <p className="text-xs text-muted-foreground hidden md:block">Join sessions</p>
          </CardContent>
        </Card>

        <Card 
          className="hover-scale cursor-pointer border-primary/20 hover:border-primary/50 transition-all"
          onClick={() => setShowCreateModal(true)}
        >
          <CardContent className="p-4 text-center">
            <Plus className="w-8 h-8 mx-auto mb-2 text-primary" />
            <h3 className="font-semibold text-sm">Create</h3>
            <p className="text-xs text-muted-foreground hidden md:block">New session</p>
          </CardContent>
        </Card>

        <Card 
          className="hover-scale cursor-pointer border-primary/20 hover:border-primary/50 transition-all"
          onClick={() => setCurrentView("history")}
        >
          <CardContent className="p-4 text-center">
            <Calendar className="w-8 h-8 mx-auto mb-2 text-primary" />
            <h3 className="font-semibold text-sm">History</h3>
            <p className="text-xs text-muted-foreground hidden md:block">Past sessions</p>
          </CardContent>
        </Card>

        <Card 
          className="hover-scale cursor-pointer border-primary/20 hover:border-primary/50 transition-all"
          onClick={() => console.log("View tournaments")}
        >
          <CardContent className="p-4 text-center">
            <Trophy className="w-8 h-8 mx-auto mb-2 text-primary" />
            <h3 className="font-semibold text-sm">Tournaments</h3>
            <p className="text-xs text-muted-foreground hidden md:block">Competitions</p>
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