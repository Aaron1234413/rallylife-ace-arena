
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Users, Zap, Play } from 'lucide-react';
import { CreateSessionDialog } from '@/components/social/CreateSessionDialog';
import { useSocialPlaySession } from '@/contexts/SocialPlaySessionContext';
import { AppLayout } from '@/components/layout/AppLayout';

export default function StartSocialPlay() {
  const navigate = useNavigate();
  const { sessionData, isSessionPending, startSession } = useSocialPlaySession();
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const handleStartSession = async () => {
    if (sessionData.id) {
      await startSession(sessionData.id);
      navigate('/');
    }
  };

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/')}
            className="p-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Social Play</h1>
            <p className="text-muted-foreground">Set up a tennis session with friends</p>
          </div>
        </div>

        {/* Current Session */}
        {isSessionPending && sessionData.id && (
          <Card className="mb-6 border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-800">
                <Users className="h-5 w-5" />
                Session Ready
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm capitalize">{sessionData.session_type}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm capitalize">{sessionData.competitive_level}</span>
                </div>
              </div>
              
              {sessionData.location && (
                <p className="text-sm text-muted-foreground">
                  📍 {sessionData.location}
                </p>
              )}
              
              {sessionData.participants && sessionData.participants.length > 1 && (
                <div>
                  <p className="text-sm font-medium mb-2">Players ({sessionData.participants.length}):</p>
                  <div className="flex flex-wrap gap-2">
                    {sessionData.participants.map(participant => (
                      <Badge key={participant.id} variant="secondary">
                        {participant.profile?.full_name || 'Unknown'}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              <Button onClick={handleStartSession} className="w-full">
                <Play className="h-4 w-4 mr-2" />
                Start Session
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Create New Session</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Set up a tennis session and invite friends to join
              </p>
              
              <CreateSessionDialog>
                <Button className="w-full">
                  <Users className="h-4 w-4 mr-2" />
                  Create Tennis Session
                </Button>
              </CreateSessionDialog>
            </CardContent>
          </Card>

          {/* Quick Setup Options */}
          <div className="grid grid-cols-1 gap-4">
            <Card className="cursor-pointer hover:bg-muted/50 transition-colors" 
                  onClick={() => setShowCreateDialog(true)}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">Singles Match</h3>
                    <p className="text-sm text-muted-foreground">1 vs 1 competitive play</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => setShowCreateDialog(true)}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Users className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">Doubles Match</h3>
                    <p className="text-sm text-muted-foreground">2 vs 2 team play</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Info Section */}
        <Card className="mt-6">
          <CardContent className="p-4">
            <h3 className="font-medium mb-2">How it works</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>• Choose between singles (1v1) or doubles (2v2) format</p>
              <p>• Set your competitive level and location</p>
              <p>• Invite friends or search for players</p>
              <p>• Start playing when everyone joins!</p>
            </div>
          </CardContent>
        </Card>

        {showCreateDialog && (
          <CreateSessionDialog>
            <div />
          </CreateSessionDialog>
        )}
      </div>
    </AppLayout>
  );
}
