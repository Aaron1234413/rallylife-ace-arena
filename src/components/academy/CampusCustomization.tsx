import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Palette, 
  Building, 
  Crown, 
  Sparkles,
  Save,
  RotateCcw,
  Star,
  Lock,
  CheckCircle
} from 'lucide-react';

interface CampusTheme {
  id: string;
  name: string;
  description: string;
  preview: string;
  cost: number;
  tokenType: 'regular' | 'premium';
  isUnlocked: boolean;
  isSelected: boolean;
  category: 'color' | 'style' | 'special';
}

interface BuildingCustomization {
  id: string;
  buildingType: string;
  name: string;
  description: string;
  cost: number;
  isUnlocked: boolean;
  isActive: boolean;
}

interface CampusCustomizationProps {
  className?: string;
}

// Mock customization data
const CAMPUS_THEMES: CampusTheme[] = [
  {
    id: '1',
    name: 'Classic Academy',
    description: 'Traditional brick and ivy campus style',
    preview: '🏛️',
    cost: 0,
    tokenType: 'regular',
    isUnlocked: true,
    isSelected: true,
    category: 'color'
  },
  {
    id: '2',
    name: 'Golden Prestige',
    description: 'Luxurious golden buildings with sparkle effects',
    preview: '🏰',
    cost: 5,
    tokenType: 'premium',
    isUnlocked: false,
    isSelected: false,
    category: 'special'
  },
  {
    id: '3',
    name: 'Cyber Academy',
    description: 'Futuristic neon-lit digital campus',
    preview: '🏢',
    cost: 75,
    tokenType: 'regular',
    isUnlocked: true,
    isSelected: false,
    category: 'style'
  },
  {
    id: '4',
    name: 'Nature Grove',
    description: 'Eco-friendly treehouse campus design',
    preview: '🌳',
    cost: 50,
    tokenType: 'regular',
    isUnlocked: true,
    isSelected: false,
    category: 'color'
  },
  {
    id: '5',
    name: 'Royal Championship',
    description: 'Championship-worthy royal palace theme',
    preview: '👑',
    cost: 10,
    tokenType: 'premium',
    isUnlocked: false,
    isSelected: false,
    category: 'special'
  },
  {
    id: '6',
    name: 'Minimalist Modern',
    description: 'Clean, modern architectural design',
    preview: '🏗️',
    cost: 100,
    tokenType: 'regular',
    isUnlocked: false,
    isSelected: false,
    category: 'style'
  }
];

const BUILDING_CUSTOMIZATIONS: BuildingCustomization[] = [
  {
    id: '1',
    buildingType: 'Rules Hall',
    name: 'Golden Dome',
    description: 'Adds a prestigious golden dome to the Rules Hall',
    cost: 25,
    isUnlocked: true,
    isActive: false
  },
  {
    id: '2',
    buildingType: 'Court Academy',
    name: 'Tennis Court Roof',
    description: 'Transforms the roof into a miniature tennis court',
    cost: 30,
    isUnlocked: false,
    isActive: false
  },
  {
    id: '3',
    buildingType: 'Scoring Center',
    name: 'Digital Scoreboard',
    description: 'Adds an animated LED scoreboard display',
    cost: 40,
    isUnlocked: true,
    isActive: true
  },
  {
    id: '4',
    buildingType: 'Strategy Tower',
    name: 'Crystal Observatory',
    description: 'Crystal dome for strategic thinking sessions',
    cost: 60,
    isUnlocked: false,
    isActive: false
  }
];

const getCategoryColor = (category: CampusTheme['category']) => {
  switch (category) {
    case 'color':
      return 'text-blue-600 bg-blue-100';
    case 'style':
      return 'text-purple-600 bg-purple-100';
    case 'special':
      return 'text-yellow-600 bg-yellow-100';
  }
};

const ThemeCard: React.FC<{ 
  theme: CampusTheme; 
  onSelect: (theme: CampusTheme) => void;
  onUnlock: (theme: CampusTheme) => void;
}> = ({ theme, onSelect, onUnlock }) => (
  <Card className={`relative transition-all cursor-pointer hover:shadow-lg ${
    theme.isSelected 
      ? 'ring-2 ring-tennis-green-primary bg-tennis-green-bg/20' 
      : theme.isUnlocked 
        ? 'hover:shadow-md' 
        : 'opacity-75'
  }`}>
    {theme.isSelected && (
      <div className="absolute -top-2 -right-2 bg-tennis-green-primary text-white p-1 rounded-full">
        <CheckCircle className="h-4 w-4" />
      </div>
    )}
    
    <CardHeader className="pb-3">
      <div className="flex items-center justify-between mb-2">
        <Badge className={getCategoryColor(theme.category)}>
          {theme.category}
        </Badge>
        {theme.cost > 0 && (
          <Badge variant="outline">
            {theme.cost} {theme.tokenType === 'premium' ? '💎' : '🪙'}
          </Badge>
        )}
      </div>
      
      <div className="text-center">
        <div className="text-4xl mb-2">{theme.preview}</div>
        <CardTitle className="text-sm font-semibold text-tennis-green-dark">
          {theme.name}
        </CardTitle>
        <p className="text-xs text-tennis-green-medium mt-1">{theme.description}</p>
      </div>
    </CardHeader>
    
    <CardContent className="pt-0">
      {theme.isUnlocked ? (
        <Button 
          onClick={() => onSelect(theme)}
          variant={theme.isSelected ? "default" : "outline"}
          size="sm"
          className="w-full"
          disabled={theme.isSelected}
        >
          {theme.isSelected ? (
            <>
              <CheckCircle className="h-4 w-4 mr-2" />
              Selected
            </>
          ) : (
            <>
              <Palette className="h-4 w-4 mr-2" />
              Apply Theme
            </>
          )}
        </Button>
      ) : (
        <Button 
          onClick={() => onUnlock(theme)}
          size="sm"
          className="w-full"
        >
          <Lock className="h-4 w-4 mr-2" />
          Unlock for {theme.cost} {theme.tokenType === 'premium' ? '💎' : '🪙'}
        </Button>
      )}
    </CardContent>
  </Card>
);

