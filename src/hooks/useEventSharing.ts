
import { useToast } from '@/hooks/use-toast';

export function useEventSharing() {
  const { toast } = useToast();

  const generateShareUrl = (eventId: string) => {
    return `${window.location.origin}/join-social-play?event=${eventId}`;
  };

  const shareEvent = async (event: {
    id: string;
    session_type: string;
    location?: string;
    title?: string;
  }) => {
    const shareUrl = generateShareUrl(event.id);
    const title = event.title || `${event.session_type} Tennis Event`;
    const text = `Join me for a ${event.session_type} tennis session${event.location ? ` at ${event.location}` : ''}!`;

    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text,
          url: shareUrl,
        });
        return true;
      } catch (error) {
        // User cancelled share or sharing failed
        return false;
      }
    } else {
      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(shareUrl);
        toast({
          title: 'Link Copied!',
          description: 'Share this link with others to invite them.',
        });
        return true;
      } catch (error) {
        toast({
          title: 'Could not copy link',
          description: 'Please copy the URL manually.',
          variant: 'destructive',
        });
        return false;
      }
    }
  };

  const copyToClipboard = async (eventId: string) => {
    const shareUrl = generateShareUrl(eventId);
    
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast({
        title: 'Link Copied!',
        description: 'Share this link with others to invite them.',
      });
      return true;
    } catch (error) {
      toast({
        title: 'Could not copy link',
        description: 'Please copy the URL manually.',
        variant: 'destructive',
      });
      return false;
    }
  };

  return {
    generateShareUrl,
    shareEvent,
    copyToClipboard,
  };
}
