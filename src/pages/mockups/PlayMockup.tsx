import { useState } from "react";
import { SessionDiscoveryTabs } from "@/components/play/SessionDiscoveryTabs";
import { SessionFlowManager } from "@/components/play/SessionFlowManager";
import { SessionHistoryTimeline } from "@/components/play/SessionHistoryTimeline";
import { SessionCreationModal } from "@/components/play/SessionCreationModal";
import { SessionCompletionFlow } from "@/components/play/SessionCompletionFlow";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Play, History, TrendingUp, Users, Clock, Star } from "lucide-react";

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
      {/* Header with Quick Stats */}
      <div className="text-center space-y-4">
        <div>
          <h1 className="text-3xl font-bold">Ready to Play?</h1>
          <p className="text-muted-foreground">Find players, courts, and start your session</p>
        </div>
        
        <div className="flex justify-center gap-4">
          <div className="text-center">
            <div className="flex items-center gap-1 justify-center">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="text-lg font-bold">{userStats.currentRating}</span>
            </div>
            <div className="text-xs text-muted-foreground">Rating</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-green-600">{userStats.winRate}%</div>
            <div className="text-xs text-muted-foreground">Win Rate</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-blue-600">{userStats.currentStreak}</div>
            <div className="text-xs text-muted-foreground">Streak</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card 
          className="hover-scale cursor-pointer border-primary/20 hover:border-primary/50"
          onClick={() => setCurrentView("discovery")}
        >
          <CardContent className="p-6 text-center">
            <Play className="w-12 h-12 mx-auto mb-3 text-primary" />
            <h3 className="font-semibold mb-2">Find Match</h3>
            <p className="text-sm text-muted-foreground">Join available sessions nearby</p>
          </CardContent>
        </Card>

        <Card 
          className="hover-scale cursor-pointer border-primary/20 hover:border-primary/50"
          onClick={() => setShowCreateModal(true)}
        >
          <CardContent className="p-6 text-center">
            <Users className="w-12 h-12 mx-auto mb-3 text-primary" />
            <h3 className="font-semibold mb-2">Create Session</h3>
            <p className="text-sm text-muted-foreground">Start your own tennis session</p>
          </CardContent>
        </Card>

        <Card 
          className="hover-scale cursor-pointer border-primary/20 hover:border-primary/50"
          onClick={() => setCurrentView("history")}
        >
          <CardContent className="p-6 text-center">
            <History className="w-12 h-12 mx-auto mb-3 text-primary" />
            <h3 className="font-semibold mb-2">Session History</h3>
            <p className="text-sm text-muted-foreground">View past sessions and stats</p>
          </CardContent>
        </Card>
      </div>

      {/* Active Sessions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Active Sessions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div 
              className="flex items-center justify-between p-3 bg-muted/50 rounded-lg cursor-pointer hover:bg-muted/70 transition-colors"
              onClick={() => handleJoinSession("active-session-1")}
            >
              <div>
                <p className="font-medium">Singles vs Alex Johnson</p>
                <p className="text-sm text-muted-foreground">Set 2 • 4-3</p>
              </div>
              <Badge variant="secondary">In Progress</Badge>
            </div>
            <div className="text-center py-8 text-muted-foreground">
              <p>No other active sessions</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            This Week's Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span>Weekly Goal</span>
              <span className="font-medium">{userStats.weeklyGoal}% complete</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300" 
                style={{ width: `${userStats.weeklyGoal}%` }}
              />
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="font-medium">Sessions this week</div>
                <div className="text-muted-foreground">3 of 4 completed</div>
              </div>
              <div>
                <div className="font-medium">Hours played</div>
                <div className="text-muted-foreground">4.5 hours</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity Quick View */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Recent Sessions</CardTitle>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setCurrentView("history")}
            >
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium">Won vs Sarah Chen</p>
                <p className="text-sm text-muted-foreground">Yesterday • 6-4, 6-2</p>
              </div>
              <div className="text-right">
                <Badge className="bg-green-500/10 text-green-500 border-green-500/20">+85 XP</Badge>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium">Practice Session</p>
                <p className="text-sm text-muted-foreground">2 days ago • 45 minutes</p>
              </div>
              <div className="text-right">
                <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20">+25 XP</Badge>
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
      <SessionCreationModal
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