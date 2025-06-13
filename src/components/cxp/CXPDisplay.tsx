
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Star, TrendingUp, Award, DollarSign, Wrench } from 'lucide-react';
import { useCoachCXP } from '@/hooks/useCoachCXP';

const tierColors = {
  novice: 'bg-gray-500',
  junior: 'bg-blue-500',
  intermediate: 'bg-green-500',
  advanced: 'bg-purple-500',
  expert: 'bg-orange-500',
  master: 'bg-yellow-500'
};

const tierIcons = {
  novice: Star,
  junior: Star,
  intermediate: TrendingUp,
  advanced: Award,
  expert: Award,
  master: Award
};

export function CXPDisplay() {
  const { cxpData, loading, error } = useCoachCXP();

  if (loading) {
    return (
      <Card className="border-tennis-green-light">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Coach Experience
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-tennis-green-medium">Loading CXP data...</p>
        </CardContent>
      </Card>
    );
  }

  if (error || !cxpData) {
    return (
      <Card className="border-tennis-green-light">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Coach Experience
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-600">Unable to load CXP data</p>
        </CardContent>
      </Card>
    );
  }

  const progressPercentage = cxpData.cxp_to_next_level > 0 
    ? ((cxpData.current_cxp / (cxpData.current_cxp + cxpData.cxp_to_next_level)) * 100)
    : 100;

  const TierIcon = tierIcons[cxpData.coaching_tier as keyof typeof tierIcons] || Star;

  return (
    <div className="space-y-4">
      <Card className="border-tennis-green-light">
        <CardHeader className="bg-tennis-green-light text-white p-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingUp className="h-5 w-5" />
            Coach Experience Points
          </CardTitle>
          <CardDescription className="text-tennis-green-bg text-sm">
            Level {cxpData.current_level} • {cxpData.total_cxp_earned.toLocaleString()} Total CXP
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4">
          <div className="space-y-4">
            {/* Level and Tier */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TierIcon className="h-5 w-5 text-tennis-green-dark" />
                <span className="font-semibold text-tennis-green-dark">
                  Level {cxpData.current_level}
                </span>
              </div>
              <Badge 
                className={`${tierColors[cxpData.coaching_tier as keyof typeof tierColors]} text-white capitalize`}
              >
                {cxpData.coaching_tier} Coach
              </Badge>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-tennis-green-medium">
                  {cxpData.current_cxp} / {cxpData.current_cxp + cxpData.cxp_to_next_level} CXP
                </span>
                <span className="text-tennis-green-medium">
                  {cxpData.cxp_to_next_level} to next level
                </span>
              </div>
              <Progress value={progressPercentage} className="h-3" />
            </div>

            {/* Benefits */}
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="flex items-center gap-2 text-sm">
                <DollarSign className="h-4 w-4 text-green-600" />
                <span className="text-tennis-green-dark">
                  {(cxpData.commission_rate * 100).toFixed(0)}% Commission
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Wrench className="h-4 w-4 text-blue-600" />
                <span className="text-tennis-green-dark">
                  {cxpData.tools_unlocked.length} Tools
                </span>
              </div>
            </div>

            {/* Certifications */}
            {cxpData.certifications_unlocked.length > 0 && (
              <div className="pt-2">
                <p className="text-sm font-medium text-tennis-green-dark mb-2">Certifications:</p>
                <div className="flex flex-wrap gap-1">
                  {cxpData.certifications_unlocked.map((cert) => (
                    <Badge key={cert} variant="outline" className="text-xs">
                      {cert.replace('_', ' ')}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
