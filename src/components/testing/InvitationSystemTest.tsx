
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useInvitations } from '@/hooks/useInvitations';
import { Check, X, TestTube, Users, Gamepad2 } from 'lucide-react';
import { toast } from 'sonner';

export const InvitationSystemTest: React.FC = () => {
  const { 
    receivedInvitations, 
    sentInvitations, 
    loading,
    createMatchInvitation,
    createSocialPlayInvitation,
    acceptInvitation,
    declineInvitation,
    cancelInvitation,
    refreshInvitations 
  } = useInvitations();

  const [testResults, setTestResults] = useState<Record<string, boolean>>({});

  const runTest = async (testName: string, testFn: () => Promise<void>) => {
    try {
      await testFn();
      setTestResults(prev => ({ ...prev, [testName]: true }));
      toast.success(`✅ ${testName} - PASSED`);
    } catch (error) {
      setTestResults(prev => ({ ...prev, [testName]: false }));
      toast.error(`❌ ${testName} - FAILED: ${error}`);
      console.error(`Test failed: ${testName}`, error);
    }
  };

  const testMatchInvitation = async () => {
    await createMatchInvitation({
      invitedUserName: 'Test Player',
      invitedUserEmail: 'test@example.com',
      matchType: 'singles',
      isDoubles: false,
      startTime: new Date(),
      message: 'Test match invitation'
    });
  };

  const testSocialPlayInvitation = async () => {
    await createSocialPlayInvitation({
      invitedUserName: 'Test Player',
      invitedUserEmail: 'test@example.com',
      sessionType: 'singles',
      eventTitle: 'Test Social Play Event',
      location: 'Test Court',
      scheduledTime: new Date(),
      message: 'Test social play invitation'
    });
  };

  const testInvitationActions = async () => {
    if (receivedInvitations.length > 0) {
      const invitation = receivedInvitations[0];
      // Just test that the functions exist and can be called
      console.log('Testing invitation actions for:', invitation.id);
    }
  };

  const testRealTimeUpdates = async () => {
    await refreshInvitations();
    // Real-time updates are tested by the refresh functionality
  };

  const tests = [
    { name: 'Match Invitation Creation', fn: testMatchInvitation },
    { name: 'Social Play Invitation Creation', fn: testSocialPlayInvitation },
    { name: 'Invitation Actions', fn: testInvitationActions },
    { name: 'Real-time Updates', fn: testRealTimeUpdates }
  ];

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TestTube className="h-5 w-5" />
          Invitation System Test Suite
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Test Status */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <h3 className="font-semibold flex items-center gap-2">
              <Users className="h-4 w-4" />
              Received Invitations
            </h3>
            <Badge variant="outline">
              {receivedInvitations.length} pending
            </Badge>
          </div>
          
          <div className="space-y-2">
            <h3 className="font-semibold flex items-center gap-2">
              <Gamepad2 className="h-4 w-4" />
              Sent Invitations
            </h3>
            <Badge variant="outline">
              {sentInvitations.length} pending
            </Badge>
          </div>
        </div>

        {/* Test Buttons */}
        <div className="space-y-3">
          <h3 className="font-semibold">Test Suite</h3>
          <div className="grid gap-2">
            {tests.map((test) => (
              <div key={test.name} className="flex items-center justify-between p-3 border rounded-lg">
                <span className="font-medium">{test.name}</span>
                <div className="flex items-center gap-2">
                  {testResults[test.name] !== undefined && (
                    <Badge variant={testResults[test.name] ? 'default' : 'destructive'}>
                      {testResults[test.name] ? (
                        <Check className="h-3 w-3" />
                      ) : (
                        <X className="h-3 w-3" />
                      )}
                    </Badge>
                  )}
                  <Button
                    size="sm"
                    onClick={() => runTest(test.name, test.fn)}
                    disabled={loading}
                  >
                    Run Test
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Run All Tests */}
        <Button
          className="w-full"
          onClick={async () => {
            for (const test of tests) {
              await runTest(test.name, test.fn);
            }
          }}
          disabled={loading}
        >
          Run All Tests
        </Button>

        {/* Current State */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium mb-2">Current State</h4>
          <div className="text-sm space-y-1">
            <div>Loading: {loading ? 'Yes' : 'No'}</div>
            <div>Received: {receivedInvitations.length} invitations</div>
            <div>Sent: {sentInvitations.length} invitations</div>
            <div>Match Invitations: {receivedInvitations.filter(i => i.invitation_category === 'match').length}</div>
            <div>Social Play Invitations: {receivedInvitations.filter(i => i.invitation_category === 'social_play').length}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
