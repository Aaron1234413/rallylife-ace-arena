import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Search, Plus } from 'lucide-react';
import { ConversationList } from '@/components/messages/ConversationList';
import { MessageThread } from '@/components/messages/MessageThread';
import { NewConversationDialog } from '@/components/messages/NewConversationDialog';
import { useConversations } from '@/hooks/useConversations';
import { useSearchParams } from 'react-router-dom';

const Messages = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const conversationId = searchParams.get('conversation');
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewConversation, setShowNewConversation] = useState(false);
  
  const { conversations, loading } = useConversations();

  const handleConversationSelect = (id: string) => {
    setSearchParams({ conversation: id });
  };

  return (
    <div className="min-h-screen bg-tennis-green-bg">
      <div className="container mx-auto h-screen flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-tennis-green-light/20 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-tennis-green-primary rounded-full flex items-center justify-center">
                <span className="text-white text-lg">💬</span>
              </div>
              <h1 className="text-2xl font-bold text-tennis-green-dark">Messages</h1>
            </div>
            <Button 
              onClick={() => setShowNewConversation(true)}
              size="sm"
              className="bg-tennis-green-primary hover:bg-tennis-green-medium"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Chat
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar - Conversation List */}
          <div className="w-80 bg-white border-r border-tennis-green-light/20 flex flex-col">
            {/* Search */}
            <div className="p-4 border-b border-tennis-green-light/20">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search conversations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Conversation List */}
            <ConversationList
              conversations={conversations}
              loading={loading}
              selectedConversation={conversationId}
              onConversationSelect={handleConversationSelect}
              searchTerm={searchTerm}
            />
          </div>

          {/* Main Chat Area */}
          <div className="flex-1 flex flex-col">
            {conversationId ? (
              <MessageThread conversationId={conversationId} />
            ) : (
              <div className="flex-1 flex items-center justify-center bg-tennis-green-bg/50">
                <Card className="p-8 text-center max-w-md mx-auto">
                  <div className="w-16 h-16 bg-tennis-green-primary rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-white text-2xl">💬</span>
                  </div>
                  <h3 className="text-lg font-semibold text-tennis-green-dark mb-2">
                    Select a conversation
                  </h3>
                  <p className="text-tennis-green-medium mb-4">
                    Choose a conversation from the list to start messaging, or create a new one.
                  </p>
                  <Button 
                    onClick={() => setShowNewConversation(true)}
                    className="bg-tennis-green-primary hover:bg-tennis-green-medium"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Start New Conversation
                  </Button>
                </Card>
              </div>
            )}
          </div>
        </div>

        {/* New Conversation Dialog */}
        {showNewConversation && (
          <NewConversationDialog
            open={showNewConversation}
            onOpenChange={setShowNewConversation}
          />
        )}
      </div>
    </div>
  );
};

export default Messages;