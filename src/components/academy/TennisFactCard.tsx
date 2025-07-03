import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Lightbulb,
  Share2,
  RefreshCw,
  Calendar
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TennisFact {
  id: string;
  fact: string;
  category: string;
  dateAdded: string;
  isInteresting?: boolean;
}

const TENNIS_FACTS: TennisFact[] = [
  {
    id: '1',
    fact: 'The fastest serve ever recorded was 263.4 km/h (163.7 mph) by Sam Groth in 2012.',
    category: 'Records',
    dateAdded: '2025-01-01',
    isInteresting: true
  },
  {
    id: '2',
    fact: 'Tennis was originally called "lawn tennis" to distinguish it from the earlier game of real tennis.',
    category: 'History',
    dateAdded: '2025-01-02'
  },
  {
    id: '3',
    fact: 'Wimbledon is the only Grand Slam tournament still played on grass courts.',
    category: 'Tournaments',
    dateAdded: '2025-01-03'
  },
  {
    id: '4',
    fact: 'A tennis ball can travel up to 150 mph during a professional match.',
    category: 'Equipment',
    dateAdded: '2025-01-04'
  },
  {
    id: '5',
    fact: 'The longest tennis match lasted 11 hours and 5 minutes (Isner vs Mahut, Wimbledon 2010).',
    category: 'Records',
    dateAdded: '2025-01-05',
    isInteresting: true
  },
  {
    id: '6',
    fact: 'Yellow tennis balls were introduced at Wimbledon in 1986 for better TV visibility.',
    category: 'Equipment',
    dateAdded: '2025-01-06'
  },
  {
    id: '7',
    fact: 'The term "love" for zero points likely comes from the French word "l\'oeuf" (egg).',
    category: 'Terminology',
    dateAdded: '2025-01-07'
  }
];

interface TennisFactCardProps {
  className?: string;
}

export const TennisFactCard: React.FC<TennisFactCardProps> = ({ className = '' }) => {
  const [currentFactIndex, setCurrentFactIndex] = useState(0);
  const { toast } = useToast();

  const currentFact = TENNIS_FACTS[currentFactIndex];

  const handleNextFact = () => {
    setCurrentFactIndex((prev) => (prev + 1) % TENNIS_FACTS.length);
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Tennis Fact of the Day',
          text: currentFact.fact,
          url: window.location.href
        });
      } else {
        await navigator.clipboard.writeText(
          `Tennis Fact: ${currentFact.fact} - via RAKO Academy`
        );
        toast({
          title: "Copied to clipboard!",
          description: "Share this interesting tennis fact with others.",
        });
      }
    } catch (error) {
      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(
          `Tennis Fact: ${currentFact.fact} - via RAKO Academy`
        );
        toast({
          title: "Copied to clipboard!",
          description: "Share this interesting tennis fact with others.",
        });
      } catch (err) {
        toast({
          title: "Could not share",
          description: "Unable to copy to clipboard.",
          variant: "destructive",
        });
      }
    }
  };

  const getCategoryColor = (category: string) => {
    const colorMap: Record<string, string> = {
      'Records': 'bg-yellow-100 text-yellow-800 border-yellow-300',
      'History': 'bg-blue-100 text-blue-800 border-blue-300',
      'Tournaments': 'bg-green-100 text-green-800 border-green-300',
      'Equipment': 'bg-purple-100 text-purple-800 border-purple-300',
      'Terminology': 'bg-indigo-100 text-indigo-800 border-indigo-300'
    };
    return colorMap[category] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  return (
    <Card className={`bg-gradient-to-br from-orange-50 to-yellow-50 border-orange-200 hover-scale transition-all duration-300 animate-fade-in ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-tennis-green-dark">
            <Lightbulb className="h-5 w-5 text-orange-600" />
            Tennis Fact of the Day
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge className={getCategoryColor(currentFact.category)}>
              {currentFact.category}
            </Badge>
            {currentFact.isInteresting && (
              <Badge className="bg-orange-100 text-orange-800 border-orange-300">
                ⭐ Amazing
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Main Fact */}
        <div className="bg-white/80 rounded-lg p-4 border border-orange-100 animate-fade-in">
          <p className="text-tennis-green-dark leading-relaxed font-medium transition-all duration-300">
            {currentFact.fact}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-tennis-green-medium">
            <Calendar className="h-4 w-4" />
            Fact #{currentFactIndex + 1} of {TENNIS_FACTS.length}
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleShare}
              className="text-tennis-green-dark border-orange-200 hover:bg-orange-50 hover-scale transition-all duration-200"
            >
              <Share2 className="h-4 w-4 mr-1" />
              Share
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleNextFact}
              className="text-tennis-green-dark border-orange-200 hover:bg-orange-50 hover-scale transition-all duration-200"
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              Next Fact
            </Button>
          </div>
        </div>

        {/* Fun tip */}
        <div className="text-center text-xs text-tennis-green-medium bg-orange-50 rounded-lg p-2">
          💡 New facts unlock as you progress through your Academy journey!
        </div>
      </CardContent>
    </Card>
  );
};