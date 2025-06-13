
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { User, ShoppingBag, Trophy, Lock, Unlock } from 'lucide-react';

interface CoachAvatarItem {
  id: string;
  name: string;
  category: string;
  ctk_cost: number;
  image_url: string;
  description: string;
  is_professional: boolean;
}

export function CoachReadyPlayerMe() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const [profile, setProfile] = useState<any>(null);
  const [avatarItems, setAvatarItems] = useState<CoachAvatarItem[]>([]);
  const [coachTokens, setCoachTokens] = useState(0);
  const [loading, setLoading] = useState(true);

  // Fetch profile and coach data on mount
  useEffect(() => {
    if (user?.id) {
      fetchProfileData();
      fetchAvatarItems();
      fetchCoachTokens();
    }
  }, [user?.id]);

  // Listen for Ready Player Me messages
  useEffect(() => {
    const handleRPM = (event: MessageEvent) => {
      const { source, eventName, data } = event.data;
      if (source !== 'readyplayerme') return;

      console.log('Ready Player Me event:', eventName, data);

      if (eventName === 'v1.avatar.exported') {
        const avatarUrl = data.url;
        console.log('Avatar exported:', avatarUrl);
        setAvatarUrl(avatarUrl);
        
        toast({
          title: "Avatar Created!",
          description: "Your 3D avatar has been created. Click 'Save Avatar' to store it.",
        });
      }
    };

    window.addEventListener('message', handleRPM);
    return () => window.removeEventListener('message', handleRPM);
  }, [toast]);

  const fetchProfileData = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
      } else {
        setProfile(data);
        if (data.avatar_url) {
          setAvatarUrl(data.avatar_url);
        }
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvatarItems = async () => {
    try {
      const { data, error } = await supabase
        .from('coach_avatar_items')
        .select('*')
        .order('ctk_cost', { ascending: true });

      if (error) {
        console.error('Error fetching avatar items:', error);
      } else {
        setAvatarItems(data || []);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchCoachTokens = async () => {
    try {
      const { data, error } = await supabase
        .from('coach_tokens')
        .select('current_tokens')
        .eq('coach_id', user?.id)
        .single();

      if (error) {
        console.error('Error fetching coach tokens:', error);
      } else {
        setCoachTokens(data?.current_tokens || 0);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleSaveAvatar = async () => {
    if (!avatarUrl) {
      toast({
        title: "No Avatar",
        description: "Please create an avatar first.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ avatar_url: avatarUrl })
        .eq('id', user?.id);

      if (!error) {
        toast({
          title: "Success!",
          description: "Avatar saved successfully!",
        });
        // Update local profile state
        setProfile({ ...profile, avatar_url: avatarUrl });
      } else {
        toast({
          title: "Error",
          description: "Error saving avatar",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error saving avatar:', error);
      toast({
        title: "Error",
        description: "Error saving avatar",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading Ready Player Me...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Coach 3D Avatar Studio
          <Badge variant="default">Professional</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="create" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="create">Create 3D Avatar</TabsTrigger>
            <TabsTrigger value="store">Avatar Items Store</TabsTrigger>
            <TabsTrigger value="progress">CTK Progress Unlocks</TabsTrigger>
          </TabsList>

          {/* Create Avatar Tab */}
          <TabsContent value="create" className="space-y-4">
            <div className="space-y-4">
              {/* Current Avatar Preview */}
              {(profile?.avatar_url || avatarUrl) && (
                <div className="text-center space-y-2">
                  <h4 className="font-medium">Your Current 3D Avatar</h4>
                  <img
                    src={profile?.avatar_url || avatarUrl}
                    alt="3D Avatar Preview"
                    className="rounded-full w-32 h-32 mx-auto border-2 border-tennis-green-light object-cover"
                  />
                </div>
              )}

              {/* Ready Player Me Iframe */}
              <div className="border rounded-lg overflow-hidden">
                <iframe
                  id="rpm-avatar"
                  allow="camera *; microphone *"
                  src="https://demo.readyplayer.me/avatar?frameApi"
                  style={{ width: '100%', height: 600, border: 0 }}
                  title="Ready Player Me Avatar Creator"
                />
              </div>

              {/* Save Button */}
              <div className="flex justify-center">
                <Button
                  onClick={handleSaveAvatar}
                  disabled={!avatarUrl}
                  className="w-full max-w-md"
                >
                  <User className="h-4 w-4 mr-2" />
                  Save Avatar
                </Button>
              </div>

              {/* Instructions */}
              <div className="text-sm text-gray-600 space-y-1">
                <p>• Use the avatar creator above to customize your appearance</p>
                <p>• Choose professional coaching attire</p>
                <p>• Click "Save Avatar" when you're satisfied with your creation</p>
              </div>
            </div>
          </TabsContent>

          {/* Avatar Store Tab */}
          <TabsContent value="store" className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Professional Avatar Items</h3>
                <Badge variant="outline">
                  CTK Balance: {coachTokens}
                </Badge>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {avatarItems.map((item) => {
                  const canAfford = coachTokens >= item.ctk_cost;
                  const isUnlocked = canAfford;

                  return (
                    <Card key={item.id} className={`relative ${!isUnlocked ? 'opacity-60' : ''}`}>
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-sm">{item.name}</CardTitle>
                          {isUnlocked ? (
                            <Unlock className="h-4 w-4 text-green-500" />
                          ) : (
                            <Lock className="h-4 w-4 text-gray-400" />
                          )}
                        </div>
                        {item.is_professional && (
                          <Badge variant="default" className="w-fit text-xs">
                            Professional
                          </Badge>
                        )}
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <img
                          src={item.image_url}
                          alt={item.name}
                          className="w-full h-24 object-cover rounded border"
                        />
                        <p className="text-xs text-gray-600">{item.description}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">
                            {item.ctk_cost} CTK
                          </span>
                          <Button
                            size="sm"
                            disabled={!isUnlocked}
                            variant={isUnlocked ? "default" : "outline"}
                          >
                            {isUnlocked ? "Unlock" : "Locked"}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {avatarItems.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <ShoppingBag className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No avatar items available yet.</p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* CTK Progress Tab */}
          <TabsContent value="progress" className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                <h3 className="text-lg font-semibold">CTK Progress & Unlocks</h3>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Current CTK Balance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-tennis-green-dark">
                    {coachTokens} CTK
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    Earn more CTK by providing excellent coaching sessions and receiving positive player feedback.
                  </p>
                </CardContent>
              </Card>

              <div className="space-y-3">
                <h4 className="font-medium">Unlock Tiers</h4>
                {[
                  { tier: "Basic Professional", required: 0, items: ["Basic coaching attire", "Standard equipment"] },
                  { tier: "Advanced Coach", required: 100, items: ["Premium coaching gear", "Advanced equipment"] },
                  { tier: "Elite Trainer", required: 250, items: ["Elite coaching uniform", "Professional accessories"] },
                  { tier: "Master Coach", required: 500, items: ["Master coach attire", "Exclusive equipment"] },
                ].map((tier, index) => {
                  const isUnlocked = coachTokens >= tier.required;
                  return (
                    <Card key={index} className={`${!isUnlocked ? 'opacity-60' : ''}`}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="font-medium">{tier.tier}</h5>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">{tier.required} CTK</span>
                            {isUnlocked ? (
                              <Unlock className="h-4 w-4 text-green-500" />
                            ) : (
                              <Lock className="h-4 w-4 text-gray-400" />
                            )}
                          </div>
                        </div>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {tier.items.map((item, i) => (
                            <li key={i}>• {item}</li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