const BuildingCustomizationCard: React.FC<{ 
  customization: BuildingCustomization;
  onToggle: (customization: BuildingCustomization) => void;
  onUnlock: (customization: BuildingCustomization) => void;
}> = ({ customization, onToggle, onUnlock }) => (
  <Card className={`transition-all ${
    customization.isActive ? 'bg-green-50 border-green-200' : 'bg-white'
  }`}>
    <CardContent className="p-4">
      <div className="space-y-3">
        <div>
          <h4 className="font-medium text-tennis-green-dark">{customization.name}</h4>
          <p className="text-sm text-tennis-green-medium">
            For: {customization.buildingType}
          </p>
          <p className="text-xs text-tennis-green-medium mt-1">
            {customization.description}
          </p>
        </div>
        
        <div className="flex items-center justify-between">
          <Badge variant="outline">
            {customization.cost} 🪙
          </Badge>
          
          {customization.isUnlocked ? (
            <Button 
              onClick={() => onToggle(customization)}
              variant={customization.isActive ? "default" : "outline"}
              size="sm"
            >
              {customization.isActive ? 'Deactivate' : 'Activate'}
            </Button>
          ) : (
            <Button 
              onClick={() => onUnlock(customization)}
              size="sm"
            >
              Unlock
            </Button>
          )}
        </div>
      </div>
    </CardContent>
  </Card>
);

export const CampusCustomization: React.FC<CampusCustomizationProps> = ({ className }) => {
  const [themes, setThemes] = useState(CAMPUS_THEMES);
  const [buildingCustomizations, setBuildingCustomizations] = useState(BUILDING_CUSTOMIZATIONS);
  const [activeTab, setActiveTab] = useState('themes');

  const handleSelectTheme = (selectedTheme: CampusTheme) => {
    setThemes(prev => prev.map(theme => ({
      ...theme,
      isSelected: theme.id === selectedTheme.id
    })));
  };

  const handleUnlockTheme = (theme: CampusTheme) => {
    setThemes(prev => prev.map(t => 
      t.id === theme.id ? { ...t, isUnlocked: true } : t
    ));
  };

  const handleToggleCustomization = (customization: BuildingCustomization) => {
    setBuildingCustomizations(prev => prev.map(c => 
      c.id === customization.id ? { ...c, isActive: !c.isActive } : c
    ));
  };

  const handleUnlockCustomization = (customization: BuildingCustomization) => {
    setBuildingCustomizations(prev => prev.map(c => 
      c.id === customization.id ? { ...c, isUnlocked: true } : c
    ));
  };

  const unlockedThemes = themes.filter(t => t.isUnlocked).length;
  const activeCustomizations = buildingCustomizations.filter(c => c.isActive).length;

  return (
    <Card className={`bg-white/95 backdrop-blur-sm border-tennis-green-light/20 ${className}`}>
      <CardHeader className="bg-gradient-to-r from-pink-500 to-purple-600 text-white p-4">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-6 w-6" />
            Campus Customization
          </div>
          <div className="text-right text-sm">
            <div>{unlockedThemes}/{themes.length} themes</div>
            <div>{activeCustomizations} customizations active</div>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="themes" className="text-xs">Campus Themes</TabsTrigger>
            <TabsTrigger value="buildings" className="text-xs">Building Upgrades</TabsTrigger>
            <TabsTrigger value="achievements" className="text-xs">Achievement Showcase</TabsTrigger>
          </TabsList>
          
          <TabsContent value="themes" className="space-y-4">
            <div className="text-center mb-4">
              <h3 className="font-semibold text-tennis-green-dark mb-2">Choose Your Campus Style</h3>
              <p className="text-sm text-tennis-green-medium">
                Transform your entire academy campus with these beautiful themes
              </p>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {themes.map((theme) => (
                <ThemeCard 
                  key={theme.id} 
                  theme={theme} 
                  onSelect={handleSelectTheme}
                  onUnlock={handleUnlockTheme}
                />
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="buildings" className="space-y-4">
            <div className="text-center mb-4">
              <h3 className="font-semibold text-tennis-green-dark mb-2">Building Customizations</h3>
              <p className="text-sm text-tennis-green-medium">
                Add special features and decorations to individual buildings
              </p>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2">
              {buildingCustomizations.map((customization) => (
                <BuildingCustomizationCard 
                  key={customization.id} 
                  customization={customization}
                  onToggle={handleToggleCustomization}
                  onUnlock={handleUnlockCustomization}
                />
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="achievements" className="space-y-4">
            <div className="text-center mb-4">
              <h3 className="font-semibold text-tennis-green-dark mb-2">Achievement Showcase</h3>
              <p className="text-sm text-tennis-green-medium">
                Display your proudest accomplishments around campus
              </p>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="p-4 text-center border-dashed border-2 border-gray-300">
                  <Star className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Achievement Slot {i}</p>
                  <p className="text-xs text-gray-400 mt-1">Unlock achievements to display here</p>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
        
        {/* Action Buttons */}
        <div className="flex gap-2 pt-4 border-t border-gray-100">
          <Button variant="outline" className="flex-1">
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset to Default
          </Button>
          <Button className="flex-1 bg-tennis-green-primary hover:bg-tennis-green-dark">
            <Save className="h-4 w-4 mr-2" />
            Save Customizations
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};