import { Player, Position, InjuryStatus } from '@/types/player';
import { FPLPlayer, FPLTeam, FPLPosition, FPLFixture } from '@/services/fplApi';

const POSITION_MAP: Record<number, Position> = {
  1: 'GK',
  2: 'DEF', 
  3: 'MID',
  4: 'FWD'
};

const STATUS_MAP: Record<string, InjuryStatus> = {
  'a': 'Fit',
  'd': 'Doubt',
  'i': 'Injured',
  's': 'Suspended',
  'u': 'Fit'
};

export function transformFPLPlayer(
  fplPlayer: FPLPlayer,
  teams: FPLTeam[],
  positions: FPLPosition[],
  fixtures: FPLFixture[]
): Player {
  const team = teams.find(t => t.id === fplPlayer.team);
  const position = POSITION_MAP[fplPlayer.element_type];
  
  // Find next fixture for this team
  const nextFixture = fixtures
    .filter(f => !f.finished && (f.team_h === fplPlayer.team || f.team_a === fplPlayer.team))
    .sort((a, b) => new Date(a.kickoff_time).getTime() - new Date(b.kickoff_time).getTime())[0];

  let nextOpponent = 'TBD';
  let nextOpponentFDR = 3;
  
  if (nextFixture) {
    const isHome = nextFixture.team_h === fplPlayer.team;
    const opponentTeamId = isHome ? nextFixture.team_a : nextFixture.team_h;
    const opponentTeam = teams.find(t => t.id === opponentTeamId);
    nextOpponent = `${opponentTeam?.short_name || 'TBD'} (${isHome ? 'H' : 'A'})`;
    nextOpponentFDR = isHome ? nextFixture.team_h_difficulty : nextFixture.team_a_difficulty;
  }

  // Calculate some derived stats
  const ownership = parseFloat(fplPlayer.selected_by_percent);
  const form = parseFloat(fplPlayer.form);
  const expectedGoals = parseFloat(fplPlayer.expected_goals) || 0;
  const expectedAssists = parseFloat(fplPlayer.expected_assists) || 0;
  const expectedGI = parseFloat(fplPlayer.expected_goal_involvements) || 0;

  // Estimate rotation risk based on minutes, form, and selection status
  let rotationRisk = 5;
  
  // If player has very few minutes, high rotation risk
  if (fplPlayer.minutes < 90) rotationRisk = 95; // Barely played
  else if (fplPlayer.minutes < 270) rotationRisk = 75; // Squad player
  else if (fplPlayer.minutes < 450) rotationRisk = 45; // Rotation prone
  else if (fplPlayer.minutes < 720) rotationRisk = 25; // Regular starter with some rotation
  else rotationRisk = 10; // Nailed starter
  
  // Adjust based on ownership (proxy for expected starts)
  if (ownership < 1.0) rotationRisk = Math.min(95, rotationRisk + 30);
  else if (ownership < 5.0) rotationRisk = Math.min(85, rotationRisk + 15);
  
  // Adjust based on form
  if (form < 2) rotationRisk = Math.min(90, rotationRisk + 10);

  // Generate mock recent matches (in real implementation, this would come from history API)
  const lastMatches = Array.from({ length: 5 }, (_, i) => ({
    gw: 15 - i,
    points: Math.max(0, Math.round(form + (Math.random() - 0.5) * 4)),
    xG: expectedGoals * 0.2 + Math.random() * 0.5,
    xA: expectedAssists * 0.2 + Math.random() * 0.3,
    xGI: expectedGI * 0.2 + Math.random() * 0.6,
  }));

  return {
    id: fplPlayer.id.toString(),
    name: fplPlayer.web_name,
    team: team?.short_name || 'UNK',
    position,
    price: fplPlayer.now_cost / 10, // FPL API returns price in tenths
    ownership,
    minutesL5: Math.min(450, fplPlayer.minutes), // Approximate last 5 games
    formL5: form,
    xG_L5: expectedGoals * 0.3, // Approximate last 5 games
    xA_L5: expectedAssists * 0.3,
    xGI_L5: expectedGI * 0.3,
    xG_season: expectedGoals,
    xA_season: expectedAssists,
    xGI_season: expectedGI,
    predPts_gw: parseFloat(fplPlayer.ep_next) || form,
    predPts_3gw: (parseFloat(fplPlayer.ep_next) || form) * 3,
    predPts_6gw: (parseFloat(fplPlayer.ep_next) || form) * 6,
    nextOpponent,
    nextOpponentFDR: nextOpponentFDR as any,
    injuryStatus: STATUS_MAP[fplPlayer.status] || 'Fit',
    rotationRiskPct: rotationRisk,
    historyVsNextOpp: [], // Would need additional API calls
    lastMatches,
    news: fplPlayer.news ? [fplPlayer.news] : undefined,
    photoUrl: fplPlayer.photo ? `https://resources.premierleague.com/premierleague/photos/players/250x250/p${fplPlayer.photo.replace('.jpg', '.png')}` : undefined
  };
}

export function getTeamCodes(teams: FPLTeam[]): string[] {
  return teams.map(team => team.short_name);
}