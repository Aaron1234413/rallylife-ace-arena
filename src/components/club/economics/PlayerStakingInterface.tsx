import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Target,
  Plus,
  TrendingUp,
  TrendingDown,
  Clock,
  Coins,
  Trophy,
  Zap,
  Users
} from 'lucide-react';
import { CreateStakeDialog } from './CreateStakeDialog';

interface PlayerStakingInterfaceProps {
  club: {
    id: string;
    name: string;
  };
}

export function PlayerStakingInterface({ club }: PlayerStakingInterfaceProps) {
  const [showCreateStake, setShowCreateStake] = useState(false);

  // Mock staking data
  const activeStakes = [
    {
      id: '1',
      staker_name: 'John Smith',
      staker_avatar: null,
      target_player_name: 'Sarah Johnson',
      target_player_avatar: null,
      stake_type: 'match_outcome',
      stake_amount_tokens: 500,
      odds_multiplier: 1.5,
      description: 'Sarah will win the next tournament match',
      expires_at: '2025-01-20T15:00:00Z',
      potential_payout: 750
    },
    {
      id: '2',
      staker_name: 'Mike Chen',
      staker_avatar: null,
      target_player_name: 'Alex Rodriguez',
      target_player_avatar: null,
      stake_type: 'training_completion',
      stake_amount_tokens: 300,
      odds_multiplier: 2.0,
      description: 'Alex will complete advanced training program',
      expires_at: '2025-01-25T23:59:59Z',
      potential_payout: 600
    },
    {
      id: '3',
      staker_name: 'Lisa Wong',
      staker_avatar: null,
      target_player_name: 'David Park',
      target_player_avatar: null,
      stake_type: 'achievement_unlock',
      stake_amount_tokens: 200,
      odds_multiplier: 3.0,
      description: 'David will unlock Tennis Pro achievement',
      expires_at: '2025-01-30T23:59:59Z',
      potential_payout: 600
    }
  ];

  const myStakes = [
    {
      id: '4',
      target_player_name: 'Emma Wilson',
      stake_type: 'match_outcome',
      stake_amount_tokens: 400,
      potential_payout: 520,
      status: 'active',
      description: 'Emma will win Friday social tournament'
    },
    {
      id: '5',
      target_player_name: 'Tom Anderson',
      stake_type: 'training_completion',
      stake_amount_tokens: 250,
      potential_payout: 500,
      status: 'won',
      description: 'Tom completed beginner training program'
    }
  ];

  const getStakeTypeIcon = (type: string) => {
    switch (type) {
      case 'match_outcome': return Trophy;
      case 'training_completion': return Target;
      case 'achievement_unlock': return Zap;
      default: return Target;
    }
  };

  const getStakeTypeColor = (type: string) => {
    switch (type) {
      case 'match_outcome': return 'bg-red-100 text-red-800';
      case 'training_completion': return 'bg-blue-100 text-blue-800';
      case 'achievement_unlock': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-purple-500" />
                Player-to-Player Staking
              </CardTitle>
              <Button
                onClick={() => setShowCreateStake(true)}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Create Stake
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Stake tokens on player outcomes and achievements. Support your fellow club members 
              and earn rewards when they succeed!
            </p>
            
            <div className="grid grid-cols-3 gap-4 p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg">
              <div className="text-center">
                <div className="text-lg font-bold text-purple-900">{activeStakes.length}</div>
                <div className="text-xs text-purple-700">Active Stakes</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-purple-900">
                  {activeStakes.reduce((sum, stake) => sum + stake.stake_amount_tokens, 0).toLocaleString()}
                </div>
                <div className="text-xs text-purple-700">Total Staked</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-purple-900">
                  {activeStakes.reduce((sum, stake) => sum + stake.potential_payout, 0).toLocaleString()}
                </div>
                <div className="text-xs text-purple-700">Potential Payout</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* My Stakes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-500" />
              My Stakes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {myStakes.map((stake) => (
              <div
                key={stake.id}
                className="flex items-center gap-4 p-4 border rounded-lg hover:shadow-md transition-all"
              >
                <div className="w-10 h-10 bg-blue-500/10 rounded-full flex items-center justify-center">
                  {React.createElement(getStakeTypeIcon(stake.stake_type), { 
                    className: "h-5 w-5 text-blue-500" 
                  })}
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900">{stake.target_player_name}</p>
                  <p className="text-sm text-gray-600">{stake.description}</p>
                </div>
                
                <div className="text-right">
                  <div className="flex items-center gap-2 mb-1">
                    <Coins className="h-4 w-4 text-emerald-500" />
                    <span className="text-sm font-medium">{stake.stake_amount_tokens} tokens</span>
                  </div>
                  <Badge 
                    variant={stake.status === 'won' ? 'default' : 'secondary'}
                    className={stake.status === 'won' ? 'bg-green-500' : ''}
                  >
                    {stake.status === 'won' ? `Won +${stake.potential_payout}` : `Potential +${stake.potential_payout}`}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Active Club Stakes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              Active Club Stakes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {activeStakes.map((stake) => {
              const Icon = getStakeTypeIcon(stake.stake_type);
              const hoursRemaining = Math.ceil((new Date(stake.expires_at).getTime() - new Date().getTime()) / (1000 * 60 * 60));
              
              return (
                <div
                  key={stake.id}
                  className="flex items-start gap-4 p-4 border rounded-lg hover:shadow-md transition-all"
                >
                  <div className="w-12 h-12 bg-purple-500/10 rounded-full flex items-center justify-center">
                    <Icon className="h-6 w-6 text-purple-500" />
                  </div>
                  
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={stake.staker_avatar || undefined} />
                            <AvatarFallback className="text-xs">
                              {stake.staker_name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-medium">{stake.staker_name}</span>
                          <span className="text-sm text-gray-500">staked on</span>
                          <span className="text-sm font-medium">{stake.target_player_name}</span>
                        </div>
                        <p className="text-sm text-gray-600">{stake.description}</p>
                      </div>
                      <Badge className={getStakeTypeColor(stake.stake_type)}>
                        {stake.stake_type.replace('_', ' ')}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <Coins className="h-4 w-4 text-emerald-500" />
                          <span>{stake.stake_amount_tokens} tokens</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <TrendingUp className="h-4 w-4 text-green-500" />
                          <span>{stake.odds_multiplier}x odds</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4 text-orange-500" />
                          <span>{hoursRemaining}h remaining</span>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-sm font-medium text-green-600">
                          Potential: {stake.potential_payout} tokens
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Staking Rules */}
        <Card>
          <CardHeader>
            <CardTitle>How Staking Works</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-medium text-blue-900 mb-2">Match Outcomes</h4>
                <p className="text-sm text-blue-700">
                  Stake on match results, tournament wins, or specific game outcomes.
                </p>
              </div>
              
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <h4 className="font-medium text-green-900 mb-2">Training Goals</h4>
                <p className="text-sm text-green-700">
                  Support players completing training programs or reaching skill milestones.
                </p>
              </div>
              
              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <h4 className="font-medium text-purple-900 mb-2">Achievements</h4>
                <p className="text-sm text-purple-700">
                  Bet on players unlocking specific achievements or reaching new levels.
                </p>
              </div>
            </div>
            
            <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
              <h4 className="font-medium text-amber-900 mb-2">Staking Guidelines</h4>
              <ul className="text-sm text-amber-700 space-y-1">
                <li>• All stakes are held in escrow until outcome is determined</li>
                <li>• Stakes expire if not resolved within the specified timeframe</li>
                <li>• Minimum stake: 50 tokens, Maximum stake: 2,000 tokens</li>
                <li>• Club takes a 5% fee on winning payouts for pool maintenance</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      <CreateStakeDialog
        open={showCreateStake}
        onOpenChange={setShowCreateStake}
        club={club}
      />
    </>
  );
}