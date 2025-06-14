
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { User, Edit, Eye } from 'lucide-react';
import { RPMCreator } from './RPMCreator';
import { RPMDisplay } from './RPMDisplay';
import { useToast } from '@/hooks/use-toast';

interface RPMWrapperProps {
  currentAvatarId?: string;
  onAvatarSaved: (avatarId: string) => void;
  userType?: 'player' | 'coach';
  showCreator?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function RPMWrapper({ 
  currentAvatarId, 
  onAvatarSaved, 
  userType = 'player',
  showCreator = true,
  size = 'md',
  className = '' 
}: RPMWrapperProps) {
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();

  const handleAvatarCreated = (avatarId: string) => {
    onAvatarSaved(avatarId);
    setIsCreating(false);
    
    toast({
      title: "Avatar Created!",
      description: `Your ${userType} avatar has been created successfully.`,
    });
  };

  const getUserTypeLabel = () => {
    return userType === 'coach' ? 'Coach Avatar' : 'Player Avatar';
  };

  const getUserTypeBadge = () => {
    return userType === 'coach' ? 'PRO' : 'PLAYER';
  };

  // Display only mode
  if (!showCreator) {
    return (
      <div className={`relative ${className}`}>
        <RPMDisplay 
          avatarId={currentAvatarId}
          size={size}
          userType={userType}
        />
        
        {/* User type indicator */}
        <div className="absolute -top-1 -right-1">
          <Badge variant={userType === 'coach' ? "default" : "secondary"} className="text-xs">
            {getUserTypeBadge()}
          </Badge>
        </div>
      </div>
    );
  }

  // Full interface mode
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          {getUserTypeLabel()}
          <Badge variant={userType === 'coach' ? "default" : "secondary"}>
            {getUserTypeBadge()}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isCreating ? (
          <div className="space-y-4">
            {/* Current Avatar Display */}
            {currentAvatarId && (
              <div className="text-center space-y-2">
                <h4 className="font-medium">Your Current 3D Avatar</h4>
                <div className="flex justify-center">
                  <RPMDisplay 
                    avatarId={currentAvatarId}
                    size="lg"
                    userType={userType}
                  />
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button 
                onClick={() => setIsCreating(true)} 
                className="flex-1"
                variant={currentAvatarId ? "outline" : "default"}
              >
                {currentAvatarId ? (
                  <>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Avatar
                  </>
                ) : (
                  <>
                    <User className="h-4 w-4 mr-2" />
                    Create 3D Avatar
                  </>
                )}
              </Button>
              
              {currentAvatarId && (
                <Button variant="outline" size="icon" title="Preview Avatar">
                  <Eye className="h-4 w-4" />
                </Button>
              )}
            </div>

            {/* Info */}
            <div className="text-sm text-gray-600 space-y-1">
              <p>• Create a personalized 3D avatar</p>
              <p>• Customize appearance and style</p>
              {userType === 'coach' && (
                <p>• Professional coaching appearance</p>
              )}
            </div>
          </div>
        ) : (
          <RPMCreator
            onAvatarCreated={handleAvatarCreated}
            onCancel={() => setIsCreating(false)}
            userType={userType}
          />
        )}
      </CardContent>
    </Card>
  );
}
