import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { 
  GraduationCap, 
  Star, 
  Calendar, 
  DollarSign,
  Coins,
  Clock,
  Users,
  UserPlus,
  Mail,
  Phone,
  Award
} from 'lucide-react';
import { Club } from '@/hooks/useClubs';

interface Coach {
  id: string;
  user_id: string;
  full_name: string;
  avatar_url: string | null;
  email: string;
  specializations: string[];
  rating: number;
  total_sessions: number;
  years_experience: number;
  bio: string;
  hourly_rate_tokens: number;
  hourly_rate_money: number;
  status: 'active' | 'inactive';
  joined_club_at: string;
}

interface ClubCoachesProps {
  club: Club;
  canManage: boolean;
}

export function ClubCoaches({ club, canManage }: ClubCoachesProps) {
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [isInviting, setIsInviting] = useState(false);

  // Mock coaches data
  const coaches: Coach[] = [
    {
      id: '1',
      user_id: 'coach-1',
      full_name: 'David Rodriguez',
      avatar_url: null,
      email: 'david.rodriguez@tennis.com',
      specializations: ['Singles', 'Technique', 'Mental Game'],
      rating: 4.9,
      total_sessions: 156,
      years_experience: 8,
      bio: 'Former professional player with extensive coaching experience. Specializes in developing technique and mental toughness.',
      hourly_rate_tokens: 75,
      hourly_rate_money: 45,
      status: 'active',
      joined_club_at: '2024-01-15T10:00:00Z'
    },
    {
      id: '2',
      user_id: 'coach-2',
      full_name: 'Sarah Martinez',
      avatar_url: null,
      email: 'sarah.martinez@tennis.com',
      specializations: ['Doubles', 'Strategy', 'Beginner Coaching'],
      rating: 4.8,
      total_sessions: 203,
      years_experience: 12,
      bio: 'Certified tennis professional focusing on doubles strategy and helping beginners fall in love with the game.',
      hourly_rate_tokens: 65,
      hourly_rate_money: 40,
      status: 'active',
      joined_club_at: '2024-02-01T14:30:00Z'
    },
    {
      id: '3',
      user_id: 'coach-3',
      full_name: 'Michael Chen',
      avatar_url: null,
      email: 'michael.chen@tennis.com',
      specializations: ['Fitness', 'Conditioning', 'Injury Prevention'],
      rating: 4.7,
      total_sessions: 89,
      years_experience: 6,
      bio: 'Sports science background with focus on tennis-specific fitness and injury prevention programs.',
      hourly_rate_tokens: 55,
      hourly_rate_money: 35,
      status: 'active',
      joined_club_at: '2024-03-10T09:15:00Z'
    }
  ];

  const handleInviteCoach = async () => {
    if (!inviteEmail.trim()) return;

    setIsInviting(true);
    try {
      // Mock invite functionality
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setInviteEmail('');
      setShowInviteDialog(false);
      
      console.log('Inviting coach:', inviteEmail);
    } catch (error) {
      console.error('Error inviting coach:', error);
    } finally {
      setIsInviting(false);
    }
  };

  const getRatingStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star 
        key={i} 
        className={`h-3 w-3 ${i < Math.floor(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
      />
    ));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-tennis-green-dark">Club Coaches</h2>
          <p className="text-sm text-tennis-green-medium">
            {coaches.length} coach{coaches.length !== 1 ? 'es' : ''} available
          </p>
        </div>
        
        {canManage && (
          <Button
            onClick={() => setShowInviteDialog(true)}
            className="flex items-center gap-2"
          >
            <UserPlus className="h-4 w-4" />
            Invite Coach
          </Button>
        )}
      </div>

      {/* Coaches Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {coaches.map((coach) => (
          <Card key={coach.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={coach.avatar_url || undefined} />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                    {coach.full_name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-tennis-green-dark truncate">
                    {coach.full_name}
                  </h3>
                  <div className="flex items-center gap-1 mb-1">
                    {getRatingStars(coach.rating)}
                    <span className="text-sm text-tennis-green-medium ml-1">
                      {coach.rating} ({coach.total_sessions} sessions)
                    </span>
                  </div>
                  <p className="text-xs text-tennis-green-medium">
                    {coach.years_experience} years experience
                  </p>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-3">
              <p className="text-sm text-tennis-green-medium line-clamp-2">
                {coach.bio}
              </p>
              
              <div className="flex flex-wrap gap-1">
                {coach.specializations.slice(0, 3).map((spec) => (
                  <Badge key={spec} variant="outline" className="text-xs">
                    {spec}
                  </Badge>
                ))}
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-1">
                  <Coins className="h-3 w-3 text-gray-500" />
                  <span>{coach.hourly_rate_tokens} tokens/hr</span>
                </div>
                <div className="flex items-center gap-1">
                  <DollarSign className="h-3 w-3 text-gray-500" />
                  <span>${coach.hourly_rate_money}/hr</span>
                </div>
              </div>
              
              <div className="flex gap-2 pt-2">
                <Button size="sm" className="flex-1">
                  <Calendar className="h-3 w-3 mr-1" />
                  Book Session
                </Button>
                <Button variant="outline" size="sm">
                  <Mail className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Coach Management Section for Club Owners */}
      {canManage && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              Coach Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="p-3 bg-tennis-green-bg/30 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Users className="h-4 w-4 text-tennis-green-primary" />
                  <span className="text-sm font-medium">Total Coaches</span>
                </div>
                <p className="text-xl font-bold text-tennis-green-dark">{coaches.length}</p>
              </div>
              
              <div className="p-3 bg-tennis-green-bg/30 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm font-medium">Avg Rating</span>
                </div>
                <p className="text-xl font-bold text-tennis-green-dark">
                  {(coaches.reduce((acc, c) => acc + c.rating, 0) / coaches.length).toFixed(1)}
                </p>
              </div>
              
              <div className="p-3 bg-tennis-green-bg/30 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-medium">Total Sessions</span>
                </div>
                <p className="text-xl font-bold text-tennis-green-dark">
                  {coaches.reduce((acc, c) => acc + c.total_sessions, 0)}
                </p>
              </div>
              
              <div className="p-3 bg-tennis-green-bg/30 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Award className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium">Active Coaches</span>
                </div>
                <p className="text-xl font-bold text-tennis-green-dark">
                  {coaches.filter(c => c.status === 'active').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Invite Coach Dialog */}
      <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Invite Coach to Club</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Coach Email Address *</label>
              <Input
                type="email"
                placeholder="Enter coach's email address"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                disabled={isInviting}
              />
              <p className="text-xs text-tennis-green-medium">
                The coach will receive an invitation to join this club
              </p>
            </div>
            
            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowInviteDialog(false)}
                disabled={isInviting}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleInviteCoach}
                disabled={isInviting || !inviteEmail.trim()}
                className="flex-1"
              >
                {isInviting ? 'Sending...' : 'Send Invite'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}