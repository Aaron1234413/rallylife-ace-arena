
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RPMWrapper } from './RPMWrapper';
import { useReadyPlayerMe } from '@/hooks/useReadyPlayerMe';

export function CoachRPMInterface() {
  const { avatarId, loading, saveAvatarId } = useReadyPlayerMe();

  const handleAvatarSaved = async (newAvatarId: string) => {
    await saveAvatarId(newAvatarId);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Professional 3D Avatar</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse h-32 bg-gray-200 rounded"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <RPMWrapper
      currentAvatarId={avatarId}
      onAvatarSaved={handleAvatarSaved}
      userType="coach"
      showCreator={true}
      size="lg"
    />
  );
}
