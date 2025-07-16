import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

interface UTRStatusProps {
  utrRating?: number;
  isVerified?: boolean;
}

export function UTRStatus({ utrRating, isVerified }: UTRStatusProps) {
  return (
    <Card className="bg-white/95 backdrop-blur-sm border-white/20 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-tennis-green-dark">
          <TrendingUp className="h-5 w-5" />
          UTR Status
          {isVerified && (
            <Badge className="bg-green-100 text-green-800">
              <Star className="h-3 w-3 mr-1" />
              Verified
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {utrRating ? (
          <div className="text-center space-y-3">
            <div className="text-3xl font-bold text-tennis-green-dark">
              {utrRating.toFixed(2)}
            </div>
            <p className="text-sm text-tennis-green-dark/70">
              {isVerified ? 'Your verified UTR rating' : 'Your UTR rating'}
            </p>
            {!isVerified && (
              <Button asChild size="sm" variant="outline" className="w-full">
                <Link to="/profile">
                  Verify Rating
                </Link>
              </Button>
            )}
          </div>
        ) : (
          <div className="text-center space-y-3">
            <div className="text-2xl font-bold text-muted-foreground">--</div>
            <p className="text-sm text-tennis-green-dark/70">No UTR rating set</p>
            <Button asChild size="sm" className="w-full bg-tennis-green-primary hover:bg-tennis-green-medium">
              <Link to="/profile">
                Set UTR Rating
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}