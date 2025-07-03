import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  Zap, 
  Users, 
  Star, 
  MessageCircle, 
  UserPlus, 
  Calendar,
  ChevronRight,
  Sparkles,
  Target
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SocialActionsPanelProps {
  selectedUsers?: string[];
  recommendedCoaches?: Coach[];
  mutualConnections?: Connection[];
  onBulkAction?: (action: string, userIds: string[]) => void;
}

interface Coach {
  id: string;
  name: string;
  avatar?: string;
  level: number;
  specializations: string[];
  rating: number;
  successRate: number;
  matchScore: number;
  connectedClients: number;
}

interface Connection {
  id: string;
  name: string;
  avatar?: string;
  mutualWith: string[];
  sharedActivities: number;
}

const mockRecommendedCoaches: Coach[] = [
  {
    id: '1',
    name: 'Coach Sarah Williams',
    avatar: null,
    level: 15,
    specializations: ['Technique', 'Mental Game'],
    rating: 4.9,
    successRate: 87,
    matchScore: 92,
    connectedClients: 24
  },
  {
    id: '2', 
    name: 'Coach Michael Chen',
    avatar: null,
    level: 18,
    specializations: ['Strategy', 'Advanced'],
    rating: 4.8,
    successRate: 91,
    matchScore: 88,
    connectedClients: 31
  },
  {
    id: '3',
    name: 'Coach Emma Rodriguez',
    avatar: null,
    level: 12,
    specializations: ['Fitness', 'Baseline'],
    rating: 4.7,
    successRate: 85,
    matchScore: 85,
    connectedClients: 19
  }
];

const mockMutualConnections: Connection[] = [
  {
    id: '1',
    name: 'Alex Thompson',
    avatar: null,
    mutualWith: ['Coach Williams', 'Jordan Lee'],
    sharedActivities: 12
  },
  {
    id: '2',
    name: 'Maya Patel',
    avatar: null,
    mutualWith: ['Coach Chen'],
    sharedActivities: 8
  }
];

