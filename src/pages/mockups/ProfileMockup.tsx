import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  User, Trophy, Target, Clock, TrendingUp, Calendar, 
  MapPin, Edit, Settings, Star, Medal, Award
} from "lucide-react";

export function ProfileMockup() {
  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Profile Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-start gap-6">
            <div className="flex items-center gap-4">
              <Avatar className="w-24 h-24">
                <AvatarImage src="/placeholder-avatar.jpg" />
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-3xl font-bold">John Doe</h1>
                <p className="text-muted-foreground mb-2">Tennis Enthusiast</p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <MapPin className="w-4 h-4" />
                  <span>San Francisco, CA</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="bg-primary/10 text-primary">
                    Level 8
                  </Badge>
                  <Badge variant="outline">2,340 XP</Badge>
                </div>
              </div>
            </div>
            
            <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">76%</div>
                <p className="text-sm text-muted-foreground">Win Rate</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">142</div>
                <p className="text-sm text-muted-foreground">Matches</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">28h</div>
                <p className="text-sm text-muted-foreground">Play Time</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">23</div>
                <p className="text-sm text-muted-foreground">Achievements</p>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Edit className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Level Progress */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Level Progress</h3>
              <span className="text-sm text-muted-foreground">160 XP to next level</span>
            </div>
            <Progress value={68} className="h-3" />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Level 8</span>
              <span>2,340 / 2,500 XP</span>
              <span>Level 9</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="stats" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="stats">Statistics</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="history">Match History</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="stats" className="space-y-6">
          {/* Performance Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <Trophy className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
                <p className="text-2xl font-bold">108</p>
                <p className="text-sm text-muted-foreground">Wins</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Target className="w-8 h-8 mx-auto mb-2 text-red-500" />
                <p className="text-2xl font-bold">34</p>
                <p className="text-sm text-muted-foreground">Losses</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Clock className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                <p className="text-2xl font-bold">5</p>
                <p className="text-sm text-muted-foreground">Win Streak</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <TrendingUp className="w-8 h-8 mx-auto mb-2 text-green-500" />
                <p className="text-2xl font-bold">1,847</p>
                <p className="text-sm text-muted-foreground">Ranking</p>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Match Performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Ace Percentage</span>
                  <span className="font-medium">23%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">First Serve %</span>
                  <span className="font-medium">67%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Break Points Won</span>
                  <span className="font-medium">42%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Unforced Errors/Game</span>
                  <span className="font-medium">2.1</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Games This Week</span>
                  <span className="font-medium">7</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Hours Played</span>
                  <span className="font-medium">12.5h</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">XP Earned</span>
                  <span className="font-medium">285 XP</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Tokens Earned</span>
                  <span className="font-medium">142</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="achievements" className="space-y-6">
          {/* Achievement Categories */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10">
              <CardContent className="p-6 text-center">
                <Trophy className="w-12 h-12 mx-auto mb-3 text-yellow-500" />
                <h3 className="font-semibold mb-2">Tournament Wins</h3>
                <p className="text-2xl font-bold">3</p>
                <p className="text-sm text-muted-foreground">Championships</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-500/10 to-blue-500/10">
              <CardContent className="p-6 text-center">
                <Medal className="w-12 h-12 mx-auto mb-3 text-green-500" />
                <h3 className="font-semibold mb-2">Skill Milestones</h3>
                <p className="text-2xl font-bold">15</p>
                <p className="text-sm text-muted-foreground">Unlocked</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10">
              <CardContent className="p-6 text-center">
                <Award className="w-12 h-12 mx-auto mb-3 text-purple-500" />
                <h3 className="font-semibold mb-2">Special Badges</h3>
                <p className="text-2xl font-bold">5</p>
                <p className="text-sm text-muted-foreground">Earned</p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Achievements */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Achievements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-3 border rounded-lg">
                  <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                    <Trophy className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">Rising Star</h4>
                    <p className="text-sm text-muted-foreground">Reached Level 8</p>
                  </div>
                  <Badge variant="secondary">+200 XP</Badge>
                </div>

                <div className="flex items-center gap-4 p-3 border rounded-lg">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                    <Target className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">Consistency King</h4>
                    <p className="text-sm text-muted-foreground">Won 5 matches in a row</p>
                  </div>
                  <Badge variant="secondary">+150 XP</Badge>
                </div>

                <div className="flex items-center gap-4 p-3 border rounded-lg">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">Dedicated Player</h4>
                    <p className="text-sm text-muted-foreground">Played 100 matches</p>
                  </div>
                  <Badge variant="secondary">+300 XP</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="history" className="space-y-4">
          {/* Match History */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Matches</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback>SC</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">vs Sarah Chen</p>
                      <p className="text-sm text-muted-foreground">Yesterday • Central Tennis Club</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className="bg-green-500/10 text-green-500 border-green-500/20">WON</Badge>
                    <p className="text-sm text-muted-foreground mt-1">6-4, 6-2</p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback>MJ</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">vs Mike Johnson</p>
                      <p className="text-sm text-muted-foreground">3 days ago • Riverside Courts</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className="bg-green-500/10 text-green-500 border-green-500/20">WON</Badge>
                    <p className="text-sm text-muted-foreground mt-1">7-6, 6-4</p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback>AJ</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">vs Alex Johnson</p>
                      <p className="text-sm text-muted-foreground">1 week ago • Elite Tennis Academy</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className="bg-red-500/10 text-red-500 border-red-500/20">LOST</Badge>
                    <p className="text-sm text-muted-foreground mt-1">4-6, 6-7</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="settings" className="space-y-4">
          {/* Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Email Notifications</p>
                  <p className="text-sm text-muted-foreground">Receive updates about matches and achievements</p>
                </div>
                <Button variant="outline" size="sm">Configure</Button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Privacy Settings</p>
                  <p className="text-sm text-muted-foreground">Control who can see your profile and stats</p>
                </div>
                <Button variant="outline" size="sm">Manage</Button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Data Export</p>
                  <p className="text-sm text-muted-foreground">Download your match history and statistics</p>
                </div>
                <Button variant="outline" size="sm">Export</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}