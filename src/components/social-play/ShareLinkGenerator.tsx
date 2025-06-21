
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Share2, Copy, Check, ExternalLink } from 'lucide-react';
import { useEventSharing } from '@/hooks/useEventSharing';

interface ShareLinkGeneratorProps {
  event: {
    id: string;
    session_type: string;
    location?: string;
    title?: string;
  };
  compact?: boolean;
}

export const ShareLinkGenerator: React.FC<ShareLinkGeneratorProps> = ({ 
  event, 
  compact = false 
}) => {
  const { generateShareUrl, shareEvent, copyToClipboard } = useEventSharing();
  const [copied, setCopied] = useState(false);
  
  const shareUrl = generateShareUrl(event.id);

  const handleShare = async () => {
    await shareEvent(event);
  };

  const handleCopy = async () => {
    const success = await copyToClipboard(event.id);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleOpenLink = () => {
    window.open(shareUrl, '_blank');
  };

  if (compact) {
    return (
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={handleShare}
          className="flex items-center gap-1"
        >
          <Share2 className="h-3 w-3" />
          Share
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={handleCopy}
          className="flex items-center gap-1"
        >
          {copied ? (
            <>
              <Check className="h-3 w-3" />
              Copied
            </>
          ) : (
            <>
              <Copy className="h-3 w-3" />
              Copy Link
            </>
          )}
        </Button>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Share2 className="h-5 w-5" />
          Share Event
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Event Link</label>
          <div className="flex gap-2">
            <Input
              value={shareUrl}
              readOnly
              className="font-mono text-sm"
            />
            <Button
              variant="outline"
              onClick={handleOpenLink}
              className="shrink-0"
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={handleShare}
            className="flex-1 flex items-center gap-2"
          >
            <Share2 className="h-4 w-4" />
            Share Event
          </Button>
          <Button
            variant="outline"
            onClick={handleCopy}
            className="flex items-center gap-2"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                Copy Link
              </>
            )}
          </Button>
        </div>

        <div className="text-sm text-muted-foreground">
          Anyone with this link can join your tennis event. Share it on social media, 
          messaging apps, or send it directly to friends!
        </div>
      </CardContent>
    </Card>
  );
};
