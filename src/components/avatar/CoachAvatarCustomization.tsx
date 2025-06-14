
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CoachRPMInterface } from '@/components/readyplayerme/CoachRPMInterface';
import { CoachAvatarDisplay } from './CoachAvatarDisplay';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function CoachAvatarCustomization() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Coach Avatar</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="3d-avatar" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="3d-avatar">3D Avatar</TabsTrigger>
              <TabsTrigger value="professional-gear">Professional Gear</TabsTrigger>
            </TabsList>
            
            <TabsContent value="3d-avatar" className="space-y-4">
              <CoachRPMInterface />
            </TabsContent>
            
            <TabsContent value="professional-gear" className="space-y-4">
              <CoachAvatarDisplay />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
