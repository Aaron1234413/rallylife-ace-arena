import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageCircle, MapPin } from 'lucide-react';

interface Member {
  id: string;
  full_name: string;
  avatar_url?: string;
  email?: string;
  utr_rating?: number;
  usta_rating?: number;
  location?: string;
  looking_to_play_until?: string;
}

interface EnhancedMemberCardProps {
  member: Member;
  onMessage?: (memberId: string) => void;
  showSkillLevel?: boolean;
  compact?: boolean;
}

export function EnhancedMemberCard({ 
  member, 
  onMessage, 
  showSkillLevel = true,
  compact = false 
}: EnhancedMemberCardProps) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const isLookingToPlay = member.looking_to_play_until && 
    new Date(member.looking_to_play_until) > new Date();

  const getSkillLevelColor = (utr?: number) => {
    if (!utr) return 'bg-gray-100 text-gray-800';
    if (utr >= 10) return 'bg-purple-100 text-purple-800 border-purple-200';
    if (utr >= 7) return 'bg-blue-100 text-blue-800 border-blue-200';
    if (utr >= 4) return 'bg-green-100 text-green-800 border-green-200';
    return 'bg-yellow-100 text-yellow-800 border-yellow-200';
  };

  if (compact) {
    return (
      <Card className={`hover:shadow-md transition-shadow ${isLookingToPlay ? 'ring-2 ring-tennis-yellow' : ''}`}>
        <CardContent className="p-3">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Avatar className="h-10 w-10">
                <AvatarImage src={member.avatar_url} alt={member.full_name} />
                <AvatarFallback className="bg-tennis-green-bg text-tennis-green-dark text-xs">
                  {getInitials(member.full_name)}
                </AvatarFallback>
              </Avatar>
              {isLookingToPlay && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-tennis-yellow rounded-full border-2 border-white" />
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm text-tennis-green-dark truncate">
                {member.full_name}
              </p>
              <div className="flex items-center gap-2 mt-1">
                {showSkillLevel && member.utr_rating && (
                  <Badge variant="outline" className={`text-xs px-1.5 py-0.5 ${getSkillLevelColor(member.utr_rating)}`}>
                    UTR {member.utr_rating}
                  </Badge>
                )}
                {member.location && (
                  <div className="flex items-center text-xs text-tennis-green-medium">
                    <MapPin className="h-3 w-3 mr-1" />
                    <span className="truncate">{member.location}</span>
                  </div>
                )}
              </div>
            </div>
            
            {onMessage && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onMessage(member.id)}
                className="h-8 w-8 p-0 hover:bg-tennis-green-bg"
              >
                <MessageCircle className="h-4 w-4 text-tennis-green-medium" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`hover:shadow-lg transition-shadow ${isLookingToPlay ? 'ring-2 ring-tennis-yellow' : ''}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className="relative">
            <Avatar className="h-16 w-16">
              <AvatarImage src={member.avatar_url} alt={member.full_name} />
              <AvatarFallback className="bg-tennis-green-bg text-tennis-green-dark text-lg">
                {getInitials(member.full_name)}
              </AvatarFallback>
            </Avatar>
            {isLookingToPlay && (
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-tennis-yellow rounded-full border-2 border-white" />
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-lg text-tennis-green-dark">
                  {member.full_name}
                </h3>
                {member.location && (
                  <div className="flex items-center text-sm text-tennis-green-medium mt-1">
                    <MapPin className="h-4 w-4 mr-1" />
                    {member.location}
                  </div>
                )}
              </div>
              
              {onMessage && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onMessage(member.id)}
                  className="flex items-center gap-2"
                >
                  <MessageCircle className="h-4 w-4" />
                  Message
                </Button>
              )}
            </div>
            
            {showSkillLevel && (
              <div className="flex gap-2 mt-3">
                {member.utr_rating && (
                  <Badge className={getSkillLevelColor(member.utr_rating)}>
                    UTR {member.utr_rating}
                  </Badge>
                )}
                {member.usta_rating && (
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    USTA {member.usta_rating}
                  </Badge>
                )}
              </div>
            )}
            
            {isLookingToPlay && (
              <div className="mt-3">
                <Badge className="bg-tennis-yellow text-tennis-green-dark">
                  Looking to Play
                </Badge>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}