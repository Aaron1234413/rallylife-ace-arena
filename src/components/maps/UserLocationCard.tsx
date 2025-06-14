
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Calendar, MapPin } from 'lucide-react';
import { UserLocation } from '@/hooks/useUserLocation';

interface UserLocationCardProps {
  user: UserLocation;
  onMessage?: () => void;
  onSchedule?: () => void;
}

export function UserLocationCard({ user, onMessage, onSchedule }: UserLocationCardProps) {
  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={user.avatar_url} />
            <AvatarFallback>
              {user.full_name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <CardTitle className="text-lg">{user.full_name}</CardTitle>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={user.role === 'coach' ? 'default' : 'secondary'}>
                {user.role}
              </Badge>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="h-3 w-3" />
                {user.distance_km.toFixed(1)}km away
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {user.city && (
          <p className="text-sm text-muted-foreground">
            Located in {user.city}
          </p>
        )}
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={onMessage}
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            Message
          </Button>
          
          {user.role === 'coach' && (
            <Button
              variant="default"
              size="sm"
              className="flex-1"
              onClick={onSchedule}
            >
              <Calendar className="h-4 w-4 mr-2" />
              Schedule
            </Button>
          )}
        </div>
        
        <div className="text-xs text-muted-foreground">
          Last seen: {new Date(user.last_updated).toLocaleString()}
        </div>
      </CardContent>
    </Card>
  );
}
