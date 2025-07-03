
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useSearchParams } from 'react-router-dom';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function Messages() {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showMobileConversation, setShowMobileConversation] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  // Fetch data
  const { data: conversations, isLoading: conversationsLoading } = useConversations();
  const { messages, loading: messagesLoading, sendMessage, sending } = useMessages(selectedConversation);
  
  // Player data for sidebar
  const { hpData, loading: hpLoading } = usePlayerHP();
  const { xpData, loading: xpLoading } = usePlayerXP();
  const { tokenData, loading: tokensLoading } = usePlayerTokens();
  const { playerAchievements } = usePlayerAchievements();

  // Handle URL parameter for auto-selecting conversation
  useEffect(() => {
    const conversationParam = searchParams.get('conversation');
    if (conversationParam && conversationParam !== selectedConversation) {
      setSelectedConversation(conversationParam);
      setShowMobileConversation(true);
      // Clear the URL parameter to clean up the URL
      setSearchParams({});
    }
  }, [searchParams, selectedConversation, setSearchParams]);

  const handleConversationSelect = (conversationId: string) => {
    setSelectedConversation(conversationId);
    setShowMobileConversation(true);
  };

  const selectedConversationData = conversations?.find(c => c.id === selectedConversation);
  const otherParticipant = selectedConversationData?.otherParticipant;

  return (
    <div className="min-h-screen bg-gradient-to-br from-tennis-green-dark via-tennis-green-medium to-tennis-green-light">
      <div className="container mx-auto px-4 py-6 sm:py-8">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8 space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-white rounded-full shadow-lg">
            <span className="text-xl">💬</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">Messages</h1>
          <p className="text-tennis-green-bg/90">Connect with players and coaches</p>
        </div>

        <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-xl border border-white/20 overflow-hidden">
          <div className="h-[calc(100vh-220px)] flex">
            {/* Conversations Sidebar */}
            <div className={`w-full md:w-80 border-r border-tennis-green-bg/20 bg-gradient-to-b from-tennis-green-bg/5 to-tennis-green-bg/10 flex flex-col ${
              showMobileConversation ? 'hidden md:flex' : 'flex'
            }`}>
              {/* Search */}
              <div className="p-6 border-b border-tennis-green-bg/20 bg-gradient-to-r from-tennis-green-bg/5 to-transparent">
                <h2 className="text-lg font-semibold text-tennis-green-dark mb-4 flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Conversations
                </h2>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-tennis-green-dark/50" />
                  <Input
                    placeholder="Search conversations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 border-tennis-green-bg/30 focus:border-tennis-green-medium bg-white/70 backdrop-blur-sm"
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
                  <div className="flex-1 overflow-hidden bg-tennis-green-bg/5">
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
                  <div className="space-y-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-tennis-green-bg/20 rounded-full">
                      <MessageSquare className="h-8 w-8 text-tennis-green-medium" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-semibold text-tennis-green-dark">Select a conversation</h3>
                      <p className="text-tennis-green-dark/70 max-w-sm">
                        Choose a conversation from the list to start messaging with players and coaches
                      </p>
                    </div>
                    <NewConversationDialog>
                      <Button className="bg-tennis-green-dark hover:bg-tennis-green-medium">
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
              <div className="hidden lg:block w-80 border-l border-tennis-green-bg/20 bg-tennis-green-bg/5">
                <ScrollArea className="h-full">
                  <div className="p-4 space-y-4">
                    {/* Quick Actions Header */}
                    <Card className="bg-white/80 backdrop-blur-sm border-tennis-green-bg/30">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-tennis-green-dark">
                          Quick Actions
                        </CardTitle>
                      </CardHeader>
                    </Card>
                    
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
      </div>
    </div>
  );
}