export function SocialActionsPanel({ 
  selectedUsers = [], 
  recommendedCoaches = mockRecommendedCoaches,
  mutualConnections = mockMutualConnections,
  onBulkAction 
}: SocialActionsPanelProps) {
  const { toast } = useToast();
  const [bulkChallengeOpen, setBulkChallengeOpen] = useState(false);
  const [selectedTargets, setSelectedTargets] = useState<string[]>([]);

  const handleBulkChallenge = (challengeType: string) => {
    if (selectedTargets.length === 0) {
      toast({
        title: "No players selected",
        description: "Please select at least one player to challenge",
        variant: "destructive"
      });
      return;
    }

    onBulkAction?.('bulk_challenge', selectedTargets);
    toast({
      title: "Challenges Sent!",
      description: `Sent ${challengeType} challenges to ${selectedTargets.length} players`,
    });
    setBulkChallengeOpen(false);
    setSelectedTargets([]);
  };

  const handleCoachConnect = (coachId: string) => {
    toast({
      title: "Connection Request Sent!",
      description: "Your connection request has been sent to the coach",
    });
  };

  const mockNearbyPlayers = [
    { id: '1', name: 'Jordan Smith', level: 8, avatar: null },
    { id: '2', name: 'Sam Johnson', level: 12, avatar: null },
    { id: '3', name: 'Riley Chen', level: 6, avatar: null },
    { id: '4', name: 'Taylor Brown', level: 15, avatar: null }
  ];

  return (
    <div className="space-y-6">
      {/* Bulk Challenge Actions */}
      <Card className="bg-white/95 backdrop-blur-sm border-tennis-green-light shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 orbitron-heading text-heading-sm text-tennis-green-dark">
            <Zap className="h-5 w-5 text-tennis-yellow-dark" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Dialog open={bulkChallengeOpen} onOpenChange={setBulkChallengeOpen}>
            <DialogTrigger asChild>
              <Button 
                variant="outline" 
                className="w-full justify-start border-tennis-green-light hover:bg-tennis-green-bg/20"
              >
                <Target className="h-4 w-4 mr-2" />
                Challenge Multiple Players
                <ChevronRight className="h-4 w-4 ml-auto" />
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white border border-tennis-green-light">
              <DialogHeader>
                <DialogTitle className="text-tennis-green-dark">Challenge Multiple Players</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="text-sm text-tennis-green-medium">
                  Select players to challenge:
                </div>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {mockNearbyPlayers.map((player) => (
                    <div key={player.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-tennis-green-bg/10">
                      <Checkbox 
                        checked={selectedTargets.includes(player.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedTargets([...selectedTargets, player.id]);
                          } else {
                            setSelectedTargets(selectedTargets.filter(id => id !== player.id));
                          }
                        }}
                      />
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={player.avatar || undefined} />
                        <AvatarFallback className="bg-tennis-green-light text-white text-xs">
                          {player.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium text-tennis-green-dark text-sm">{player.name}</p>
                        <p className="text-xs text-tennis-green-medium">Level {player.level}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={() => handleBulkChallenge('Singles Match')}
                    className="flex-1"
                    disabled={selectedTargets.length === 0}
                  >
                    Singles Challenge
                  </Button>
                  <Button 
                    onClick={() => handleBulkChallenge('Training Session')}
                    variant="outline"
                    className="flex-1"
                    disabled={selectedTargets.length === 0}
                  >
                    Training Challenge
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Button 
            variant="outline" 
            className="w-full justify-start border-tennis-green-light hover:bg-tennis-green-bg/20"
          >
            <MessageCircle className="h-4 w-4 mr-2" />
            Group Message
            <ChevronRight className="h-4 w-4 ml-auto" />
          </Button>
        </CardContent>
      </Card>

      {/* Recommended Coaches */}
      <Card className="bg-white/95 backdrop-blur-sm border-tennis-green-light shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 orbitron-heading text-heading-sm text-tennis-green-dark">
            <Sparkles className="h-5 w-5 text-tennis-yellow-dark" />
            Recommended Coaches
          </CardTitle>
          <p className="poppins-body text-body-sm text-tennis-green-medium">
            Based on your level and goals
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          {recommendedCoaches.slice(0, 3).map((coach) => (
            <div key={coach.id} className="p-3 rounded-lg border border-tennis-green-light/50 hover:bg-tennis-green-bg/10 transition-colors">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={coach.avatar || undefined} />
                  <AvatarFallback className="bg-tennis-green-light text-white">
                    {coach.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-tennis-green-dark text-sm truncate">
                      {coach.name}
                    </p>
                    <Badge 
                      variant="outline" 
                      className="text-xs border-yellow-500 text-yellow-700 bg-yellow-50"
                    >
                      {coach.matchScore}% match
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 text-yellow-500 fill-current" />
                      <span className="text-xs text-tennis-green-medium">{coach.rating}</span>
                    </div>
                    <span className="text-xs text-tennis-green-medium">•</span>
                    <span className="text-xs text-tennis-green-medium">
                      {coach.successRate}% success rate
                    </span>
                  </div>
                  
                  <div className="flex flex-wrap gap-1 mt-1">
                    {coach.specializations.slice(0, 2).map((spec) => (
                      <Badge key={spec} variant="secondary" className="text-xs">
                        {spec}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div className="flex flex-col gap-1">
                  <Button
                    size="sm"
                    onClick={() => handleCoachConnect(coach.id)}
                    className="text-xs h-7"
                  >
                    <UserPlus className="h-3 w-3 mr-1" />
                    Connect
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs h-7"
                  >
                    <Calendar className="h-3 w-3 mr-1" />
                    Book
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Social Proof & Mutual Connections */}
      <Card className="bg-white/95 backdrop-blur-sm border-tennis-green-light shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 orbitron-heading text-heading-sm text-tennis-green-dark">
            <Users className="h-5 w-5" />
            Mutual Connections
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {mutualConnections.map((connection) => (
            <div key={connection.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-tennis-green-bg/10">
              <Avatar className="h-8 w-8">
                <AvatarImage src={connection.avatar || undefined} />
                <AvatarFallback className="bg-tennis-green-light text-white text-xs">
                  {connection.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <p className="font-medium text-tennis-green-dark text-sm">{connection.name}</p>
                <p className="text-xs text-tennis-green-medium">
                  Connected with: {connection.mutualWith.join(', ')}
                </p>
                <p className="text-xs text-tennis-green-medium">
                  {connection.sharedActivities} shared activities
                </p>
              </div>
              
              <Button size="sm" variant="ghost" className="text-xs">
                <MessageCircle className="h-3 w-3 mr-1" />
                Message
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}