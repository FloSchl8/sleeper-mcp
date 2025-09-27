import type { PlayerWithDetails } from './types.js';

// Web search utilities
export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
  source: string;
}

export async function performWebSearch(query: string, maxResults: number = 5): Promise<SearchResult[]> {
  // In a real implementation, this would integrate with a web search API like:
  // - Google Custom Search API
  // - Bing Search API
  // - SerpAPI
  // - Brave Search API

  // For now, we'll simulate search results based on common fantasy football patterns
  const mockResults: SearchResult[] = [];

  if (query.toLowerCase().includes('injury')) {
    mockResults.push({
      title: `${query} - Latest Injury Report and Updates`,
      url: 'https://nfl.com/injury-report',
      snippet: 'Latest injury updates and expected return timeline for fantasy football players',
      source: 'NFL.com'
    });

    mockResults.push({
      title: `Fantasy Impact: ${query}`,
      url: 'https://fantasydb.com/injury-analysis',
      snippet: 'Analysis of fantasy football impact and recommended waiver wire replacements',
      source: 'FantasyDB'
    });
  }

  if (query.toLowerCase().includes('news') || query.toLowerCase().includes('update')) {
    mockResults.push({
      title: `Breaking: ${query}`,
      url: 'https://espn.com/nfl/news',
      snippet: 'Latest NFL news and updates affecting fantasy football lineups',
      source: 'ESPN'
    });
  }

  mockResults.push({
    title: `${query} - Fantasy Football Analysis`,
    url: 'https://fantasy-experts.com/analysis',
    snippet: 'Expert analysis and start/sit recommendations for your fantasy lineup',
    source: 'Fantasy Experts'
  });

  return mockResults.slice(0, maxResults);
}

// Player analysis utilities
export function calculatePlayerTier(player: PlayerWithDetails): 'elite' | 'high' | 'mid' | 'low' | 'deep' {
  const rank = player.search_rank || 999;

  if (rank <= 24) return 'elite';
  if (rank <= 60) return 'high';
  if (rank <= 120) return 'mid';
  if (rank <= 200) return 'low';
  return 'deep';
}

export function getInjuryRiskLevel(player: PlayerWithDetails): 'none' | 'low' | 'moderate' | 'high' | 'extreme' {
  const status = player.injury_status?.toLowerCase();

  if (!status || status === 'healthy') return 'none';
  if (status === 'probable') return 'low';
  if (status === 'questionable') return 'moderate';
  if (status === 'doubtful') return 'high';
  if (status === 'out' || status === 'injured reserve') return 'extreme';

  return 'low';
}

export function formatPlayerName(player: PlayerWithDetails): string {
  const name = player.full_name || `${player.first_name || ''} ${player.last_name || ''}`.trim();
  const team = player.team ? ` (${player.team})` : '';
  const position = player.position ? ` - ${player.position}` : '';

  return `${name}${team}${position}`;
}

export function generateFantasyAdvice(player: PlayerWithDetails, context?: string): string {
  const tier = calculatePlayerTier(player);
  const risk = getInjuryRiskLevel(player);
  const advice: string[] = [];

  // Base recommendation based on tier
  switch (tier) {
    case 'elite':
      advice.push('Must-start player in all formats');
      break;
    case 'high':
      advice.push('Strong starter with consistent production');
      break;
    case 'mid':
      advice.push('Solid flex option with upside');
      break;
    case 'low':
      advice.push('Situational start based on matchup');
      break;
    case 'deep':
      advice.push('Deep league option or handcuff only');
      break;
  }

  // Modify based on injury risk
  switch (risk) {
    case 'extreme':
      advice.push('❌ DO NOT START - Player unavailable');
      break;
    case 'high':
      advice.push('⚠️ HIGH RISK - Unlikely to play');
      break;
    case 'moderate':
      advice.push('🟡 MONITOR - Game-time decision');
      break;
    case 'low':
      advice.push('✅ Expected to play with minor concern');
      break;
    case 'none':
      advice.push('✅ Healthy and ready to go');
      break;
  }

  // Context-specific advice
  if (context?.toLowerCase().includes('waiver')) {
    if (tier === 'elite' || tier === 'high') {
      advice.push('🔥 HIGH PRIORITY waiver claim');
    } else if (tier === 'mid') {
      advice.push('📈 Worth a waiver claim if you need depth');
    } else {
      advice.push('💡 Monitor but not a priority pickup');
    }
  }

  if (context?.toLowerCase().includes('trade')) {
    if (tier === 'elite') {
      advice.push('💎 Hold unless receiving premium value');
    } else if (tier === 'high') {
      advice.push('📊 Good trade asset with solid value');
    } else {
      advice.push('🔄 Tradeable for right price or need');
    }
  }

  return advice.join(' | ');
}

