
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BookOpen, Clock, Target, CheckCircle, User, Calendar, Trophy, Zap } from 'lucide-react';
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
      <Card className="bg-white/95 backdrop-blur-sm border-tennis-green-bg/30 shadow-lg">
        <CardContent className="p-12 text-center">
          <div className="w-12 h-12 border-4 border-tennis-green-primary/20 border-t-tennis-green-primary rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-tennis-green-dark/70 text-lg">Loading training assignments...</p>
        </CardContent>
      </Card>
    );
  }

  const activeAssignments = assignments?.filter(a => a.status !== 'completed') || [];
  const completedAssignments = assignments?.filter(a => a.status === 'completed') || [];

  return (
    <div className="space-y-6">
      {/* Active Assignments */}
      <Card className="bg-white/95 backdrop-blur-sm border-tennis-green-bg/30 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-tennis-green-primary to-tennis-green-medium rounded-full flex items-center justify-center">
              <BookOpen className="h-4 w-4 text-white" />
            </div>
            <div>
              <span className="text-xl text-tennis-green-dark">Active Training Assignments</span>
              <p className="text-sm text-tennis-green-dark/70 font-normal">
                Your coach's training plans
              </p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {activeAssignments.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-tennis-green-bg/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <BookOpen className="h-8 w-8 text-tennis-green-medium" />
              </div>
              <h3 className="text-xl font-semibold text-tennis-green-dark mb-3">No Active Assignments</h3>
              <p className="text-tennis-green-dark/70 text-lg">
                Your coach hasn't assigned any training plans yet. Check back soon!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {activeAssignments.map((assignment) => (
                <Card key={assignment.id} className="bg-white/70 backdrop-blur-sm border-tennis-green-bg/20 shadow-md hover:shadow-lg transition-all duration-200">
                  <CardContent className="p-6">
                    <div className="space-y-5">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <h3 className="font-bold text-lg text-tennis-green-dark">
                            {assignment.training_plans?.name}
                          </h3>
                          <div className="flex items-center gap-2 text-sm text-tennis-green-dark/70">
                            <User className="h-4 w-4" />
                            Coach: {assignment.profiles?.full_name || 'Unknown Coach'}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Badge className={`${getStatusColor(assignment.status)} border-0 shadow-sm`}>
                            {assignment.status.replace('_', ' ')}
                          </Badge>
                          <Badge className={`${getDifficultyColor(assignment.training_plans?.difficulty_level || 'intermediate')} border-0 shadow-sm`}>
                            {assignment.training_plans?.difficulty_level}
                          </Badge>
                        </div>
                      </div>

                      {assignment.training_plans?.description && (
                        <p className="text-tennis-green-dark/80 leading-relaxed">
                          {assignment.training_plans.description}
                        </p>
                      )}

                      <div className="flex items-center gap-6 text-sm text-tennis-green-dark/70 bg-tennis-green-bg/10 rounded-lg p-3">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          {assignment.training_plans?.estimated_duration_minutes || 60}m
                        </div>
                        {assignment.due_date && (
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            Due: {format(new Date(assignment.due_date), 'MMM dd, yyyy')}
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <Target className="h-4 w-4" />
                          Assigned: {format(new Date(assignment.assigned_date), 'MMM dd, yyyy')}
                        </div>
                      </div>

                      {assignment.training_plans?.skills_focus && assignment.training_plans.skills_focus.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {assignment.training_plans.skills_focus.map((skill, index) => (
                            <Badge key={index} variant="secondary" className="bg-tennis-green-bg/20 text-tennis-green-dark border-tennis-green-bg text-xs">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      )}

                      <div className="space-y-3">
                        <div className="flex justify-between text-sm font-medium">
                          <span className="text-tennis-green-dark">Progress</span>
                          <span className="text-tennis-green-medium">{assignment.completion_percentage || 0}%</span>
                        </div>
                        <Progress value={assignment.completion_percentage || 0} className="h-3 bg-tennis-green-bg/20" />
                      </div>

                      {assignment.coach_notes && (
                        <div className="p-4 bg-gradient-to-r from-tennis-green-bg/20 to-tennis-green-bg/10 rounded-xl border border-tennis-green-bg/20">
                          <p className="text-sm font-semibold mb-2 text-tennis-green-dark flex items-center gap-2">
                            <Zap className="h-4 w-4" />
                            Coach Notes:
                          </p>
                          <p className="text-sm text-tennis-green-dark/80">{assignment.coach_notes}</p>
                        </div>
                      )}

                      <div className="pt-2">
                        <Button
                          onClick={() => handleCompleteAssignment(assignment.id)}
                          disabled={completeAssignment.isPending || assignment.status === 'completed'}
                          className="bg-gradient-to-r from-tennis-green-primary to-tennis-green-medium hover:from-tennis-green-medium hover:to-tennis-green-primary text-white shadow-md hover:shadow-lg transition-all duration-200"
                          size="lg"
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
        <Card className="bg-white/95 backdrop-blur-sm border-tennis-green-bg/30 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
                <Trophy className="h-4 w-4 text-white" />
              </div>
              <div>
                <span className="text-xl text-tennis-green-dark">Completed Assignments</span>
                <p className="text-sm text-tennis-green-dark/70 font-normal">
                  {completedAssignments.length} assignments completed
                </p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {completedAssignments.slice(0, 5).map((assignment) => (
                <div key={assignment.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50/50 to-white rounded-xl border border-green-100/50">
                  <div>
                    <h4 className="font-semibold text-tennis-green-dark">{assignment.training_plans?.name}</h4>
                    <p className="text-sm text-tennis-green-dark/70">
                      Completed: {assignment.completed_at ? format(new Date(assignment.completed_at), 'MMM dd, yyyy') : 'Unknown'}
                    </p>
                  </div>
                  <Badge className="bg-green-100 text-green-700 border-green-200 shadow-sm">
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
