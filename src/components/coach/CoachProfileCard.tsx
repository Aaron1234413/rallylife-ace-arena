import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { useCoachProfile } from '@/hooks/useCoachProfile';
import { User } from 'lucide-react';

export function CoachProfileCard() {
  const navigate = useNavigate();
  const { bio, experienceTags, loading } = useCoachProfile();

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Coach Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Coach Profile
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="font-medium mb-2">Bio</h4>
          <p className="text-sm text-muted-foreground">
            {bio || 'No bio added yet'}
          </p>
        </div>
        
        {experienceTags && experienceTags.length > 0 && (
          <div>
            <h4 className="font-medium mb-2">Experience</h4>
            <div className="flex flex-wrap gap-2">
              {experienceTags.map((tag, index) => (
                <Badge key={index} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}
        
        <Button 
          variant="outline" 
          onClick={() => navigate('/coach/profile/edit')}
          className="w-full"
        >
          Edit Profile
        </Button>
      </CardContent>
    </Card>
  );
}