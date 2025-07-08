import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  Target,
  Coins,
  CalendarIcon,
  Trophy,
  Users,
  Zap
} from 'lucide-react';
import { format } from 'date-fns';

interface CreateStakeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  club: {
    id: string;
    name: string;
  };
}

export function CreateStakeDialog({ open, onOpenChange, club }: CreateStakeDialogProps) {
  const [formData, setFormData] = useState({
    target_player_id: '',
    stake_type: '',
    stake_amount_tokens: 100,
    odds_multiplier: 1.5,
    description: '',
    expires_at: undefined as Date | undefined
  });

  // Mock club members for selection
  const clubMembers = [
    {
      id: '1',
      name: 'Sarah Johnson',
      avatar: null,
      current_level: 8
    },
    {
      id: '2',
      name: 'Mike Chen',
      avatar: null,
      current_level: 12
    },
    {
      id: '3',
      name: 'Alex Rodriguez',
      avatar: null,
      current_level: 5
    },
    {
      id: '4',
      name: 'Emma Wilson',
      avatar: null,
      current_level: 15
    }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Creating stake:', formData);
    onOpenChange(false);
    // Reset form
    setFormData({
      target_player_id: '',
      stake_type: '',
      stake_amount_tokens: 100,
      odds_multiplier: 1.5,
      description: '',
      expires_at: undefined
    });
  };

  const getStakeTypeIcon = (type: string) => {
    switch (type) {
      case 'match_outcome': return Trophy;
      case 'training_completion': return Target;
      case 'achievement_unlock': return Zap;
      default: return Target;
    }
  };

  const selectedPlayer = clubMembers.find(m => m.id === formData.target_player_id);
  const potentialPayout = Math.round(formData.stake_amount_tokens * formData.odds_multiplier);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-purple-500" />
            Create Player Stake
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="target_player">Target Player</Label>
            <Select
              value={formData.target_player_id}
              onValueChange={(value) => setFormData({ ...formData, target_player_id: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a player to stake on" />
              </SelectTrigger>
              <SelectContent>
                {clubMembers.map((member) => (
                  <SelectItem key={member.id} value={member.id}>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={member.avatar || undefined} />
                        <AvatarFallback className="text-xs">
                          {member.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <span>{member.name}</span>
                      <span className="text-xs text-gray-500">Lv.{member.current_level}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="stake_type">Stake Type</Label>
            <Select
              value={formData.stake_type}
              onValueChange={(value) => setFormData({ ...formData, stake_type: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="What are you staking on?" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="match_outcome">
                  <div className="flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-red-500" />
                    Match Outcome
                  </div>
                </SelectItem>
                <SelectItem value="training_completion">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-blue-500" />
                    Training Completion
                  </div>
                </SelectItem>
                <SelectItem value="achievement_unlock">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-purple-500" />
                    Achievement Unlock
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="description">Stake Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe what you're betting on..."
              rows={3}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="stake_amount" className="flex items-center gap-2">
                <Coins className="h-4 w-4 text-emerald-500" />
                Stake Amount
              </Label>
              <Input
                id="stake_amount"
                type="number"
                value={formData.stake_amount_tokens}
                onChange={(e) => setFormData({ ...formData, stake_amount_tokens: parseInt(e.target.value) || 0 })}
                min="50"
                max="2000"
                step="10"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Min: 50, Max: 2,000 tokens
              </p>
            </div>
            <div>
              <Label htmlFor="odds_multiplier">Odds Multiplier</Label>
              <Input
                id="odds_multiplier"
                type="number"
                value={formData.odds_multiplier}
                onChange={(e) => setFormData({ ...formData, odds_multiplier: parseFloat(e.target.value) || 1.0 })}
                min="1.1"
                max="5.0"
                step="0.1"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                1.1x to 5.0x multiplier
              </p>
            </div>
          </div>

          <div>
            <Label>Expiration Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.expires_at ? format(formData.expires_at, "PPP") : "Pick an expiration date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={formData.expires_at}
                  onSelect={(date) => setFormData({ ...formData, expires_at: date })}
                  disabled={(date) => date < new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Stake Preview */}
          {selectedPlayer && formData.stake_type && (
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <h4 className="font-semibold text-purple-900 mb-2">Stake Preview</h4>
              <div className="space-y-2 text-sm text-purple-700">
                <div className="flex items-center gap-2">
                  {React.createElement(getStakeTypeIcon(formData.stake_type), { 
                    className: "h-4 w-4" 
                  })}
                  <span>Staking on {selectedPlayer.name}</span>
                </div>
                <div className="flex justify-between">
                  <span>Stake Amount:</span>
                  <span className="font-medium">{formData.stake_amount_tokens} tokens</span>
                </div>
                <div className="flex justify-between">
                  <span>Potential Payout:</span>
                  <span className="font-medium text-purple-900">{potentialPayout} tokens</span>
                </div>
                <div className="flex justify-between">
                  <span>Potential Profit:</span>
                  <span className="font-medium text-green-600">
                    +{potentialPayout - formData.stake_amount_tokens} tokens
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Staking Rules */}
          <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
            <h4 className="font-medium text-amber-900 mb-1">Staking Rules</h4>
            <ul className="text-xs text-amber-700 space-y-1">
              <li>• Stakes are held in escrow until resolved</li>
              <li>• 5% club fee on winning payouts</li>
              <li>• Stakes expire if not resolved by deadline</li>
              <li>• Outcomes verified by club admins</li>
            </ul>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="flex-1"
              disabled={!formData.target_player_id || !formData.stake_type || !formData.description}
            >
              Create Stake
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}