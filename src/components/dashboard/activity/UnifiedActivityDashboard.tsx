
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Activity, 
  Filter,
  Calendar,
  TrendingUp,
  ChevronDown,
  RefreshCw
} from 'lucide-react';
import { ActivityTimeline } from './ActivityTimeline';
import { ActivityAnalytics } from './ActivityAnalytics';
import { useActivityLogs } from '@/hooks/useActivityLogs';
import { useFeedData } from '@/hooks/useFeedData';

interface UnifiedActivityDashboardProps {
  className?: string;
}

export function UnifiedActivityDashboard({ className }: UnifiedActivityDashboardProps) {
  const [activeTab, setActiveTab] = useState<'timeline' | 'analytics'>('timeline');
  const [timeFilter, setTimeFilter] = useState<'today' | 'week' | 'month' | 'all'>('week');
  const [activityFilter, setActivityFilter] = useState<string>('all');
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  const { activities, stats, loading: activitiesLoading, refreshData } = useActivityLogs();
  const { feedPosts, loading: feedLoading } = useFeedData();

  const handleRefresh = async () => {
    await refreshData();
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              <CardTitle>Activity Dashboard</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                className="sm:hidden"
                onClick={() => setIsCollapsed(!isCollapsed)}
              >
                <ChevronDown className={`h-4 w-4 transition-transform ${isCollapsed ? 'rotate-180' : ''}`} />
              </Button>
            </div>
            
            <div className={`flex flex-col sm:flex-row gap-2 ${isCollapsed ? 'hidden sm:flex' : 'flex'}`}>
              {/* Tab Selection */}
              <div className="flex bg-muted rounded-lg p-1">
                <Button
                  variant={activeTab === 'timeline' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setActiveTab('timeline')}
                  className="text-xs"
                >
                  Timeline
                </Button>
                <Button
                  variant={activeTab === 'analytics' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setActiveTab('analytics')}
                  className="text-xs"
                >
                  Analytics
                </Button>
              </div>
              
              {/* Filters */}
              <Select value={timeFilter} onValueChange={(value: any) => setTimeFilter(value)}>
                <SelectTrigger className="w-full sm:w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="all">All Time</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={activityFilter} onValueChange={setActivityFilter}>
                <SelectTrigger className="w-full sm:w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Activities</SelectItem>
                  <SelectItem value="match">Matches</SelectItem>
                  <SelectItem value="training">Training</SelectItem>
                  <SelectItem value="lesson">Lessons</SelectItem>
                  <SelectItem value="social">Social</SelectItem>
                </SelectContent>
              </Select>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={activitiesLoading}
                className="w-full sm:w-auto"
              >
                <RefreshCw className={`h-4 w-4 mr-1 ${activitiesLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Content */}
      {activeTab === 'timeline' ? (
        <ActivityTimeline
          activities={activities}
          feedPosts={feedPosts}
          timeFilter={timeFilter}
          activityFilter={activityFilter}
          loading={activitiesLoading || feedLoading}
        />
      ) : (
        <ActivityAnalytics
          activities={activities}
          stats={stats}
          timeFilter={timeFilter}
          loading={activitiesLoading}
        />
      )}
    </div>
  );
}
