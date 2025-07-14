import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, MessageCircle, Trophy, Target, Clock, TrendingUp } from "lucide-react";

export function FeedMockup() {
  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Activity Feed</h1>
        <p className="text-muted-foreground">See what players in your network are up to</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Trophy className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
            <p className="text-2xl font-bold">127</p>
            <p className="text-sm text-muted-foreground">This Week</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Target className="w-8 h-8 mx-auto mb-2 text-green-500" />
            <p className="text-2xl font-bold">8</p>
            <p className="text-sm text-muted-foreground">Matches Won</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Clock className="w-8 h-8 mx-auto mb-2 text-blue-500" />
            <p className="text-2xl font-bold">12h</p>
            <p className="text-sm text-muted-foreground">Time Played</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="w-8 h-8 mx-auto mb-2 text-purple-500" />
            <p className="text-2xl font-bold">Level 8</p>
            <p className="text-sm text-muted-foreground">Current Level</p>
          </CardContent>
        </Card>
      </div>

      {/* Activity Stream */}
      <div className="space-y-4">
        {/* Activity Post 1 */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start space-x-4">
              <Avatar className="w-12 h-12">
                <AvatarImage src="/placeholder-avatar.jpg" />
                <AvatarFallback>MJ</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <p className="font-semibold">Mike Johnson</p>
                  <Badge variant="outline" className="text-xs">Level 12</Badge>
                  <span className="text-sm text-muted-foreground">• 2 hours ago</span>
                </div>
                <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 p-4 rounded-lg mb-3">
                  <p className="text-sm mb-2">🎾 <strong>Match Victory!</strong></p>
                  <p className="text-sm">Defeated Sarah Chen 6-4, 7-5 at Central Tennis Club</p>
                  <div className="flex items-center gap-4 mt-3 text-sm">
                    <span className="text-green-600">+120 XP</span>
                    <span className="text-blue-600">+75 Tokens</span>
                    <span className="text-purple-600">Level Up!</span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Button variant="ghost" size="sm" className="text-muted-foreground">
                    <Heart className="w-4 h-4 mr-1" />
                    12
                  </Button>
                  <Button variant="ghost" size="sm" className="text-muted-foreground">
                    <MessageCircle className="w-4 h-4 mr-1" />
                    3
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Activity Post 2 */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start space-x-4">
              <Avatar className="w-12 h-12">
                <AvatarImage src="/placeholder-avatar.jpg" />
                <AvatarFallback>SC</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <p className="font-semibold">Sarah Chen</p>
                  <Badge variant="outline" className="text-xs">Level 10</Badge>
                  <span className="text-sm text-muted-foreground">• 4 hours ago</span>
                </div>
                <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 p-4 rounded-lg mb-3">
                  <p className="text-sm mb-2">🏆 <strong>Achievement Unlocked!</strong></p>
                  <p className="text-sm">Completed "Rising Star" - reached Level 10!</p>
                  <div className="flex items-center gap-4 mt-3 text-sm">
                    <span className="text-green-600">+200 XP</span>
                    <span className="text-blue-600">+100 Tokens</span>
                    <span className="text-orange-600">New Avatar Item</span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Button variant="ghost" size="sm" className="text-muted-foreground">
                    <Heart className="w-4 h-4 mr-1" />
                    8
                  </Button>
                  <Button variant="ghost" size="sm" className="text-muted-foreground">
                    <MessageCircle className="w-4 h-4 mr-1" />
                    5
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Activity Post 3 */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start space-x-4">
              <Avatar className="w-12 h-12">
                <AvatarImage src="/placeholder-avatar.jpg" />
                <AvatarFallback>AJ</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <p className="font-semibold">Alex Johnson</p>
                  <Badge variant="outline" className="text-xs">Level 8</Badge>
                  <span className="text-sm text-muted-foreground">• 6 hours ago</span>
                </div>
                <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 p-4 rounded-lg mb-3">
                  <p className="text-sm mb-2">⚡ <strong>Training Session</strong></p>
                  <p className="text-sm">Completed 2-hour practice session focusing on backhand technique</p>
                  <div className="flex items-center gap-4 mt-3 text-sm">
                    <span className="text-green-600">+65 XP</span>
                    <span className="text-blue-600">+35 Tokens</span>
                    <span className="text-purple-600">Skill Improvement</span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Button variant="ghost" size="sm" className="text-muted-foreground">
                    <Heart className="w-4 h-4 mr-1" />
                    6
                  </Button>
                  <Button variant="ghost" size="sm" className="text-muted-foreground">
                    <MessageCircle className="w-4 h-4 mr-1" />
                    2
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Club Activity */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <p className="font-semibold">Central Tennis Club</p>
                  <Badge variant="secondary" className="text-xs">Club Event</Badge>
                  <span className="text-sm text-muted-foreground">• 1 day ago</span>
                </div>
                <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 p-4 rounded-lg mb-3">
                  <p className="text-sm mb-2">🏆 <strong>Tournament Results</strong></p>
                  <p className="text-sm">Monthly Singles Tournament completed! Congratulations to all participants.</p>
                  <div className="mt-3">
                    <p className="text-sm"><strong>Winner:</strong> Mike Johnson</p>
                    <p className="text-sm"><strong>Runner-up:</strong> Sarah Chen</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Button variant="ghost" size="sm" className="text-muted-foreground">
                    <Heart className="w-4 h-4 mr-1" />
                    24
                  </Button>
                  <Button variant="ghost" size="sm" className="text-muted-foreground">
                    <MessageCircle className="w-4 h-4 mr-1" />
                    7
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Load More */}
      <div className="text-center">
        <Button variant="outline">Load More Activities</Button>
      </div>
    </div>
  );
}