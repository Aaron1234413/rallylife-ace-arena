
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Plus, X } from 'lucide-react';
import { useActivityLogs } from '@/hooks/useActivityLogs';
import { format } from 'date-fns';

interface ActivityLogFormProps {
  onSuccess?: () => void;
  className?: string;
}

export function ActivityLogForm({ onSuccess, className }: ActivityLogFormProps) {
  const { logActivity } = useActivityLogs();
  const [formData, setFormData] = useState({
    activity_type: '',
    activity_category: '',
    title: '',
    description: '',
    duration_minutes: '',
    intensity_level: 'medium',
    location: '',
    opponent_name: '',
    coach_name: '',
    score: '',
    result: '',
    notes: '',
    weather_conditions: '',
    court_surface: '',
    energy_before: '',
    energy_after: '',
    enjoyment_rating: '',
    difficulty_rating: '',
    is_competitive: false,
    is_official: false,
    logged_at: new Date()
  });
  
  const [equipmentUsed, setEquipmentUsed] = useState<string[]>([]);
  const [skillsPracticed, setSkillsPracticed] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [newEquipment, setNewEquipment] = useState('');
  const [newSkill, setNewSkill] = useState('');
  const [newTag, setNewTag] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const activityTypes = [
    { value: 'match', label: 'Match', category: 'on_court' },
    { value: 'training', label: 'Training', category: 'on_court' },
    { value: 'lesson', label: 'Lesson', category: 'educational' },
    { value: 'tournament', label: 'Tournament', category: 'on_court' },
    { value: 'social', label: 'Social Play', category: 'social' },
    { value: 'practice', label: 'Practice', category: 'on_court' }
  ];

  const intensityLevels = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'extreme', label: 'Extreme' }
  ];

  const courtSurfaces = [
    { value: 'hard', label: 'Hard Court' },
    { value: 'clay', label: 'Clay' },
    { value: 'grass', label: 'Grass' },
    { value: 'indoor', label: 'Indoor' }
  ];

  const results = [
    { value: 'win', label: 'Win' },
    { value: 'loss', label: 'Loss' },
    { value: 'draw', label: 'Draw' },
    { value: 'completed', label: 'Completed' }
  ];

  const addToArray = (array: string[], setArray: (arr: string[]) => void, value: string, setValue: (val: string) => void) => {
    if (value.trim() && !array.includes(value.trim())) {
      setArray([...array, value.trim()]);
      setValue('');
    }
  };

  const removeFromArray = (array: string[], setArray: (arr: string[]) => void, index: number) => {
    setArray(array.filter((_, i) => i !== index));
  };

  const handleActivityTypeChange = (value: string) => {
    const selectedType = activityTypes.find(type => type.value === value);
    setFormData(prev => ({
      ...prev,
      activity_type: value,
      activity_category: selectedType?.category || ''
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.activity_type || !formData.title) {
      return;
    }

    setIsSubmitting(true);
    
    const activityData = {
      activity_type: formData.activity_type,
      activity_category: formData.activity_category,
      title: formData.title,
      description: formData.description || undefined,
      duration_minutes: formData.duration_minutes ? parseInt(formData.duration_minutes) : undefined,
      intensity_level: formData.intensity_level,
      location: formData.location || undefined,
      opponent_name: formData.opponent_name || undefined,
      coach_name: formData.coach_name || undefined,
      score: formData.score || undefined,
      result: formData.result || undefined,
      notes: formData.notes || undefined,
      weather_conditions: formData.weather_conditions || undefined,
      court_surface: formData.court_surface || undefined,
      equipment_used: equipmentUsed.length > 0 ? equipmentUsed : undefined,
      skills_practiced: skillsPracticed.length > 0 ? skillsPracticed : undefined,
      energy_before: formData.energy_before ? parseInt(formData.energy_before) : undefined,
      energy_after: formData.energy_after ? parseInt(formData.energy_after) : undefined,
      enjoyment_rating: formData.enjoyment_rating ? parseInt(formData.enjoyment_rating) : undefined,
      difficulty_rating: formData.difficulty_rating ? parseInt(formData.difficulty_rating) : undefined,
      tags: tags.length > 0 ? tags : undefined,
      is_competitive: formData.is_competitive,
      is_official: formData.is_official,
      logged_at: formData.logged_at.toISOString()
    };

    try {
      await logActivity(activityData);
      
      // Reset form
      setFormData({
        activity_type: '',
        activity_category: '',
        title: '',
        description: '',
        duration_minutes: '',
        intensity_level: 'medium',
        location: '',
        opponent_name: '',
        coach_name: '',
        score: '',
        result: '',
        notes: '',
        weather_conditions: '',
        court_surface: '',
        energy_before: '',
        energy_after: '',
        enjoyment_rating: '',
        difficulty_rating: '',
        is_competitive: false,
        is_official: false,
        logged_at: new Date()
      });
      setEquipmentUsed([]);
      setSkillsPracticed([]);
      setTags([]);
      
      onSuccess?.();
    } catch (error) {
      console.error('Error submitting activity:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Log Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="activity_type">Activity Type *</Label>
              <Select value={formData.activity_type} onValueChange={handleActivityTypeChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select activity type" />
                </SelectTrigger>
                <SelectContent>
                  {activityTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g., Singles match vs John"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Brief description of the activity"
            />
          </div>

          {/* Activity Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="duration_minutes">Duration (minutes)</Label>
              <Input
                id="duration_minutes"
                type="number"
                value={formData.duration_minutes}
                onChange={(e) => setFormData(prev => ({ ...prev, duration_minutes: e.target.value }))}
                placeholder="90"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="intensity_level">Intensity</Label>
              <Select value={formData.intensity_level} onValueChange={(value) => setFormData(prev => ({ ...prev, intensity_level: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {intensityLevels.map(level => (
                    <SelectItem key={level.value} value={level.value}>
                      {level.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                placeholder="Tennis Center"
              />
            </div>
          </div>

          {/* Match/Competition specific fields */}
          {(formData.activity_type === 'match' || formData.activity_type === 'tournament') && (
            <div className="space-y-4 p-4 border rounded-lg">
              <h4 className="font-semibold">Match Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="opponent_name">Opponent</Label>
                  <Input
                    id="opponent_name"
                    value={formData.opponent_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, opponent_name: e.target.value }))}
                    placeholder="Opponent name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="score">Score</Label>
                  <Input
                    id="score"
                    value={formData.score}
                    onChange={(e) => setFormData(prev => ({ ...prev, score: e.target.value }))}
                    placeholder="6-4, 6-2"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="result">Result</Label>
                  <Select value={formData.result} onValueChange={(value) => setFormData(prev => ({ ...prev, result: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select result" />
                    </SelectTrigger>
                    <SelectContent>
                      {results.map(result => (
                        <SelectItem key={result.value} value={result.value}>
                          {result.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="court_surface">Court Surface</Label>
                  <Select value={formData.court_surface} onValueChange={(value) => setFormData(prev => ({ ...prev, court_surface: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select surface" />
                    </SelectTrigger>
                    <SelectContent>
                      {courtSurfaces.map(surface => (
                        <SelectItem key={surface.value} value={surface.value}>
                          {surface.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="is_competitive"
                    checked={formData.is_competitive}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_competitive: !!checked }))}
                  />
                  <Label htmlFor="is_competitive">Competitive Match</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="is_official"
                    checked={formData.is_official}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_official: !!checked }))}
                  />
                  <Label htmlFor="is_official">Official Tournament</Label>
                </div>
              </div>
            </div>
          )}

          {/* Lesson specific fields */}
          {formData.activity_type === 'lesson' && (
            <div className="space-y-4 p-4 border rounded-lg">
              <h4 className="font-semibold">Lesson Details</h4>
              <div className="space-y-2">
                <Label htmlFor="coach_name">Coach</Label>
                <Input
                  id="coach_name"
                  value={formData.coach_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, coach_name: e.target.value }))}
                  placeholder="Coach name"
                />
              </div>
            </div>
          )}

          {/* Equipment and Skills */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Equipment Used</Label>
              <div className="flex gap-2">
                <Input
                  value={newEquipment}
                  onChange={(e) => setNewEquipment(e.target.value)}
                  placeholder="Add equipment"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addToArray(equipmentUsed, setEquipmentUsed, newEquipment, setNewEquipment))}
                />
                <Button
                  type="button"
                  size="sm"
                  onClick={() => addToArray(equipmentUsed, setEquipmentUsed, newEquipment, setNewEquipment)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {equipmentUsed.map((equipment, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {equipment}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => removeFromArray(equipmentUsed, setEquipmentUsed, index)} />
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Skills Practiced</Label>
              <div className="flex gap-2">
                <Input
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  placeholder="Add skill"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addToArray(skillsPracticed, setSkillsPracticed, newSkill, setNewSkill))}
                />
                <Button
                  type="button"
                  size="sm"
                  onClick={() => addToArray(skillsPracticed, setSkillsPracticed, newSkill, setNewSkill)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {skillsPracticed.map((skill, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {skill}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => removeFromArray(skillsPracticed, setSkillsPracticed, index)} />
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Ratings */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="energy_before">Energy Before (1-10)</Label>
              <Input
                id="energy_before"
                type="number"
                min="1"
                max="10"
                value={formData.energy_before}
                onChange={(e) => setFormData(prev => ({ ...prev, energy_before: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="energy_after">Energy After (1-10)</Label>
              <Input
                id="energy_after"
                type="number"
                min="1"
                max="10"
                value={formData.energy_after}
                onChange={(e) => setFormData(prev => ({ ...prev, energy_after: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="enjoyment_rating">Enjoyment (1-5)</Label>
              <Input
                id="enjoyment_rating"
                type="number"
                min="1"
                max="5"
                value={formData.enjoyment_rating}
                onChange={(e) => setFormData(prev => ({ ...prev, enjoyment_rating: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="difficulty_rating">Difficulty (1-5)</Label>
              <Input
                id="difficulty_rating"
                type="number"
                min="1"
                max="5"
                value={formData.difficulty_rating}
                onChange={(e) => setFormData(prev => ({ ...prev, difficulty_rating: e.target.value }))}
              />
            </div>
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label>Activity Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(formData.logged_at, 'PPP')}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={formData.logged_at}
                  onSelect={(date) => date && setFormData(prev => ({ ...prev, logged_at: date }))}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Any additional notes about the activity"
            />
          </div>

          <Button type="submit" disabled={isSubmitting || !formData.activity_type || !formData.title} className="w-full">
            {isSubmitting ? 'Logging Activity...' : 'Log Activity'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
