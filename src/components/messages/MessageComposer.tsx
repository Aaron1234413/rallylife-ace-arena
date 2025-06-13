
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Smile, Paperclip } from 'lucide-react';

interface MessageComposerProps {
  conversationId: string;
}

export function MessageComposer({ conversationId }: MessageComposerProps) {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (message.trim()) {
      // TODO: Implement message sending logic
      console.log('Sending message:', message, 'to conversation:', conversationId);
      setMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Card>
      <CardContent className="p-3">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="flex-shrink-0">
            <Paperclip className="h-4 w-4" />
          </Button>

          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="flex-1"
          />

          <Button variant="ghost" size="sm" className="flex-shrink-0">
            <Smile className="h-4 w-4" />
          </Button>

          <Button 
            onClick={handleSend}
            disabled={!message.trim()}
            size="sm"
            className="bg-tennis-green-dark hover:bg-tennis-green-medium flex-shrink-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
