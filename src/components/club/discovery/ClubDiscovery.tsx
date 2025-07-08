import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  MapPin, 
  Users, 
  Globe, 
  Calendar,
  Trophy,
  Target,
  Star,
  Compass
} from 'lucide-react';

interface ClubDiscoveryProps {
  currentClubId: string;
}

export function ClubDiscovery({ currentClubId }: ClubDiscoveryProps) {

  // Mock data for upcoming tournaments
  const upcomingTournaments = [
    {
      id: '1',
      name: 'City Championship',
      date: 'Jan 20-22, 2025',
      location: 'Downtown Tennis Center',
      participants: 64,
      entryFee: 25
    },
    {
      id: '2',
      name: 'Amateur Singles League',
      date: 'Feb 1-15, 2025',
      location: 'Multiple Venues',
      participants: 32,
      entryFee: 15
    }
  ];

  // Mock data for recommended players
  const recommendedPlayers = [
    {
      id: '1',
      name: 'Sarah Johnson',
      skillLevel: 'Intermediate',
      rating: '4.2 NTRP',
      distance: '1.2 miles',
      lastActive: '2 hours ago',
      avatar: null
    },
    {
      id: '2',
      name: 'Mike Chen',
      skillLevel: 'Advanced',
      rating: '5.0 NTRP',
      distance: '0.8 miles', 
      lastActive: '5 hours ago',
      avatar: null
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="shadow-lg border-0 bg-gradient-to-br from-tennis-green-primary/5 to-tennis-green-primary/10">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-tennis-green-primary/10 rounded-full flex items-center justify-center">
              <Compass className="h-8 w-8 text-tennis-green-primary" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-tennis-green-dark mb-1">
                Discover Tennis Near You
              </h2>
              <p className="text-tennis-green-medium">
                Find clubs, tournaments, and players in your area
              </p>
            </div>
          </div>
        </CardContent>
      </Card>


      {/* Upcoming Tournaments */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-tennis-green-dark">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Upcoming Tournaments
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {upcomingTournaments.map((tournament) => (
            <div
              key={tournament.id}
              className="flex items-center gap-4 p-4 border rounded-lg hover:shadow-md transition-all"
            >
              <div className="w-12 h-12 bg-yellow-500/10 rounded-full flex items-center justify-center">
                <Trophy className="h-6 w-6 text-yellow-500" />
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-tennis-green-dark mb-1">
                  {tournament.name}
                </h3>
                <div className="flex items-center gap-4 text-sm text-tennis-green-medium">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {tournament.date}
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {tournament.location}
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {tournament.participants} players
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-sm font-medium text-tennis-green-dark">
                  ${tournament.entryFee}
                </div>
                <Button variant="outline" size="sm" className="mt-2">
                  Register
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Recommended Players */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-tennis-green-dark">
            <Target className="h-5 w-5 text-green-500" />
            Recommended Players
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {recommendedPlayers.map((player) => (
            <div
              key={player.id}
              className="flex items-center gap-4 p-4 border rounded-lg hover:shadow-md transition-all"
            >
              <Avatar className="h-12 w-12 bg-gradient-to-br from-green-500 to-blue-500">
                <AvatarImage src={player.avatar || undefined} />
                <AvatarFallback className="text-white font-bold">
                  {player.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-tennis-green-dark mb-1">
                  {player.name}
                </h3>
                <div className="flex items-center gap-4 text-sm text-tennis-green-medium">
                  <Badge variant="secondary">
                    {player.skillLevel}
                  </Badge>
                  <span>{player.rating}</span>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {player.distance}
                  </div>
                  <span>Active {player.lastActive}</span>
                </div>
              </div>
              
              <Button variant="outline" size="sm">
                Connect
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}