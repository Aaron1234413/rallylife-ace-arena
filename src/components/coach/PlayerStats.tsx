import { Card, CardContent } from '@/components/ui/card';

interface PlayerStatsProps {
  hp: number;
  xp: number;
  tokens: number;
}

export function PlayerStats({ hp, xp, tokens }: PlayerStatsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <Card>
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-red-500">{hp}</div>
          <div className="text-sm text-muted-foreground">HP</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-blue-500">{xp}</div>
          <div className="text-sm text-muted-foreground">XP</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-yellow-500">{tokens}</div>
          <div className="text-sm text-muted-foreground">Tokens</div>
        </CardContent>
      </Card>
    </div>
  );
}