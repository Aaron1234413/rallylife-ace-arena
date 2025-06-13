
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { User, Download, Edit } from 'lucide-react';

interface ReadyPlayerMeCreatorProps {
  currentAvatarUrl?: string;
  onAvatarSaved: (avatarUrl: string) => void;
  className?: string;
}

export function ReadyPlayerMeCreator({ 
  currentAvatarUrl, 
  onAvatarSaved, 
  className = '' 
}: ReadyPlayerMeCreatorProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(currentAvatarUrl || '');
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.source !== 'readyplayerme') return;
      
      console.log('Ready Player Me event:', event.data);

      if (event.data.eventName === 'v1.avatar.exported') {
        const newAvatarUrl = event.data.data.url;
        console.log('Avatar exported:', newAvatarUrl);
        
        // Extract the avatar ID from the full URL
        const avatarId = newAvatarUrl.split('/').pop()?.replace('.glb', '');
        if (avatarId) {
          setAvatarUrl(avatarId);
          onAvatarSaved(avatarId);
          setIsCreating(false);
          
          toast({
            title: "Avatar Created!",
            description: "Your Ready Player Me avatar has been created successfully.",
          });
        }
      }

      if (event.data.eventName === 'v1.frame.ready') {
        console.log('Ready Player Me frame is ready');
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onAvatarSaved, toast]);

  const startCreation = () => {
    setIsCreating(true);
  };

  const cancelCreation = () => {
    setIsCreating(false);
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Ready Player Me Avatar
          <Badge variant="secondary">3D Avatar</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isCreating ? (
          <div className="space-y-4">
            {/* Current Avatar Display */}
            {avatarUrl && (
              <div className="text-center space-y-2">
                <h4 className="font-medium">Your Current Avatar</h4>
                <div className="w-32 h-32 mx-auto">
                  <iframe
                    src={`https://models.readyplayer.me/${avatarUrl}?morphTargets=ARKit,Oculus Visemes&textureAtlas=1024&lod=0`}
                    className="w-full h-full rounded-lg border"
                    title="Current Avatar"
                  />
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button 
                onClick={startCreation} 
                className="flex-1"
                variant={avatarUrl ? "outline" : "default"}
              >
                {avatarUrl ? (
                  <>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Avatar
                  </>
                ) : (
                  <>
                    <User className="h-4 w-4 mr-2" />
                    Create Avatar
                  </>
                )}
              </Button>
            </div>

            {/* Info */}
            <div className="text-sm text-gray-600 space-y-1">
              <p>• Create a personalized 3D avatar</p>
              <p>• Customize appearance and clothing</p>
              <p>• Professional coaching items available</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Avatar Creator Interface */}
            <div className="w-full h-96">
              <iframe
                ref={iframeRef}
                src="https://vibe.readyplayer.me/avatar?frameApi"
                className="w-full h-full rounded-lg border"
                allow="camera *; microphone *"
                title="Create Ready Player Me Avatar"
              />
            </div>

            {/* Cancel Button */}
            <Button 
              onClick={cancelCreation} 
              variant="outline" 
              className="w-full"
            >
              Cancel
            </Button>

            <div className="text-sm text-gray-600">
              <p>Follow the steps in the avatar creator above to create your personalized coaching avatar.</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
