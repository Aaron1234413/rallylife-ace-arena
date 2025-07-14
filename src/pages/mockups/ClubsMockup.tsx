import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, Users, Calendar, Search, Plus, Star, Trophy, Clock } from "lucide-react";

export function ClubsMockup() {
  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tennis Clubs</h1>
          <p className="text-muted-foreground">Connect with local tennis communities</p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Create Club
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Users className="w-8 h-8 mx-auto mb-2 text-primary" />
            <p className="text-2xl font-bold">8</p>
            <p className="text-sm text-muted-foreground">Clubs Joined</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Calendar className="w-8 h-8 mx-auto mb-2 text-green-500" />
            <p className="text-2xl font-bold">12</p>
            <p className="text-sm text-muted-foreground">Events This Week</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Trophy className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
            <p className="text-2xl font-bold">3</p>
            <p className="text-sm text-muted-foreground">Tournaments</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Clock className="w-8 h-8 mx-auto mb-2 text-blue-500" />
            <p className="text-2xl font-bold">28h</p>
            <p className="text-sm text-muted-foreground">Total Play Time</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input 
                  placeholder="Search clubs by name, location, or type..." 
                  className="pl-10"
                />
              </div>
            </div>
            <Button variant="outline">Filters</Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="my-clubs" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="my-clubs">My Clubs</TabsTrigger>
          <TabsTrigger value="discover">Discover</TabsTrigger>
          <TabsTrigger value="invitations">Invitations</TabsTrigger>
        </TabsList>
        
        <TabsContent value="my-clubs" className="space-y-4">
          {/* My Clubs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="hover-scale cursor-pointer">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src="/placeholder-club.jpg" />
                      <AvatarFallback>CTC</AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">Central Tennis Club</CardTitle>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="w-4 h-4" />
                        Downtown District
                      </div>
                    </div>
                  </div>
                  <Badge variant="secondary">Owner</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Members</span>
                    <span className="font-medium">147</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Active Events</span>
                    <span className="font-medium">8</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Rating</span>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">4.8</span>
                    </div>
                  </div>
                </div>
                <Button className="w-full mt-4" variant="outline">
                  Manage Club
                </Button>
              </CardContent>
            </Card>

            <Card className="hover-scale cursor-pointer">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src="/placeholder-club.jpg" />
                      <AvatarFallback>RTC</AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">Riverside Tennis</CardTitle>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="w-4 h-4" />
                        Riverside Park
                      </div>
                    </div>
                  </div>
                  <Badge variant="outline">Member</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Members</span>
                    <span className="font-medium">89</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Active Events</span>
                    <span className="font-medium">4</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Rating</span>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">4.6</span>
                    </div>
                  </div>
                </div>
                <Button className="w-full mt-4" variant="outline">
                  View Club
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="discover" className="space-y-4">
          {/* Discover Clubs */}
          <div className="space-y-4">
            <Card className="hover-scale cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar className="w-16 h-16">
                      <AvatarImage src="/placeholder-club.jpg" />
                      <AvatarFallback>ETC</AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                      <h3 className="text-xl font-semibold">Elite Tennis Academy</h3>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="w-4 h-4" />
                        <span>Sports Complex, 2.3 miles away</span>
                      </div>
                      <p className="text-sm text-muted-foreground max-w-md">
                        Professional coaching and competitive tournaments for all skill levels. State-of-the-art facilities.
                      </p>
                    </div>
                  </div>
                  <div className="text-right space-y-2">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">4.9</span>
                      <span className="text-sm text-muted-foreground">(127)</span>
                    </div>
                    <Badge variant="secondary">Professional</Badge>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                  <div className="flex items-center gap-6 text-sm">
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <span>234 members</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span>15 events</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Trophy className="w-4 h-4 text-muted-foreground" />
                      <span>12 tournaments</span>
                    </div>
                  </div>
                  <Button>Join Club</Button>
                </div>
              </CardContent>
            </Card>

            <Card className="hover-scale cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar className="w-16 h-16">
                      <AvatarImage src="/placeholder-club.jpg" />
                      <AvatarFallback>WTC</AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                      <h3 className="text-xl font-semibold">Westside Tennis Club</h3>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="w-4 h-4" />
                        <span>West District, 1.8 miles away</span>
                      </div>
                      <p className="text-sm text-muted-foreground max-w-md">
                        Friendly community club focused on recreational play and social events. All levels welcome.
                      </p>
                    </div>
                  </div>
                  <div className="text-right space-y-2">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">4.7</span>
                      <span className="text-sm text-muted-foreground">(89)</span>
                    </div>
                    <Badge variant="outline">Recreational</Badge>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                  <div className="flex items-center gap-6 text-sm">
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <span>156 members</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span>8 events</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Trophy className="w-4 h-4 text-muted-foreground" />
                      <span>3 tournaments</span>
                    </div>
                  </div>
                  <Button>Join Club</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="invitations" className="space-y-4">
          {/* Invitations */}
          <div className="space-y-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src="/placeholder-club.jpg" />
                      <AvatarFallback>PTC</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold">Premium Tennis Club</h3>
                      <p className="text-sm text-muted-foreground">Invited by Sarah Chen</p>
                      <p className="text-sm text-muted-foreground">2 days ago</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">Decline</Button>
                    <Button size="sm">Accept</Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="text-center py-8 text-muted-foreground">
              <p>No other pending invitations</p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}