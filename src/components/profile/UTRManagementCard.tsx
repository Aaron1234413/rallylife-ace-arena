import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Award, CheckCircle, XCircle, Search, ExternalLink } from 'lucide-react';
import { UTRSetup } from '@/components/profile/UTRSetup';

interface UTRManagementCardProps {
  profile: any;
  onProfileUpdate: () => void;
}

export function UTRManagementCard({ profile, onProfileUpdate }: UTRManagementCardProps) {
  const [utrSetupOpen, setUtrSetupOpen] = useState(false);

  const hasUTR = profile?.utr_rating;
  const isVerified = profile?.utr_verified;

  return (
    <Card className="bg-white/95 backdrop-blur-sm border-white/20 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-tennis-green-dark">
          <Award className="h-5 w-5" />
          UTR Management
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {hasUTR ? (
          <div className="text-center space-y-3">
            <div className="flex items-center justify-center gap-2">
              {isVerified ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <XCircle className="h-5 w-5 text-orange-500" />
              )}
              <Badge 
                variant={isVerified ? "default" : "secondary"}
                className="text-lg px-3 py-1"
              >
                UTR {profile.utr_rating}
              </Badge>
            </div>
            
            <p className="text-sm text-tennis-green-dark/70">
              {isVerified ? 'Verified Rating' : 'Self-Reported Rating'}
            </p>

            <div className="flex flex-col gap-2">
              <Dialog open={utrSetupOpen} onOpenChange={setUtrSetupOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Search className="h-4 w-4 mr-2" />
                    Update UTR
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <UTRSetup 
                    userId={profile.id}
                    currentUTR={profile.utr_rating}
                    onComplete={() => {
                      setUtrSetupOpen(false);
                      onProfileUpdate();
                    }}
                  />
                </DialogContent>
              </Dialog>

              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.open('https://app.universaltennis.com/', '_blank')}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Visit UTR
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center space-y-3">
            <Award className="h-12 w-12 text-tennis-green-medium mx-auto opacity-50" />
            <div>
              <h3 className="font-semibold text-tennis-green-dark mb-1">No UTR Rating</h3>
              <p className="text-sm text-tennis-green-dark/70 mb-3">
                Set up your Universal Tennis Rating to find better matches
              </p>
            </div>
            
            <Dialog open={utrSetupOpen} onOpenChange={setUtrSetupOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Search className="h-4 w-4 mr-2" />
                  Set Up UTR
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <UTRSetup 
                  userId={profile.id}
                  onComplete={() => {
                    setUtrSetupOpen(false);
                    onProfileUpdate();
                  }}
                />
              </DialogContent>
            </Dialog>
          </div>
        )}
      </CardContent>
    </Card>
  );
}