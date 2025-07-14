import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, Users, Play, Calendar, Trophy } from "lucide-react";

export function PlayMockup() {
  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Ready to Play?</h1>
        <p className="text-muted-foreground">Find players, courts, and start your session</p>
      </div>

      {/* Quick Play Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="hover-scale cursor-pointer border-primary/20 hover:border-primary/50">
          <CardContent className="p-6 text-center">
            <Play className="w-12 h-12 mx-auto mb-3 text-primary" />
            <h3 className="font-semibold mb-2">Quick Match</h3>
            <p className="text-sm text-muted-foreground">Find available players nearby</p>
          </CardContent>
        </Card>

        <Card className="hover-scale cursor-pointer border-primary/20 hover:border-primary/50">
          <CardContent className="p-6 text-center">
            <Calendar className="w-12 h-12 mx-auto mb-3 text-primary" />
            <h3 className="font-semibold mb-2">Schedule Session</h3>
            <p className="text-sm text-muted-foreground">Plan your next tennis session</p>
          </CardContent>
        </Card>

        <Card className="hover-scale cursor-pointer border-primary/20 hover:border-primary/50">
          <CardContent className="p-6 text-center">
            <Trophy className="w-12 h-12 mx-auto mb-3 text-primary" />
            <h3 className="font-semibold mb-2">Practice Solo</h3>
            <p className="text-sm text-muted-foreground">Track individual training</p>
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
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
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

      {/* Nearby Venues */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Nearby Courts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-medium">Central Tennis Club</h4>
                <Badge variant="outline">0.8 mi</Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-3">6 courts available • $25/hour</p>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">3 players looking to play</span>
              </div>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-medium">Riverside Courts</h4>
                <Badge variant="outline">1.2 mi</Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-3">4 courts available • $20/hour</p>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">1 player looking to play</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Sessions</CardTitle>
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
}