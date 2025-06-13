
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  Activity, 
  BarChart3
} from 'lucide-react';
import { ActivityLogForm } from '@/components/activities/ActivityLogForm';
import { ActivityFeed } from '@/components/activities/ActivityFeed';
import { ActivityStats } from '@/components/activities/ActivityStats';
import { QuickActionButtons } from '@/components/activities/QuickActionButtons';

const Activities = () => {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="min-h-screen bg-tennis-green-bg p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-tennis-green-dark">
              Activity Management
            </h1>
            <p className="text-tennis-green-medium mt-1">
              Track and analyze your tennis activities
            </p>
          </div>
          
          <Button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 bg-tennis-green-dark hover:bg-tennis-green-medium"
          >
            <Plus className="h-4 w-4" />
            {showForm ? 'Hide Form' : 'Log Activity'}
          </Button>
        </div>

        <div className="space-y-6">
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
          <Tabs defaultValue="feed" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="feed" className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Activity Feed
              </TabsTrigger>
              <TabsTrigger value="stats" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Statistics
              </TabsTrigger>
            </TabsList>

            <TabsContent value="feed" className="space-y-6">
              <ActivityFeed 
                limit={50} 
                showFilters={true}
                className="border-tennis-green-light"
              />
            </TabsContent>

            <TabsContent value="stats" className="space-y-6">
              <div className="grid gap-6">
                <ActivityStats className="border-tennis-green-light" />
                
                {/* Additional Stats Cards */}
                <div className="grid gap-6 md:grid-cols-2">
                  <Card className="border-tennis-green-light">
                    <CardHeader>
                      <CardTitle>Activity Goals</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">
                        Set and track your activity goals here. Feature coming soon!
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="border-tennis-green-light">
                    <CardHeader>
                      <CardTitle>Performance Trends</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">
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
    </div>
  );
};

export default Activities;
