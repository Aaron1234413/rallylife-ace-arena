import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Clock, Users, MapPin, Play, Pause, Square, Trophy, Star } from "lucide-react";

interface SessionFlowManagerProps {
  sessionId: string;
  onEndSession: (sessionData: any) => void;
  onBackToLobby: () => void;
}

export function SessionFlowManager({ sessionId, onEndSession, onBackToLobby }: SessionFlowManagerProps) {
  const [sessionState, setSessionState] = useState<"joining" | "waiting" | "active" | "paused" | "completed">("joining");
  const [elapsedTime, setElapsedTime] = useState(0);
  const [score, setScore] = useState({ player1: 0, player2: 0 });
  const [currentSet, setCurrentSet] = useState(1);
  const [sets, setSets] = useState([{ player1: 0, player2: 0 }]);
  const [isPaused, setIsPaused] = useState(false);

  // Mock session data
  const sessionData = {
    id: sessionId,
    type: "singles",
    location: "Central Tennis Club",
    court: "Court 3",
    players: [
      { id: "player1", name: "You", rating: 4.2, avatar: "👤" },
      { id: "player2", name: "Alex Johnson", rating: 4.5, avatar: "👨" }
    ],
    startTime: new Date().toISOString(),
    estimatedDuration: 90
  };

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (sessionState === "active" && !isPaused) {
      interval = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [sessionState, isPaused]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleJoinSession = () => {
    setSessionState("waiting");
    // Simulate waiting for other players
    setTimeout(() => {
      setSessionState("active");
    }, 3000);
  };

  const handleStartSession = () => {
    setSessionState("active");
  };

  const handlePauseSession = () => {
    setIsPaused(!isPaused);
  };

  const handleEndSession = () => {
    const finalSessionData = {
      id: sessionId,
      players: sessionData.players,
      duration: elapsedTime,
      score: sets,
      winner: score.player1 > score.player2 ? "player1" : "player2",
      endTime: new Date().toISOString(),
      type: sessionData.type,
      location: sessionData.location
    };
    onEndSession(finalSessionData);
  };

  const handleScoreUpdate = (player: "player1" | "player2") => {
    setScore(prev => ({
      ...prev,
      [player]: prev[player] + 1
    }));
  };

  const handleSetComplete = () => {
    setSets(prev => [...prev, { player1: 0, player2: 0 }]);
    setScore({ player1: 0, player2: 0 });
    setCurrentSet(prev => prev + 1);
  };

  if (sessionState === "joining") {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Joining Session
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <span className="text-2xl">🎾</span>
              </div>
              <div>
                <h3 className="font-semibold">Singles Match</h3>
                <p className="text-sm text-muted-foreground">{sessionData.location} • {sessionData.court}</p>
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <h4 className="font-medium">Players</h4>
              {sessionData.players.map((player) => (
                <div key={player.id} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <span className="text-2xl">{player.avatar}</span>
                  <div className="flex-1">
                    <p className="font-medium">{player.name}</p>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm">{player.rating}</span>
                    </div>
                  </div>
                  {player.id === "player1" && <Badge variant="secondary">You</Badge>}
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={onBackToLobby} variant="outline" className="flex-1">
              Back to Lobby
            </Button>
            <Button onClick={handleJoinSession} className="flex-1">
              Join Session
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (sessionState === "waiting") {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Waiting for Session to Start
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center py-8">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-lg font-medium">Getting ready...</p>
            <p className="text-sm text-muted-foreground">All players are joining the session</p>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Session Progress</span>
              <span>Almost ready</span>
            </div>
            <Progress value={85} className="h-2" />
          </div>

          <Button onClick={handleStartSession} className="w-full">
            Start Session
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (sessionState === "active") {
    return (
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Play className="w-5 h-5" />
              Active Session
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="gap-1">
                <Clock className="w-3 h-3" />
                {formatTime(elapsedTime)}
              </Badge>
              <Badge variant="outline">Set {currentSet}</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Session Info */}
          <div className="bg-muted/50 p-4 rounded-lg">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span className="text-sm">{sessionData.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm">•</span>
                <span className="text-sm">{sessionData.court}</span>
              </div>
            </div>
          </div>

          {/* Score Display */}
          <div className="grid grid-cols-2 gap-4">
            {sessionData.players.map((player, index) => (
              <div key={player.id} className="text-center">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <span className="text-3xl block mb-2">{player.avatar}</span>
                  <h3 className="font-semibold">{player.name}</h3>
                  <div className="text-3xl font-bold my-4">
                    {index === 0 ? score.player1 : score.player2}
                  </div>
                  <Button 
                    onClick={() => handleScoreUpdate(index === 0 ? "player1" : "player2")}
                    size="sm"
                    variant="outline"
                  >
                    +1 Point
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Sets History */}
          <div className="space-y-2">
            <h4 className="font-medium">Sets</h4>
            <div className="grid grid-cols-1 gap-2">
              {sets.map((set, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                  <span className="text-sm">Set {index + 1}</span>
                  <div className="flex gap-4">
                    <span>{set.player1}</span>
                    <span>-</span>
                    <span>{set.player2}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Controls */}
          <div className="flex gap-2">
            <Button onClick={onBackToLobby} variant="outline" size="sm">
              Back to Lobby
            </Button>
            <Button onClick={handlePauseSession} variant="outline" size="sm" className="gap-2">
              <Pause className="w-4 h-4" />
              {isPaused ? "Resume" : "Pause"}
            </Button>
            <Button onClick={handleSetComplete} variant="outline" size="sm">
              Complete Set
            </Button>
            <Button onClick={handleEndSession} variant="destructive" size="sm" className="gap-2">
              <Square className="w-4 h-4" />
              End Session
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
}