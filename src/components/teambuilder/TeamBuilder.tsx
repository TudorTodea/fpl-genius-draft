import { motion } from 'framer-motion';
import { Save, Download, Wand2, Crown, Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useFPLStore } from '@/store/fplStore';
import type { Position } from '@/types/player';

const positionLimits = {
  GK: 2,
  DEF: 5,
  MID: 5,
  FWD: 3
};

export function TeamBuilder() {
  const { 
    teamBuilder, 
    removeFromTeam, 
    setCaptain, 
    setViceCaptain, 
    clearTeam 
  } = useFPLStore();

  const getPositionPlayers = (position: Position) => {
    return teamBuilder.players.filter(p => p.position === position);
  };

  const getPositionChipClass = (position: Position) => {
    switch (position) {
      case 'GK': return 'position-chip-gk';
      case 'DEF': return 'position-chip-def';
      case 'MID': return 'position-chip-mid';
      case 'FWD': return 'position-chip-fwd';
    }
  };

  const exportTeam = () => {
    const teamData = {
      players: teamBuilder.players,
      budget: teamBuilder.budget,
      formation: teamBuilder.formation,
      totalPredPts: teamBuilder.totalPredPts,
      exportedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(teamData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fpl-team-gw${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const isFormationValid = () => {
    const gk = getPositionPlayers('GK').length;
    const def = getPositionPlayers('DEF').length;
    const mid = getPositionPlayers('MID').length;
    const fwd = getPositionPlayers('FWD').length;
    
    return gk === 1 && def >= 3 && def <= 5 && mid >= 3 && mid <= 5 && fwd >= 1 && fwd <= 3 && (def + mid + fwd === 10);
  };

  return (
    <div className="space-y-6">
      {/* Budget & Stats */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Budget & Predictions</span>
            <Button
              variant="outline"
              size="sm"
              onClick={clearTeam}
              className="hover-lift"
            >
              Clear Team
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Budget Remaining</p>
              <p className={`text-xl font-bold ${teamBuilder.budget < 0 ? 'text-red-500' : 'text-green-600'}`}>
                £{teamBuilder.budget.toFixed(1)}m
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Total Pred Pts</p>
              <p className="text-xl font-bold text-primary">
                {teamBuilder.totalPredPts.toFixed(1)}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Players</p>
              <p className="text-lg font-semibold">
                {teamBuilder.players.length}/15
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Formation</p>
              <p className={`text-lg font-semibold ${isFormationValid() ? 'text-green-600' : 'text-red-500'}`}>
                {teamBuilder.formation}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Squad by Position */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Squad</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {(['GK', 'DEF', 'MID', 'FWD'] as Position[]).map((position) => {
            const players = getPositionPlayers(position);
            const limit = positionLimits[position];
            
            return (
              <motion.div 
                key={position}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-3"
              >
                <div className="flex items-center justify-between">
                  <Badge className={getPositionChipClass(position)}>
                    {position} ({players.length}/{limit})
                  </Badge>
                </div>
                
                <div className="space-y-2">
                  {players.map((player) => (
                    <motion.div
                      key={player.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/20 hover:bg-muted/40 transition-smooth"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={player.photoUrl} alt={player.name} />
                          <AvatarFallback>{player.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">{player.name}</span>
                            {player.isCaptain && (
                              <Crown className="h-3 w-3 text-yellow-500" />
                            )}
                            {player.isViceCaptain && (
                              <Star className="h-3 w-3 text-gray-500" />
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {player.team} • £{player.price}m
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant={player.isCaptain ? "default" : "ghost"}
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => setCaptain(player.id)}
                              >
                                <Crown className="h-3 w-3" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Captain</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant={player.isViceCaptain ? "secondary" : "ghost"}
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => setViceCaptain(player.id)}
                              >
                                <Star className="h-3 w-3" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Vice Captain</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-red-500 hover:text-red-700"
                          onClick={() => removeFromTeam(player.id)}
                        >
                          ×
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                  
                  {/* Empty slots */}
                  {Array.from({ length: limit - players.length }).map((_, index) => (
                    <div
                      key={`empty-${index}`}
                      className="flex items-center justify-center p-3 rounded-lg border-2 border-dashed border-muted-foreground/30 text-muted-foreground text-sm"
                    >
                      Empty {position} slot
                    </div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-2">
        <Button className="flex-1 hover-lift" onClick={exportTeam}>
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
        <Button variant="outline" className="flex-1 hover-lift">
          <Save className="h-4 w-4 mr-2" />
          Save Draft
        </Button>
        <Button variant="secondary" className="hover-lift hover-glow">
          <Wand2 className="h-4 w-4 mr-2" />
          AI Suggest
        </Button>
      </div>
    </div>
  );
}