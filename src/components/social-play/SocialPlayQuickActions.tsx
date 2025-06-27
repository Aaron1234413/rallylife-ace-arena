
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Calendar, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const SocialPlayQuickActions = () => {
  const navigate = useNavigate();

  return (
    <Card className="border-tennis-green-light bg-gradient-to-r from-tennis-green-light/5 to-tennis-green-dark/5">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-tennis-green-dark">
          <Users className="h-5 w-5" />
          <span className="font-orbitron font-bold">Social Play</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Button
            onClick={() => navigate('/start-social-play')}
            className="bg-tennis-green-dark hover:bg-tennis-green text-white font-orbitron font-semibold"
            size="sm"
          >
            <Calendar className="h-4 w-4 mr-2" />
            Create Event
          </Button>
          <Button
            onClick={() => navigate('/join-social-play')}
            variant="outline"
            className="border-tennis-green-dark text-tennis-green-dark hover:bg-tennis-green-light/10 font-orbitron font-medium"
            size="sm"
          >
            <MapPin className="h-4 w-4 mr-2" />
            Find Events
          </Button>
          <Button
            onClick={() => navigate('/maps')}
            variant="outline"
            className="border-tennis-green-dark text-tennis-green-dark hover:bg-tennis-green-light/10 font-orbitron font-medium"
            size="sm"
          >
            <Users className="h-4 w-4 mr-2" />
            Browse Courts
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
