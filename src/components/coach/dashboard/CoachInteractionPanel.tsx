
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UserPlus, BookOpen, Target, MessageSquare, TrendingUp } from 'lucide-react';
import { TrainingPlanManager } from '@/components/coach/TrainingPlanManager';
import { AssignTrainingDialog } from '@/components/coach/AssignTrainingDialog';
import { useMessageNavigation } from '@/hooks/useMessageNavigation';
import { useTrainingAssignments } from '@/hooks/useTrainingAssignments';
import { useCoachingChallenges } from '@/hooks/useCoachingChallenges';
import { useProgressReports } from '@/hooks/useProgressReports';

export function CoachInteractionPanel() {
  const { data: assignments } = useTrainingAssignments();
  const { data: challenges } = useCoachingChallenges();
  const { data: reports } = useProgressReports();

  const activeAssignments = assignments?.filter(a => a.status !== 'completed').length || 0;
  const activeChallenges = challenges?.filter(c => c.status === 'active').length || 0;
  const unreadReports = reports?.filter(r => !r.coach_responded_at).length || 0;

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BookOpen className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium">Active Assignments</p>
                <p className="text-2xl font-bold text-blue-600">{activeAssignments}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Target className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium">Active Challenges</p>
                <p className="text-2xl font-bold text-green-600">{activeChallenges}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <TrendingUp className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium">Unread Reports</p>
                <p className="text-2xl font-bold text-orange-600">{unreadReports}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <AssignTrainingDialog
              trigger={
                <Button className="bg-tennis-green-dark hover:bg-tennis-green-medium">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Assign Training Plan
                </Button>
              }
            />
            <Button variant="outline">
              <Target className="h-4 w-4 mr-2" />
              Create Challenge
            </Button>
            <Button 
              variant="outline"
              onClick={() => {
                // For demo purposes - could open a client selector dialog
                console.log('Opening client messaging interface');
              }}
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Send Message
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {assignments?.slice(0, 3).map((assignment) => (
              <div key={assignment.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div>
                  <p className="font-medium">{assignment.training_plans?.name}</p>
                  <p className="text-sm text-muted-foreground">
                    Assigned to {assignment.player_profiles?.full_name || 'Unknown Player'}
                  </p>
                </div>
                <Badge variant={assignment.status === 'completed' ? 'default' : 'secondary'}>
                  {assignment.status.replace('_', ' ')}
                </Badge>
              </div>
            ))}
            
            {(!assignments || assignments.length === 0) && (
              <p className="text-center text-muted-foreground py-4">
                No recent activity. Start by assigning training plans to your players!
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Training Plan Management */}
      <TrainingPlanManager />
    </div>
  );
}
