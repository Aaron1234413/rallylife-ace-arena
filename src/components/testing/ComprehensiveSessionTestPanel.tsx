import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TestTube, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Users, 
  PlayCircle,
  StopCircle,
  UserPlus,
  UserMinus,
  Trophy,
  Zap,
  Activity,
  Heart
} from 'lucide-react';
import { useRealTimeSessions } from '@/hooks/useRealTimeSessions';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface TestResult {
  status: 'pending' | 'running' | 'passed' | 'failed';
  message?: string;
  timestamp?: Date;
}

interface SessionTestData {
  sessionId?: string;
  sessionType: 'match' | 'social_play' | 'training' | 'wellbeing';
  participantCount: number;
  stakesAmount: number;
}

export const ComprehensiveSessionTestPanel = () => {
  const { user } = useAuth();
  const mySessions = useRealTimeSessions('my-sessions', user?.id);
  const availableSessions = useRealTimeSessions('available', user?.id);
  const completedSessions = useRealTimeSessions('completed', user?.id);
  
  const [testResults, setTestResults] = useState<Record<string, TestResult>>({});
  const [testData, setTestData] = useState<Record<string, SessionTestData>>({});
  const [overallStatus, setOverallStatus] = useState<'idle' | 'running' | 'completed'>('idle');

  // Test definitions for each session type
  const sessionTypes = [
    { type: 'match', name: 'Match Sessions', icon: Trophy, maxPlayers: 2, stakes: 50 },
    { type: 'social_play', name: 'Social Play', icon: Users, maxPlayers: 4, stakes: 25 },
    { type: 'training', name: 'Training', icon: Activity, maxPlayers: 1, stakes: 20 },
    { type: 'wellbeing', name: 'Wellbeing', icon: Heart, maxPlayers: 3, stakes: 15 }
  ] as const;

  const updateTestResult = (testKey: string, result: TestResult) => {
    setTestResults(prev => ({
      ...prev,
      [testKey]: { ...result, timestamp: new Date() }
    }));
  };

  const createTestSession = async (sessionType: 'match' | 'social_play' | 'training' | 'wellbeing') => {
    const testKey = `create-${sessionType}`;
    updateTestResult(testKey, { status: 'running' });

    try {
      const sessionConfig = sessionTypes.find(s => s.type === sessionType);
      if (!sessionConfig) throw new Error('Invalid session type');

      const { data, error } = await supabase
        .from('sessions')
        .insert({
          creator_id: user?.id,
          session_type: sessionType,
          format: sessionType === 'match' ? 'singles' : 'doubles',
          max_players: sessionConfig.maxPlayers,
          stakes_amount: sessionConfig.stakes,
          status: 'waiting',
          is_private: false,
          notes: `Test ${sessionType} session`
        })
        .select()
        .single();

      if (error) throw error;

      // Store test data
      setTestData(prev => ({
        ...prev,
        [sessionType]: {
          sessionId: data.id,
          sessionType,
          participantCount: 1,
          stakesAmount: sessionConfig.stakes
        }
      }));

      updateTestResult(testKey, { 
        status: 'passed', 
        message: `Session created: ${data.id}` 
      });

      return data.id;
    } catch (error) {
      updateTestResult(testKey, { 
        status: 'failed', 
        message: error instanceof Error ? error.message : 'Unknown error' 
      });
      return null;
    }
  };

  const joinTestSession = async (sessionId: string, sessionType: string) => {
    const testKey = `join-${sessionType}`;
    updateTestResult(testKey, { status: 'running' });

    try {
      await mySessions.joinSession(sessionId);
      updateTestResult(testKey, { status: 'passed', message: 'Successfully joined session' });
      return true;
    } catch (error) {
      updateTestResult(testKey, { 
        status: 'failed', 
        message: error instanceof Error ? error.message : 'Failed to join' 
      });
      return false;
    }
  };

  const startTestSession = async (sessionId: string, sessionType: string) => {
    const testKey = `start-${sessionType}`;
    updateTestResult(testKey, { status: 'running' });

    try {
      await mySessions.startSession(sessionId);
      updateTestResult(testKey, { status: 'passed', message: 'Session started successfully' });
      return true;
    } catch (error) {
      updateTestResult(testKey, { 
        status: 'failed', 
        message: error instanceof Error ? error.message : 'Failed to start' 
      });
      return false;
    }
  };

  const completeTestSession = async (sessionId: string, sessionType: string) => {
    const testKey = `complete-${sessionType}`;
    updateTestResult(testKey, { status: 'running' });

    try {
      // For match sessions, randomly assign a winner
      const winnerId = sessionType === 'match' ? (Math.random() > 0.5 ? user?.id : null) : undefined;
      const duration = Math.floor(Math.random() * 60) + 30; // 30-90 minutes
      
      await mySessions.completeSession(sessionId, winnerId, duration);
      updateTestResult(testKey, { 
        status: 'passed', 
        message: `Session completed (${duration}min)` 
      });
      return true;
    } catch (error) {
      updateTestResult(testKey, { 
        status: 'failed', 
        message: error instanceof Error ? error.message : 'Failed to complete' 
      });
      return false;
    }
  };

  const verifySessionInTab = async (sessionId: string, tabType: 'my' | 'available' | 'completed', sessionType: string) => {
    const testKey = `verify-${tabType}-${sessionType}`;
    updateTestResult(testKey, { status: 'running' });

    try {
      let sessions;
      switch (tabType) {
        case 'my':
          sessions = mySessions.sessions;
          break;
        case 'available':
          sessions = availableSessions.sessions;
          break;
        case 'completed':
          sessions = completedSessions.sessions;
          break;
      }

      const sessionExists = sessions.some(s => s.id === sessionId);
      
      if (sessionExists) {
        updateTestResult(testKey, { 
          status: 'passed', 
          message: `Session found in ${tabType} tab` 
        });
        return true;
      } else {
        updateTestResult(testKey, { 
          status: 'failed', 
          message: `Session not found in ${tabType} tab` 
        });
        return false;
      }
    } catch (error) {
      updateTestResult(testKey, { 
        status: 'failed', 
        message: error instanceof Error ? error.message : 'Verification failed' 
      });
      return false;
    }
  };

  const runFullSessionFlow = async (sessionType: 'match' | 'social_play' | 'training' | 'wellbeing') => {
    try {
      // Step 1: Create session
      const sessionId = await createTestSession(sessionType);
      if (!sessionId) return;

      // Wait for real-time update
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Step 2: Verify in "My Sessions"
      await verifySessionInTab(sessionId, 'my', sessionType);

      // Step 3: Verify in "Available" tab
      await verifySessionInTab(sessionId, 'available', sessionType);

      // Step 4: Start session
      await startTestSession(sessionId, sessionType);

      // Wait for real-time update
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Step 5: Complete session
      await completeTestSession(sessionId, sessionType);

      // Wait for real-time update
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Step 6: Verify in "Completed" tab
      await verifySessionInTab(sessionId, 'completed', sessionType);

    } catch (error) {
      console.error(`Full flow test failed for ${sessionType}:`, error);
    }
  };

  const runAllTests = async () => {
    setOverallStatus('running');
    setTestResults({});

    try {
      // Run tests for each session type sequentially
      for (const sessionConfig of sessionTypes) {
        await runFullSessionFlow(sessionConfig.type);
        // Wait between session types
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      
      setOverallStatus('completed');
      toast.success('All session flow tests completed!');
    } catch (error) {
      setOverallStatus('completed');
      toast.error('Some tests failed');
    }
  };

  const getTestIcon = (result?: TestResult) => {
    if (!result || result.status === 'pending') return TestTube;
    if (result.status === 'running') return Clock;
    if (result.status === 'passed') return CheckCircle;
    return XCircle;
  };

  const getTestColor = (result?: TestResult) => {
    if (!result || result.status === 'pending') return 'text-gray-600';
    if (result.status === 'running') return 'text-yellow-600';
    if (result.status === 'passed') return 'text-green-600';
    return 'text-red-600';
  };

  const getStatusBadge = (result?: TestResult) => {
    if (!result) return <Badge variant="outline">Pending</Badge>;
    
    const variants = {
      pending: 'outline',
      running: 'secondary',
      passed: 'default',
      failed: 'destructive'
    } as const;

    return <Badge variant={variants[result.status]}>{result.status}</Badge>;
  };

  const passedTests = Object.values(testResults).filter(r => r.status === 'passed').length;
  const totalTests = Object.keys(testResults).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TestTube className="h-5 w-5" />
          Phase 7: End-to-End Session Flow Testing
          {totalTests > 0 && (
            <Badge variant={passedTests === totalTests ? 'default' : 'secondary'}>
              {passedTests}/{totalTests} passed
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Control Panel */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Badge variant={overallStatus === 'running' ? 'secondary' : 'outline'}>
              Status: {overallStatus}
            </Badge>
            <span className="text-sm text-gray-600">
              Tests all session lifecycle flows with real-time verification
            </span>
          </div>
          <Button 
            onClick={runAllTests}
            disabled={overallStatus === 'running'}
            size="sm"
          >
            {overallStatus === 'running' ? 'Running Tests...' : 'Run All Flow Tests'}
          </Button>
        </div>

        <Separator />

        {/* Session Type Tests */}
        <Tabs defaultValue="match" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            {sessionTypes.map(({ type, name, icon: Icon }) => (
              <TabsTrigger key={type} value={type} className="flex items-center gap-1">
                <Icon className="h-4 w-4" />
                {name}
              </TabsTrigger>
            ))}
          </TabsList>

          {sessionTypes.map(({ type, name }) => (
            <TabsContent key={type} value={type} className="space-y-4">
              <div className="grid gap-3">
                {/* Test Flow Steps */}
                {[
                  { key: `create-${type}`, label: 'Create Session', icon: PlayCircle },
                  { key: `verify-my-${type}`, label: 'Verify in My Sessions', icon: Users },
                  { key: `verify-available-${type}`, label: 'Verify in Available', icon: Zap },
                  { key: `start-${type}`, label: 'Start Session', icon: PlayCircle },
                  { key: `complete-${type}`, label: 'Complete Session', icon: StopCircle },
                  { key: `verify-completed-${type}`, label: 'Verify in Completed', icon: Trophy }
                ].map(({ key, label, icon: Icon }) => {
                  const result = testResults[key];
                  const TestIcon = getTestIcon(result);
                  const colorClass = getTestColor(result);

                  return (
                    <div key={key} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Icon className="h-4 w-4 text-gray-500" />
                        <TestIcon className={`h-4 w-4 ${colorClass}`} />
                        <div>
                          <p className="font-medium">{label}</p>
                          {result?.message && (
                            <p className="text-sm text-gray-600">{result.message}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(result)}
                        {result?.timestamp && (
                          <span className="text-xs text-gray-500">
                            {result.timestamp.toLocaleTimeString()}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* Individual Test Button */}
                <Button 
                  onClick={() => runFullSessionFlow(type)}
                  disabled={overallStatus === 'running'}
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  Test {name} Flow
                </Button>
              </div>
            </TabsContent>
          ))}
        </Tabs>

        {/* Real-time Status */}
        <Separator />
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium mb-3">Real-time Session Counts</h4>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="flex justify-between">
              <span>My Sessions:</span>
              <Badge>{mySessions.sessions.length}</Badge>
            </div>
            <div className="flex justify-between">
              <span>Available:</span>
              <Badge>{availableSessions.sessions.length}</Badge>
            </div>
            <div className="flex justify-between">
              <span>Completed:</span>
              <Badge>{completedSessions.sessions.length}</Badge>
            </div>
          </div>
        </div>

        {/* Test Summary */}
        {totalTests > 0 && (
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="font-medium mb-2">Test Summary</h4>
            <p className="text-sm text-gray-700 mb-2">
              Comprehensive end-to-end testing of all session types with real-time verification.
            </p>
            <div className="flex items-center gap-4 text-sm">
              <span className="text-green-600">✓ {passedTests} Passed</span>
              <span className="text-red-600">✗ {totalTests - passedTests} Failed</span>
              <span className="text-gray-600">Total: {totalTests}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};