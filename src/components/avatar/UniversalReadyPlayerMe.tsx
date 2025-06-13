
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { User, Edit, Eye } from 'lucide-react';
import { ReadyPlayerMeCreatorAPI } from './ReadyPlayerMeCreatorAPI';
import { ReadyPlayerMeAvatar } from './ReadyPlayerMeAvatar';
import { useReadyPlayerMe } from '@/hooks/useReadyPlayerMe';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface UniversalReadyPlayerMeProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showCreator?: boolean;
}

export function UniversalReadyPlayerMe({ 
  className = '', 
  size = 'md',
  showCreator = true 
}: UniversalReadyPlayerMeProps) {
  const { user } = useAuth();
  const { avatarUrl, loading } = useReadyPlayerMe();
  const [isCreating, setIsCreating] = useState(false);
  const [profile, setProfile] = useState<any>(null);

  // Fetch user profile
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.id) return;

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (!error) {
          setProfile(data);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };

    fetchProfile();
  }, [user?.id]);

  const handleAvatarSaved = async (newAvatarUrl: string) => {
    setIsCreating(false);
    // The hook will automatically refresh the avatar URL
  };

  const getUserTypeLabel = () => {
    return profile?.role === 'coach' ? 'Coach' : 'Player';
  };

  const getUserTypeBadge = () => {
    return profile?.role === 'coach' ? 'PRO' : 'PLAYER';
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Loading Avatar...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Avatar display only (no creator)
  if (!showCreator) {
    return (
      <div className={`relative ${className}`}>
        {avatarUrl ? (
          <ReadyPlayerMeAvatar 
            avatarUrl={avatarUrl}
            size={size}
          />
        ) : (
          <div className={`${size === 'sm' ? 'w-16 h-16' : size === 'md' ? 'w-24 h-24' : 'w-32 h-32'} rounded-full bg-gray-200 flex items-center justify-center border-2 border-tennis-green-light`}>
            <User className="h-6 w-6 text-gray-500" />
          </div>
        )}
        
        {/* User type indicator */}
        <div className="absolute -top-1 -right-1">
          <Badge variant={profile?.role === 'coach' ? "default" : "secondary"} className="text-xs">
            {getUserTypeBadge()}
          </Badge>
        </div>
      </div>
    );
  }

  // Full creator interface
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Ready Player Me Avatar
          <Badge variant={profile?.role === 'coach' ? "default" : "secondary"}>
            {getUserTypeLabel()}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isCreating ? (
          <div className="space-y-4">
            {/* Current Avatar Display */}
            {avatarUrl && (
              <div className="text-center space-y-2">
                <h4 className="font-medium">Your Current 3D Avatar</h4>
                <div className="w-32 h-32 mx-auto">
                  <ReadyPlayerMeAvatar 
                    avatarUrl={avatarUrl}
                    size="lg"
                  />
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button 
                onClick={() => setIsCreating(true)} 
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
                    Create 3D Avatar
                  </>
                )}
              </Button>
              
              {avatarUrl && (
                <Button variant="outline" size="icon" title="Preview Avatar">
                  <Eye className="h-4 w-4" />
                </Button>
              )}
            </div>

            {/* Info */}
            <div className="text-sm text-gray-600 space-y-1">
              <p>• Create a personalized 3D avatar with Ready Player Me API</p>
              <p>• Choose from tennis-specific clothing and equipment</p>
              <p>• Future: Custom RallyPointX gear and branded items</p>
              {profile?.role === 'coach' && (
                <p>• Professional coaching appearance options</p>
              )}
            </div>
          </div>
        ) : (
          <ReadyPlayerMeCreatorAPI
            currentAvatarUrl={avatarUrl}
            onAvatarSaved={handleAvatarSaved}
          />
        )}
      </CardContent>
    </Card>
  );
}
