
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send } from 'lucide-react';

interface MessageComposerProps {
  conversationId: string;
  onSendMessage?: (data: { content: string; messageType?: string; metadata?: any }) => void;
  sending?: boolean;
}

export function MessageComposer({ conversationId, onSendMessage, sending }: MessageComposerProps) {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (!message.trim() || sending) return;
    
    if (onSendMessage) {
      onSendMessage({ content: message.trim() });
    }
    
    setMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t border-tennis-green-bg/20 bg-white/80 backdrop-blur-sm p-4">
      <div className="flex items-center space-x-3">
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type a message..."
          disabled={sending}
          className="flex-1 border-tennis-green-bg/30 focus:border-tennis-green-medium"
        />
        <Button
          onClick={handleSend}
          disabled={!message.trim() || sending}
          size="sm"
          className="bg-tennis-green-dark hover:bg-tennis-green-medium px-6"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