// Matchup analysis utilities
export function analyzeMatchupStrength(homeTeam: string, awayTeam: string, position: string): {
  strength: 'excellent' | 'good' | 'neutral' | 'poor' | 'avoid';
  reasoning: string;
} {
  // This would typically integrate with matchup data APIs
  // For now, we'll provide a simplified analysis structure

  const defenseRankings: Record<string, Record<string, number>> = {
    // Mock defense rankings (1 = best defense, 32 = worst defense)
    'QB': { 'NE': 5, 'BUF': 12, 'MIA': 18, 'NYJ': 25 },
    'RB': { 'SF': 3, 'BAL': 8, 'DEN': 15, 'ATL': 28 },
    'WR': { 'NE': 2, 'DEN': 10, 'GB': 20, 'KC': 30 },
    'TE': { 'NE': 1, 'PIT': 7, 'LAC': 14, 'ARI': 32 }
  };

  const opposingDefense = homeTeam; // Simplified - would need to determine which team player is facing
  const ranking = defenseRankings[position]?.[opposingDefense] || 16;

  let strength: 'excellent' | 'good' | 'neutral' | 'poor' | 'avoid';
  let reasoning: string;

  if (ranking >= 25) {
    strength = 'excellent';
    reasoning = `Facing a bottom-tier defense (#${ranking}) - great matchup`;
  } else if (ranking >= 18) {
    strength = 'good';
    reasoning = `Favorable matchup against weaker defense (#${ranking})`;
  } else if (ranking >= 10) {
    strength = 'neutral';
    reasoning = `Average matchup - defense ranked #${ranking}`;
  } else if (ranking >= 5) {
    strength = 'poor';
    reasoning = `Tough matchup vs strong defense (#${ranking})`;
  } else {
    strength = 'avoid';
    reasoning = `Elite defense (#${ranking}) - consider alternatives`;
  }

  return { strength, reasoning };
}

// Scoring utilities
export function calculateProjectedPoints(
  player: PlayerWithDetails,
  scoringFormat: 'standard' | 'ppr' | 'half_ppr' = 'ppr'
): number {
  const tier = calculatePlayerTier(player);
  const risk = getInjuryRiskLevel(player);
  const position = player.position?.toUpperCase();

  // Base points by position and tier
  const basePoints: Record<string, Record<string, number>> = {
    'QB': { elite: 22, high: 18, mid: 15, low: 12, deep: 8 },
    'RB': { elite: 18, high: 14, mid: 11, low: 8, deep: 5 },
    'WR': { elite: 16, high: 12, mid: 9, low: 7, deep: 4 },
    'TE': { elite: 14, high: 10, mid: 7, low: 5, deep: 3 },
    'K': { elite: 9, high: 8, mid: 7, low: 6, deep: 5 },
    'DEF': { elite: 12, high: 9, mid: 7, low: 5, deep: 3 }
  };

  let projected = basePoints[position || 'WR']?.[tier] || 6;

  // Adjust for PPR scoring
  if (scoringFormat === 'ppr' && (position === 'RB' || position === 'WR' || position === 'TE')) {
    const pprBonus = tier === 'elite' ? 4 : tier === 'high' ? 3 : tier === 'mid' ? 2 : 1;
    projected += pprBonus;
  } else if (scoringFormat === 'half_ppr' && (position === 'RB' || position === 'WR' || position === 'TE')) {
    const halfPprBonus = tier === 'elite' ? 2 : tier === 'high' ? 1.5 : tier === 'mid' ? 1 : 0.5;
    projected += halfPprBonus;
  }

  // Adjust for injury risk
  switch (risk) {
    case 'extreme':
      projected = 0;
      break;
    case 'high':
      projected *= 0.2;
      break;
    case 'moderate':
      projected *= 0.7;
      break;
    case 'low':
      projected *= 0.9;
      break;
  }

  return Math.round(projected * 100) / 100; // Round to 2 decimal places
}

// Time utilities
export function formatTimeAgo(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days} day${days === 1 ? '' : 's'} ago`;
  if (hours > 0) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  if (minutes > 0) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
  return 'Just now';
}

export function getCurrentNFLWeek(): number {
  // This is a simplified calculation - in reality you'd want to use the NFL API
  const seasonStart = new Date('2024-09-05'); // Approximate NFL season start
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - seasonStart.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return Math.min(Math.max(1, Math.ceil(diffDays / 7)), 18);
}

// Validation utilities
export function isValidSleeperID(id: string): boolean {
  // Sleeper IDs are typically numeric strings of varying length
  return /^\d+$/.test(id);
}

export function isValidNFLTeam(team: string): boolean {
  const nflTeams = [
    'ARI', 'ATL', 'BAL', 'BUF', 'CAR', 'CHI', 'CIN', 'CLE',
    'DAL', 'DEN', 'DET', 'GB', 'HOU', 'IND', 'JAX', 'KC',
    'LV', 'LAC', 'LAR', 'MIA', 'MIN', 'NE', 'NO', 'NYG',
    'NYJ', 'PHI', 'PIT', 'SEA', 'SF', 'TB', 'TEN', 'WAS'
  ];

  return nflTeams.includes(team.toUpperCase());
}

export function isValidFantasyPosition(position: string): boolean {
  const positions = ['QB', 'RB', 'WR', 'TE', 'K', 'DEF', 'FLEX', 'SUPER_FLEX'];
  return positions.includes(position.toUpperCase());
}

// Error handling utilities
export class SleeperAPIError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public endpoint?: string
  ) {
    super(message);
    this.name = 'SleeperAPIError';
  }
}

export function handleSleeperError(error: any, endpoint?: string): never {
  if (error.name === 'SleeperAPIError') {
    throw error;
  }

  if (error.message?.includes('404')) {
    throw new SleeperAPIError('Resource not found', 404, endpoint);
  }

  if (error.message?.includes('429')) {
    throw new SleeperAPIError('Rate limit exceeded - please wait before making more requests', 429, endpoint);
  }

  if (error.message?.includes('500')) {
    throw new SleeperAPIError('Sleeper API is experiencing issues - please try again later', 500, endpoint);
  }

  throw new SleeperAPIError(
    error.message || 'Unknown error occurred while fetching data from Sleeper',
    undefined,
    endpoint
  );
}
