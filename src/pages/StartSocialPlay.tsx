
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CreateSocialPlayDialog } from '@/components/social-play/CreateSocialPlayDialog';
import { ArrowLeft, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';

const StartSocialPlay = () => {
  const navigate = useNavigate();

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  const handleSessionCreated = () => {
    // Navigate back to dashboard after successful session creation and join
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBackToDashboard}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>

        {/* Main Content */}
        <Card className="shadow-lg">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Users className="h-8 w-8 text-blue-600" />
            </div>
            <CardTitle className="text-2xl">Start Social Play Session</CardTitle>
            <p className="text-muted-foreground mt-2">
              Invite friends to join you for a fun tennis session. Choose your game type, 
              competitive level, and get playing!
            </p>
          </CardHeader>
          
          <CardContent className="pt-0">
            {/* Use the CreateSocialPlayDialog without a trigger - it will show immediately */}
            <CreateSocialPlayDialog 
              open={true}
              onOpenChange={(open) => {
                if (!open) {
                  // If dialog is closed without creating a session, go back to dashboard
                  handleBackToDashboard();
                }
              }}
            />
          </CardContent>
        </Card>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-2">Singles Play</h3>
              <p className="text-sm text-muted-foreground">
                Challenge a friend to a 1v1 match. Perfect for focused practice or competitive play.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-2">Doubles Play</h3>
              <p className="text-sm text-muted-foreground">
                Team up for 2v2 action. Great for social play and working on doubles strategies.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default StartSocialPlay;
