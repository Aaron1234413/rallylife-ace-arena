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
    <Card className={`bg-gradient-to-r from-orange-50 to-yellow-50 border-orange-200 hover-scale transition-all duration-300 shadow-md ${className}`}>
      <CardContent className="p-3 sm:p-4">
        {/* Mobile: Stacked layout / Desktop: Horizontal */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
          
          {/* Header with icon, title and category */}
          <div className="flex items-center justify-between sm:justify-start gap-2 sm:gap-3 flex-shrink-0">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-orange-100 rounded-lg">
                <Lightbulb className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600" />
              </div>
              <span className="font-medium text-tennis-green-dark text-sm sm:text-base orbitron-heading">
                Tennis Fact
              </span>
            </div>
            <Badge className={`text-xs ${getCategoryColor(currentFact.category)} px-2 py-1`}>
              {currentFact.category}
            </Badge>
          </div>

          {/* Main Fact - Mobile full width */}
          <div className="flex-1 bg-white/90 rounded-lg px-3 py-3 sm:px-4 sm:py-2 border border-orange-100 shadow-sm">
            <p className="text-tennis-green-dark text-sm sm:text-base leading-relaxed poppins-body">
              {currentFact.fact}
            </p>
          </div>

          {/* Actions - Mobile: Full width row / Desktop: Compact */}
          <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-1 flex-shrink-0">
            <span className="text-xs sm:text-sm text-tennis-green-medium bg-white/60 px-2 py-1 rounded-full">
              #{currentFactIndex + 1}/{TENNIS_FACTS.length}
            </span>
            
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleShare}
                className="h-8 w-8 sm:h-6 sm:w-6 p-0 hover-scale bg-white/60 hover:bg-white/80"
                title="Share fact"
              >
                <Share2 className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleNextFact}
                className="h-8 w-8 sm:h-6 sm:w-6 p-0 hover-scale bg-white/60 hover:bg-white/80"
                title="Next fact"
              >
                <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};