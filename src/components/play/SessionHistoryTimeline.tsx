import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock, Trophy, Target, TrendingUp, Search, Filter, MapPin, Star } from "lucide-react";

interface SessionHistoryTimelineProps {
  onViewSession: (sessionId: string) => void;
}

export function SessionHistoryTimeline({ onViewSession }: SessionHistoryTimelineProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTimeframe, setSelectedTimeframe] = useState("all");

  const sessionHistory = [
    {
      id: "session-h1",
      date: "2024-01-15",
      time: "14:30",
      type: "singles",
      opponent: "Alex Johnson",
      location: "Central Tennis Club",
      duration: 85,
      result: "won",
      score: "6-4, 6-2",
      xp: 85,
      rating: 4.2,
      notes: "Great match! Improved my backhand significantly."
    },
    {
      id: "session-h2",
      date: "2024-01-13",
      time: "16:00",
      type: "doubles",
      opponent: "Sarah & Mike vs You & Emma",
      location: "Riverside Courts",
      duration: 95,
      result: "lost",
      score: "6-2, 4-6, 6-7",
      xp: 45,
      rating: 4.1,
      notes: "Close match, need to work on net play."
    },
    {
      id: "session-h3",
      date: "2024-01-12",
      time: "18:00",
      type: "training",
      opponent: "Coach Mike",
      location: "Elite Tennis Academy",
      duration: 60,
      result: "completed",
      score: "Training Session",
      xp: 30,
      rating: 4.0,
      notes: "Focused on serve technique."
    },
    {
      id: "session-h4",
      date: "2024-01-10",
      time: "15:00",
      type: "singles",
      opponent: "Jenny Davis",
      location: "City Tennis Center",
      duration: 70,
      result: "won",
      score: "6-3, 6-1",
      xp: 70,
      rating: 4.0,
      notes: "Solid performance, great forehand shots."
    },
    {
      id: "session-h5",
      date: "2024-01-08",
      time: "10:00",
      type: "practice",
      opponent: "Solo Practice",
      location: "Local Courts",
      duration: 45,
      result: "completed",
      score: "Practice Session",
      xp: 25,
      rating: 3.9,
      notes: "Working on consistency."
    }
  ];

  const stats = {
    totalSessions: sessionHistory.length,
    winRate: Math.round((sessionHistory.filter(s => s.result === "won").length / sessionHistory.filter(s => s.type === "singles" || s.type === "doubles").length) * 100),
    avgDuration: Math.round(sessionHistory.reduce((acc, s) => acc + s.duration, 0) / sessionHistory.length),
    totalXP: sessionHistory.reduce((acc, s) => acc + s.xp, 0),
    currentRating: 4.2,
    ratingChange: +0.3
  };

  const getResultColor = (result: string) => {
    switch (result) {
      case "won": return "bg-green-500/10 text-green-600 border-green-500/20";
      case "lost": return "bg-red-500/10 text-red-600 border-red-500/20";
      case "completed": return "bg-blue-500/10 text-blue-600 border-blue-500/20";
      default: return "bg-gray-500/10 text-gray-600 border-gray-500/20";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "singles": return "🎾";
      case "doubles": return "👥";
      case "training": return "🏆";
      case "practice": return "🎯";
      default: return "🎾";
    }
  };

  const filteredSessions = sessionHistory.filter(session => 
    session.opponent.toLowerCase().includes(searchTerm.toLowerCase()) ||
    session.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Session History</h2>
          <p className="text-muted-foreground">Track your tennis journey</p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{stats.totalSessions}</div>
            <div className="text-sm text-muted-foreground">Total Sessions</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{stats.winRate}%</div>
            <div className="text-sm text-muted-foreground">Win Rate</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.avgDuration}m</div>
            <div className="text-sm text-muted-foreground">Avg Duration</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{stats.totalXP}</div>
            <div className="text-sm text-muted-foreground">Total XP</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="timeline" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="stats">Statistics</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
        </TabsList>

        <TabsContent value="timeline" className="space-y-4">
          {/* Search and Filters */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search sessions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" size="sm" className="gap-2">
              <Filter className="w-4 h-4" />
              Filter
            </Button>
          </div>

          {/* Session Timeline */}
          <div className="space-y-4">
            {filteredSessions.map((session) => (
              <Card key={session.id} className="hover-scale cursor-pointer border-primary/20 hover:border-primary/50">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{getTypeIcon(session.type)}</div>
                      <div>
                        <h3 className="font-semibold">{session.opponent}</h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          <span>{session.date}</span>
                          <span>•</span>
                          <Clock className="w-4 h-4" />
                          <span>{session.time}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={getResultColor(session.result)}>
                        {session.result.toUpperCase()}
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-lg font-bold">{session.score}</div>
                      <div className="text-xs text-muted-foreground">Score</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold">{session.duration}m</div>
                      <div className="text-xs text-muted-foreground">Duration</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-primary">+{session.xp}</div>
                      <div className="text-xs text-muted-foreground">XP</div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-lg font-bold">{session.rating}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">Rating</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mb-3 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span>{session.location}</span>
                  </div>

                  {session.notes && (
                    <div className="bg-muted/50 p-3 rounded-lg text-sm">
                      <p className="italic">"{session.notes}"</p>
                    </div>
                  )}

                  <div className="flex gap-2 mt-4">
                    <Button 
                      onClick={() => onViewSession(session.id)}
                      variant="outline" 
                      size="sm"
                    >
                      View Details
                    </Button>
                    <Button variant="outline" size="sm">
                      Share
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="stats" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Performance Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Current Rating</span>
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-bold">{stats.currentRating}</span>
                      <Badge variant="secondary" className="text-green-600">
                        +{stats.ratingChange}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Win Rate</span>
                    <span className="font-bold text-green-600">{stats.winRate}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Average Duration</span>
                    <span className="font-bold">{stats.avgDuration} minutes</span>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Total XP Earned</span>
                    <span className="font-bold text-purple-600">{stats.totalXP}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Sessions This Week</span>
                    <span className="font-bold">3</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Favorite Opponent</span>
                    <span className="font-bold">Alex Johnson</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="achievements" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <Trophy className="w-12 h-12 mx-auto mb-3 text-yellow-500" />
                <h3 className="font-semibold mb-1">First Victory</h3>
                <p className="text-sm text-muted-foreground">Won your first match</p>
                <Badge className="mt-2">Unlocked</Badge>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Target className="w-12 h-12 mx-auto mb-3 text-blue-500" />
                <h3 className="font-semibold mb-1">Consistent Player</h3>
                <p className="text-sm text-muted-foreground">Played 5 sessions</p>
                <Badge className="mt-2">Unlocked</Badge>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}