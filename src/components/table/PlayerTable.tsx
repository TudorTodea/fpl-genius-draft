import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Plus, ArrowUpDown, Eye, Settings } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import type { Player, Position } from '@/types/player';

interface Column {
  key: keyof Player | 'actions';
  label: string;
  sortable?: boolean;
  hidden?: boolean;
  render?: (player: Player) => React.ReactNode;
}

export function PlayerTable() {
  const { filteredPlayers, setSelectedPlayer, addToTeam } = useFPLStore();
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Player | null;
    direction: 'asc' | 'desc';
  }>({ key: null, direction: 'asc' });

  const getPositionChipClass = (position: Position) => {
    switch (position) {
      case 'GK': return 'position-chip-gk';
      case 'DEF': return 'position-chip-def';
      case 'MID': return 'position-chip-mid';
      case 'FWD': return 'position-chip-fwd';
    }
  };

  const getFDRClass = (fdr: number) => {
    return `fdr-${fdr} text-xs px-2 py-1 rounded-full font-semibold`;
  };

  const getInjuryStatusColor = (status: string) => {
    switch (status) {
      case 'Fit': return 'text-green-600';
      case 'Doubt': return 'text-yellow-600';
      case 'Injured': return 'text-red-600';
      case 'Suspended': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const columns: Column[] = [
    {
      key: 'name',
      label: 'Player',
      sortable: true,
      render: (player) => (
        <div className="flex items-center gap-3 min-w-[200px]">
          <Avatar className="h-8 w-8">
            <AvatarImage src={player.photoUrl} alt={player.name} />
            <AvatarFallback>{player.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{player.name}</div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{player.team}</span>
              <Badge 
                variant="outline" 
                className={`text-xs ${getPositionChipClass(player.position)}`}
              >
                {player.position}
              </Badge>
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'price',
      label: 'Price',
      sortable: true,
      render: (player) => <span className="font-mono">£{player.price}m</span>
    },
    {
      key: 'ownership',
      label: 'Own%',
      sortable: true,
      render: (player) => <span>{player.ownership.toFixed(1)}%</span>
    },
    {
      key: 'minutesL5',
      label: 'Min (L5)',
      sortable: true,
      hidden: true,
    },
    {
      key: 'formL5',
      label: 'Form',
      sortable: true,
      render: (player) => (
        <span className="font-mono text-sm">
          {player.formL5.toFixed(1)}
        </span>
      )
    },
    {
      key: 'xGI_L5',
      label: 'xGI (L5)',
      sortable: true,
      render: (player) => (
        <span className="font-mono text-sm">
          {player.xGI_L5.toFixed(1)}
        </span>
      )
    },
    {
      key: 'predPts_gw',
      label: 'Pred GW',
      sortable: true,
      render: (player) => (
        <span className="font-mono font-semibold text-primary">
          {player.predPts_gw.toFixed(1)}
        </span>
      )
    },
    {
      key: 'predPts_3gw',
      label: 'Pred 3GW',
      sortable: true,
      hidden: true,
      render: (player) => (
        <span className="font-mono text-sm">
          {player.predPts_3gw.toFixed(1)}
        </span>
      )
    },
    {
      key: 'predPts_6gw',
      label: 'Pred 6GW',
      sortable: true,
      hidden: true,
      render: (player) => (
        <span className="font-mono text-sm">
          {player.predPts_6gw.toFixed(1)}
        </span>
      )
    },
    {
      key: 'nextOpponent',
      label: 'Next',
      sortable: false,
      render: (player) => (
        <div className="flex items-center gap-2">
          <span className="text-sm">{player.nextOpponent}</span>
          <span className={getFDRClass(player.nextOpponentFDR)}>
            {player.nextOpponentFDR}
          </span>
        </div>
      )
    },
    {
      key: 'injuryStatus',
      label: 'Status',
      sortable: true,
      render: (player) => (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <span className={`text-sm ${getInjuryStatusColor(player.injuryStatus)}`}>
                {player.injuryStatus === 'Fit' ? '✓' : '⚠'}
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <p>{player.injuryStatus}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )
    },
    {
      key: 'rotationRiskPct',
      label: 'Risk%',
      sortable: true,
      hidden: true,
      render: (player) => (
        <span className={`text-sm ${player.rotationRiskPct > 30 ? 'text-orange-600' : 'text-green-600'}`}>
          {player.rotationRiskPct}%
        </span>
      )
    },
    {
      key: 'actions',
      label: '',
      sortable: false,
      render: (player) => (
        <div className="flex gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 hover-glow"
                  onClick={() => setSelectedPlayer(player)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>View Details</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 hover-glow text-green-600"
                  onClick={() => addToTeam(player)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Add to Team</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      )
    }
  ];

  const visibleColumns = columns.filter(col => !col.hidden);

  const sortedPlayers = useMemo(() => {
    if (!sortConfig.key) return filteredPlayers;

    return [...filteredPlayers].sort((a, b) => {
      const aValue = a[sortConfig.key as keyof Player];
      const bValue = b[sortConfig.key as keyof Player];

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
      }

      const aString = String(aValue);
      const bString = String(bValue);
      return sortConfig.direction === 'asc' 
        ? aString.localeCompare(bString)
        : bString.localeCompare(aString);
    });
  }, [filteredPlayers, sortConfig]);

  const handleSort = (key: keyof Player) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-2xl overflow-hidden"
    >
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-border/50">
              {visibleColumns.map((column) => (
                <TableHead 
                  key={column.key}
                  className={`${column.sortable ? 'cursor-pointer hover:bg-muted/50' : ''} transition-smooth`}
                  onClick={() => column.sortable && column.key !== 'actions' && handleSort(column.key as keyof Player)}
                >
                  <div className="flex items-center gap-2">
                    {column.label}
                    {column.sortable && column.key !== 'actions' && (
                      <ArrowUpDown className="h-3 w-3 opacity-50" />
                    )}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedPlayers.map((player, index) => (
              <motion.tr
                key={player.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="cursor-pointer hover:bg-muted/30 transition-smooth border-b border-border/30"
                onClick={() => setSelectedPlayer(player)}
              >
                {visibleColumns.map((column) => (
                  <TableCell key={column.key} className="py-3">
                    {column.render 
                      ? column.render(player)
                      : String(player[column.key as keyof Player] || '')
                    }
                  </TableCell>
                ))}
              </motion.tr>
            ))}
          </TableBody>
        </Table>
      </div>
      
      {sortedPlayers.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <p>No players found matching your filters.</p>
          <p className="text-sm mt-2">Try adjusting your search criteria.</p>
        </div>
      )}
    </motion.div>
  );
}