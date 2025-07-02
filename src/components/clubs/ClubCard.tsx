import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users, Globe, Lock, Crown, Calendar } from 'lucide-react';
import { Club } from '@/hooks/useClubs';
import { useAuth } from '@/hooks/useAuth';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';

interface ClubCardProps {
  club: Club;
  isMember?: boolean;
  memberRole?: string;
  onJoin?: (clubId: string) => void;
  onLeave?: (clubId: string) => void;
}

export function ClubCard({ club, isMember, memberRole, onJoin, onLeave }: ClubCardProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isOwner = user?.id === club.owner_id;

  const handleCardClick = () => {
    if (isMember || club.is_public) {
      navigate(`/club/${club.id}`);
    }
  };

  const handleActionClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (isMember && onLeave && !isOwner) {
      onLeave(club.id);
    } else if (!isMember && onJoin) {
      onJoin(club.id);
    }
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
          onClick={handleActionClick}
          className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          Leave Club
        </Button>
      );
    }

    return (
      <Button 
        size="sm"
        onClick={handleActionClick}
        className="w-full"
      >
        Join Club
      </Button>
    );
  };

  return (
    <Card 
      className="hover:shadow-lg transition-shadow cursor-pointer group"
      onClick={handleCardClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <Avatar className="h-12 w-12 bg-gradient-to-br from-blue-500 to-purple-600">
              <AvatarImage src={club.logo_url || undefined} />
              <AvatarFallback className="text-white font-semibold">
                {club.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-lg truncate group-hover:text-blue-600 transition-colors">
                  {club.name}
                </h3>
                {isOwner && (
                  <Crown className="h-4 w-4 text-amber-500 flex-shrink-0" />
                )}
              </div>
              
              <div className="flex items-center gap-2 mt-1">
                <div className="flex items-center gap-1 text-gray-600">
                  <Users className="h-3 w-3" />
                  <span className="text-sm">{club.member_count} members</span>
                </div>
                
                <Badge variant={club.is_public ? "default" : "secondary"} className="text-xs">
                  {club.is_public ? (
                    <><Globe className="h-3 w-3 mr-1" />Public</>
                  ) : (
                    <><Lock className="h-3 w-3 mr-1" />Private</>
                  )}
                </Badge>
                
                {memberRole && (
                  <Badge variant="outline" className="text-xs capitalize">
                    {memberRole}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {club.description && (
          <p className="text-sm text-gray-600 mt-2 line-clamp-2">
            {club.description}
          </p>
        )}
      </CardHeader>

      <CardContent className="pt-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Calendar className="h-3 w-3" />
            <span>Created {formatDistanceToNow(new Date(club.created_at), { addSuffix: true })}</span>
          </div>
          
          <div onClick={(e) => e.stopPropagation()}>
            {getActionButton()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}