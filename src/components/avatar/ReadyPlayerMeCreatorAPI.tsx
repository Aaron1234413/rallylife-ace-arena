
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useReadyPlayerMeAPI } from '@/hooks/useReadyPlayerMeAPI';
import { ReadyPlayerMeAvatar } from './ReadyPlayerMeAvatar';
import { User, Save, RefreshCw, Wifi, AlertCircle, CheckCircle, ExternalLink } from 'lucide-react';

interface ReadyPlayerMeCreatorAPIProps {
  currentAvatarUrl?: string;
  onAvatarSaved?: (avatarUrl: string) => void;
}

export function ReadyPlayerMeCreatorAPI({ 
  currentAvatarUrl, 
  onAvatarSaved 
}: ReadyPlayerMeCreatorAPIProps) {
  const { 
    loading, 
    avatarUrl, 
    connectionStatus,
    testConnection,
    getAvatarUrl,
    saveAvatarUrl,
    validateAvatar
  } = useReadyPlayerMeAPI();

  const [localAvatarUrl, setLocalAvatarUrl] = useState<string>(currentAvatarUrl || '');

  useEffect(() => {
    getAvatarUrl();
  }, []);

  useEffect(() => {
    if (avatarUrl) {
      setLocalAvatarUrl(avatarUrl);
    }
  }, [avatarUrl]);

  const handleAvatarChange = async (newAvatarUrl: string) => {
    console.log('Avatar changed:', newAvatarUrl);
    setLocalAvatarUrl(newAvatarUrl);
    
    // Auto-save the new avatar
    try {
      await saveAvatarUrl(newAvatarUrl);
      if (onAvatarSaved) {
        onAvatarSaved(newAvatarUrl);
      }
    } catch (error) {
      console.error('Failed to save avatar:', error);
    }
  };

  const handleTestConnection = async () => {
    await testConnection();
  };

  const handleValidateAvatar = async () => {
    if (localAvatarUrl) {
      await validateAvatar(localAvatarUrl);
    }
  };

  const getConnectionStatusIcon = () => {
    switch (connectionStatus) {
      case 'connected':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Wifi className="h-4 w-4 text-gray-400" />;
    }
  };

  const getConnectionStatusText = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'Connected';
      case 'error':
        return 'Connection Error';
      default:
        return 'Unknown';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Ready Player Me Avatar Creator
          <div className="ml-auto flex items-center gap-2">
            {getConnectionStatusIcon()}
            <span className="text-sm text-muted-foreground">
              {getConnectionStatusText()}
            </span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Connection Test Section */}
        <div className="border rounded-lg p-4 bg-gray-50">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Ready Player Me Service</h4>
              <p className="text-sm text-muted-foreground">
                Test connection to Ready Player Me avatar creation service
              </p>
            </div>
            <Button 
              onClick={handleTestConnection}
              disabled={loading}
              variant="outline"
              size="sm"
            >
              {loading ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Wifi className="h-4 w-4" />
              )}
              Test Connection
            </Button>
          </div>
        </div>

        {/* Avatar Creation Interface */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Create Your 3D Avatar</h3>
          
          {/* Current Avatar Display */}
          {localAvatarUrl && (
            <div className="text-center space-y-2">
              <h4 className="font-medium">Your Current Avatar</h4>
              <ReadyPlayerMeAvatar 
                avatarUrl={localAvatarUrl}
                size="lg"
              />
            </div>
          )}

          {/* Avatar Creator */}
          <div className="border rounded-lg p-4">
            <ReadyPlayerMeAvatar 
              onAvatarChange={handleAvatarChange}
              size="lg"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button 
            onClick={handleValidateAvatar}
            disabled={loading || !localAvatarUrl}
            variant="outline"
            className="flex-1"
          >
            {loading ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <CheckCircle className="h-4 w-4 mr-2" />
            )}
            Validate Avatar
          </Button>

          <Button 
            variant="outline" 
            onClick={() => window.open('https://readyplayer.me', '_blank')}
            size="icon"
            title="Open Ready Player Me Website"
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>

        {/* Info */}
        <div className="text-sm text-gray-600 space-y-1">
          <p>• Create a personalized 3D avatar using Ready Player Me</p>
          <p>• Your avatar will be automatically saved when created</p>
          <p>• The avatar will be used throughout the RallyLife application</p>
          <p>• Test the connection first to ensure proper communication</p>
        </div>
      </CardContent>
    </Card>
  );
}
