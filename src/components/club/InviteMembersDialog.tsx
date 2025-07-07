import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { UserPlus, Mail, Copy, Check, Crown } from 'lucide-react';
import { useClubs } from '@/hooks/useClubs';
import { useClubSubscription } from '@/hooks/useClubSubscription';
import { useTierEnforcement } from '@/hooks/useTierEnforcement';
import { UsageLimitWarning } from './UsageLimitWarning';
import { toast } from 'sonner';

interface InviteMembersDialogProps {
  clubId: string;
  onInviteSent?: () => void;
  trigger?: React.ReactNode;
}

export function InviteMembersDialog({ clubId, onInviteSent, trigger }: InviteMembersDialogProps) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  
  const { inviteMember } = useClubs();
  const { subscription, usage } = useClubSubscription(clubId);
  const { checkCanInviteMember } = useTierEnforcement(subscription, usage);

  // For demo purposes - in real app this would come from club settings
  const clubInviteCode = 'TEMP123'; // This would be generated per club

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast.error('Please enter an email address');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      toast.error('Please enter a valid email address');
      return;
    }

    // Check tier limits before inviting
    const canInvite = checkCanInviteMember();
    if (!canInvite.allowed) {
      toast.error(canInvite.reason);
      return;
    }

    setLoading(true);
    try {
      await inviteMember(clubId, email.trim(), message.trim() || undefined);
      
      // Reset form
      setEmail('');
      setMessage('');
      setOpen(false);
      
      // Refresh parent data
      onInviteSent?.();
    } catch (error) {
      // Error handled by hook
    } finally {
      setLoading(false);
    }
  };

  const handleCopyInviteCode = async () => {
    try {
      await navigator.clipboard.writeText(clubInviteCode);
      setCopiedCode(true);
      toast.success('Invite code copied to clipboard!');
      setTimeout(() => setCopiedCode(false), 2000);
    } catch (error) {
      toast.error('Failed to copy invite code');
    }
  };

  const defaultTrigger = (
    <Button className="flex items-center gap-2">
      <UserPlus className="h-4 w-4" />
      Invite Members
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Invite New Members
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Usage Warning */}
          <UsageLimitWarning 
            subscription={subscription}
            usage={usage}
            onUpgrade={() => setShowUpgradeModal(true)}
            compact
          />

          {/* Email Invitation */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Mail className="h-4 w-4" />
                <h3 className="font-medium">Send Email Invitation</h3>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="member@example.com"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Personal Message (Optional)</Label>
                  <Textarea
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Come join our tennis club! We'd love to have you as a member."
                    rows={3}
                    maxLength={500}
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={loading || !email.trim()}
                >
                  {loading ? 'Sending...' : 'Send Invitation'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Invite Code Sharing */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Copy className="h-4 w-4" />
                <h3 className="font-medium">Share Invite Code</h3>
              </div>
              
              <p className="text-sm text-gray-600 mb-3">
                Share this code with friends so they can join directly
              </p>
              
              <div className="flex items-center gap-2">
                <Input 
                  value={clubInviteCode} 
                  readOnly 
                  className="font-mono"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyInviteCode}
                  className="flex items-center gap-2"
                >
                  {copiedCode ? (
                    <>
                      <Check className="h-4 w-4" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
              
              <p className="text-xs text-gray-500 mt-2">
                Members can use this code on the club directory page
              </p>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}