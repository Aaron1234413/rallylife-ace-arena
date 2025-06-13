
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  MessageSquare, 
  Search, 
  Plus,
  Users,
  Send,
  ArrowLeft
} from 'lucide-react';
import { useConversations } from '@/hooks/useConversations';
import { useMessages } from '@/hooks/useMessages';
import { useProfiles } from '@/hooks/useProfiles';
import { usePlayerHP } from '@/hooks/usePlayerHP';
import { usePlayerXP } from '@/hooks/usePlayerXP';
import { usePlayerTokens } from '@/hooks/usePlayerTokens';
import { usePlayerAchievements } from '@/hooks/usePlayerAchievements';
import { MessageList } from '@/components/messages/MessageList';
import { MessageComposer } from '@/components/messages/MessageComposer';
import { PlayerStatusCard } from '@/components/messages/PlayerStatusCard';
import { ChallengeCard } from '@/components/messages/ChallengeCard';
import { AchievementShareCard } from '@/components/messages/AchievementShareCard';
import { format } from 'date-fns';

export default function Messages() {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showMobileConversation, setShowMobileConversation] = useState(false);

  // Fetch data
  const { data: conversations, loading: conversationsLoading } = useConversations();
  const { messages, loading: messagesLoading } = useMessages(selectedConversation);
  const { data: profiles } = useProfiles();
  
  // Player data
  const { hpData, loading: hpLoading } = usePlayerHP();
  const { xpData, loading: xpLoading } = usePlayerXP();
  const { tokenData, loading: tokensLoading } = usePlayerTokens();
  const { playerAchievements } = usePlayerAchievements();

  // Filter conversations based on search
  const filteredConversations = conversations?.filter(conversation => {
    if (!searchTerm) return true;
    const otherParticipant = conversation.otherParticipant;
    return otherParticipant?.full_name?.toLowerCase().includes(searchTerm.toLowerCase());
  }) || [];

  const handleConversationSelect = (conversationId: string) => {
    setSelectedConversation(conversationId);
    setShowMobileConversation(true);
  };

  const handleCreateConversation = () => {
    // TODO: Implement conversation creation modal
    console.log('Create new conversation');
  };

  const selectedConversationData = conversations?.find(c => c.id === selectedConversation);

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="border-b bg-background px-4 py-3">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">Messages</h1>
          <Button onClick={handleCreateConversation} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            New Chat
          </Button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Conversations List - Hidden on mobile when conversation is selected */}
        <div className={`w-full md:w-80 border-r bg-background flex flex-col ${
          showMobileConversation ? 'hidden md:flex' : 'flex'
        }`}>
          {/* Search */}
          <div className="p-4 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Conversations */}
          <ScrollArea className="flex-1">
            {conversationsLoading ? (
              <div className="p-4 space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-3 animate-pulse">
                    <div className="w-10 h-10 bg-gray-200 rounded-full" />
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded mb-1" />
                      <div className="h-3 bg-gray-200 rounded w-3/4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No conversations yet</p>
                <p className="text-sm">Start a new chat to begin messaging</p>
              </div>
            ) : (
              <div className="divide-y">
                {filteredConversations.map((conversation) => {
                  const otherParticipant = conversation.otherParticipant;
                  const isSelected = selectedConversation === conversation.id;
                  
                  return (
                    <button
                      key={conversation.id}
                      onClick={() => handleConversationSelect(conversation.id)}
                      className={`w-full p-4 text-left hover:bg-muted transition-colors ${
                        isSelected ? 'bg-muted' : ''
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={otherParticipant?.avatar_url || ''} />
                          <AvatarFallback>
                            {otherParticipant?.full_name?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="font-medium truncate">
                              {otherParticipant?.full_name || 'Unknown User'}
                            </p>
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(conversation.lastMessageTime), 'MMM d')}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground truncate">
                            {conversation.lastMessage}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Chat Area */}
        <div className={`flex-1 flex flex-col ${
          !showMobileConversation ? 'hidden md:flex' : 'flex'
        }`}>
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="border-b bg-background px-4 py-3">
                <div className="flex items-center space-x-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowMobileConversation(false)}
                    className="md:hidden"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={selectedConversationData?.otherParticipant?.avatar_url || ''} />
                    <AvatarFallback>
                      {selectedConversationData?.otherParticipant?.full_name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div>
                    <p className="font-medium">
                      {selectedConversationData?.otherParticipant?.full_name || 'Unknown User'}
                    </p>
                    <p className="text-xs text-muted-foreground">Online</p>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-hidden">
                <MessageList
                  messages={messages}
                  loading={messagesLoading}
                  conversationId={selectedConversation}
                />
              </div>

              {/* Message Composer */}
              <MessageComposer conversationId={selectedConversation} />
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-center p-8">
              <div>
                <MessageSquare className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-medium mb-2">Select a conversation</h3>
                <p className="text-muted-foreground">
                  Choose a conversation from the list to start messaging
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar - Only show on desktop when conversation is selected */}
        {selectedConversation && (
          <div className="hidden lg:block w-80 border-l bg-muted/20">
            <ScrollArea className="h-full">
              <div className="p-4 space-y-4">
                <PlayerStatusCard
                  hpData={hpData}
                  xpData={xpData}
                  tokenData={tokenData}
                  loading={hpLoading || xpLoading || tokensLoading}
                />
                
                <ChallengeCard
                  otherUserId={selectedConversationData?.otherParticipant?.id}
                  conversationId={selectedConversation}
                  tokenData={tokenData}
                />
                
                <AchievementShareCard
                  achievements={playerAchievements}
                  conversationId={selectedConversation}
                />
              </div>
            </ScrollArea>
          </div>
        )}
      </div>
    </div>
  );
}
