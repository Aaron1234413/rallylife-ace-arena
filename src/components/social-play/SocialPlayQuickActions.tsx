
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Search, UserPlus } from 'lucide-react';
import { CreateSocialPlayDialog } from './CreateSocialPlayDialog';
import { useSocialPlaySession } from '@/contexts/SocialPlaySessionContext';

export const SocialPlayQuickActions = () => {
  const { isSessionActive } = useSocialPlaySession();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  // Don't show quick actions if already in a session
  if (isSessionActive) {
    return null;
  }

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="h-5 w-5 text-tennis-green" />
            Social Play
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Button 
              className="w-full justify-start h-12"
              onClick={() => setCreateDialogOpen(true)}
            >
              <UserPlus className="h-5 w-5 mr-2" />
              <div className="text-left">
                <div className="font-medium">Create Session</div>
                <div className="text-xs opacity-80">Invite friends to play</div>
              </div>
            </Button>
            
            <Button variant="outline" className="w-full justify-start h-12">
              <Search className="h-5 w-5 mr-2" />
              <div className="text-left">
                <div className="font-medium">Find Sessions</div>
                <div className="text-xs opacity-60">Join nearby games</div>
              </div>
            </Button>
          </div>
          
          <p className="text-xs text-muted-foreground mt-3 text-center">
            Connect with friends and organize tennis sessions together
          </p>
        </CardContent>
      </Card>

      <CreateSocialPlayDialog 
        open={createDialogOpen} 
        onOpenChange={setCreateDialogOpen}
      />
    </>
  );
};
