// Sleeper API Types
export interface SleeperUser {
  user_id: string;
  username: string;
  display_name: string;
  avatar: string | null;
}

export interface SleeperLeague {
  league_id: string;
  name: string;
  season: string;
  sport: string;
  status: 'pre_draft' | 'drafting' | 'in_season' | 'complete';
  total_rosters: number;
  scoring_settings: Record<string, number>;
  roster_positions: string[];
  settings: {
    playoff_week_start?: number;
    playoff_teams?: number;
    playoff_round_type?: number;
    playoff_seed_type?: number;
    league_average_match?: number;
    leg?: number;
    trade_deadline?: number;
    reserve_allow_cov?: number;
    reserve_slots?: number;
    taxi_allow_vets?: number;
    taxi_slots?: number;
    taxi_deadline?: number;
    taxi_years?: number;
    type?: number;
    daily_waivers?: number;
    daily_waivers_hour?: number;
    daily_waivers_days?: number;
    waiver_day_of_week?: number;
  };
  avatar?: string;
}

export interface SleeperRoster {
  roster_id: number;
  owner_id: string;
  players: string[];
  starters: string[];
  reserve?: string[];
  taxi?: string[];
  settings: {
    wins: number;
    losses: number;
    ties: number;
    fpts: number;
    fpts_decimal: number;
    fpts_against: number;
    fpts_against_decimal: number;
    total_moves: number;
    waiver_position: number;
    waiver_budget_used: number;
  };
  league_id: string;
}

export interface SleeperLeagueUser {
  user_id: string;
  username: string;
  display_name: string;
  avatar: string | null;
  metadata?: {
    team_name?: string;
  };
  is_owner?: boolean;
}

export interface SleeperMatchup {
  roster_id: number;
  matchup_id: number;
  points: number;
  starters: string[];
  players: string[];
  custom_points?: number | null;
}

export interface SleeperPlayer {
  player_id: string;
  first_name: string;
  last_name: string;
  position: string;
  team: string | null;
  status: string;
  injury_status?: string | null;
  fantasy_positions: string[];
  number?: number;
  age?: number;
  height?: string;
  weight?: string;
  college?: string;
  years_exp?: number;
  search_full_name: string;
  search_rank?: number;
  depth_chart_position?: number;
  depth_chart_order?: number;
  practice_participation?: string | null;
  injury_start_date?: string | null;
}

export interface SleeperNFLState {
  season: string;
  season_type: 'pre' | 'regular' | 'post';
  week: number;
  leg: number;
  season_start_date: string;
  league_season: string;
  league_create_season: string;
  display_week: number;
  previous_season: string;
}

export interface SleeperTrendingPlayer {
  player_id: string;
  count: number;
}

export interface SleeperTransaction {
  transaction_id: string;
  type: 'trade' | 'free_agent' | 'waiver';
  status: 'complete' | 'failed' | 'pending';
  roster_ids: number[];
  adds?: Record<string, number>;
  drops?: Record<string, number>;
  draft_picks?: {
    season: string;
    round: number;
    roster_id: number;
    previous_owner_id: number;
    owner_id: number;
  }[];
  waiver_budget?: {
    sender: number;
    receiver: number;
    amount: number;
  }[];
  settings?: {
    waiver_bid?: number;
  };
  metadata?: any;
  leg: number;
  created: number;
  creator: string;
  consenter_ids: number[];
}

export interface SleeperDraft {
  draft_id: string;
  league_id: string;
  type: 'snake' | 'linear' | 'auction';
  status: 'pre_draft' | 'drafting' | 'paused' | 'complete';
  start_time: number;
  sport: string;
  settings: {
    teams: number;
    rounds: number;
    pick_timer: number;
    slots_qb?: number;
    slots_rb?: number;
    slots_wr?: number;
    slots_te?: number;
    slots_k?: number;
    slots_def?: number;
    slots_bn?: number;
    slots_flex?: number;
  };
  season: string;
  season_type: string;
  metadata?: {
    name?: string;
    description?: string;
    scoring_type?: string;
  };
  draft_order?: Record<string, number>;
  slot_to_roster_id?: Record<string, number>;
  last_picked?: number;
  last_message_id?: string;
  last_message_time?: number;
  created: number;
}

// Internal types for better UX
export interface PlayerWithDetails extends SleeperPlayer {
  full_name: string;
  display_position: string;
  injury_display?: string;
  is_starter?: boolean;
}

export interface MatchupWithDetails {
  matchup_id: number;
  week: number;
  team1: {
    roster_id: number;
    user: SleeperLeagueUser;
    points: number;
    starters: PlayerWithDetails[];
    bench: PlayerWithDetails[];
  };
  team2: {
    roster_id: number;
    user: SleeperLeagueUser;
    points: number;
    starters: PlayerWithDetails[];
    bench: PlayerWithDetails[];
  };
}

export interface RosterWithDetails {
  roster: SleeperRoster;
  user: SleeperLeagueUser;
  starters: PlayerWithDetails[];
  bench: PlayerWithDetails[];
  allPlayers: PlayerWithDetails[];
}

export interface LineupAnalysis {
  user_id: string;
  week: number;
  total_projected_points: number;
  questionable_players: PlayerWithDetails[];
  recommended_changes: {
    player: PlayerWithDetails;
    recommendation: string;
    reason: string;
  }[];
  waiver_suggestions: {
    player: PlayerWithDetails;
    position: string;
    reason: string;
    priority: 'high' | 'medium' | 'low';
  }[];
}

export interface PlayerNews {
  player: PlayerWithDetails;
  news_items: {
    title: string;
    summary: string;
    source: string;
    timestamp: string;
    impact: 'positive' | 'negative' | 'neutral';
  }[];
  injury_update?: {
    status: string;
    expected_return?: string;
    severity: 'minor' | 'moderate' | 'major';
  };
}
