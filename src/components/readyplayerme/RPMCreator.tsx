
import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { User, Loader2, AlertCircle } from 'lucide-react';
import { useRPMMessageHandler } from '@/hooks/useRPMMessageHandler';
import { RPMFrameConfig } from '@/types/readyPlayerMe';

interface RPMCreatorProps {
  onAvatarCreated: (avatarId: string) => void;
  onCancel?: () => void;
  userType?: 'player' | 'coach';
  config?: RPMFrameConfig;
  className?: string;
}

export function RPMCreator({ 
  onAvatarCreated, 
  onCancel, 
  userType = 'player',
  config = {},
  className = '' 
}: RPMCreatorProps) {
  const [isFrameReady, setIsFrameReady] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Build iframe URL with config
  const buildCreatorUrl = () => {
    const baseUrl = 'https://vibe.readyplayer.me/avatar';
    const params = new URLSearchParams({
      frameApi: 'true',
      clearCache: config.clearCache ? 'true' : 'false',
      bodyType: config.bodyType || 'halfbody',
      quickStart: config.quickStart ? 'true' : 'false',
      language: config.language || 'en'
    });
    
    return `${baseUrl}?${params.toString()}`;
  };

  // Handle RPM events
  useRPMMessageHandler({
    onFrameReady: () => {
      console.log('RPM frame is ready');
      setIsFrameReady(true);
      setError(null);
    },
    onAvatarExported: (avatarData) => {
      console.log('Avatar created:', avatarData);
      setIsCreating(false);
      onAvatarCreated(avatarData.id);
    },
    onError: (errorMessage) => {
      console.error('RPM error:', errorMessage);
      setError(errorMessage);
      setIsCreating(false);
    }
  });

  const getUserTypeLabel = () => {
    return userType === 'coach' ? 'Professional Coach' : 'Player';
  };

  const getUserTypeBadge = () => {
    return userType === 'coach' ? 'PRO' : 'PLAYER';
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Create 3D Avatar
          <Badge variant={userType === 'coach' ? "default" : "secondary"}>
            {getUserTypeBadge()}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Loading State */}
        {!isFrameReady && !error && (
          <div className="flex items-center justify-center h-96 border rounded-lg">
            <div className="text-center space-y-2">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-tennis-green-medium" />
              <p className="text-sm text-gray-600">Loading avatar creator...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="flex items-center justify-center h-96 border rounded-lg">
            <div className="text-center space-y-2">
              <AlertCircle className="h-8 w-8 mx-auto text-red-500" />
              <p className="text-sm text-red-600">{error}</p>
              <Button 
                onClick={() => {
                  setError(null);
                  if (iframeRef.current) {
                    iframeRef.current.src = buildCreatorUrl();
                  }
                }}
                variant="outline"
                size="sm"
              >
                Try Again
              </Button>
            </div>
          </div>
        )}

        {/* Avatar Creator iframe */}
        <div className="relative">
          <iframe
            ref={iframeRef}
            src={buildCreatorUrl()}
            className={`w-full h-96 rounded-lg border ${!isFrameReady ? 'hidden' : ''}`}
            allow="camera *; microphone *"
            title={`Create ${getUserTypeLabel()} Avatar`}
          />
          
          {/* Creating overlay */}
          {isCreating && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
              <div className="text-center space-y-2 text-white">
                <Loader2 className="h-8 w-8 animate-spin mx-auto" />
                <p className="text-sm">Creating your avatar...</p>
              </div>
            </div>
          )}
        </div>

        {/* Info */}
        {isFrameReady && (
          <div className="text-sm text-gray-600 space-y-1">
            <p>• Customize your appearance and style</p>
            <p>• Take a photo or use the camera for face scanning</p>
            {userType === 'coach' && (
              <p>• Professional coaching appearance recommended</p>
            )}
            <p>• Click "Done" in the creator when finished</p>
          </div>
        )}

        {/* Cancel Button */}
        {onCancel && (
          <Button 
            onClick={onCancel} 
            variant="outline" 
            className="w-full"
            disabled={isCreating}
          >
            Cancel
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
