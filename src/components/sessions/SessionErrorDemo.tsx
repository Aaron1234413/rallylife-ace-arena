import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Bug, 
  Wifi, 
  RefreshCw, 
  Clock,
  Database,
  Shield,
  AlertTriangle
} from 'lucide-react';
import { SessionErrorWrapper } from '@/components/sessions/SessionErrorWrapper';
import { SessionErrorDisplay } from '@/components/sessions/SessionErrorDisplay';
import { SessionLoadingState } from '@/components/sessions/SessionLoadingState';
import { SessionListSkeleton, SessionCardSkeleton, SessionCompactSkeleton } from '@/components/sessions/SessionSkeletons';
import { toast } from 'sonner';

/**
 * Demo component to showcase Phase 3.2 error handling and loading states
 */
export function SessionErrorDemo() {
  const [activeTab, setActiveTab] = useState('loading');
  const [showError, setShowError] = useState(false);
  const [errorType, setErrorType] = useState<'network' | 'permission' | 'timeout' | 'server' | 'generic'>('network');

  const simulateError = (type: typeof errorType) => {
    setErrorType(type);
    setShowError(true);
  };

  const getErrorForType = (type: typeof errorType): Error => {
    switch (type) {
      case 'network':
        return new Error('Failed to fetch sessions: Network error');
      case 'permission':
        return new Error('Permission denied: Insufficient access rights');
      case 'timeout':
        return new Error('Request timeout: The request took too long to complete');
      case 'server':
        return new Error('Database connection failed: Server temporarily unavailable');
      default:
        return new Error('Something went wrong while loading sessions');
    }
  };

  const handleRetry = () => {
    setShowError(false);
    toast.success('Retrying...', { duration: 2000 });
  };

  const handleGoHome = () => {
    toast.info('Navigating home...', { duration: 2000 });
  };

  return (
    <div className="min-h-screen p-6 bg-muted/30">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Session Error Handling Demo</h1>
          <p className="text-muted-foreground">Phase 3.2: Error Handling & Loading States</p>
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            ✅ Implementation Complete
          </Badge>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="loading">Loading States</TabsTrigger>
            <TabsTrigger value="errors">Error Handling</TabsTrigger>
            <TabsTrigger value="wrappers">Error Wrappers</TabsTrigger>
          </TabsList>

          {/* Loading States Demo */}
          <TabsContent value="loading" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <RefreshCw className="h-5 w-5" />
                  Loading State Components
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                
                {/* Session Loading States */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Session Loading States</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <h4 className="font-medium">Default Spinner</h4>
                      <SessionLoadingState context="loading" />
                    </div>
                    <div className="space-y-3">
                      <h4 className="font-medium">Joining Session</h4>
                      <SessionLoadingState context="joining" variant="spinner" />
                    </div>
                    <div className="space-y-3">
                      <h4 className="font-medium">Starting Session</h4>
                      <SessionLoadingState context="starting" variant="dots" />
                    </div>
                    <div className="space-y-3">
                      <h4 className="font-medium">Updating Session</h4>
                      <SessionLoadingState context="updating" variant="pulse" />
                    </div>
                  </div>
                </div>

                {/* Skeleton Loaders */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Skeleton Loaders</h3>
                  
                  <div className="space-y-4">
                    <h4 className="font-medium">Session Card Skeleton</h4>
                    <SessionCardSkeleton />
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium">Compact Session Skeleton</h4>
                    <SessionCompactSkeleton />
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium">Session List Skeleton (3 cards)</h4>
                    <SessionListSkeleton count={3} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Error Handling Demo */}
          <TabsContent value="errors" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bug className="h-5 w-5" />
                  Error Display Components
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                
                {/* Error Type Buttons */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Simulate Different Error Types</h3>
                  <div className="flex flex-wrap gap-2">
                    <Button 
                      variant="outline" 
                      onClick={() => simulateError('network')}
                      className="gap-2"
                    >
                      <Wifi className="h-4 w-4" />
                      Network Error
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => simulateError('permission')}
                      className="gap-2"
                    >
                      <Shield className="h-4 w-4" />
                      Permission Error
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => simulateError('timeout')}
                      className="gap-2"
                    >
                      <Clock className="h-4 w-4" />
                      Timeout Error
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => simulateError('server')}
                      className="gap-2"
                    >
                      <Database className="h-4 w-4" />
                      Server Error
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => simulateError('generic')}
                      className="gap-2"
                    >
                      <AlertTriangle className="h-4 w-4" />
                      Generic Error
                    </Button>
                  </div>
                </div>

                {/* Error Display Variants */}
                {showError && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold">Error Display Variants</h3>
                    
                    {/* Card Variant */}
                    <div className="space-y-2">
                      <h4 className="font-medium">Card Variant (Default)</h4>
                      <SessionErrorDisplay 
                        error={getErrorForType(errorType)}
                        onRetry={handleRetry}
                        onNavigateHome={handleGoHome}
                        context="session loading"
                        variant="card"
                      />
                    </div>

                    {/* Alert Variant */}
                    <div className="space-y-2">
                      <h4 className="font-medium">Alert Variant</h4>
                      <SessionErrorDisplay 
                        error={getErrorForType(errorType)}
                        onRetry={handleRetry}
                        context="session loading"
                        variant="alert"
                      />
                    </div>

                    {/* Inline Variant */}
                    <div className="space-y-2">
                      <h4 className="font-medium">Inline Variant</h4>
                      <SessionErrorDisplay 
                        error={getErrorForType(errorType)}
                        onRetry={handleRetry}
                        context="session loading"
                        variant="inline"
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Error Wrappers Demo */}
          <TabsContent value="wrappers" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Error Boundary Wrappers
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">SessionErrorWrapper Examples</h3>
                  <p className="text-muted-foreground">
                    These wrappers automatically catch errors and provide user-friendly error handling with retry functionality.
                  </p>
                  
                  {/* Working Wrapper Example */}
                  <div className="space-y-2">
                    <h4 className="font-medium">Working Content (No Error)</h4>
                    <SessionErrorWrapper 
                      context="demo session list"
                      onRetry={() => toast.success('Retry triggered!')}
                    >
                      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-green-800">✅ This content loads successfully!</p>
                        <p className="text-sm text-green-600 mt-1">
                          The error wrapper is active but not needed since there's no error.
                        </p>
                      </div>
                    </SessionErrorWrapper>
                  </div>

                  {/* Integration Example */}
                  <div className="space-y-2">
                    <h4 className="font-medium">Real Integration Example</h4>
                    <p className="text-sm text-muted-foreground">
                      This shows how the wrapper integrates with loading states in the actual Play page:
                    </p>
                    <div className="bg-muted/50 p-4 rounded-lg border">
                      <pre className="text-sm overflow-x-auto">
{`<SessionErrorWrapper 
  context="recent sessions"
  onRetry={refreshSessions}
>
  {loading ? (
    <SessionListSkeleton count={3} />
  ) : sessions.length === 0 ? (
    <EmptyState />
  ) : (
    <SessionCards sessions={sessions} />
  )}
</SessionErrorWrapper>`}
                      </pre>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}