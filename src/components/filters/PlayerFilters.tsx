import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useFPLStore } from '@/store/fplStore';
import { TEAMS } from '@/data/mockPlayers';
import type { Position } from '@/types/player';

const positions: Position[] = ['GK', 'DEF', 'MID', 'FWD'];

export function PlayerFilters() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { filters, updateFilters, clearFilters } = useFPLStore();

  const togglePosition = (position: Position) => {
    const newPositions = filters.positions.includes(position)
      ? filters.positions.filter(p => p !== position)
      : [...filters.positions, position];
    updateFilters({ positions: newPositions });
  };

  const toggleTeam = (team: string) => {
    const newTeams = filters.teams.includes(team)
      ? filters.teams.filter(t => t !== team)
      : [...filters.teams, team];
    updateFilters({ teams: newTeams });
  };

  const getPositionChipClass = (position: Position) => {
    const baseClass = "border cursor-pointer transition-smooth hover-lift";
    switch (position) {
      case 'GK': return `${baseClass} position-chip-gk`;
      case 'DEF': return `${baseClass} position-chip-def`;
      case 'MID': return `${baseClass} position-chip-mid`;
      case 'FWD': return `${baseClass} position-chip-fwd`;
    }
  };

  return (
    <Card className="glass-card mb-6">
      <CardHeader 
        className="cursor-pointer hover:bg-muted/50 transition-smooth"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <CardTitle className="flex items-center justify-between">
          <span>Filters</span>
          <motion.div
            animate={{ rotate: isCollapsed ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="h-5 w-5" />
          </motion.div>
        </CardTitle>
      </CardHeader>
      
      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <CardContent className="space-y-6">
              {/* Position Chips */}
              <div>
                <label className="text-sm font-medium mb-3 block">Positions</label>
                <div className="flex gap-2 flex-wrap">
                  {positions.map((position) => (
                    <Badge
                      key={position}
                      variant={filters.positions.includes(position) ? "default" : "outline"}
                      className={getPositionChipClass(position)}
                      onClick={() => togglePosition(position)}
                    >
                      {position}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Teams */}
              <div>
                <label className="text-sm font-medium mb-3 block">Teams</label>
                <div className="flex gap-2 flex-wrap max-h-32 overflow-y-auto">
                  {TEAMS.map((team) => (
                    <Badge
                      key={team}
                      variant={filters.teams.includes(team) ? "default" : "outline"}
                      className="cursor-pointer transition-smooth hover-lift"
                      onClick={() => toggleTeam(team)}
                    >
                      {team}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <label className="text-sm font-medium mb-3 block">
                  Price Range: £{filters.priceRange[0]}m - £{filters.priceRange[1]}m
                </label>
                <Slider
                  value={filters.priceRange}
                  onValueChange={(value) => updateFilters({ priceRange: value as [number, number] })}
                  min={4.0}
                  max={14.5}
                  step={0.1}
                  className="w-full"
                />
              </div>

              {/* Ownership */}
              <div>
                <label className="text-sm font-medium mb-3 block">
                  Ownership: {filters.ownershipRange[0]}% - {filters.ownershipRange[1]}%
                </label>
                <Slider
                  value={filters.ownershipRange}
                  onValueChange={(value) => updateFilters({ ownershipRange: value as [number, number] })}
                  min={0}
                  max={100}
                  step={1}
                  className="w-full"
                />
              </div>

              {/* Form */}
              <div>
                <label className="text-sm font-medium mb-3 block">
                  Form (L5): {filters.formRange[0]} - {filters.formRange[1]} pts
                </label>
                <Slider
                  value={filters.formRange}
                  onValueChange={(value) => updateFilters({ formRange: value as [number, number] })}
                  min={0}
                  max={20}
                  step={0.1}
                  className="w-full"
                />
              </div>

              {/* Predicted Points */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium mb-3 block">
                    Pred GW: {filters.predPtsGW[0]} - {filters.predPtsGW[1]}
                  </label>
                  <Slider
                    value={filters.predPtsGW}
                    onValueChange={(value) => updateFilters({ predPtsGW: value as [number, number] })}
                    min={0}
                    max={20}
                    step={0.1}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-3 block">
                    Pred 3GW: {filters.predPts3GW[0]} - {filters.predPts3GW[1]}
                  </label>
                  <Slider
                    value={filters.predPts3GW}
                    onValueChange={(value) => updateFilters({ predPts3GW: value as [number, number] })}
                    min={0}
                    max={60}
                    step={0.1}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-3 block">
                    Pred 6GW: {filters.predPts6GW[0]} - {filters.predPts6GW[1]}
                  </label>
                  <Slider
                    value={filters.predPts6GW}
                    onValueChange={(value) => updateFilters({ predPts6GW: value as [number, number] })}
                    min={0}
                    max={120}
                    step={0.1}
                    className="w-full"
                  />
                </div>
              </div>

              {/* Risk Toggles */}
              <div className="flex gap-6">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="injury-doubts"
                    checked={filters.injuryDoubts}
                    onCheckedChange={(checked) => updateFilters({ injuryDoubts: !!checked })}
                  />
                  <label htmlFor="injury-doubts" className="text-sm">
                    Include injury doubts
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="rotation-risk"
                    checked={filters.rotationRisk}
                    onCheckedChange={(checked) => updateFilters({ rotationRisk: !!checked })}
                  />
                  <label htmlFor="rotation-risk" className="text-sm">
                    Include rotation risk
                  </label>
                </div>
              </div>

              {/* Clear All */}
              <div className="flex justify-end">
                <Button variant="outline" onClick={clearFilters} className="hover-lift">
                  <X className="h-4 w-4 mr-2" />
                  Clear All
                </Button>
              </div>
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}