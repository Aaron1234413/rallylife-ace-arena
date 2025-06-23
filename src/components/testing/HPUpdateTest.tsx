
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { usePlayerHP } from '@/hooks/usePlayerHP';
import { toast } from 'sonner';

export function HPUpdateTest() {
  const { hpData, restoreHP, refreshHP } = usePlayerHP();

  const testHPUpdate = async () => {
    console.log('Testing HP update flow...');
    
    try {
      // Test HP restoration
      await restoreHP(5, 'test', 'Testing HP update flow');
      
      // Force refresh
      await refreshHP();
      
      toast.success('HP update test completed!');
    } catch (error) {
      console.error('HP update test failed:', error);
      toast.error('HP update test failed');
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>HP Update Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm text-gray-600">
            Current HP: {hpData?.current_hp || 0}/{hpData?.max_hp || 100}
          </p>
        </div>
        <Button onClick={testHPUpdate} className="w-full">
          Test +5 HP Update
        </Button>
      </CardContent>
    </Card>
  );
}
