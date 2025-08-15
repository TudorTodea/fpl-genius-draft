export interface FPLBootstrapResponse {
  elements: FPLPlayer[];
  teams: FPLTeam[];
  element_types: FPLPosition[];
  events: FPLGameweek[];
}

export interface FPLPlayer {
  id: number;
  first_name: string;
  second_name: string;
  web_name: string;
  team: number;
  element_type: number;
  now_cost: number;
  selected_by_percent: string;
  minutes: number;
  total_points: number;
  form: string;
  expected_goals: string;
  expected_assists: string;
  expected_goal_involvements: string;
  expected_goals_per_90: string;
  expected_assists_per_90: string;
  expected_goal_involvements_per_90: string;
  ep_next: string;
  ep_this: string;
  event_points: number;
  points_per_game: string;
  transfers_in_event: number;
  transfers_out_event: number;
  value_season: string;
  status: string;
  chance_of_playing_next_round: number | null;
  chance_of_playing_this_round: number | null;
  news: string;
  photo: string;
}

export interface FPLTeam {
  id: number;
  name: string;
  short_name: string;
  code: number;
}

export interface FPLPosition {
  id: number;
  plural_name: string;
  plural_name_short: string;
  singular_name: string;
  singular_name_short: string;
}

export interface FPLGameweek {
  id: number;
  name: string;
  deadline_time: string;
  average_entry_score: number;
  finished: boolean;
  data_checked: boolean;
  highest_scoring_entry: number;
  deadline_time_epoch: number;
  deadline_time_game_offset: number;
  highest_score: number;
  is_previous: boolean;
  is_current: boolean;
  is_next: boolean;
  cup_leagues_created: boolean;
  h2h_ko_matches_created: boolean;
  chip_plays: any[];
  most_selected: number;
  most_transferred_in: number;
  top_element: number;
  top_element_info: any;
  transfers_made: number;
  most_captained: number;
  most_vice_captained: number;
}

export interface FPLFixture {
  code: number;
  event: number;
  finished: boolean;
  finished_provisional: boolean;
  id: number;
  kickoff_time: string;
  minutes: number;
  provisional_start_time: boolean;
  started: boolean;
  team_a: number;
  team_a_score: number | null;
  team_h: number;
  team_h_score: number | null;
  team_a_difficulty: number;
  team_h_difficulty: number;
  pulse_id: number;
}

const FPL_BASE_URL =
  typeof import.meta !== "undefined" && import.meta.env.DEV
    ? "/fpl"
    : "/api/fpl";

class FPLApiService {
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  private async fetchWithCache<T>(url: string): Promise<T> {
    const cached = this.cache.get(url);
    const now = Date.now();

    if (cached && (now - cached.timestamp) < this.CACHE_DURATION) {
      return cached.data;
    }

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      this.cache.set(url, { data, timestamp: now });
      return data;
    } catch (error) {
      console.error(`Error fetching ${url}:`, error);
      throw error;
    }
  }

  async getBootstrapStatic(): Promise<FPLBootstrapResponse> {
    return this.fetchWithCache(`${FPL_BASE_URL}/bootstrap-static/`);
  }

  async getFixtures(): Promise<FPLFixture[]> {
    return this.fetchWithCache(`${FPL_BASE_URL}/fixtures/`);
  }

  async getPlayerHistory(playerId: number): Promise<any> {
    return this.fetchWithCache(`${FPL_BASE_URL}/element-summary/${playerId}/`);
  }

  clearCache(): void {
    this.cache.clear();
  }
}

export const fplApi = new FPLApiService();