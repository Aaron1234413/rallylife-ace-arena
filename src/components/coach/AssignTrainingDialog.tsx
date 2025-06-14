
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, UserPlus, Clock, Target } from 'lucide-react';
import { useTrainingPlans, useAssignTrainingPlan } from '@/hooks/useTrainingPlans';
import { useProfiles } from '@/hooks/useProfiles';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface AssignTrainingDialogProps {
  trigger: React.ReactNode;
}

export function AssignTrainingDialog({ trigger }: AssignTrainingDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('');
  const [selectedPlayer, setSelectedPlayer] = useState('');
  const [dueDate, setDueDate] = useState<Date>();
  const [coachNotes, setCoachNotes] = useState('');

  const { data: trainingPlans } = useTrainingPlans();
  const { data: players } = useProfiles();
  const assignPlan = useAssignTrainingPlan();

  const handleAssign = async () => {
    if (!selectedPlan || !selectedPlayer) {
      toast.error('Please select both a training plan and a player');
      return;
    }

    try {
      const result = await assignPlan.mutateAsync({
        playerId: selectedPlayer,
        trainingPlanId: selectedPlan,
        dueDate: dueDate?.toISOString(),
        coachNotes: coachNotes || undefined
      });

      if (result.success) {
        toast.success('Training plan assigned successfully!');
        setOpen(false);
        // Reset form
        setSelectedPlan('');
        setSelectedPlayer('');
        setDueDate(undefined);
        setCoachNotes('');
      }
    } catch (error) {
      console.error('Error assigning training plan:', error);
      toast.error('Failed to assign training plan');
    }
  };

  const selectedPlanData = trainingPlans?.find(p => p.id === selectedPlan);

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-orange-100 text-orange-800';
      case 'expert': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Assign Training Plan
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Player Selection */}
          <div className="space-y-2">
            <Label htmlFor="player">Select Player</Label>
            <Select value={selectedPlayer} onValueChange={setSelectedPlayer}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a player..." />
              </SelectTrigger>
              <SelectContent>
                {players?.map((player) => (
                  <SelectItem key={player.id} value={player.id}>
                    {player.full_name || player.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Training Plan Selection */}
          <div className="space-y-2">
            <Label htmlFor="plan">Select Training Plan</Label>
            <Select value={selectedPlan} onValueChange={setSelectedPlan}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a training plan..." />
              </SelectTrigger>
              <SelectContent>
                {trainingPlans?.map((plan) => (
                  <SelectItem key={plan.id} value={plan.id}>
                    <div className="flex items-center gap-2">
                      <span>{plan.name}</span>
                      <Badge className={getDifficultyColor(plan.difficulty_level)}>
                        {plan.difficulty_level}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Selected Plan Preview */}
          {selectedPlanData && (
            <div className="p-4 border rounded-lg bg-muted/50">
              <h3 className="font-medium mb-2">Selected Plan: {selectedPlanData.name}</h3>
              {selectedPlanData.description && (
                <p className="text-sm text-muted-foreground mb-3">{selectedPlanData.description}</p>
              )}
              <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {selectedPlanData.estimated_duration_minutes || 60}m
                </div>
                {selectedPlanData.skills_focus && (
                  <div className="flex items-center gap-1">
                    <Target className="h-3 w-3" />
                    {selectedPlanData.skills_focus.length} skills
                  </div>
                )}
              </div>
              {selectedPlanData.skills_focus && selectedPlanData.skills_focus.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {selectedPlanData.skills_focus.map((skill, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Due Date */}
          <div className="space-y-2">
            <Label>Due Date (Optional)</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dueDate ? format(dueDate, "PPP") : "Select due date..."}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dueDate}
                  onSelect={setDueDate}
                  disabled={(date) => date < new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Coach Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Coach Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={coachNotes}
              onChange={(e) => setCoachNotes(e.target.value)}
              placeholder="Add any specific instructions or goals for this assignment..."
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAssign}
              disabled={!selectedPlan || !selectedPlayer || assignPlan.isPending}
              className="bg-tennis-green-dark hover:bg-tennis-green-medium"
            >
              {assignPlan.isPending ? 'Assigning...' : 'Assign Training Plan'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
