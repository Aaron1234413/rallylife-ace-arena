
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  Activity, 
  BarChart3,
  ArrowLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ActivityLogForm } from '@/components/activities/ActivityLogForm';
import { ActivityFeed } from '@/components/activities/ActivityFeed';
import { ActivityStats } from '@/components/activities/ActivityStats';
import { QuickActionButtons } from '@/components/activities/QuickActionButtons';

const Activities = () => {
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="min-h-screen bg-tennis-green-bg">
      {/* Mobile-First Header */}
      <div className="sticky top-0 z-50 bg-tennis-green-bg border-b border-tennis-green-light p-3 sm:p-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => navigate('/')}
                className="flex items-center gap-2 flex-shrink-0"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Back</span>
              </Button>
              
              <div className="min-w-0 flex-1">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-tennis-green-dark">
                  Activities
                </h1>
                <p className="text-tennis-green-medium text-sm sm:text-base hidden sm:block">
                  Track and analyze your tennis activities
                </p>
              </div>
            </div>
            
            <Button
              onClick={() => setShowForm(!showForm)}
              size="sm"
              className="flex items-center gap-2 bg-tennis-green-dark hover:bg-tennis-green-medium flex-shrink-0"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">{showForm ? 'Hide' : 'Log'}</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-3 sm:p-4 max-w-6xl mx-auto space-y-4 sm:space-y-6">
        {/* Activity Log Form */}
        {showForm && (
          <ActivityLogForm 
            onSuccess={() => setShowForm(false)}
            className="border-tennis-green-light"
          />
        )}

        {/* Quick Actions */}
        <QuickActionButtons 
          className="border-tennis-green-light"
        />

        {/* Main Content Tabs */}
        <Tabs defaultValue="feed" className="space-y-4 sm:space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="feed" className="flex items-center gap-2 text-sm">
              <Activity className="h-4 w-4" />
              <span className="hidden sm:inline">Activity </span>Feed
            </TabsTrigger>
            <TabsTrigger value="stats" className="flex items-center gap-2 text-sm">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Statistics</span>
              <span className="sm:hidden">Stats</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="feed" className="space-y-4 sm:space-y-6">
            <ActivityFeed 
              limit={50} 
              showFilters={true}
              className="border-tennis-green-light"
            />
          </TabsContent>

          <TabsContent value="stats" className="space-y-4 sm:space-y-6">
            <div className="grid gap-4 sm:gap-6">
              <ActivityStats className="border-tennis-green-light" />
              
              {/* Additional Stats Cards */}
              <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
                <Card className="border-tennis-green-light">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Activity Goals</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-sm">
                      Set and track your activity goals here. Feature coming soon!
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-tennis-green-light">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Performance Trends</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-sm">
                      View your performance trends over time. Feature coming soon!
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Activities;
