
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  MessageSquare, 
  Search, 
  Plus
} from 'lucide-react';
import { useConversations } from '@/hooks/useConversations';
import { useMessages } from '@/hooks/useMessages';
import { usePlayerHP } from '@/hooks/usePlayerHP';
import { usePlayerXP } from '@/hooks/usePlayerXP';
import { usePlayerTokens } from '@/hooks/usePlayerTokens';
import { usePlayerAchievements } from '@/hooks/usePlayerAchievements';
import { ConversationList } from '@/components/messages/ConversationList';
import { ConversationHeader } from '@/components/messages/ConversationHeader';
import { MessageList } from '@/components/messages/MessageList';
import { MessageComposer } from '@/components/messages/MessageComposer';
import { PlayerStatusCard } from '@/components/messages/PlayerStatusCard';
import { ChallengeCard } from '@/components/messages/ChallengeCard';
import { AchievementShareCard } from '@/components/messages/AchievementShareCard';
import { NewConversationDialog } from '@/components/messages/NewConversationDialog';

export default function Messages() {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showMobileConversation, setShowMobileConversation] = useState(false);

  // Fetch data
  const { data: conversations, isLoading: conversationsLoading } = useConversations();
  const { messages, loading: messagesLoading, sendMessage, sending } = useMessages(selectedConversation);
  
  // Player data for sidebar
  const { hpData, loading: hpLoading } = usePlayerHP();
  const { xpData, loading: xpLoading } = usePlayerXP();
  const { tokenData, loading: tokensLoading } = usePlayerTokens();
  const { playerAchievements } = usePlayerAchievements();

  const handleConversationSelect = (conversationId: string) => {
    setSelectedConversation(conversationId);
    setShowMobileConversation(true);
  };

  const selectedConversationData = conversations?.find(c => c.id === selectedConversation);
  const otherParticipant = selectedConversationData?.otherParticipant;

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="border-b bg-background px-4 py-3">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">Messages</h1>
          <NewConversationDialog>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              New Chat
            </Button>
          </NewConversationDialog>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Conversations Sidebar */}
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
          <ConversationList
            conversations={conversations || []}
            loading={conversationsLoading}
            selectedConversation={selectedConversation}
            onConversationSelect={handleConversationSelect}
            searchTerm={searchTerm}
          />
        </div>

        {/* Chat Area */}
        <div className={`flex-1 flex flex-col ${
          !showMobileConversation ? 'hidden md:flex' : 'flex'
        }`}>
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <ConversationHeader
                otherParticipant={otherParticipant}
                onBackClick={() => setShowMobileConversation(false)}
                showBackButton={true}
              />

              {/* Messages */}
              <div className="flex-1 overflow-hidden">
                <MessageList
                  messages={messages}
                  loading={messagesLoading}
                  conversationId={selectedConversation}
                />
              </div>

              {/* Message Composer */}
              <MessageComposer 
                conversationId={selectedConversation} 
                onSendMessage={sendMessage}
                sending={sending}
              />
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-center p-8">
              <div>
                <MessageSquare className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-medium mb-2">Select a conversation</h3>
                <p className="text-muted-foreground mb-4">
                  Choose a conversation from the list to start messaging
                </p>
                <NewConversationDialog>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Start New Chat
                  </Button>
                </NewConversationDialog>
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar - Enhanced for coach features */}
        {selectedConversation && (
          <div className="hidden lg:block w-80 border-l bg-muted/20">
            <ScrollArea className="h-full">
              <div className="p-4 space-y-4">
                {/* Quick Actions Header */}
                <div className="text-sm font-medium text-muted-foreground border-b pb-2">
                  Quick Actions
                </div>
                
                <PlayerStatusCard
                  hpData={hpData}
                  xpData={xpData}
                  tokenData={tokenData}
                  loading={hpLoading || xpLoading || tokensLoading}
                />
                
                <ChallengeCard
                  otherUserId={otherParticipant?.id}
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
