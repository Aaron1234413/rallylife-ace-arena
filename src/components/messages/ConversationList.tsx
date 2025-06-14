
import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { MessageSquare, Users, Calendar } from 'lucide-react';

interface ConversationListProps {
  conversations: any[];
  loading: boolean;
  selectedConversation: string | null;
  onConversationSelect: (conversationId: string) => void;
  searchTerm: string;
}

export function ConversationList({ 
  conversations, 
  loading, 
  selectedConversation, 
  onConversationSelect,
  searchTerm 
}: ConversationListProps) {
  const filteredConversations = conversations?.filter(conversation => {
    if (!searchTerm) return true;
    const otherParticipant = conversation.otherParticipant;
    return otherParticipant?.full_name?.toLowerCase().includes(searchTerm.toLowerCase());
  }) || [];

  if (loading) {
    return (
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
    );
  }

  if (filteredConversations.length === 0) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p className="font-medium">No conversations yet</p>
        <p className="text-sm">Start a new chat to begin messaging</p>
      </div>
    );
  }

  return (
    <ScrollArea className="flex-1">
      <div className="divide-y">
        {filteredConversations.map((conversation) => {
          const isSelected = selectedConversation === conversation.id;
          const otherParticipant = conversation.otherParticipant;
          
          return (
            <button
              key={conversation.id}
              onClick={() => onConversationSelect(conversation.id)}
              className={`w-full p-4 text-left hover:bg-muted transition-colors ${
                isSelected ? 'bg-muted border-r-2 border-tennis-green-dark' : ''
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={otherParticipant?.avatar_url || ''} />
                    <AvatarFallback>
                      {otherParticipant?.full_name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  {/* Online status indicator */}
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-medium truncate text-sm">
                      {otherParticipant?.full_name || 'Unknown User'}
                    </p>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(conversation.lastMessageTime), 'MMM d')}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-sm text-muted-foreground truncate">
                      {conversation.lastMessage}
                    </p>
                    
                    {/* Conversation type indicators */}
                    <div className="flex items-center gap-1">
                      {conversation.is_group && (
                        <Badge variant="secondary" className="text-xs">
                          <Users className="h-3 w-3 mr-1" />
                          Group
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </ScrollArea>
  );
}
