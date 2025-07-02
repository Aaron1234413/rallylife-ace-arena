
import React, { useState } from 'react';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Brain, 
  Dumbbell, 
  Heart, 
  Clock,
  Sparkles
} from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface WellbeingMode {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  duration: string;
  hp: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

const wellbeingModes: WellbeingMode[] = [
  {
    id: 'meditation',
    title: 'Meditation',
    description: 'Mindful breathing and relaxation',
    icon: Brain,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    duration: '5-15 min',
    hp: 10,
    difficulty: 'easy'
  },
  {
    id: 'stretching',
    title: 'Stretching',
    description: 'Tennis-focused muscle recovery',
    icon: Dumbbell,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    duration: '8-20 min',
    hp: 12,
    difficulty: 'medium'
  }
];

interface WellbeingModeSelectorProps {
  onModeSelect: (mode: WellbeingMode) => void;
  children: React.ReactNode;
}

export function WellbeingModeSelector({ onModeSelect, children }: WellbeingModeSelectorProps) {
  const [open, setOpen] = useState(false);
  const isMobile = useIsMobile();

  const handleModeSelect = (mode: WellbeingMode) => {
    onModeSelect(mode);
    setOpen(false);
  };

  const content = (
    <div className="space-y-4">
      <div className="text-center space-y-2">
        <div className="flex justify-center">
          <div className="p-3 rounded-full bg-gradient-to-r from-purple-100 to-green-100">
            <Sparkles className="h-6 w-6 text-purple-600" />
          </div>
        </div>
        <p className="text-sm text-gray-600">
          Choose your wellbeing method to restore HP and improve mental health
        </p>
      </div>

      <div className="grid gap-3">
        {wellbeingModes.map((mode) => {
          const Icon = mode.icon;
          return (
            <Card 
              key={mode.id}
              className="border-2 hover:border-primary/20 transition-colors cursor-pointer"
              onClick={() => handleModeSelect(mode)}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${mode.bgColor}`}>
                    <Icon className={`h-5 w-5 ${mode.color}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{mode.title}</h3>
                      <Badge variant="outline" className="text-xs">
                        {mode.difficulty}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{mode.description}</p>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{mode.duration}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Heart className="h-3 w-3 text-red-500" />
                        <span>+{mode.hp} HP</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="text-center">
        <p className="text-xs text-gray-500">
          💡 Regular wellbeing sessions help maintain peak performance and mental health
        </p>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>
          {children}
        </DrawerTrigger>
        <DrawerContent className="px-4 pb-6">
          <DrawerHeader className="text-left">
            <DrawerTitle>Wellbeing Center</DrawerTitle>
            <DrawerDescription>
              Choose your wellbeing method
            </DrawerDescription>
          </DrawerHeader>
          {content}
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {children}
      </SheetTrigger>
      <SheetContent side="bottom" className="max-h-[80vh]">
        <SheetHeader>
          <SheetTitle>Wellbeing Center</SheetTitle>
          <SheetDescription>
            Choose your wellbeing method
          </SheetDescription>
        </SheetHeader>
        <div className="mt-6">
          {content}
        </div>
      </SheetContent>
    </Sheet>
  );
}
