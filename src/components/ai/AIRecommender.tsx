import { motion } from 'framer-motion';
import { TrendingUp, Users, DollarSign, Zap, Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useFPLStore } from '@/store/fplStore';
import type { Player, Position } from '@/types/player';

interface AIRecommendation {
  category: string;
  title: string;
  description: string;
  players: Player[];
  confidence: number;
  icon: React.ReactNode;
}

export function AIRecommender() {
  const { players, addToTeam } = useFPLStore();

  // Mock AI recommendations - in a real app this would come from an AI service
  const recommendations: AIRecommendation[] = [
    {
      category: 'Top Picks',
      title: 'Best Value This Gameweek',
      description: 'High predicted points relative to price with good ownership balance.',
      players: players.slice(0, 3),
      confidence: 92,
      icon: <TrendingUp className="h-4 w-4" />
    },
    {
      category: 'Differentials',
      title: 'Low Ownership Gems',
      description: 'Under 10% owned players with high potential for big returns.',
      players: players.filter(p => p.ownership < 20).slice(0, 3),
      confidence: 78,
      icon: <Users className="h-4 w-4" />
    },
    {
      category: 'Budget Enablers',
      title: 'Cheap Starting Players',
      description: 'Affordable players who regularly start and provide steady returns.',
      players: players.filter(p => p.price <= 5.0).slice(0, 3),
      confidence: 85,
      icon: <DollarSign className="h-4 w-4" />
    },
    {
      category: 'High Risk/Reward',
      title: 'Captain Contenders',
      description: 'Players with highest ceiling for big hauls but with some risk.',
      players: players.filter(p => p.predPts_gw > 6).slice(0, 3),
      confidence: 71,
      icon: <Zap className="h-4 w-4" />
    }
  ];

  const getPositionChipClass = (position: Position) => {
    switch (position) {
      case 'GK': return 'position-chip-gk';
      case 'DEF': return 'position-chip-def';
      case 'MID': return 'position-chip-mid';
      case 'FWD': return 'position-chip-fwd';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 85) return 'text-green-600';
    if (confidence >= 70) return 'text-yellow-600';
    return 'text-orange-600';
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="h-5 w-5 text-primary" />
          AI Recommendations
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {recommendations.map((rec, index) => (
          <motion.div
            key={rec.category}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {rec.icon}
                <h3 className="font-semibold text-sm">{rec.title}</h3>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-medium ${getConfidenceColor(rec.confidence)}`}>
                  {rec.confidence}%
                </span>
                <Progress value={rec.confidence} className="w-12 h-2" />
              </div>
            </div>
            
            <p className="text-xs text-muted-foreground">
              {rec.description}
            </p>
            
            <div className="space-y-2">
              {rec.players.map((player) => (
                <motion.div
                  key={player.id}
                  whileHover={{ scale: 1.02 }}
                  className="flex items-center justify-between p-2 rounded-lg bg-muted/20 hover:bg-muted/40 transition-smooth cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-xs">{player.name}</span>
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${getPositionChipClass(player.position)}`}
                        >
                          {player.position}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {player.team} • £{player.price}m • {player.predPts_gw.toFixed(1)} pts
                      </div>
                    </div>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-green-600 hover:text-green-700 hover-glow"
                    onClick={() => addToTeam(player)}
                  >
                    +
                  </Button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        ))}
        
        <div className="pt-4 border-t border-border/50">
          <div className="text-center">
            <p className="text-xs text-muted-foreground mb-2">
              AI analysis updated every gameweek
            </p>
            <Button variant="outline" size="sm" className="hover-lift">
              View Full Analysis
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}