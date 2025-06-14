
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlayerRPMInterface } from '@/components/readyplayerme/PlayerRPMInterface';
import { AvatarDisplay } from './AvatarDisplay';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function AvatarCustomization() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Player Avatar</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="3d-avatar" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="3d-avatar">3D Avatar</TabsTrigger>
              <TabsTrigger value="game-avatar">Game Items</TabsTrigger>
            </TabsList>
            
            <TabsContent value="3d-avatar" className="space-y-4">
              <PlayerRPMInterface />
            </TabsContent>
            
            <TabsContent value="game-avatar" className="space-y-4">
              <AvatarDisplay />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
