import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Settings, TestTube } from 'lucide-react';
import { useFeatureFlagContext } from '@/contexts/FeatureFlagContext';
import { useABTest } from '@/hooks/useFeatureFlags';
import { toast } from 'sonner';

export const FeatureFlagPanel: React.FC = () => {
  const {
    flags,
    isLoading,
    overrideFlags,
    resetFlags,
    shouldUseUnifiedSessions,
    shouldMigrateSocialPlay,
    shouldMigrateTraining,
    shouldMigrateMatch,
  } = useFeatureFlagContext();

  // A/B test for UI variant
  const uiVariant = useABTest('ui-style', ['classic', 'modern']);

  const handleFlagToggle = (flagName: keyof typeof flags) => {
    overrideFlags({ [flagName]: !flags[flagName] });
    toast.success(`${flagName} ${!flags[flagName] ? 'enabled' : 'disabled'}`);
  };

  const handleReset = () => {
    resetFlags();
    toast.success('Feature flags reset to calculated values');
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Feature Flags
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Loading feature configuration...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Feature Flags & A/B Tests
        </CardTitle>
        <CardDescription>
          Control feature rollout and experimental features. Changes are temporary for testing.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Migration Status */}
        <div className="space-y-3">
          <h4 className="font-medium flex items-center gap-2">
            <TestTube className="h-4 w-4" />
            Migration Status
          </h4>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <span className="text-sm">Unified Sessions</span>
              <Badge variant={shouldUseUnifiedSessions ? 'default' : 'secondary'}>
                {shouldUseUnifiedSessions ? 'Active' : 'Legacy'}
              </Badge>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <span className="text-sm">Social Play</span>
              <Badge variant={shouldMigrateSocialPlay ? 'default' : 'secondary'}>
                {shouldMigrateSocialPlay ? 'Migrated' : 'Legacy'}
              </Badge>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <span className="text-sm">Training</span>
              <Badge variant={shouldMigrateTraining ? 'default' : 'secondary'}>
                {shouldMigrateTraining ? 'Migrated' : 'Legacy'}
              </Badge>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <span className="text-sm">Match</span>
              <Badge variant={shouldMigrateMatch ? 'default' : 'secondary'}>
                {shouldMigrateMatch ? 'Migrated' : 'Legacy'}
              </Badge>
            </div>
          </div>
        </div>

        {/* Feature Flag Controls */}
        <div className="space-y-4">
          <h4 className="font-medium">Manual Overrides</h4>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <span className="text-sm font-medium">Unified Sessions</span>
                <p className="text-xs text-muted-foreground">Use new unified sessions system</p>
              </div>
              <Switch
                checked={flags.useUnifiedSessions}
                onCheckedChange={() => handleFlagToggle('useUnifiedSessions')}
              />
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <span className="text-sm font-medium">Social Play Migration</span>
                <p className="text-xs text-muted-foreground">Migrate social play to unified system</p>
              </div>
              <Switch
                checked={flags.enableSocialPlayMigration}
                onCheckedChange={() => handleFlagToggle('enableSocialPlayMigration')}
              />
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <span className="text-sm font-medium">Training Migration</span>
                <p className="text-xs text-muted-foreground">Migrate training to unified system</p>
              </div>
              <Switch
                checked={flags.enableTrainingMigration}
                onCheckedChange={() => handleFlagToggle('enableTrainingMigration')}
              />
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <span className="text-sm font-medium">Match Migration</span>
                <p className="text-xs text-muted-foreground">Migrate matches to unified system</p>
              </div>
              <Switch
                checked={flags.enableMatchMigration}
                onCheckedChange={() => handleFlagToggle('enableMatchMigration')}
              />
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <span className="text-sm font-medium">Real-time Updates</span>
                <p className="text-xs text-muted-foreground">Enable real-time session updates</p>
              </div>
              <Switch
                checked={flags.enableRealTimeUpdates}
                onCheckedChange={() => handleFlagToggle('enableRealTimeUpdates')}
              />
            </div>
          </div>
        </div>

        {/* A/B Test Info */}
        <div className="space-y-3">
          <h4 className="font-medium">A/B Tests</h4>
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <span className="text-sm">UI Variant</span>
            <Badge variant="outline">{uiVariant}</Badge>
          </div>
        </div>

        {/* Reset Button */}
        <Button 
          onClick={handleReset} 
          variant="outline" 
          className="w-full"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Reset to Calculated Values
        </Button>
      </CardContent>
    </Card>
  );
};