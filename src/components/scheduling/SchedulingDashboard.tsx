
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CalendarIcon, Plus } from 'lucide-react';
import { LessonScheduler } from './LessonScheduler';
import { LessonsList } from './LessonsList';
import { useAuth } from '@/hooks/useAuth';

export function SchedulingDashboard() {
  const { user } = useAuth();
  const isCoach = user?.user_metadata?.role === 'coach';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Lesson Scheduling</h1>
      </div>

      <Tabs defaultValue="lessons" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="lessons" className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4" />
            My Lessons
          </TabsTrigger>
          {isCoach && (
            <TabsTrigger value="schedule" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Schedule Lesson
            </TabsTrigger>
          )}
        </TabsList>
        
        <TabsContent value="lessons" className="space-y-4">
          <LessonsList />
        </TabsContent>
        
        {isCoach && (
          <TabsContent value="schedule" className="space-y-4">
            <LessonScheduler />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
