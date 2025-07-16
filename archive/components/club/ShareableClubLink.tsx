import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Share2, 
  Copy, 
  ExternalLink,
  Plus,
  Clock,
  Users
} from 'lucide-react';
import { useClubs } from '@/hooks/useClubs';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

interface ShareableClubLinkProps {
  clubId: string;
  clubName: string;
}

interface ShareableLink {
  id: string;
  link_slug: string;
  uses_count: number;
  max_uses: number | null;
  expires_at: string;
  is_active: boolean;
  created_at: string;
}

export function ShareableClubLink({ clubId, clubName }: ShareableClubLinkProps) {
  const { createShareableLink, getShareableLinks } = useClubs();
  const [links, setLinks] = useState<ShareableLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [maxUses, setMaxUses] = useState<string>('');
  const [expiresDays, setExpiresDays] = useState<string>('30');

  const fetchLinks = async () => {
    try {
      const data = await getShareableLinks(clubId);
      setLinks(data);
    } catch (error) {
      console.error('Error fetching links:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLink = async () => {
    setCreating(true);
    try {
      const maxUsesNum = maxUses ? parseInt(maxUses) : undefined;
      const expiresDaysNum = parseInt(expiresDays) || 30;
      
      await createShareableLink(clubId, maxUsesNum, expiresDaysNum);
      await fetchLinks();
      setShowCreateForm(false);
      setMaxUses('');
      setExpiresDays('30');
    } catch (error) {
      console.error('Error creating link:', error);
    } finally {
      setCreating(false);
    }
  };

  const copyToClipboard = (linkSlug: string) => {
    const fullUrl = `${window.location.origin}/join-club/${linkSlug}`;
    navigator.clipboard.writeText(fullUrl);
    toast.success('Link copied to clipboard!');
  };

  const shareLink = (linkSlug: string) => {
    const fullUrl = `${window.location.origin}/join-club/${linkSlug}`;
    if (navigator.share) {
      navigator.share({
        title: `Join ${clubName}`,
        text: `You're invited to join ${clubName} tennis club!`,
        url: fullUrl,
      });
    } else {
      copyToClipboard(linkSlug);
    }
  };

  useEffect(() => {
    fetchLinks();
  }, [clubId]);

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <LoadingSpinner size="lg" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5 text-tennis-green-primary" />
            Club Invitation Links
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowCreateForm(!showCreateForm)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Link
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Create Form */}
        {showCreateForm && (
          <div className="p-4 border rounded-lg space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="maxUses">Max Uses (optional)</Label>
                <Input
                  id="maxUses"
                  type="number"
                  placeholder="Unlimited"
                  value={maxUses}
                  onChange={(e) => setMaxUses(e.target.value)}
                  min="1"
                />
              </div>
              <div>
                <Label htmlFor="expiresDays">Expires in (days)</Label>
                <Input
                  id="expiresDays"
                  type="number"
                  value={expiresDays}
                  onChange={(e) => setExpiresDays(e.target.value)}
                  min="1"
                  max="365"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleCreateLink}
                disabled={creating}
                className="flex-1"
              >
                {creating ? <LoadingSpinner size="sm" /> : 'Create Link'}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowCreateForm(false)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Active Links */}
        {links.length > 0 ? (
          <div className="space-y-3">
            {links.map((link) => (
              <div
                key={link.id}
                className="flex items-center gap-3 p-3 border rounded-lg hover:bg-tennis-green-bg/10 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <code className="text-sm bg-tennis-green-bg/20 px-2 py-1 rounded font-mono">
                      {link.link_slug}
                    </code>
                    {link.is_active ? (
                      <Badge variant="default" className="bg-green-500">Active</Badge>
                    ) : (
                      <Badge variant="secondary">Expired</Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-4 text-xs text-tennis-green-medium">
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      <span>
                        {link.uses_count} / {link.max_uses || '∞'} uses
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>
                        Expires {formatDistanceToNow(new Date(link.expires_at), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(link.link_slug)}
                    disabled={!link.is_active}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => shareLink(link.link_slug)}
                    disabled={!link.is_active}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <Share2 className="h-12 w-12 mx-auto mb-3 text-tennis-green-medium/50" />
            <p className="text-sm text-tennis-green-medium">
              No invitation links created yet
            </p>
            <p className="text-xs text-tennis-green-medium/70">
              Create a link to easily invite new members
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}