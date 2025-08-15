import { motion } from 'framer-motion';
import { X, Plus, BarChart3, TrendingUp, Crown, Star } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useFPLStore } from '@/store/fplStore';
import type { Player } from '@/types/player';

interface PlayerModalProps {
  player: Player | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PlayerModal({ player, open, onOpenChange }: PlayerModalProps) {
  const { addToTeam, addToCompare, compareList } = useFPLStore();

  if (!player) return null;

  const handleAddToTeam = () => {
    addToTeam(player);
  };

  const handleAddToCompare = () => {
    addToCompare(player);
  };

  const isInCompare = compareList.some(p => p.id === player.id);
  const canAddToCompare = compareList.length < 3 && !isInCompare;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Fit': return 'text-green-600';
      case 'Doubt': return 'text-yellow-600';
      case 'Injured': return 'text-red-600';
      case 'Suspended': return 'text-red-600';
      default: return 'text-muted-foreground';
    }
  };

  const getFDRColor = (fdr: number) => {
    switch (fdr) {
      case 1: return 'bg-green-500';
      case 2: return 'bg-green-400';
      case 3: return 'bg-yellow-400';
      case 4: return 'bg-orange-400';
      case 5: return 'bg-red-500';
      default: return 'bg-gray-400';
    }
  };

  const formData = player.lastMatches.map((match, index) => ({
    gw: match.gw,
    points: match.points,
    xG: match.xG,
    xA: match.xA,
    xGI: match.xGI,
  }));

  // Generate some mock future fixtures based on the next opponent
  const generateMockFixtures = (teamCode: string) => {
    const opponents = ['ARS', 'CHE', 'LIV', 'MCI', 'MUN', 'TOT', 'NEW', 'BHA', 'FUL', 'WHU'];
    const filteredOpponents = opponents.filter(opp => opp !== teamCode);
    
    return Array.from({ length: 6 }, (_, i) => ({
      gw: 16 + i,
      opponent: `${filteredOpponents[i % filteredOpponents.length]} (${Math.random() > 0.5 ? 'H' : 'A'})`,
      fdr: Math.floor(Math.random() * 5) + 1,
      restDays: i % 2 === 0 ? 3 : 7
    }));
  };
  
  const mockFixtures = generateMockFixtures(player.team);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto glass-card">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={player.photoUrl} alt={player.name} />
                <AvatarFallback className="text-lg">
                  {player.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div>
                <DialogTitle className="text-2xl">{player.name}</DialogTitle>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline">{player.team}</Badge>
                  <Badge className={`position-chip-${player.position.toLowerCase()}`}>
                    {player.position}
                  </Badge>
                  <span className="text-2xl font-bold text-primary">£{player.price}m</span>
                  <Badge className={getStatusColor(player.injuryStatus)}>
                    {player.injuryStatus}
                  </Badge>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAddToTeam} className="hover-lift">
                <Plus className="h-4 w-4 mr-2" />
                Add to Team
              </Button>
              <Button 
                variant="outline" 
                onClick={handleAddToCompare}
                disabled={!canAddToCompare}
                className="hover-lift"
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Compare
              </Button>
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="history">vs Opponent</TabsTrigger>
            <TabsTrigger value="form">Form & Trends</TabsTrigger>
            <TabsTrigger value="fixtures">Fixtures</TabsTrigger>
            <TabsTrigger value="heatmap">Heatmap</TabsTrigger>
            <TabsTrigger value="news">News</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Predicted Points</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">GW</span>
                    <span className="font-bold">{player.predPts_gw.toFixed(1)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">3 GWs</span>
                    <span className="font-bold">{player.predPts_3gw.toFixed(1)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">6 GWs</span>
                    <span className="font-bold">{player.predPts_6gw.toFixed(1)}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Ownership & Form</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Ownership</span>
                    <span className="font-bold">{player.ownership}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Form (L5)</span>
                    <span className="font-bold">{player.formL5.toFixed(1)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Minutes (L5)</span>
                    <span className="font-bold">{player.minutesL5}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Next Fixture</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Opponent</span>
                    <span className="font-bold">{player.nextOpponent}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Difficulty</span>
                    <Badge className={`${getFDRColor(player.nextOpponentFDR)} text-white`}>
                      {player.nextOpponentFDR}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Rotation Risk</span>
                    <span className="font-bold">{player.rotationRiskPct}%</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  AI Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-3">
                  {player.rotationRiskPct > 70 
                    ? "High rotation risk - likely squad player or rarely plays. Consider only as budget enabler."
                    : player.rotationRiskPct > 40 
                      ? "Moderate rotation risk - not guaranteed to start every game. Monitor team news."
                      : player.predPts_gw > 6
                        ? "Strong pick with excellent underlying numbers. High ceiling for captaincy consideration."
                        : "Steady option with consistent returns. Good for set-and-forget strategy."
                  }
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Captaincy Rating:</span>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => {
                      const rating = player.rotationRiskPct > 70 ? 1 : 
                                   player.rotationRiskPct > 40 ? 2 :
                                   player.predPts_gw > 8 ? 5 :
                                   player.predPts_gw > 6 ? 4 :
                                   player.predPts_gw > 4 ? 3 : 2;
                      return (
                        <Star
                          key={star}
                          className={`h-4 w-4 ${
                            star <= rating ? 'text-yellow-500 fill-current' : 'text-gray-300'
                          }`}
                        />
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>History vs {player.nextOpponent.split(' ')[0]}</CardTitle>
              </CardHeader>
              <CardContent>
                {player.historyVsNextOpp.length > 0 ? (
                  <div className="space-y-2">
                    {player.historyVsNextOpp.map((match, index) => (
                      <div key={index} className="flex justify-between items-center p-2 rounded bg-muted/20">
                        <span className="text-sm font-medium">{match.date}</span>
                        <div className="flex gap-4 text-sm">
                          <span>{match.minutes}'</span>
                          <span className="font-bold">{match.points} pts</span>
                          <span>xG: {match.xG}</span>
                          <span>xA: {match.xA}</span>
                        </div>
                      </div>
                    ))}
                    {player.historyVsNextOpp.length < 3 && (
                      <p className="text-sm text-muted-foreground italic">
                        Limited sample size - use with caution
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No previous matches found</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="form" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Form Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={formData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="gw" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="points" stroke="hsl(var(--primary))" strokeWidth={2} />
                      <Line type="monotone" dataKey="xGI" stroke="hsl(var(--accent))" strokeWidth={2} strokeDasharray="5 5" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="fixtures" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Fixtures</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {mockFixtures.map((fixture) => (
                    <div key={fixture.gw} className="flex justify-between items-center p-3 rounded bg-muted/20">
                      <span className="font-medium">GW{fixture.gw}</span>
                      <span>{fixture.opponent}</span>
                      <Badge className={`${getFDRColor(fixture.fdr)} text-white`}>
                        FDR {fixture.fdr}
                      </Badge>
                      <span className="text-sm text-muted-foreground">{fixture.restDays}d rest</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="heatmap" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Position Heatmap</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center h-64 bg-muted/20 rounded-lg">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-primary/20 rounded-full mx-auto mb-4 flex items-center justify-center">
                      <BarChart3 className="h-8 w-8 text-primary" />
                    </div>
                    <p className="text-muted-foreground">Heatmap visualization</p>
                    <p className="text-sm text-muted-foreground">Coming soon</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="news" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Latest News</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {player.news && player.news.length > 0 ? (
                    player.news.map((item, index) => (
                      <div key={index} className="p-3 rounded bg-muted/20">
                        <p className="text-sm">{item}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground">No recent news</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}