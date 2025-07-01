
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Users, 
  Search, 
  Plus, 
  MessageSquare, 
  Calendar, 
  TrendingUp,
  Clock,
  Target,
  Award,
  Mail
} from 'lucide-react';
import { useCoachClients } from '@/hooks/useCoachClients';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

export function ClientManagementPanel() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [inviteForm, setInviteForm] = useState({ email: '', message: '' });
  
  const { clients, isLoading, sendInvitation, isSendingInvitation } = useCoachClients();

  const filteredClients = clients.filter(client =>
    client.player_profile.full_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSendInvitation = async () => {
    if (!inviteForm.email.trim()) {
      toast.error('Please enter a player email');
      return;
    }

    try {
      await sendInvitation({ 
        playerEmail: inviteForm.email, 
        message: inviteForm.message || undefined 
      });
      toast.success('Invitation sent successfully!');
      setInviteForm({ email: '', message: '' });
      setShowInviteDialog(false);
    } catch (error) {
      toast.error('Failed to send invitation');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'premium': return 'bg-purple-100 text-purple-800';
      case 'active': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Client Management
            </CardTitle>
            <CardDescription>
              Monitor and manage your tennis students
            </CardDescription>
          </div>
          <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-tennis-green-light hover:bg-tennis-green-dark">
                <Plus className="h-4 w-4 mr-2" />
                Invite Player
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Invite Player</DialogTitle>
                <DialogDescription>
                  Send an invitation to a player to join your coaching program.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="email">Player Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={inviteForm.email}
                    onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                    placeholder="player@example.com"
                  />
                </div>
                <div>
                  <Label htmlFor="message">Personal Message (Optional)</Label>
                  <Textarea
                    id="message"
                    value={inviteForm.message}
                    onChange={(e) => setInviteForm({ ...inviteForm, message: e.target.value })}
                    placeholder="Let them know why you'd like to coach them..."
                    rows={3}
                  />
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={handleSendInvitation}
                    disabled={isSendingInvitation}
                    className="bg-tennis-green-dark hover:bg-tennis-green-medium"
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    {isSendingInvitation ? 'Sending...' : 'Send Invitation'}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowInviteDialog(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search clients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Client Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">All Clients ({clients.length})</TabsTrigger>
            <TabsTrigger value="active">Active ({clients.filter(c => c.status === 'active').length})</TabsTrigger>
            <TabsTrigger value="premium">Premium ({clients.filter(c => c.status === 'premium').length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="border rounded-lg p-4 animate-pulse">
                    <div className="flex items-start gap-4">
                      <div className="h-12 w-12 bg-gray-200 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-1/3" />
                        <div className="h-3 bg-gray-200 rounded w-1/4" />
                        <div className="grid grid-cols-4 gap-4">
                          {[...Array(4)].map((_, j) => (
                            <div key={j} className="h-3 bg-gray-200 rounded" />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredClients.length > 0 ? (
              filteredClients.map((client) => (
                <div key={client.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={client.player_profile.avatar_url || ''} />
                        <AvatarFallback className="bg-tennis-green-light text-white">
                          {client.player_profile.full_name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="space-y-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold">{client.player_profile.full_name}</h4>
                            <Badge className={getStatusColor(client.status)}>
                              {client.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Coach since {formatDistanceToNow(new Date(client.created_at), { addSuffix: true })}
                          </p>
                        </div>
                        
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                          <div className="flex items-center gap-1">
                            <Target className="h-3 w-3 text-blue-500" />
                            <span>Level {client.player_stats?.current_level || 1}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <TrendingUp className="h-3 w-3 text-green-500" />
                            <span>{Math.round((client.player_stats?.current_hp || 100) / (client.player_stats?.max_hp || 100) * 100)}% HP</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Award className="h-3 w-3 text-yellow-500" />
                            <span>{client.player_stats?.total_xp_earned || 0} XP</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3 text-purple-500" />
                            <span>{formatDistanceToNow(new Date(client.player_stats?.last_activity || new Date()), { addSuffix: true })}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Message
                      </Button>
                      <Button variant="outline" size="sm">
                        <Calendar className="h-4 w-4 mr-2" />
                        Schedule
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No Clients Yet</h3>
                <p className="text-muted-foreground mb-4">
                  Start building your coaching business by inviting players to join your program.
                </p>
                <Button 
                  onClick={() => setShowInviteDialog(true)}
                  className="bg-tennis-green-dark hover:bg-tennis-green-medium"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Invite Your First Player
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="active">
            <p className="text-center text-muted-foreground py-8">
              Active clients will be displayed here
            </p>
          </TabsContent>

          <TabsContent value="premium">
            <p className="text-center text-muted-foreground py-8">
              Premium clients will be displayed here
            </p>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
