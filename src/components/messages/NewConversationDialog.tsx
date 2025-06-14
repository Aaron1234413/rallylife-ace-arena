
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MessageSquare, Search } from 'lucide-react';
import { useProfiles } from '@/hooks/useProfiles';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface NewConversationDialogProps {
  children: React.ReactNode;
}

export function NewConversationDialog({ children }: NewConversationDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [creating, setCreating] = useState(false);

  const { user } = useAuth();
  const { data: profiles } = useProfiles();
  const queryClient = useQueryClient();

  const filteredProfiles = profiles?.filter(profile => 
    profile.id !== user?.id &&
    (profile.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     profile.email.toLowerCase().includes(searchTerm.toLowerCase()))
  ) || [];

  const handleCreateConversation = async () => {
    if (!selectedUser || creating) return;

    setCreating(true);
    try {
      const { data, error } = await supabase.rpc('create_direct_conversation', {
        other_user_id: selectedUser
      });

      if (error) throw error;

      // Refresh conversations
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      
      toast.success('Conversation created successfully!');
      setOpen(false);
      setSelectedUser('');
      setSearchTerm('');
    } catch (error) {
      console.error('Error creating conversation:', error);
      toast.error('Failed to create conversation');
    } finally {
      setCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Start New Conversation
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Search Input */}
          <div className="space-y-2">
            <Label htmlFor="search">Search Users</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="search"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* User Selection */}
          <div className="space-y-2">
            <Label htmlFor="user">Select User</Label>
            <Select value={selectedUser} onValueChange={setSelectedUser}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a user to message..." />
              </SelectTrigger>
              <SelectContent>
                {filteredProfiles.map((profile) => (
                  <SelectItem key={profile.id} value={profile.id}>
                    <div className="flex items-center gap-2">
                      <span>{profile.full_name || 'Unnamed User'}</span>
                      <span className="text-xs text-muted-foreground">({profile.email})</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Actions */}
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreateConversation}
              disabled={!selectedUser || creating}
              className="bg-tennis-green-dark hover:bg-tennis-green-medium"
            >
              {creating ? 'Creating...' : 'Start Conversation'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
