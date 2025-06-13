
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Send, MessageCircle, Trophy, Zap, Heart, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { usePlayerHP } from '@/hooks/usePlayerHP';
import { usePlayerXP } from '@/hooks/usePlayerXP';
import { usePlayerTokens } from '@/hooks/usePlayerTokens';
import { usePlayerAchievements } from '@/hooks/usePlayerAchievements';
import { MessageList } from '@/components/messages/MessageList';
import { MessageComposer } from '@/components/messages/MessageComposer';
import { PlayerStatusCard } from '@/components/messages/PlayerStatusCard';
import { AchievementShareCard } from '@/components/messages/AchievementShareCard';
import { ChallengeCard } from '@/components/messages/ChallengeCard';

const Messages = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { hpData } = usePlayerHP();
  const { xpData } = usePlayerXP();
  const { tokenData } = usePlayerTokens();
  const { playerAchievements } = usePlayerAchievements();
  const [activeTab, setActiveTab] = useState('messages');
  const [selectedContact, setSelectedContact] = useState<string | null>(null);

  // Mock data for demonstration
  const [conversations] = useState([
    {
      id: '1',
      name: 'Sarah Johnson',
      lastMessage: 'Great match today! 🎾',
      timestamp: '2 min ago',
      unread: 2,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
      online: true
    },
    {
      id: '2', 
      name: 'Mike Wilson',
      lastMessage: 'Want to play doubles tomorrow?',
      timestamp: '1 hour ago',
      unread: 0,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mike',
      online: false
    },
    {
      id: '3',
      name: 'Tennis Club Group',
      lastMessage: 'Tournament starts next week!',
      timestamp: '3 hours ago',
      unread: 5,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=group',
      online: true,
      isGroup: true
    }
  ]);

  if (!user) {
    return (
      <div className="min-h-screen bg-tennis-green-bg p-3 sm:p-4">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="p-6 sm:p-8 text-center">
              <MessageCircle className="h-12 w-12 sm:h-16 sm:w-16 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-xl sm:text-2xl font-bold mb-2">Messages</h2>
              <p className="text-muted-foreground text-sm sm:text-base">
                Please sign in to access your messages.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-tennis-green-bg">
      {/* Mobile-First Header */}
      <div className="sticky top-0 z-50 bg-tennis-green-bg border-b border-tennis-green-light p-3 sm:p-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 sm:gap-4">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigate('/')}
              className="flex items-center gap-2 flex-shrink-0"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Back</span>
            </Button>
            
            <div className="min-w-0 flex-1">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-tennis-green-dark">
                Messages
              </h1>
              <p className="text-tennis-green-medium text-sm sm:text-base">
                Connect with other players
              </p>
            </div>

            <Button 
              size="sm" 
              className="bg-tennis-green-dark hover:bg-tennis-green-medium flex-shrink-0"
            >
              <Plus className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">New</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-3 sm:p-4 max-w-6xl mx-auto">
        <div className="grid gap-4 lg:grid-cols-4">
          {/* Mobile: Full width, Desktop: Sidebar */}
          <div className={`lg:col-span-1 ${selectedContact ? 'hidden lg:block' : ''}`}>
            <div className="space-y-4">
              {/* Player Status Card */}
              <PlayerStatusCard
                hpData={hpData}
                xpData={xpData}
                tokenData={tokenData}
              />

              {/* Conversations List */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MessageCircle className="h-5 w-5" />
                    Conversations
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <ScrollArea className="h-80">
                    <div className="space-y-1 p-3">
                      {conversations.map((conversation) => (
                        <div
                          key={conversation.id}
                          onClick={() => setSelectedContact(conversation.id)}
                          className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors hover:bg-muted/50 ${
                            selectedContact === conversation.id ? 'bg-tennis-green-light/20' : ''
                          }`}
                        >
                          <div className="relative">
                            <img
                              src={conversation.avatar}
                              alt={conversation.name}
                              className="h-10 w-10 rounded-full"
                            />
                            {conversation.online && (
                              <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-500 rounded-full border-2 border-white" />
                            )}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium truncate">{conversation.name}</h4>
                              <span className="text-xs text-muted-foreground">
                                {conversation.timestamp}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground truncate">
                              {conversation.lastMessage}
                            </p>
                          </div>

                          {conversation.unread > 0 && (
                            <Badge variant="default" className="bg-tennis-green-dark">
                              {conversation.unread}
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Main Chat Area */}
          <div className={`lg:col-span-3 ${!selectedContact ? 'hidden lg:block' : ''}`}>
            {selectedContact ? (
              <div className="space-y-4">
                {/* Mobile: Back button for conversation */}
                <div className="lg:hidden">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedContact(null)}
                    className="mb-3"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to conversations
                  </Button>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="messages" className="flex items-center gap-2">
                      <MessageCircle className="h-4 w-4" />
                      <span className="hidden sm:inline">Chat</span>
                    </TabsTrigger>
                    <TabsTrigger value="achievements" className="flex items-center gap-2">
                      <Trophy className="h-4 w-4" />
                      <span className="hidden sm:inline">Share</span>
                    </TabsTrigger>
                    <TabsTrigger value="challenges" className="flex items-center gap-2">
                      <Zap className="h-4 w-4" />
                      <span className="hidden sm:inline">Challenge</span>
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="messages" className="space-y-4">
                    <MessageList conversationId={selectedContact} />
                    <MessageComposer conversationId={selectedContact} />
                  </TabsContent>

                  <TabsContent value="achievements" className="space-y-4">
                    <AchievementShareCard
                      achievements={playerAchievements}
                      conversationId={selectedContact}
                    />
                  </TabsContent>

                  <TabsContent value="challenges" className="space-y-4">
                    <ChallengeCard
                      conversationId={selectedContact}
                      playerStats={{ hpData, xpData, tokenData }}
                    />
                  </TabsContent>
                </Tabs>
              </div>
            ) : (
              <Card className="h-96 flex items-center justify-center">
                <CardContent className="text-center">
                  <MessageCircle className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">Select a conversation</h3>
                  <p className="text-muted-foreground">
                    Choose a conversation from the list to start messaging
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messages;
