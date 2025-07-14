import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Target, Trophy, Clock, Play, CheckCircle, Lock } from "lucide-react";

export function TrainingMockup() {
  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Training Center</h1>
        <p className="text-muted-foreground">Improve your game with structured training programs</p>
      </div>

      {/* Progress Overview */}
      <Card className="bg-gradient-to-r from-primary/5 to-secondary/5">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-1">Level 8</div>
              <p className="text-sm text-muted-foreground">Current Level</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-1">2,340</div>
              <p className="text-sm text-muted-foreground">Total XP</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-1">7</div>
              <p className="text-sm text-muted-foreground">Skills Mastered</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-1">23</div>
              <p className="text-sm text-muted-foreground">Achievements</p>
            </div>
          </div>
          <div className="mt-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Progress to Level 9</span>
              <span className="text-sm text-muted-foreground">340/500 XP</span>
            </div>
            <Progress value={68} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Skill Development Paths */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Skill Development Paths</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Fundamentals Path */}
          <Card className="hover-scale cursor-pointer">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Fundamentals</CardTitle>
                <Badge variant="secondary">Beginner</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm">Grip Basics</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm">Stance & Footwork</span>
                </div>
                <div className="flex items-center gap-2">
                  <Play className="w-4 h-4 text-blue-500" />
                  <span className="text-sm">Forehand Technique</span>
                </div>
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Backhand Basics</span>
                </div>
              </div>
              <div className="mt-4">
                <Progress value={60} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1">3/5 lessons completed</p>
              </div>
            </CardContent>
          </Card>

          {/* Power & Control Path */}
          <Card className="hover-scale cursor-pointer">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Power & Control</CardTitle>
                <Badge variant="outline">Intermediate</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm">Shot Placement</span>
                </div>
                <div className="flex items-center gap-2">
                  <Play className="w-4 h-4 text-blue-500" />
                  <span className="text-sm">Topspin Mastery</span>
                </div>
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Power Generation</span>
                </div>
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Angle Control</span>
                </div>
              </div>
              <div className="mt-4">
                <Progress value={25} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1">1/4 lessons completed</p>
              </div>
            </CardContent>
          </Card>

          {/* Strategy & Tactics Path */}
          <Card className="hover-scale cursor-pointer opacity-60">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Strategy & Tactics</CardTitle>
                <Badge variant="destructive">Advanced</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Court Positioning</span>
                </div>
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Match Strategy</span>
                </div>
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Mental Game</span>
                </div>
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Advanced Patterns</span>
                </div>
              </div>
              <div className="mt-4">
                <Progress value={0} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1">Requires Level 12</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Daily Challenges */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Daily Challenges
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">Practice Serves</h4>
                <Badge variant="outline">Active</Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-3">Hit 50 successful serves</p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>32/50</span>
                </div>
                <Progress value={64} className="h-2" />
              </div>
              <div className="flex items-center gap-2 mt-3 text-sm">
                <Trophy className="w-4 h-4 text-yellow-500" />
                <span>Reward: 50 XP + 25 Tokens</span>
              </div>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">Accuracy Training</h4>
                <Badge variant="secondary">Completed</Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-3">Hit targets 20 times in a row</p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>20/20</span>
                </div>
                <Progress value={100} className="h-2" />
              </div>
              <div className="flex items-center gap-2 mt-3 text-sm text-green-600">
                <CheckCircle className="w-4 h-4" />
                <span>Completed! +75 XP earned</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Learning Resources */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Learning Resources
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg hover-scale cursor-pointer">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-medium">Quick Tips</span>
              </div>
              <h4 className="font-medium mb-2">5-Minute Drills</h4>
              <p className="text-sm text-muted-foreground">Quick practice routines for busy schedules</p>
            </div>

            <div className="p-4 border rounded-lg hover-scale cursor-pointer">
              <div className="flex items-center gap-2 mb-2">
                <Play className="w-4 h-4 text-green-500" />
                <span className="text-sm font-medium">Video Lessons</span>
              </div>
              <h4 className="font-medium mb-2">Pro Technique</h4>
              <p className="text-sm text-muted-foreground">Learn from professional players and coaches</p>
            </div>

            <div className="p-4 border rounded-lg hover-scale cursor-pointer">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-4 h-4 text-purple-500" />
                <span className="text-sm font-medium">Practice Plans</span>
              </div>
              <h4 className="font-medium mb-2">Structured Training</h4>
              <p className="text-sm text-muted-foreground">Complete training programs for all levels</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}