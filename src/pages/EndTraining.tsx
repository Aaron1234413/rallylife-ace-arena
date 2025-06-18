
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';

export default function EndTraining() {
  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-6 w-6 text-green-600" />
            Complete Training Session
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Training session completion coming soon...
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
