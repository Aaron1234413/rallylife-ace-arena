
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, BookOpen, Clock, Target, Dumbbell } from 'lucide-react';
import { useTrainingPlans, useCreateTrainingPlan } from '@/hooks/useTrainingPlans';
import { toast } from 'sonner';

export function TrainingPlanManager() {
  const { data: trainingPlans, isLoading } = useTrainingPlans();
  const createPlan = useCreateTrainingPlan();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    difficulty_level: 'intermediate',
    estimated_duration_minutes: 60,
    skills_focus: '',
    equipment_needed: ''
  });

  const handleCreatePlan = async () => {
    if (!formData.name.trim()) {
      toast.error('Please enter a plan name');
      return;
    }

    try {
      await createPlan.mutateAsync({
        ...formData,
        skills_focus: formData.skills_focus.split(',').map(s => s.trim()).filter(Boolean),
        equipment_needed: formData.equipment_needed.split(',').map(s => s.trim()).filter(Boolean)
      });
      
      setFormData({
        name: '',
        description: '',
        difficulty_level: 'intermediate',
        estimated_duration_minutes: 60,
        skills_focus: '',
        equipment_needed: ''
      });
      setShowCreateForm(false);
      toast.success('Training plan created successfully!');
    } catch (error) {
      console.error('Error creating training plan:', error);
      toast.error('Failed to create training plan');
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
          <p className="text-center text-muted-foreground">Loading training plans...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Training Plans
            </CardTitle>
            <Button 
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="bg-tennis-green-dark hover:bg-tennis-green-medium"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Plan
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {showCreateForm && (
            <div className="mb-6 p-4 border rounded-lg bg-muted/50 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Plan Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Beginner Forehand Technique"
                  />
                </div>
                <div>
                  <Label htmlFor="difficulty">Difficulty Level</Label>
                  <Select 
                    value={formData.difficulty_level} 
                    onValueChange={(value) => setFormData({ ...formData, difficulty_level: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                      <SelectItem value="expert">Expert</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the training plan objectives and approach..."
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={formData.estimated_duration_minutes}
                    onChange={(e) => setFormData({ ...formData, estimated_duration_minutes: parseInt(e.target.value) || 60 })}
                  />
                </div>
                <div>
                  <Label htmlFor="skills">Skills Focus (comma-separated)</Label>
                  <Input
                    id="skills"
                    value={formData.skills_focus}
                    onChange={(e) => setFormData({ ...formData, skills_focus: e.target.value })}
                    placeholder="forehand, backhand, footwork"
                  />
                </div>
                <div>
                  <Label htmlFor="equipment">Equipment Needed (comma-separated)</Label>
                  <Input
                    id="equipment"
                    value={formData.equipment_needed}
                    onChange={(e) => setFormData({ ...formData, equipment_needed: e.target.value })}
                    placeholder="racket, balls, cones"
                  />
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  onClick={handleCreatePlan}
                  disabled={createPlan.isPending}
                >
                  {createPlan.isPending ? 'Creating...' : 'Create Plan'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowCreateForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {trainingPlans?.map((plan) => (
              <Card key={plan.id} className="relative">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <h3 className="font-semibold line-clamp-2">{plan.name}</h3>
                      <Badge className={getDifficultyColor(plan.difficulty_level)}>
                        {plan.difficulty_level}
                      </Badge>
                    </div>
                    
                    {plan.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {plan.description}
                      </p>
                    )}
                    
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {plan.estimated_duration_minutes || 60}m
                      </div>
                      {plan.skills_focus && (
                        <div className="flex items-center gap-1">
                          <Target className="h-3 w-3" />
                          {plan.skills_focus.length} skills
                        </div>
                      )}
                    </div>

                    {plan.skills_focus && plan.skills_focus.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {plan.skills_focus.slice(0, 3).map((skill, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                        {plan.skills_focus.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{plan.skills_focus.length - 3} more
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {trainingPlans?.length === 0 && (
            <div className="text-center py-8">
              <Dumbbell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No Training Plans Yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first training plan to start assigning workouts to players.
              </p>
              <Button 
                onClick={() => setShowCreateForm(true)}
                className="bg-tennis-green-dark hover:bg-tennis-green-medium"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Plan
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
