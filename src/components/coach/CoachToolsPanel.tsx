import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { useFeedback } from '@/hooks/useFeedback';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function CoachToolsPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<string>('');
  const [feedback, setFeedback] = useState('');
  
  const { pastSessions, loading, submitting, leaveFeedback } = useFeedback();

  const handleSubmitFeedback = async () => {
    if (!selectedSession || !feedback.trim()) return;
    
    const success = await leaveFeedback(selectedSession, feedback);
    if (success) {
      setFeedback('');
      setSelectedSession('');
    }
  };

  return (
    <Card>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
            <CardTitle className="flex items-center justify-between">
              <span>Coach Tools</span>
              {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Leave Feedback</h4>
              
              <div className="space-y-3">
                <Select value={selectedSession} onValueChange={setSelectedSession}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a past session" />
                  </SelectTrigger>
                  <SelectContent>
                    {loading ? (
                      <SelectItem value="loading" disabled>Loading sessions...</SelectItem>
                    ) : pastSessions.length === 0 ? (
                      <SelectItem value="none" disabled>No past sessions found</SelectItem>
                    ) : (
                      pastSessions.map((session) => (
                        <SelectItem key={session.id} value={session.id}>
                          {session.session_type} - {session.location} ({new Date(session.created_at).toLocaleDateString()})
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>

                <Textarea
                  placeholder="Enter your feedback for the session..."
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  rows={3}
                />

                <Button 
                  onClick={handleSubmitFeedback}
                  disabled={!selectedSession || !feedback.trim() || submitting}
                  className="w-full"
                >
                  {submitting ? 'Submitting...' : 'Submit Feedback'}
                </Button>
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}