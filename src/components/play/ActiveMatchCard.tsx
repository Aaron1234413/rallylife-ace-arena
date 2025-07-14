import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Clock, Users, MapPin, Trophy, Play, Pause, MoreHorizontal } from "lucide-react";

interface ActiveMatchCardProps {
  onJoinMatch?: (matchId: string) => void;
  onResumeMatch?: (matchId: string) => void;
}

export function ActiveMatchCard({ onJoinMatch, onResumeMatch }: ActiveMatchCardProps) {
  const activeMatches = [
    {
      id: "match-1",
      type: "Singles Match",
      opponent: "Alex Johnson",
      opponentRating: 4.2,
      currentSet: 2,
      score: "6-4, 3-2",
      status: "in-progress",
      court: "Court 1",
      timeElapsed: "45 min",
      canResume: true
    },
    {
      id: "match-2", 
      type: "Doubles Tournament",
      opponent: "Sarah & Mike",
      currentSet: 1,
      score: "2-1",
      status: "waiting",
      court: "Court 3",
      timeElapsed: "12 min",
      canResume: false,
      nextMatch: "Semi-Final"
    }
  ];

  if (activeMatches.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Active Matches
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Play className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
            <p className="text-muted-foreground mb-4">No active matches</p>
            <Button size="sm" onClick={() => onJoinMatch?.("new")}>
              <Play className="w-4 h-4 mr-2" />
              Start Playing
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Active Matches
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {activeMatches.map((match) => (
          <div
            key={match.id}
            className="p-4 border rounded-lg bg-gradient-to-r from-primary/5 to-background"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium">{match.type}</h4>
                  <Badge variant={match.status === "in-progress" ? "default" : "secondary"}>
                    {match.status === "in-progress" ? "Live" : "Waiting"}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">vs {match.opponent}</p>
              </div>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span>{match.court}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span>{match.timeElapsed}</span>
                  </div>
                </div>
                <div className="font-medium">Set {match.currentSet}</div>
              </div>

              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{match.score}</div>
                {match.nextMatch && (
                  <p className="text-xs text-muted-foreground mt-1">Next: {match.nextMatch}</p>
                )}
              </div>

              {match.status === "in-progress" && (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Match Progress</span>
                    <span>65%</span>
                  </div>
                  <Progress value={65} className="h-2" />
                </div>
              )}

              <div className="flex gap-2">
                {match.canResume ? (
                  <Button 
                    size="sm" 
                    className="flex-1"
                    onClick={() => onResumeMatch?.(match.id)}
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Resume Match
                  </Button>
                ) : (
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => onJoinMatch?.(match.id)}
                  >
                    <Users className="w-4 h-4 mr-2" />
                    View Match
                  </Button>
                )}
                <Button size="sm" variant="outline">
                  <Pause className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}