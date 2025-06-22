
import React from 'react';
import { SearchResult } from '@/hooks/useSearchUsers';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Calendar, MapPin, Star } from 'lucide-react';
import { CoachBenefitsPreview } from './CoachBenefitsPreview';

interface UserCardProps {
  user: SearchResult;
  type: 'players' | 'coaches';
}

export function UserCard({ user, type }: UserCardProps) {
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

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 flex-1">
              {/* Avatar */}
              <Avatar className="h-16 w-16">
                <AvatarImage src={user.avatar_url} alt={user.full_name} />
                <AvatarFallback className="bg-tennis-green-primary text-white text-lg font-semibold">
                  {getInitials(user.full_name)}
                </AvatarFallback>
              </Avatar>

              {/* User Info */}
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">{user.full_name}</h3>
                <p className="text-gray-600">{getLevelDisplay()}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary" className="text-xs">
                    {getSpecialtyDisplay()}
                  </Badge>
                  {user.location && (
                    <div className="flex items-center text-xs text-gray-500">
                      <MapPin className="h-3 w-3 mr-1" />
                      {user.location}
                    </div>
                  )}
                </div>
              </div>

              {/* Match Percentage */}
              <div className="text-right">
                <div className="bg-tennis-green-primary text-white px-3 py-1 rounded-full text-sm font-semibold">
                  {user.match_percentage}%
                </div>
                <p className="text-xs text-gray-500 mt-1">Match</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-2 ml-4">
              <Button 
                variant="outline" 
                size="sm"
                className="border-tennis-green-primary text-tennis-green-primary hover:bg-tennis-green-primary hover:text-white"
              >
                <MessageCircle className="h-4 w-4 mr-1" />
                Message
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                className="border-tennis-green-primary text-tennis-green-primary hover:bg-tennis-green-primary hover:text-white"
              >
                <Calendar className="h-4 w-4 mr-1" />
                {type === 'coaches' ? 'Book' : 'Challenge'}
              </Button>
            </div>
          </div>

          {/* Coach Benefits Preview - only show for coaches */}
          {type === 'coaches' && (
            <CoachBenefitsPreview 
              coachLevel={user.current_level || 1} 
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
