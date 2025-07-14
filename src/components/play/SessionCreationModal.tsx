import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Clock, MapPin, Users, Settings, Star, DollarSign } from "lucide-react";

interface SessionCreationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateSession: (sessionData: any) => void;
}

export function SessionCreationModal({ open, onOpenChange, onCreateSession }: SessionCreationModalProps) {
  const [sessionType, setSessionType] = useState("singles");
  const [formData, setFormData] = useState({
    title: "",
    date: "",
    time: "",
    location: "",
    skillLevel: "",
    maxPlayers: 2,
    pricePerHour: "",
    description: "",
    isPrivate: false,
    courtPreference: ""
  });

  const sessionTypes = [
    { id: "singles", name: "Singles Match", icon: "🎾", description: "1v1 competitive match", maxPlayers: 2 },
    { id: "doubles", name: "Doubles Match", icon: "👥", description: "2v2 team match", maxPlayers: 4 },
    { id: "training", name: "Training Session", icon: "🏆", description: "Skill development with coach", maxPlayers: 6 },
    { id: "practice", name: "Practice Session", icon: "🎯", description: "Casual practice and drills", maxPlayers: 8 },
    { id: "social", name: "Social Play", icon: "🎪", description: "Fun and social tennis", maxPlayers: 12 }
  ];

  const locations = [
    { id: "central", name: "Central Tennis Club", distance: "0.8 mi", courts: 6, price: "$25/hour" },
    { id: "riverside", name: "Riverside Courts", distance: "1.2 mi", courts: 4, price: "$20/hour" },
    { id: "elite", name: "Elite Tennis Academy", distance: "2.1 mi", courts: 8, price: "$35/hour" },
    { id: "city", name: "City Tennis Center", distance: "1.5 mi", courts: 5, price: "$30/hour" }
  ];

  const skillLevels = [
    { id: "beginner", name: "Beginner", description: "Just starting out" },
    { id: "intermediate", name: "Intermediate", description: "Some experience" },
    { id: "advanced", name: "Advanced", description: "Experienced player" },
    { id: "professional", name: "Professional", description: "Tournament level" }
  ];

  const handleSubmit = () => {
    const selectedType = sessionTypes.find(t => t.id === sessionType);
    const selectedLocation = locations.find(l => l.id === formData.location);
    
    const sessionData = {
      id: `session-${Date.now()}`,
      type: sessionType,
      title: formData.title || `${selectedType?.name} at ${selectedLocation?.name}`,
      date: formData.date,
      time: formData.time,
      location: selectedLocation?.name,
      skillLevel: formData.skillLevel,
      maxPlayers: selectedType?.maxPlayers || formData.maxPlayers,
      currentPlayers: 1,
      pricePerHour: formData.pricePerHour || selectedLocation?.price,
      description: formData.description,
      isPrivate: formData.isPrivate,
      host: "You",
      hostRating: 4.2,
      status: "waiting",
      createdAt: new Date().toISOString()
    };

    onCreateSession(sessionData);
    onOpenChange(false);
    
    // Reset form
    setFormData({
      title: "",
      date: "",
      time: "",
      location: "",
      skillLevel: "",
      maxPlayers: 2,
      pricePerHour: "",
      description: "",
      isPrivate: false,
      courtPreference: ""
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Session</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="type" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="type">Session Type</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="location">Location</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="type" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sessionTypes.map((type) => (
                <Card 
                  key={type.id} 
                  className={`cursor-pointer transition-all ${sessionType === type.id ? 'border-primary bg-primary/5' : 'hover:border-primary/50'}`}
                  onClick={() => {
                    setSessionType(type.id);
                    setFormData(prev => ({ ...prev, maxPlayers: type.maxPlayers }));
                  }}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-2xl">{type.icon}</span>
                      <div>
                        <h3 className="font-semibold">{type.name}</h3>
                        <p className="text-sm text-muted-foreground">{type.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="w-4 h-4" />
                      <span>Max {type.maxPlayers} players</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="details" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Session Title</Label>
                <Input
                  id="title"
                  placeholder="Enter session title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="skillLevel">Skill Level</Label>
                <Select value={formData.skillLevel} onValueChange={(value) => setFormData(prev => ({ ...prev, skillLevel: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select skill level" />
                  </SelectTrigger>
                  <SelectContent>
                    {skillLevels.map((level) => (
                      <SelectItem key={level.id} value={level.id}>
                        <div>
                          <div className="font-medium">{level.name}</div>
                          <div className="text-sm text-muted-foreground">{level.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="time">Time</Label>
                <Input
                  id="time"
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Add any additional details about the session..."
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>
          </TabsContent>

          <TabsContent value="location" className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              {locations.map((location) => (
                <Card 
                  key={location.id} 
                  className={`cursor-pointer transition-all ${formData.location === location.id ? 'border-primary bg-primary/5' : 'hover:border-primary/50'}`}
                  onClick={() => setFormData(prev => ({ ...prev, location: location.id }))}
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">{location.name}</h3>
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            <span>{location.distance}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span>{location.courts} courts</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <DollarSign className="w-4 h-4" />
                            <span>{location.price}</span>
                          </div>
                        </div>
                      </div>
                      <Badge variant="outline">{location.distance}</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="private">Private Session</Label>
                  <p className="text-sm text-muted-foreground">Only invited players can join</p>
                </div>
                <Button
                  variant={formData.isPrivate ? "default" : "outline"}
                  onClick={() => setFormData(prev => ({ ...prev, isPrivate: !prev.isPrivate }))}
                >
                  {formData.isPrivate ? "Private" : "Public"}
                </Button>
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxPlayers">Maximum Players</Label>
                <Input
                  id="maxPlayers"
                  type="number"
                  min="2"
                  max="12"
                  value={formData.maxPlayers}
                  onChange={(e) => setFormData(prev => ({ ...prev, maxPlayers: parseInt(e.target.value) }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pricePerHour">Price Per Hour (Optional)</Label>
                <Input
                  id="pricePerHour"
                  placeholder="e.g., $25/hour"
                  value={formData.pricePerHour}
                  onChange={(e) => setFormData(prev => ({ ...prev, pricePerHour: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="courtPreference">Court Preference</Label>
                <Select value={formData.courtPreference} onValueChange={(value) => setFormData(prev => ({ ...prev, courtPreference: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select court preference" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hard">Hard Court</SelectItem>
                    <SelectItem value="clay">Clay Court</SelectItem>
                    <SelectItem value="grass">Grass Court</SelectItem>
                    <SelectItem value="indoor">Indoor Court</SelectItem>
                    <SelectItem value="outdoor">Outdoor Court</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex gap-2 pt-4">
          <Button onClick={() => onOpenChange(false)} variant="outline" className="flex-1">
            Cancel
          </Button>
          <Button onClick={handleSubmit} className="flex-1">
            Create Session
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}