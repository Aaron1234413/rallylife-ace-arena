
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BookOpen, Clock, Target, CheckCircle, User, Calendar } from 'lucide-react';
import { useTrainingAssignments, useCompleteTrainingAssignment } from '@/hooks/useTrainingAssignments';
import { toast } from 'sonner';
import { format } from 'date-fns';

export function TrainingAssignmentsList() {
  const { data: assignments, isLoading } = useTrainingAssignments();
  const completeAssignment = useCompleteTrainingAssignment();

  const handleCompleteAssignment = async (assignmentId: string) => {
    try {
      const result = await completeAssignment.mutateAsync({ 
        assignmentId,
        playerFeedback: 'Completed via dashboard' 
      });
      
      if (result.success) {
        toast.success(`Assignment completed! Earned ${result.xp_earned || 0} XP and ${result.tokens_earned || 0} tokens`);
      } else {
        toast.error(result.error || 'Failed to complete assignment');
      }
    } catch (error) {
      console.error('Error completing assignment:', error);
      toast.error('Failed to complete assignment');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'assigned': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-orange-100 text-orange-800';
      case 'expert': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">Loading training assignments...</p>
        </CardContent>
      </Card>
    );
  }

  const activeAssignments = assignments?.filter(a => a.status !== 'completed') || [];
  const completedAssignments = assignments?.filter(a => a.status === 'completed') || [];

  return (
    <div className="space-y-6">
      {/* Active Assignments */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Active Training Assignments
          </CardTitle>
        </CardHeader>
        <CardContent>
          {activeAssignments.length === 0 ? (
            <div className="text-center py-8">
              <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No Active Assignments</h3>
              <p className="text-muted-foreground">
                Your coach hasn't assigned any training plans yet. Check back soon!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {activeAssignments.map((assignment) => (
                <Card key={assignment.id} className="relative">
                  <CardContent className="p-4">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <h3 className="font-semibold">{assignment.training_plans?.name}</h3>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <User className="h-3 w-3" />
                            Coach: {assignment.profiles?.full_name || 'Unknown Coach'}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Badge className={getStatusColor(assignment.status)}>
                            {assignment.status.replace('_', ' ')}
                          </Badge>
                          <Badge className={getDifficultyColor(assignment.training_plans?.difficulty_level || 'intermediate')}>
                            {assignment.training_plans?.difficulty_level}
                          </Badge>
                        </div>
                      </div>

                      {assignment.training_plans?.description && (
                        <p className="text-sm text-muted-foreground">
                          {assignment.training_plans.description}
                        </p>
                      )}

                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {assignment.training_plans?.estimated_duration_minutes || 60}m
                        </div>
                        {assignment.due_date && (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Due: {format(new Date(assignment.due_date), 'MMM dd, yyyy')}
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Target className="h-3 w-3" />
                          Assigned: {format(new Date(assignment.assigned_date), 'MMM dd, yyyy')}
                        </div>
                      </div>

                      {assignment.training_plans?.skills_focus && assignment.training_plans.skills_focus.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {assignment.training_plans.skills_focus.map((skill, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      )}

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span>{assignment.completion_percentage || 0}%</span>
                        </div>
                        <Progress value={assignment.completion_percentage || 0} className="h-2" />
                      </div>

                      {assignment.coach_notes && (
                        <div className="p-3 bg-muted/50 rounded-lg">
                          <p className="text-sm font-medium mb-1">Coach Notes:</p>
                          <p className="text-sm text-muted-foreground">{assignment.coach_notes}</p>
                        </div>
                      )}

                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleCompleteAssignment(assignment.id)}
                          disabled={completeAssignment.isPending || assignment.status === 'completed'}
                          className="bg-tennis-green-dark hover:bg-tennis-green-medium"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          {completeAssignment.isPending ? 'Completing...' : 'Mark Complete'}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Completed Assignments */}
      {completedAssignments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Completed Assignments ({completedAssignments.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {completedAssignments.slice(0, 5).map((assignment) => (
                <div key={assignment.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div>
                    <h4 className="font-medium">{assignment.training_plans?.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      Completed: {assignment.completed_at ? format(new Date(assignment.completed_at), 'MMM dd, yyyy') : 'Unknown'}
                    </p>
                  </div>
                  <Badge className="bg-green-100 text-green-800">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Complete
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
