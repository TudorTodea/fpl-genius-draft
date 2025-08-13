import { create } from 'zustand';
import { Player, PlayerFilters, TeamBuilderPlayer, Position } from '@/types/player';

interface FPLStore {
  // Data
  players: Player[];
  filteredPlayers: Player[];
  
  // UI State
  currentGameweek: number;
  currentSeason: string;
  searchQuery: string;
  selectedPlayer: Player | null;
  compareList: Player[];
  
  // Filters
  filters: PlayerFilters;
  
  // Team Builder
  teamBuilder: {
    players: TeamBuilderPlayer[];
    budget: number;
    totalPredPts: number;
    formation: string;
  };
  
  // Actions
  setPlayers: (players: Player[]) => void;
  setFilteredPlayers: (players: Player[]) => void;
  setCurrentGameweek: (gw: number) => void;
  setCurrentSeason: (season: string) => void;
  setSearchQuery: (query: string) => void;
  setSelectedPlayer: (player: Player | null) => void;
  addToCompare: (player: Player) => void;
  removeFromCompare: (playerId: string) => void;
  clearCompare: () => void;
  updateFilters: (filters: Partial<PlayerFilters>) => void;
  clearFilters: () => void;
  addToTeam: (player: Player) => void;
  removeFromTeam: (playerId: string) => void;
  setCaptain: (playerId: string) => void;
  setViceCaptain: (playerId: string) => void;
  clearTeam: () => void;
}

const initialFilters: PlayerFilters = {
  positions: [],
  teams: [],
  priceRange: [4.0, 14.5],
  ownershipRange: [0, 100],
  minutesRange: [0, 450],
  formRange: [0, 20],
  predPtsGW: [0, 20],
  predPts3GW: [0, 60],
  predPts6GW: [0, 120],
  fdrRange: [1, 5],
  injuryDoubts: false,
  rotationRisk: false,
};

export const useFPLStore = create<FPLStore>((set, get) => ({
  // Initial state
  players: [],
  filteredPlayers: [],
  currentGameweek: 1,
  currentSeason: '24/25',
  searchQuery: '',
  selectedPlayer: null,
  compareList: [],
  filters: initialFilters,
  teamBuilder: {
    players: [],
    budget: 100.0,
    totalPredPts: 0,
    formation: '3-5-2',
  },

  // Actions
  setPlayers: (players) => {
    set({ players, filteredPlayers: players });
  },

  setFilteredPlayers: (players) => {
    set({ filteredPlayers: players });
  },

  setCurrentGameweek: (gw) => set({ currentGameweek: gw }),
  
  setCurrentSeason: (season) => set({ currentSeason: season }),
  
  setSearchQuery: (query) => set({ searchQuery: query }),
  
  setSelectedPlayer: (player) => set({ selectedPlayer: player }),
  
  addToCompare: (player) => {
    const { compareList } = get();
    if (compareList.length < 3 && !compareList.find(p => p.id === player.id)) {
      set({ compareList: [...compareList, player] });
    }
  },
  
  removeFromCompare: (playerId) => {
    const { compareList } = get();
    set({ compareList: compareList.filter(p => p.id !== playerId) });
  },
  
  clearCompare: () => set({ compareList: [] }),
  
  updateFilters: (newFilters) => {
    set({ filters: { ...get().filters, ...newFilters } });
  },
  
  clearFilters: () => set({ filters: initialFilters }),
  
  addToTeam: (player) => {
    const { teamBuilder } = get();
    const newPlayer: TeamBuilderPlayer = { ...player };
    const updatedPlayers = [...teamBuilder.players, newPlayer];
    const newBudget = teamBuilder.budget - player.price;
    const newTotalPredPts = teamBuilder.totalPredPts + player.predPts_gw;
    
    set({
      teamBuilder: {
        ...teamBuilder,
        players: updatedPlayers,
        budget: newBudget,
        totalPredPts: newTotalPredPts,
      }
    });
  },
  
  removeFromTeam: (playerId) => {
    const { teamBuilder } = get();
    const playerToRemove = teamBuilder.players.find(p => p.id === playerId);
    if (!playerToRemove) return;
    
    const updatedPlayers = teamBuilder.players.filter(p => p.id !== playerId);
    const newBudget = teamBuilder.budget + playerToRemove.price;
    const newTotalPredPts = teamBuilder.totalPredPts - playerToRemove.predPts_gw;
    
    set({
      teamBuilder: {
        ...teamBuilder,
        players: updatedPlayers,
        budget: newBudget,
        totalPredPts: newTotalPredPts,
      }
    });
  },
  
  setCaptain: (playerId) => {
    const { teamBuilder } = get();
    const updatedPlayers = teamBuilder.players.map(p => ({
      ...p,
      isCaptain: p.id === playerId,
      isViceCaptain: p.isCaptain && p.id === playerId ? false : p.isViceCaptain,
    }));
    
    set({
      teamBuilder: {
        ...teamBuilder,
        players: updatedPlayers,
      }
    });
  },
  
  setViceCaptain: (playerId) => {
    const { teamBuilder } = get();
    const updatedPlayers = teamBuilder.players.map(p => ({
      ...p,
      isViceCaptain: p.id === playerId,
      isCaptain: p.isViceCaptain && p.id === playerId ? false : p.isCaptain,
    }));
    
    set({
      teamBuilder: {
        ...teamBuilder,
        players: updatedPlayers,
      }
    });
  },
  
  clearTeam: () => {
    set({
      teamBuilder: {
        players: [],
        budget: 100.0,
        totalPredPts: 0,
        formation: '3-5-2',
      }
    });
  },
}));