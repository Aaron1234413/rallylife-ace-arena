
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Target, MessageSquare, TrendingUp, Clock } from 'lucide-react';
import { TrainingAssignmentsList } from '@/components/player/TrainingAssignmentsList';
import { useTrainingAssignments } from '@/hooks/useTrainingAssignments';
import { useCoachingChallenges } from '@/hooks/useCoachingChallenges';

export function PlayerInteractionPanel() {
  const { data: assignments } = useTrainingAssignments();
  const { data: challenges } = useCoachingChallenges();

  const activeAssignments = assignments?.filter(a => a.status !== 'completed').length || 0;
  const activeChallenges = challenges?.filter(c => c.status === 'active').length || 0;
  
  // Calculate completed assignments this week from real data
  const completedThisWeek = assignments?.filter(a => {
    if (!a.completed_at) return false;
    const completedDate = new Date(a.completed_at);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return completedDate > weekAgo;
  }).length || 0;

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
                <p className="text-sm font-medium">Pending Assignments</p>
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
                <p className="text-sm font-medium">Completed This Week</p>
                <p className="text-2xl font-bold text-orange-600">{completedThisWeek}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Assignments Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent Training Updates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {assignments?.slice(0, 3).map((assignment) => (
              <div key={assignment.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div>
                  <p className="font-medium">{assignment.training_plans?.name}</p>
                  <p className="text-sm text-muted-foreground">
                    From Coach {assignment.profiles?.full_name || 'Unknown Coach'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={assignment.status === 'completed' ? 'default' : 'secondary'}>
                    {assignment.status.replace('_', ' ')}
                  </Badge>
                  {assignment.completion_percentage !== undefined && (
                    <span className="text-sm text-muted-foreground">
                      {assignment.completion_percentage}%
                    </span>
                  )}
                </div>
              </div>
            ))}
            
            {(!assignments || assignments.length === 0) && (
              <p className="text-center text-muted-foreground py-4">
                No training assignments yet. Your coach will assign training plans when you start working together!
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Full Training Assignments List */}
      <TrainingAssignmentsList />
    </div>
  );
}
