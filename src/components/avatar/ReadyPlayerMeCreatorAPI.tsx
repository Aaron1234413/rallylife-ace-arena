
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useReadyPlayerMeAPI } from '@/hooks/useReadyPlayerMeAPI';
import { ReadyPlayerMeAvatar } from './ReadyPlayerMeAvatar';
import { User, Shirt, Palette, Save, RefreshCw, Wifi, AlertCircle, CheckCircle } from 'lucide-react';

interface ReadyPlayerMeCreatorAPIProps {
  currentAvatarUrl?: string;
  onAvatarSaved?: (avatarUrl: string) => void;
}

export function ReadyPlayerMeCreatorAPI({ 
  currentAvatarUrl, 
  onAvatarSaved 
}: ReadyPlayerMeCreatorAPIProps) {
  const { 
    loading, 
    avatarUrl, 
    assets, 
    connectionStatus,
    testConnection,
    createAvatar, 
    updateAvatar, 
    getAssets 
  } = useReadyPlayerMeAPI();

  const [selectedAssets, setSelectedAssets] = useState<Record<string, string>>({});
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [bodyType, setBodyType] = useState<'fullbody' | 'halfbody'>('fullbody');

  useEffect(() => {
    getAssets();
  }, []);

  const handleAssetSelect = (category: string, assetId: string) => {
    setSelectedAssets(prev => ({
      ...prev,
      [category]: assetId
    }));
  };

  const handleSaveAvatar = async () => {
    try {
      const avatarData = {
        gender,
        bodyType,
        assets: selectedAssets
      };

      const result = currentAvatarUrl 
        ? await updateAvatar(avatarData)
        : await createAvatar(avatarData);

      if (result.success && onAvatarSaved) {
        onAvatarSaved(result.avatarUrl);
      }
    } catch (error) {
      console.error('Failed to save avatar:', error);
    }
  };

  const handleTestConnection = async () => {
    await testConnection();
  };

  const assetCategories = assets.reduce((acc, asset) => {
    if (!acc[asset.category]) {
      acc[asset.category] = [];
    }
    acc[asset.category].push(asset);
    return acc;
  }, {} as Record<string, typeof assets>);

  const getConnectionStatusIcon = () => {
    switch (connectionStatus) {
      case 'connected':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Wifi className="h-4 w-4 text-gray-400" />;
    }
  };

  const getConnectionStatusText = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'Connected';
      case 'error':
        return 'Connection Error';
      default:
        return 'Unknown';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Create Your 3D Avatar
          <div className="ml-auto flex items-center gap-2">
            {getConnectionStatusIcon()}
            <span className="text-sm text-muted-foreground">
              {getConnectionStatusText()}
            </span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Connection Test Section */}
        <div className="border rounded-lg p-4 bg-gray-50">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">API Connection Status</h4>
              <p className="text-sm text-muted-foreground">
                Test connection to Ready Player Me service
              </p>
            </div>
            <Button 
              onClick={handleTestConnection}
              disabled={loading}
              variant="outline"
              size="sm"
            >
              {loading ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Wifi className="h-4 w-4" />
              )}
              Test Connection
            </Button>
          </div>
        </div>

        {/* Avatar Preview */}
        {(avatarUrl || currentAvatarUrl) && (
          <div className="text-center">
            <ReadyPlayerMeAvatar 
              avatarUrl={avatarUrl || currentAvatarUrl || ''}
              size="lg"
            />
          </div>
        )}

        {/* Basic Settings */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Gender</label>
              <div className="flex gap-2">
                <Button
                  variant={gender === 'male' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setGender('male')}
                >
                  Male
                </Button>
                <Button
                  variant={gender === 'female' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setGender('female')}
                >
                  Female
                </Button>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Body Type</label>
              <div className="flex gap-2">
                <Button
                  variant={bodyType === 'fullbody' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setBodyType('fullbody')}
                >
                  Full Body
                </Button>
                <Button
                  variant={bodyType === 'halfbody' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setBodyType('halfbody')}
                >
                  Half Body
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Asset Selection */}
        {Object.keys(assetCategories).length > 0 && (
          <Tabs defaultValue={Object.keys(assetCategories)[0]}>
            <TabsList className="grid w-full grid-cols-3">
              {Object.keys(assetCategories).slice(0, 3).map((category) => (
                <TabsTrigger key={category} value={category} className="capitalize">
                  {category}
                </TabsTrigger>
              ))}
            </TabsList>

            {Object.entries(assetCategories).map(([category, categoryAssets]) => (
              <TabsContent key={category} value={category} className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {categoryAssets.map((asset) => (
                    <Card 
                      key={asset.id}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        selectedAssets[category] === asset.id ? 'ring-2 ring-tennis-green-light' : ''
                      }`}
                      onClick={() => handleAssetSelect(category, asset.id)}
                    >
                      <CardContent className="p-3">
                        <div className="space-y-2">
                          <img 
                            src={asset.iconUrl} 
                            alt={asset.name}
                            className="w-full h-16 object-cover rounded"
                          />
                          <div>
                            <h4 className="text-xs font-medium">{asset.name}</h4>
                            <Badge variant="outline" className="text-xs">
                              {asset.type}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button 
            onClick={handleSaveAvatar}
            disabled={loading || connectionStatus === 'error'}
            className="flex-1"
          >
            {loading ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            {currentAvatarUrl ? 'Update Avatar' : 'Create Avatar'}
          </Button>
          
          <Button 
            variant="outline" 
            onClick={getAssets}
            disabled={loading}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>

        {/* Info */}
        <div className="text-sm text-gray-600 space-y-1">
          <p>• Test the connection first to ensure API communication</p>
          <p>• Customize your 3D avatar with Ready Player Me</p>
          <p>• Choose from professional tennis clothing and equipment</p>
          <p>• Your avatar will be saved and used throughout RallyLife</p>
        </div>
      </CardContent>
    </Card>
  );
}
