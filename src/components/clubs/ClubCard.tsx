import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users, Globe, Lock, Crown, MapPin } from 'lucide-react';
import { Club } from '@/hooks/useClubs';
import { useAuth } from '@/hooks/useAuth';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';

interface ClubCardProps {
  club: Club;
  isMember?: boolean;
  memberRole?: string;
  // Remove unused props since all clubs are invitation-only now
}

export function ClubCard({ club, isMember, memberRole }: ClubCardProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isOwner = user?.id === club.owner_id;

  const handleCardClick = () => {
    if (isMember) {
      navigate(`/club/${club.id}`);
    }
  };

  const handleLeaveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Leave functionality would be handled by parent component
    console.log('Leave club:', club.id);
  };

  const getActionButton = () => {
    if (isOwner) {
      return (
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleCardClick}
          className="w-full"
        >
          Manage Club
        </Button>
      );
    }

    if (isMember) {
      return (
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleLeaveClick}
          className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          Leave Club
        </Button>
      );
    }

    return (
      <div className="w-full text-center">
        <Badge variant="outline" className="w-full justify-center py-1.5 mb-1">
          <Lock className="h-3 w-3 mr-1" />
          Invitation Only
        </Badge>
        <p className="text-xs text-gray-500">
          Contact a member for an invitation
        </p>
      </div>
    );
  };

  return (
    <Card 
      className={`hover:shadow-lg transition-all duration-200 group hover-scale ${
        isMember ? 'cursor-pointer' : 'cursor-default'
      }`}
      onClick={isMember ? handleCardClick : undefined}
    >
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Header Section */}
          <div className="flex items-start gap-3">
            <Avatar className="h-14 w-14 bg-gradient-to-br from-blue-500 to-purple-600 flex-shrink-0">
              <AvatarImage src={club.logo_url || undefined} />
              <AvatarFallback className="text-white font-semibold text-lg">
                {club.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-bold text-lg leading-tight group-hover:text-blue-600 transition-colors">
                  {club.name}
                </h3>
                {isOwner && (
                  <Crown className="h-4 w-4 text-amber-500 flex-shrink-0 mt-1" />
                )}
              </div>
              
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="secondary" className="text-xs px-2 py-1">
                  <Lock className="h-3 w-3 mr-1" />
                  Private
                </Badge>
                
                {memberRole && (
                  <Badge variant="outline" className="text-xs capitalize px-2 py-1">
                    {memberRole}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          
          {/* Description */}
          {club.description && (
            <p className="text-sm text-gray-600 leading-relaxed line-clamp-2">
              {club.description}
            </p>
          )}

          {/* Location */}
          {club.location && (
            <div className="flex items-center gap-1 text-gray-600 bg-gray-50 px-2 py-1 rounded-md">
              <MapPin className="h-3 w-3 flex-shrink-0" />
              <span className="text-xs font-medium truncate">{club.location}</span>
            </div>
          )}
          
          {/* Footer Section */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <div className="flex items-center gap-1 text-gray-600">
              <Users className="h-4 w-4" />
              <span className="text-sm font-medium">{club.member_count} members</span>
            </div>
            
            <div onClick={(e) => e.stopPropagation()}>
              {getActionButton()}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}