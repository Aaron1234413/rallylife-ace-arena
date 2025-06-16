import React, { useState } from 'react';
import { DashboardCard } from './DashboardCard';
import { ActivityFeed } from '@/components/activities/ActivityFeed';
import { ActivityStats } from '@/components/activities/ActivityStats';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Activity, BarChart3 } from 'lucide-react';

export function ActivityFeedPod() {
  console.log('[ActivityFeedPod] mounted');
  
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <DashboardCard
      title="Activity & Stats"
      priority="low"
      collapsible={true}
      isCollapsed={isCollapsed}
      onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
      icon={<Activity className="h-5 w-5 text-green-500" />}
    >
      <Tabs defaultValue="feed" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="feed" className="flex items-center gap-1">
            <Activity className="h-3 w-3" />
            Recent Activity
          </TabsTrigger>
          <TabsTrigger value="stats" className="flex items-center gap-1">
            <BarChart3 className="h-3 w-3" />
            Statistics
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="feed" className="mt-4">
          <ActivityFeed limit={5} showFilters={false} />
        </TabsContent>
        
        <TabsContent value="stats" className="mt-4">
          <ActivityStats />
        </TabsContent>
      </Tabs>
    </DashboardCard>
  );
}
