export type Position = "GK" | "DEF" | "MID" | "FWD";
export type InjuryStatus = "Fit" | "Doubt" | "Injured" | "Suspended";
export type FDR = 1 | 2 | 3 | 4 | 5;

export interface HistoryMatch {
  date: string;
  minutes: number;
  points: number;
  xG: number;
  xA: number;
  shots: number;
  chances: number;
}

export interface LastMatch {
  gw: number;
  points: number;
  xG: number;
  xA: number;
  xGI: number;
}

export interface Player {
  id: string;
  name: string;
  team: string;
  position: Position;
  price: number;
  ownership: number;
  minutesL5: number;
  formL5: number;
  xG_L5: number;
  xA_L5: number;
  xGI_L5: number;
  xG_season: number;
  xA_season: number;
  xGI_season: number;
  predPts_gw: number;
  predPts_3gw: number;
  predPts_6gw: number;
  nextOpponent: string;
  nextOpponentFDR: FDR;
  injuryStatus: InjuryStatus;
  rotationRiskPct: number;
  historyVsNextOpp: HistoryMatch[];
  lastMatches: LastMatch[];
  news?: string[];
  photoUrl?: string;
}

export interface PlayerFilters {
  positions: Position[];
  teams: string[];
  priceRange: [number, number];
  ownershipRange: [number, number];
  minutesRange: [number, number];
  formRange: [number, number];
  predPtsGW: [number, number];
  predPts3GW: [number, number];
  predPts6GW: [number, number];
  fdrRange: [FDR, FDR];
  injuryDoubts: boolean;
  rotationRisk: boolean;
}

export interface TeamBuilderPlayer extends Player {
  isCaptain?: boolean;
  isViceCaptain?: boolean;
}

export interface TeamBuilder {
  players: TeamBuilderPlayer[];
  budget: number;
  totalPredPts: number;
  formation: string;
}