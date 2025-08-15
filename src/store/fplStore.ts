import { create } from 'zustand';
import { Player, PlayerFilters, TeamBuilderPlayer, Position } from '@/types/player';

// Filter application function
function applyFilters(players: Player[], filters: PlayerFilters, searchQuery: string): Player[] {
  return players.filter(player => {
    // Search query filter
    if (searchQuery && !player.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !player.team.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

    // Position filter
    if (filters.positions.length > 0 && !filters.positions.includes(player.position)) {
      return false;
    }

    // Team filter
    if (filters.teams.length > 0 && !filters.teams.includes(player.team)) {
      return false;
    }

    // Price range filter
    if (player.price < filters.priceRange[0] || player.price > filters.priceRange[1]) {
      return false;
    }

    // Ownership range filter
    if (player.ownership < filters.ownershipRange[0] || player.ownership > filters.ownershipRange[1]) {
      return false;
    }

    // Minutes range filter
    if (player.minutesL5 < filters.minutesRange[0] || player.minutesL5 > filters.minutesRange[1]) {
      return false;
    }

    // Form range filter
    if (player.formL5 < filters.formRange[0] || player.formL5 > filters.formRange[1]) {
      return false;
    }

    // Predicted points filters
    if (player.predPts_gw < filters.predPtsGW[0] || player.predPts_gw > filters.predPtsGW[1]) {
      return false;
    }

    if (player.predPts_3gw < filters.predPts3GW[0] || player.predPts_3gw > filters.predPts3GW[1]) {
      return false;
    }

    if (player.predPts_6gw < filters.predPts6GW[0] || player.predPts_6gw > filters.predPts6GW[1]) {
      return false;
    }

    // FDR range filter
    if (player.nextOpponentFDR < filters.fdrRange[0] || player.nextOpponentFDR > filters.fdrRange[1]) {
      return false;
    }

    // Injury doubts filter
    if (filters.injuryDoubts && player.injuryStatus === 'Fit') {
      return false;
    }

    // Rotation risk filter
    if (filters.rotationRisk && player.rotationRiskPct < 20) {
      return false;
    }

    return true;
  });
}

interface FPLStore {
  // Data
  players: Player[];
  filteredPlayers: Player[];
  
  // Pagination
  currentPage: number;
  itemsPerPage: number;
  totalPages: number;
  
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
  setCurrentPage: (page: number) => void;
  setItemsPerPage: (items: number) => void;
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
  currentPage: 1,
  itemsPerPage: 25,
  totalPages: 0,
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
    set((state) => {
      const filtered = applyFilters(players, state.filters, state.searchQuery);
      const totalPages = Math.ceil(filtered.length / state.itemsPerPage);
      return { players, filteredPlayers: filtered, totalPages, currentPage: 1 };
    });
  },

  setFilteredPlayers: (players) => {
    set({ filteredPlayers: players });
  },

  setCurrentGameweek: (gw) => set({ currentGameweek: gw }),
  
  setCurrentSeason: (season) => set({ currentSeason: season }),
  
  setSearchQuery: (query) => {
    set((state) => {
      const filtered = applyFilters(state.players, state.filters, query);
      const totalPages = Math.ceil(filtered.length / state.itemsPerPage);
      return { searchQuery: query, filteredPlayers: filtered, totalPages, currentPage: 1 };
    });
  },
  
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
    set((state) => {
      const updatedFilters = { ...state.filters, ...newFilters };
      const filtered = applyFilters(state.players, updatedFilters, state.searchQuery);
      const totalPages = Math.ceil(filtered.length / state.itemsPerPage);
      return { filters: updatedFilters, filteredPlayers: filtered, totalPages, currentPage: 1 };
    });
  },
  
  clearFilters: () => {
    set((state) => {
      const filtered = applyFilters(state.players, initialFilters, state.searchQuery);
      const totalPages = Math.ceil(filtered.length / state.itemsPerPage);
      return { filters: initialFilters, filteredPlayers: filtered, totalPages, currentPage: 1 };
    });
  },
  
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

  setCurrentPage: (page) => set({ currentPage: page }),
  
  setItemsPerPage: (items) => {
    set((state) => {
      const totalPages = Math.ceil(state.filteredPlayers.length / items);
      const currentPage = Math.min(state.currentPage, totalPages || 1);
      return { itemsPerPage: items, totalPages, currentPage };
    });
  },
}));