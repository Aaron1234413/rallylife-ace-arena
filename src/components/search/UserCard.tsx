
import React from 'react';
import { SearchResult } from '@/hooks/useSearchUsers';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Calendar, MapPin, Star, Trophy } from 'lucide-react';
import { CoachBenefitsPreview } from './CoachBenefitsPreview';
import { useMessageNavigation } from '@/hooks/useMessageNavigation';

interface UserCardProps {
  user: SearchResult;
  type: 'players' | 'coaches';
}

export function UserCard({ user, type }: UserCardProps) {
  const { openConversation, isLoading } = useMessageNavigation();

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getLevelDisplay = () => {
    if (type === 'players') {
      return `Level ${user.current_level || 1}.0`;
    } else {
      return user.experience_years ? `${user.experience_years} years experience` : 'New coach';
    }
  };

  const getSpecialtyDisplay = () => {
    if (type === 'players') {
      return user.skill_level ? user.skill_level.charAt(0).toUpperCase() + user.skill_level.slice(1) : 'Beginner';
    } else {
      return user.coaching_focus ? user.coaching_focus.replace('_', ' ').charAt(0).toUpperCase() + user.coaching_focus.replace('_', ' ').slice(1) : 'General coaching';
    }
  };

  const handleMessage = () => {
    openConversation({
      targetUserId: user.id,
      targetUserName: user.full_name
    });
  };

  return (
    <Card className="bg-white/95 backdrop-blur-sm border-white/30 shadow-lg hover:shadow-xl transition-all duration-300 hover:border-tennis-green-primary/30">
      <CardContent className="p-6">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 flex-1">
              {/* Avatar */}
              <div className="relative">
                <Avatar className="h-20 w-20 border-2 border-white shadow-lg">
                  <AvatarImage src={user.avatar_url} alt={user.full_name} />
                  <AvatarFallback className="bg-tennis-green-primary text-white text-xl font-bold">
                    {getInitials(user.full_name)}
                  </AvatarFallback>
                </Avatar>
                {type === 'coaches' && (
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-tennis-green-primary rounded-full flex items-center justify-center shadow-lg">
                    <Trophy className="w-3 h-3 text-white" />
                  </div>
                )}
              </div>

              {/* User Info */}
              <div className="flex-1">
                <h3 className="text-xl font-bold text-tennis-green-dark mb-1">
                  {user.full_name}
                </h3>
                <p className="text-tennis-green-medium font-medium mb-3">
                  {getLevelDisplay()}
                </p>
                <div className="flex items-center gap-3 flex-wrap">
                  <Badge 
                    variant="secondary" 
                    className="bg-tennis-green-bg/50 text-tennis-green-dark border-tennis-green-bg"
                  >
                    {getSpecialtyDisplay()}
                  </Badge>
                  {user.location && (
                    <div className="flex items-center text-sm text-tennis-green-dark/70">
                      <MapPin className="h-4 w-4 mr-1" />
                      {user.location}
                    </div>
                  )}
                </div>
              </div>

              {/* Match Percentage */}
              <div className="text-center">
                <div className="bg-gradient-to-r from-tennis-green-primary to-tennis-green-medium text-white px-4 py-2 rounded-full shadow-lg">
                  <div className="text-2xl font-bold">{user.match_percentage}%</div>
                </div>
                <div className="flex items-center gap-1 text-sm text-tennis-green-dark/70 mt-2">
                  <Star className="h-3 w-3 text-tennis-yellow" />
                  <span>Match</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 ml-6">
              <Button 
                onClick={handleMessage}
                disabled={isLoading}
                className="bg-white border-2 border-tennis-green-primary text-tennis-green-primary hover:bg-tennis-green-primary hover:text-white transition-all duration-200 shadow-md hover:shadow-lg"
                size="lg"
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                {isLoading ? 'Opening...' : 'Message'}
              </Button>
              <Button 
                className="bg-tennis-green-primary hover:bg-tennis-green-medium text-white shadow-md hover:shadow-lg transition-all duration-200"
                size="lg"
              >
                <Calendar className="h-4 w-4 mr-2" />
                {type === 'coaches' ? 'Book Session' : 'Challenge'}
              </Button>
            </div>
          </div>

          {/* Coach Benefits Preview - only show for coaches */}
          {type === 'coaches' && (
            <div className="border-t border-tennis-green-bg/30 pt-4">
              <CoachBenefitsPreview 
                coachLevel={user.current_level || 1} 
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
