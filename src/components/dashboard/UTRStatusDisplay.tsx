import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trophy, AlertCircle, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface UTRStatusDisplayProps {
  utrRating?: number | null;
  utrVerified?: boolean;
  className?: string;
}

export function UTRStatusDisplay({ utrRating, utrVerified, className }: UTRStatusDisplayProps) {
  const navigate = useNavigate();

  const handleUpdateUTR = () => {
    navigate('/profile?tab=tennis');
  };

  return (
    <Card className={`bg-white/95 backdrop-blur-sm border-white/20 shadow-xl ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-tennis-green-dark">
          <Trophy className="h-5 w-5" />
          UTR Status
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {utrRating ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-tennis-green-dark">
                  {utrRating.toFixed(1)}
                </span>
                <Badge 
                  variant={utrVerified ? "default" : "secondary"}
                  className={`${
                    utrVerified 
                      ? "bg-green-100 text-green-800 border-green-200" 
                      : "bg-yellow-100 text-yellow-800 border-yellow-200"
                  }`}
                >
                  {utrVerified ? (
                    <>
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Verified
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Unverified
                    </>
                  )}
                </Badge>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleUpdateUTR}
                className="border-tennis-green-bg/30 text-tennis-green-dark hover:bg-tennis-green-light/20"
              >
                Update
              </Button>
            </div>
          ) : (
            <div className="text-center py-4">
              <AlertCircle className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
              <p className="text-sm text-tennis-green-dark/70 mb-3">
                Set your UTR rating to access better matchmaking
              </p>
              <Button
                onClick={handleUpdateUTR}
                className="bg-tennis-green-primary hover:bg-tennis-green-medium text-white"
                size="sm"
              >
                Set UTR Rating
              </Button>
            </div>
          )}
          
          {utrRating && !utrVerified && (
            <div className="text-xs text-tennis-green-dark/60 bg-yellow-50 p-2 rounded border border-yellow-200">
              <p>Verify your UTR rating to unlock premium matchmaking features</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}