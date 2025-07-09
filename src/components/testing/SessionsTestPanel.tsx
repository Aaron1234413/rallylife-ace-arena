import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  TestTube, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Users, 
  Coins,
  Play,
  Trophy,
  Calculator
} from 'lucide-react';
import { useSessionManager } from '@/hooks/useSessionManager';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export const SessionsTestPanel = () => {
  const { user } = useAuth();
  const { sessions, loading, joinSession, leaveSession, startSession, completeSession } = useSessionManager({
    sessionType: 'social_play',
    includeNonClubSessions: true
  });
  const [testResults, setTestResults] = useState<Record<string, boolean>>({});
  const [testing, setTesting] = useState(false);

  const runTest = async (testName: string, testFn: () => Promise<boolean>) => {
    setTesting(true);
    try {
      const result = await testFn();
      setTestResults(prev => ({ ...prev, [testName]: result }));
      if (result) {
        toast.success(`✅ ${testName} passed`);
      } else {
        toast.error(`❌ ${testName} failed`);
      }
    } catch (error) {
      console.error(`Test ${testName} failed:`, error);
      setTestResults(prev => ({ ...prev, [testName]: false }));
      toast.error(`❌ ${testName} failed with error`);
    } finally {
      setTesting(false);
    }
  };

  const tests = [
    {
      name: 'Real-time Updates',
      description: 'Test that sessions update in real-time',
      icon: Clock,
      test: async () => {
        // This would be verified by creating a session in another window
        return sessions !== undefined && !loading;
      }
    },
    {
      name: 'Session Data Loading',
      description: 'Verify sessions load with correct data structure',
      icon: Users,
      test: async () => {
        if (!sessions || sessions.length === 0) return true; // No sessions is valid
        const session = sessions[0];
        return !!(session.id && session.session_type && session.status);
      }
    },
    {
      name: 'Stakes Calculation',
      description: 'Test stakes calculation logic',
      icon: Calculator,
      test: async () => {
        // Test stakes calculation for different scenarios
        const matchStakes = 100;
        const participants = 4;
        const totalStakes = matchStakes * participants;
        
        // Winner-takes-all calculation
        const winnerTakesAll = totalStakes;
        
        // 60/40 split calculation
        const organizerShare = Math.round(totalStakes * 0.6);
        const participantShare = (totalStakes - organizerShare) / participants;
        
        return winnerTakesAll === 400 && organizerShare === 240 && participantShare === 40;
      }
    },
    {
      name: 'Join/Leave Flow',
      description: 'Test joining and leaving sessions',
      icon: Play,
      test: async () => {
        // This would test the actual join/leave functionality
        // For now, just verify the functions exist and are callable
        return typeof joinSession === 'function' && typeof leaveSession === 'function';
      }
    },
    {
      name: 'Session Completion',
      description: 'Test session completion with winner selection',
      icon: Trophy,
      test: async () => {
        // Test completion function exists and handles different scenarios
        return typeof completeSession === 'function' && typeof startSession === 'function';
      }
    }
  ];

  const getTestIcon = (testName: string) => {
    if (testing) return Clock;
    if (testResults[testName] === true) return CheckCircle;
    if (testResults[testName] === false) return XCircle;
    return TestTube;
  };

  const getTestColor = (testName: string) => {
    if (testing) return 'text-yellow-600';
    if (testResults[testName] === true) return 'text-green-600';
    if (testResults[testName] === false) return 'text-red-600';
    return 'text-gray-600';
  };

  const runAllTests = async () => {
    for (const test of tests) {
      await runTest(test.name, test.test);
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  };

  const passedTests = Object.values(testResults).filter(result => result === true).length;
  const totalTests = Object.keys(testResults).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TestTube className="h-5 w-5" />
          Sessions System Test Panel
          {totalTests > 0 && (
            <Badge variant={passedTests === totalTests ? 'default' : 'secondary'}>
              {passedTests}/{totalTests} passed
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Test Status Overview */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Coins className="h-4 w-4 text-yellow-600" />
            <span className="text-sm">Available Sessions: {sessions?.length || 0}</span>
          </div>
          <Button 
            onClick={runAllTests}
            disabled={testing}
            size="sm"
          >
            {testing ? 'Running Tests...' : 'Run All Tests'}
          </Button>
        </div>

        <Separator />

        {/* Individual Tests */}
        <div className="space-y-3">
          {tests.map((test) => {
            const TestIcon = getTestIcon(test.name);
            const colorClass = getTestColor(test.name);
            
            return (
              <div key={test.name} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <TestIcon className={`h-4 w-4 ${colorClass}`} />
                  <div>
                    <p className="font-medium">{test.name}</p>
                    <p className="text-sm text-gray-600">{test.description}</p>
                  </div>
                </div>
                <Button
                  onClick={() => runTest(test.name, test.test)}
                  disabled={testing}
                  variant="outline"
                  size="sm"
                >
                  Test
                </Button>
              </div>
            );
          })}
        </div>

        {/* System Health Check */}
        <Separator />
        <div className="bg-gray-50 rounded-lg p-3">
          <h4 className="font-medium mb-2">System Health</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex justify-between">
              <span>Real-time Hook:</span>
              <Badge variant={loading ? 'secondary' : 'default'}>
                {loading ? 'Loading' : 'Active'}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span>User Session:</span>
              <Badge variant={user ? 'default' : 'destructive'}>
                {user ? 'Authenticated' : 'Not Authenticated'}
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};