import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Users, Search, Edit2, Save, X } from 'lucide-react';
import { MemberSpendingLimit } from '@/types/club';
import { toast } from 'sonner';

interface MemberSpendingLimitsProps {
  clubId: string;
}

const mockMembers: MemberSpendingLimit[] = [
  {
    member_id: '1',
    monthly_limit: 500,
    daily_limit: 50,
    service_restrictions: [],
    override_permissions: false
  },
  {
    member_id: '2',
    monthly_limit: 300,
    daily_limit: 30,
    service_restrictions: ['coaching'],
    override_permissions: true
  },
  {
    member_id: '3',
    monthly_limit: 200,
    daily_limit: 25,
    service_restrictions: [],
    override_permissions: false
  }
];

const mockMemberProfiles = [
  { id: '1', name: 'John Smith', avatar: '', role: 'member' },
  { id: '2', name: 'Sarah Johnson', avatar: '', role: 'admin' },
  { id: '3', name: 'Mike Wilson', avatar: '', role: 'member' }
];

export function MemberSpendingLimits({ clubId }: MemberSpendingLimitsProps) {
  const [members, setMembers] = useState<MemberSpendingLimit[]>(mockMembers);
  const [editingMember, setEditingMember] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const getMemberProfile = (memberId: string) => {
    return mockMemberProfiles.find(p => p.id === memberId);
  };

  const filteredMembers = members.filter(member => {
    const profile = getMemberProfile(member.member_id);
    return profile?.name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const updateMemberLimit = (memberId: string, field: keyof MemberSpendingLimit, value: any) => {
    setMembers(prev => prev.map(member => 
      member.member_id === memberId 
        ? { ...member, [field]: value }
        : member
    ));
  };

  const saveMemberLimits = async (memberId: string) => {
    try {
      // In real implementation, save to database
      await new Promise(resolve => setTimeout(resolve, 500));
      setEditingMember(null);
      toast.success('Member spending limits updated');
    } catch (error) {
      toast.error('Failed to update limits');
    }
  };

  const cancelEdit = (memberId: string) => {
    setEditingMember(null);
    // In real implementation, reset to original values
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="h-5 w-5" />
            Member Spending Limits
          </CardTitle>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search members..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 w-64"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Headers */}
          <div className="grid grid-cols-6 gap-4 text-sm font-medium text-gray-500 pb-2 border-b">
            <div className="col-span-2">Member</div>
            <div className="text-center">Monthly Limit</div>
            <div className="text-center">Daily Limit</div>
            <div className="text-center">Override Rights</div>
            <div className="text-center">Actions</div>
          </div>

          {/* Member Rows */}
          {filteredMembers.map((member) => {
            const profile = getMemberProfile(member.member_id);
            const isEditing = editingMember === member.member_id;

            return (
              <div key={member.member_id} className="grid grid-cols-6 gap-4 items-center py-3 border-b border-gray-100 last:border-b-0">
                {/* Member Info */}
                <div className="col-span-2 flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={profile?.avatar} />
                    <AvatarFallback>
                      {profile?.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium text-sm">{profile?.name}</div>
                    {profile?.role === 'admin' && (
                      <Badge variant="secondary" className="text-xs">Admin</Badge>
                    )}
                  </div>
                </div>

                {/* Monthly Limit */}
                <div className="text-center">
                  {isEditing ? (
                    <Input
                      type="number"
                      value={member.monthly_limit}
                      onChange={(e) => updateMemberLimit(member.member_id, 'monthly_limit', parseInt(e.target.value))}
                      className="w-20 text-center"
                    />
                  ) : (
                    <div className="font-medium">{member.monthly_limit}</div>
                  )}
                </div>

                {/* Daily Limit */}
                <div className="text-center">
                  {isEditing ? (
                    <Input
                      type="number"
                      value={member.daily_limit || ''}
                      onChange={(e) => updateMemberLimit(member.member_id, 'daily_limit', parseInt(e.target.value) || undefined)}
                      className="w-20 text-center"
                      placeholder="None"
                    />
                  ) : (
                    <div className="font-medium">{member.daily_limit || 'None'}</div>
                  )}
                </div>

                {/* Override Rights */}
                <div className="text-center">
                  {isEditing ? (
                    <Switch
                      checked={member.override_permissions}
                      onCheckedChange={(checked) => updateMemberLimit(member.member_id, 'override_permissions', checked)}
                    />
                  ) : (
                    <Badge variant={member.override_permissions ? 'default' : 'secondary'}>
                      {member.override_permissions ? 'Yes' : 'No'}
                    </Badge>
                  )}
                </div>

                {/* Actions */}
                <div className="text-center">
                  {isEditing ? (
                    <div className="flex items-center gap-1 justify-center">
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => saveMemberLimits(member.member_id)}
                      >
                        <Save className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => cancelEdit(member.member_id)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingMember(member.member_id)}
                    >
                      <Edit2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
            );
          })}

          {filteredMembers.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              {searchTerm ? 'No members found matching your search.' : 'No members to display.'}
            </div>
          )}
        </div>

        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="text-blue-600 text-sm">ℹ️</div>
            <div className="text-sm">
              <div className="font-medium text-blue-800 mb-1">Spending Limits Guide</div>
              <ul className="space-y-1 text-blue-700">
                <li>• <strong>Monthly Limit:</strong> Maximum tokens a member can spend per month</li>
                <li>• <strong>Daily Limit:</strong> Maximum tokens a member can spend per day (optional)</li>
                <li>• <strong>Override Rights:</strong> Allows member to exceed limits with admin approval</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}