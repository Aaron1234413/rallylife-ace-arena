import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, Clock, Users, Star, Filter, Calendar } from "lucide-react";

interface SessionDiscoveryTabsProps {
  onJoinSession: (sessionId: string) => void;
  onCreateSession: () => void;
}

export function SessionDiscoveryTabs({ onJoinSession, onCreateSession }: SessionDiscoveryTabsProps) {
  const [selectedLocation, setSelectedLocation] = useState("all");

  const availableSessions = [
    {
      id: "session-1",
      type: "singles",
      host: "Alex Johnson",
      hostRating: 4.2,
      location: "Central Tennis Club",
      distance: "0.8 mi",
      time: "2:30 PM",
      skill: "Intermediate",
      courts: 3,
      price: "$25/hour",
      participants: 1,
      maxParticipants: 2,
      status: "waiting"
    },
    {
      id: "session-2",
      type: "doubles",
      host: "Sarah Chen",
      hostRating: 4.8,
      location: "Riverside Courts",
      distance: "1.2 mi",
      time: "4:00 PM",
      skill: "Advanced",
      courts: 2,
      price: "$20/hour",
      participants: 2,
      maxParticipants: 4,
      status: "waiting"
    },
    {
      id: "session-3",
      type: "training",
      host: "Coach Mike",
      hostRating: 4.9,
      location: "Elite Tennis Academy",
      distance: "2.1 mi",
      time: "6:00 PM",
      skill: "All Levels",
      courts: 1,
      price: "$60/hour",
      participants: 3,
      maxParticipants: 6,
      status: "filling"
    }
  ];

  const quickMatchOptions = [
    {
      id: "quick-1",
      type: "Quick Singles",
      description: "Find a singles match within 15 minutes",
      icon: "🎾",
      estimatedWait: "5-15 min",
      skillRange: "Your level ± 0.5"
    },
    {
      id: "quick-2",
      type: "Quick Doubles",
      description: "Join or create a doubles match",
      icon: "👥",
      estimatedWait: "10-20 min",
      skillRange: "Mixed levels"
    },
    {
      id: "quick-3",
      type: "Practice Partner",
      description: "Find someone to practice with",
      icon: "🏋️",
      estimatedWait: "5-30 min",
      skillRange: "Any level"
    }
  ];

  const SessionCard = ({ session }: { session: any }) => (
    <Card className="hover-scale cursor-pointer border-primary/20 hover:border-primary/50">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="font-semibold flex items-center gap-2">
              {session.type === "singles" ? "🎾" : session.type === "doubles" ? "👥" : "🏆"} 
              {session.type.charAt(0).toUpperCase() + session.type.slice(1)}
            </h3>
            <p className="text-sm text-muted-foreground">Hosted by {session.host}</p>
          </div>
          <div className="text-right">
            <Badge variant={session.status === "waiting" ? "secondary" : "default"}>
              {session.participants}/{session.maxParticipants}
            </Badge>
          </div>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4" />
            <span>{session.location}</span>
            <Badge variant="outline" className="text-xs">{session.distance}</Badge>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>{session.time}</span>
            <span>•</span>
            <span>{session.skill}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span>{session.hostRating}</span>
            <span>•</span>
            <span>{session.price}</span>
          </div>
        </div>

        <Button 
          onClick={() => onJoinSession(session.id)}
          className="w-full"
          variant={session.status === "waiting" ? "default" : "secondary"}
        >
          {session.status === "waiting" ? "Join Session" : "Request to Join"}
        </Button>
      </CardContent>
    </Card>
  );

  const QuickMatchCard = ({ option }: { option: any }) => (
    <Card className="hover-scale cursor-pointer border-primary/20 hover:border-primary/50">
      <CardContent className="p-4">
        <div className="text-center">
          <div className="text-2xl mb-2">{option.icon}</div>
          <h3 className="font-semibold mb-2">{option.type}</h3>
          <p className="text-sm text-muted-foreground mb-3">{option.description}</p>
          <div className="space-y-1 text-xs text-muted-foreground mb-4">
            <div>Wait: {option.estimatedWait}</div>
            <div>Skill: {option.skillRange}</div>
          </div>
          <Button 
            onClick={() => onJoinSession(option.id)}
            className="w-full"
            variant="secondary"
          >
            Find Match
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Find Your Match</h2>
          <p className="text-muted-foreground">Join sessions or start your own</p>
        </div>
        <Button onClick={onCreateSession} className="gap-2">
          <Users className="w-4 h-4" />
          Create Session
        </Button>
      </div>

      <Tabs defaultValue="available" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="available">Available Sessions</TabsTrigger>
          <TabsTrigger value="quick">Quick Match</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
        </TabsList>

        <TabsContent value="available" className="space-y-4">
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <Filter className="w-4 h-4" />
              Filter
            </Button>
            <Button variant="outline" size="sm">All Locations</Button>
            <Button variant="outline" size="sm">All Skills</Button>
          </div>

          <div className="grid gap-4">
            {availableSessions.map((session) => (
              <SessionCard key={session.id} session={session} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="quick" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {quickMatchOptions.map((option) => (
              <QuickMatchCard key={option.id} option={option} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="scheduled" className="space-y-4">
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No scheduled sessions</p>
            <Button onClick={onCreateSession} variant="outline" className="mt-4">
              Schedule a Session
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}