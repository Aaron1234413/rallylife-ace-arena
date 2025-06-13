
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageCircle, Users, Plus } from 'lucide-react';
import { MessageList } from '@/components/messages/MessageList';
import { MessageComposer } from '@/components/messages/MessageComposer';
import { PlayerStatusCard } from '@/components/messages/PlayerStatusCard';
import { AchievementShareCard } from '@/components/messages/AchievementShareCard';
import { ChallengeCard } from '@/components/messages/ChallengeCard';
import { usePlayerHP } from '@/hooks/usePlayerHP';
import { usePlayerXP } from '@/hooks/usePlayerXP';
import { usePlayerTokens } from '@/hooks/usePlayerTokens';
import { usePlayerAchievements } from '@/hooks/usePlayerAchievements';
import { useConversations } from '@/hooks/useConversations';
import { useProfiles } from '@/hooks/useProfiles';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function Messages() {
  const { user } = useAuth();
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);

  const { data: hpData, isLoading: hpLoading } = usePlayerHP();
  const { data: xpData, isLoading: xpLoading } = usePlayerXP();
  const { data: tokenData, isLoading: tokensLoading } = usePlayerTokens();
  const { data: achievements = [] } = usePlayerAchievements();
  const { data: conversations = [], isLoading: conversationsLoading } = useConversations();
  const { data: profiles = [] } = useProfiles();

  const playerStats = { hpData, xpData, tokenData };

  const handleStartConversation = async (otherUserId: string) => {
    try {
      const { data, error } = await supabase.rpc('create_direct_conversation', {
        other_user_id: otherUserId
      });

      if (error) throw error;

      setSelectedConversationId(data);
      setIsNewChatOpen(false);
    } catch (error) {
      console.error('Error creating conversation:', error);
    }
  };

  const selectedConversation = conversations.find(c => c.id === selectedConversationId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-tennis-green-light/20 to-tennis-green-medium/20 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Messages</h1>
          <p className="text-gray-600">Chat with other players, share achievements, and send challenges</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar - Conversations List */}
          <div className="lg:col-span-1">
            <Card className="h-[calc(100vh-12rem)]">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <MessageCircle className="h-5 w-5" />
                    Conversations
                  </CardTitle>
                  <Dialog open={isNewChatOpen} onOpenChange={setIsNewChatOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="outline">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Start New Conversation</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-3 max-h-96 overflow-y-auto">
                        {profiles.map((profile) => (
                          <div
                            key={profile.id}
                            className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted cursor-pointer"
                            onClick={() => handleStartConversation(profile.id)}
                          >
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={profile.avatar_url || ''} />
                              <AvatarFallback>
                                {profile.full_name?.charAt(0) || 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{profile.full_name || 'Unknown User'}</p>
                              <p className="text-sm text-muted-foreground">{profile.email}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {conversationsLoading ? (
                  <div className="p-4 text-center text-muted-foreground">
                    Loading conversations...
                  </div>
                ) : conversations.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground">
                    No conversations yet. Start chatting with other players!
                  </div>
                ) : (
                  <div className="space-y-1 p-2">
                    {conversations.map((conversation) => (
                      <div
                        key={conversation.id}
                        className={`p-3 rounded-lg cursor-pointer transition-colors ${
                          selectedConversationId === conversation.id
                            ? 'bg-tennis-green-light text-white'
                            : 'hover:bg-muted'
                        }`}
                        onClick={() => setSelectedConversationId(conversation.id)}
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={conversation.otherParticipant?.avatar_url || ''} />
                            <AvatarFallback>
                              {conversation.otherParticipant?.full_name?.charAt(0) || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">
                              {conversation.name || conversation.otherParticipant?.full_name || 'Unknown User'}
                            </p>
                            <p className="text-sm opacity-75 truncate">
                              {conversation.lastMessage}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Main Chat Area */}
          <div className="lg:col-span-2">
            {selectedConversationId ? (
              <div className="space-y-4">
                <Card className="h-[calc(100vh-20rem)]">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2">
                      <MessageCircle className="h-5 w-5" />
                      {selectedConversation?.name || selectedConversation?.otherParticipant?.full_name || 'Chat'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="h-full overflow-hidden">
                    <MessageList conversationId={selectedConversationId} />
                  </CardContent>
                </Card>
                <MessageComposer conversationId={selectedConversationId} />
              </div>
            ) : (
              <Card className="h-[calc(100vh-12rem)] flex items-center justify-center">
                <div className="text-center">
                  <MessageCircle className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">Select a conversation</h3>
                  <p className="text-muted-foreground">
                    Choose a conversation from the list or start a new one
                  </p>
                </div>
              </Card>
            )}
          </div>

          {/* Right Sidebar - Player Stats & Actions */}
          <div className="lg:col-span-1 space-y-4">
            <PlayerStatusCard
              hpData={hpData}
              xpData={xpData}
              tokenData={tokenData}
            />

            {selectedConversationId && (
              <>
                <ChallengeCard
                  conversationId={selectedConversationId}
                  playerStats={playerStats}
                />

                <AchievementShareCard
                  achievements={achievements}
                  conversationId={selectedConversationId}
                />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
