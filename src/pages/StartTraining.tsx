
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, ArrowRight, Sparkles } from 'lucide-react';
import { useUnifiedSessions } from '@/hooks/useUnifiedSessions';
import { TrainingGreeting } from '@/components/training/TrainingGreeting';
import { SessionTypeSelector } from '@/components/training/SessionTypeSelector';
import { CoachSelector } from '@/components/training/CoachSelector';
import { SkillsChipSelector } from '@/components/training/SkillsChipSelector';
import { IntensitySelector } from '@/components/training/IntensitySelector';
import { DurationEstimator } from '@/components/training/DurationEstimator';
import { toast } from 'sonner';

export default function StartTraining() {
  const navigate = useNavigate();
  const { createSession, startSession } = useUnifiedSessions({});
  
  const [sessionType, setSessionType] = useState<string>('');
  const [coachName, setCoachName] = useState<string>('');
  const [skillsFocus, setSkillsFocus] = useState<string[]>([]);
  const [intensity, setIntensity] = useState<string>('');
  const [estimatedDuration, setEstimatedDuration] = useState<number>(0);
  const [isCreating, setIsCreating] = useState(false);

  const handleStartSession = async () => {
    if (!canStart) return;
    
    setIsCreating(true);
    
    try {
      // Create session in database with proper mapping
      const sessionData = {
        session_type: 'training', // Map to database enum
        format: sessionType, // Store training type in format field
        max_players: 1, // Training sessions are solo
        stakes_amount: 0, // No stakes for training
        location: 'Training Session',
        notes: buildSessionNotes(),
        is_private: true, // Training sessions are private
        session_source: 'training' as const
      };

      const newSession = await createSession(sessionData);
      
      if (!newSession) {
        throw new Error('Failed to create session');
      }

      // Start the session immediately
      const started = await startSession(newSession.id);
      
      if (!started) {
        throw new Error('Failed to start session');
      }

      toast.success('Training session started successfully!');
      
      // Navigate to dashboard to show active session
      navigate('/dashboard');
      
    } catch (error) {
      console.error('Error starting training session:', error);
      toast.error('Failed to start training session. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const buildSessionNotes = () => {
    const notes = [`Training Type: ${sessionType}`];
    
    if (coachName) {
      notes.push(`Coach: ${coachName}`);
    }
    
    if (skillsFocus.length > 0) {
      notes.push(`Focus: ${skillsFocus.join(', ')}`);
    }
    
    notes.push(`Intensity: ${intensity}`);
    notes.push(`Estimated Duration: ${estimatedDuration} minutes`);
    
    return notes.join('\n');
  };

  const canStart = sessionType && intensity && estimatedDuration > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-tennis-green-dark via-tennis-green-medium to-tennis-green-light">
      {/* Header */}
      <div className="bg-white/95 backdrop-blur-sm border-b border-white/20 shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-tennis-green-primary rounded-full flex items-center justify-center shadow-lg">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-tennis-green-dark">Start Training</h1>
              <p className="text-tennis-green-dark/70">Let's get you ready for an amazing session</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-xl border border-white/20">
          <Card className="border-0 shadow-none bg-transparent">
            <CardHeader className="text-center pb-6">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-tennis-green-primary to-tennis-green-medium rounded-full flex items-center justify-center shadow-lg">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
              </div>
              <CardTitle className="text-2xl text-tennis-green-dark">
                Configure Your Session
              </CardTitle>
              <p className="text-tennis-green-dark/70 text-lg">
                Set up your training parameters for the best experience
              </p>
            </CardHeader>
            
            <CardContent className="space-y-8">
              <TrainingGreeting />
              
              <div className="space-y-6">
                <SessionTypeSelector 
                  value={sessionType}
                  onValueChange={setSessionType}
                />
                
                <CoachSelector 
                  value={coachName}
                  onValueChange={setCoachName}
                />
                
                <SkillsChipSelector 
                  value={skillsFocus}
                  onValueChange={setSkillsFocus}
                />
                
                <IntensitySelector 
                  value={intensity}
                  onValueChange={setIntensity}
                />
                
                <DurationEstimator 
                  value={estimatedDuration}
                  onValueChange={setEstimatedDuration}
                />
              </div>

              <div className="flex gap-4 pt-6">
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/dashboard')}
                  className="flex-1 h-12 border-tennis-green-bg/30 text-tennis-green-dark hover:bg-tennis-green-bg/10"
                  size="lg"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleStartSession}
                  disabled={!canStart || isCreating}
                  className="flex-1 h-12 bg-gradient-to-r from-tennis-green-primary to-tennis-green-medium hover:from-tennis-green-medium hover:to-tennis-green-primary text-white shadow-lg hover:shadow-xl transition-all duration-200"
                  size="lg"
                >
                  {isCreating ? 'Starting...' : 'Start Training'}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
