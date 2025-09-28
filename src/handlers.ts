import { sleeperClient } from "./sleeper-client.js";
import {
  GetUserInfoSchema,
  GetUserLeaguesSchema,
  GetLeagueInfoSchema,
  GetLeagueRostersSchema,
  GetLeagueUsersSchema,
  GetCurrentMatchupsSchema,
  GetMatchupDetailsSchema,
  SearchPlayersSchema,
  GetTrendingPlayersSchema,
  GetPlayerDetailsSchema,
  ResearchPlayerStatusSchema,
  AnalyzeLineupSchema,
  GetWaiverSuggestionsSchema,
  GetTransactionsSchema,
  ComparePlayersSchema,
  GetStartSitAdviceSchema,
  ClearCacheSchema,
} from "./tools.js";
import type { PlayerWithDetails, RosterWithDetails } from "./types.js";

// Web search functionality (simplified for MCP context)
async function performWebSearch(query: string): Promise<string[]> {
  // In a real implementation, this would use a web search API
  // For now, we'll return mock results to demonstrate the structure
  const searchResults = [
    `Search result for "${query}": Recent news and updates would appear here`,
    `Injury report: Player status and expected return timeline`,
    `Expert analysis: Fantasy football impact and recommendations`,
  ];

  return searchResults;
}

export async function handleToolCall(name: string, args: any) {
  try {
    switch (name) {
      case "get_user_info":
        return handleGetUserInfo(args);

      case "get_user_leagues":
        return handleGetUserLeagues(args);

      case "get_league_info":
        return handleGetLeagueInfo(args);

      case "get_league_rosters":
        return handleGetLeagueRosters(args);

      case "get_league_users":
        return handleGetLeagueUsers(args);

      case "get_current_matchups":
        return handleGetCurrentMatchups(args);

      case "get_matchup_details":
        return handleGetMatchupDetails(args);

      case "get_nfl_state":
        return handleGetNFLState();

      case "search_players":
        return handleSearchPlayers(args);

      case "get_trending_players":
        return handleGetTrendingPlayers(args);

      case "get_player_details":
        return handleGetPlayerDetails(args);

      case "research_player_status":
        return handleResearchPlayerStatus(args);

      case "analyze_lineup":
        return handleAnalyzeLineup(args);

      case "get_waiver_suggestions":
        return handleGetWaiverSuggestions(args);

      case "get_transactions":
        return handleGetTransactions(args);

      case "compare_players":
        return handleComparePlayers(args);

      case "get_start_sit_advice":
        return handleGetStartSitAdvice(args);

      case "clear_cache":
        return handleClearCache(args);

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Unknown error occurred",
      success: false,
    };
  }
}

async function handleGetUserInfo(args: any) {
  const { username_or_id } = GetUserInfoSchema.parse(args);

  const user = await sleeperClient.getUser(username_or_id);
  return {
    user,
    success: true,
    message: `Successfully retrieved user information for ${user.display_name} (@${user.username})`,
  };
}

async function handleGetUserLeagues(args: any) {
  const { user_id, season, sport } = GetUserLeaguesSchema.parse(args);

  const leagues = await sleeperClient.getUserLeagues(user_id, sport, season);
  return {
    leagues,
    count: leagues.length,
    success: true,
    message: `Found ${leagues.length} ${sport.toUpperCase()} leagues for ${season} season`,
  };
}

async function handleGetLeagueInfo(args: any) {
  const { league_id } = GetLeagueInfoSchema.parse(args);

  const league = await sleeperClient.getLeague(league_id);
  return {
    league,
    success: true,
    message: `Retrieved league information for "${league.name}" (${league.total_rosters} teams, ${league.status} status)`,
  };
}

async function handleGetLeagueRosters(args: any) {
  const { league_id, include_player_details } =
    GetLeagueRostersSchema.parse(args);

  if (include_player_details) {
    const rostersWithDetails =
      await sleeperClient.getMultipleRostersWithDetails(league_id);
    return {
      rosters: rostersWithDetails,
      count: rostersWithDetails.length,
      success: true,
      message: `Retrieved ${rostersWithDetails.length} rosters with detailed player information`,
    };
  }

  const rosters = await sleeperClient.getLeagueRosters(league_id);
  return {
    rosters,
    count: rosters.length,
    success: true,
    message: `Retrieved ${rosters.length} rosters`,
  };
}

async function handleGetLeagueUsers(args: any) {
  const { league_id } = GetLeagueUsersSchema.parse(args);

  const users = await sleeperClient.getLeagueUsers(league_id);
  const commissioners = users.filter((user) => user.is_owner);

  return {
    users,
    count: users.length,
    commissioners,
    success: true,
    message: `Retrieved ${users.length} users (${commissioners.length} commissioners)`,
  };
}

async function handleGetCurrentMatchups(args: any) {
  const { league_id, week } = GetCurrentMatchupsSchema.parse(args);

  let currentWeek = week;
  if (!currentWeek) {
    const nflState = await sleeperClient.getNFLState();
    currentWeek = nflState.week;
  }

  const matchups = await sleeperClient.getMatchups(league_id, currentWeek);

  // Group matchups by matchup_id for easier consumption
  const groupedMatchups = matchups.reduce(
    (acc, matchup) => {
      if (!acc[matchup.matchup_id]) {
        acc[matchup.matchup_id] = [];
      }
      acc[matchup.matchup_id].push(matchup);
      return acc;
    },
    {} as Record<number, typeof matchups>,
  );

  const matchupCount = Object.keys(groupedMatchups).length;

  return {
    matchups: groupedMatchups,
    week: currentWeek,
    matchup_count: matchupCount,
    success: true,
    message: `Retrieved ${matchupCount} matchups for week ${currentWeek}`,
  };
}

async function handleGetMatchupDetails(args: any) {
  const { league_id, user_id, week } = GetMatchupDetailsSchema.parse(args);

  let currentWeek = week;
  if (!currentWeek) {
    const nflState = await sleeperClient.getNFLState();
    currentWeek = nflState.week;
  }

  const userMatchup = await sleeperClient.getMatchupForUser(
    league_id,
    currentWeek,
    user_id,
  );
  if (!userMatchup || userMatchup.length !== 2) {
    return {
      error: "No matchup found for this user in the specified week",
      success: false,
    };
  }

  // Get league users for team names
  const users = await sleeperClient.getLeagueUsers(league_id);
  const userMap = new Map(users.map((u) => [u.user_id, u]));

  // Get rosters to map roster_id to user_id
  const rosters = await sleeperClient.getLeagueRosters(league_id);
  const rosterMap = new Map(rosters.map((r) => [r.roster_id, r]));

  const enhancedMatchup = await Promise.all(
    userMatchup.map(async (team) => {
      const roster = rosterMap.get(team.roster_id);
      const user = roster ? userMap.get(roster.owner_id) : null;
      const starters = await sleeperClient.getPlayersWithDetails(team.starters);
      const benchPlayerIds = team.players.filter(
        (id) => !team.starters.includes(id),
      );
      const bench = await sleeperClient.getPlayersWithDetails(benchPlayerIds);

      return {
        roster_id: team.roster_id,
        user: user || {
          user_id: "unknown",
          username: "Unknown",
          display_name: "Unknown User",
          avatar: null,
        },
        points: team.points,
        starters,
        bench,
        total_players: team.players.length,
      };
    }),
  );

  return {
    matchup: enhancedMatchup,
    week: currentWeek,
    success: true,
    message: `Retrieved detailed matchup for week ${currentWeek}`,
  };
}

async function handleGetNFLState() {
  const nflState = await sleeperClient.getNFLState();

  return {
    nfl_state: nflState,
    success: true,
    message: `Current NFL state: Week ${nflState.week} of ${nflState.season_type} season ${nflState.season}`,
  };
}

async function handleSearchPlayers(args: any) {
  const { query, limit } = SearchPlayersSchema.parse(args);

  const players = await sleeperClient.searchPlayers(query, limit);

  return {
    players,
    count: players.length,
    query,
    success: true,
    message: `Found ${players.length} players matching "${query}"`,
  };
}

async function handleGetTrendingPlayers(args: any) {
  const { type, lookback_hours, limit } = GetTrendingPlayersSchema.parse(args);

  const trendingData = await sleeperClient.getTrendingPlayers(
    type,
    lookback_hours,
    limit,
  );

  // Enhance trending data with player details
  const playerIds = trendingData.map((t) => t.player_id);
  const playerDetails = await sleeperClient.getPlayersWithDetails(playerIds);

  const enhancedTrending = trendingData.map((trending) => {
    const player = playerDetails.find(
      (p) => p.player_id === trending.player_id,
    );
    return {
      ...trending,
      player: player || null,
    };
  });

  return {
    trending_players: enhancedTrending,
    type,
    lookback_hours,
    count: enhancedTrending.length,
    success: true,
    message: `Retrieved top ${enhancedTrending.length} trending ${type} players from last ${lookback_hours} hours`,
  };
}

async function handleGetPlayerDetails(args: any) {
  const { player_ids } = GetPlayerDetailsSchema.parse(args);

  const players = await sleeperClient.getPlayersWithDetails(player_ids);

  return {
    players,
    count: players.length,
    requested_count: player_ids.length,
    success: true,
    message: `Retrieved details for ${players.length}/${player_ids.length} requested players`,
  };
}

async function handleResearchPlayerStatus(args: any) {
  const { player_name, team } = ResearchPlayerStatusSchema.parse(args);

  // First, find the player in Sleeper database
  const searchResults = await sleeperClient.searchPlayers(player_name, 5);
  let targetPlayer = searchResults[0];

  if (team && searchResults.length > 1) {
    // Try to find exact team match
    const teamMatch = searchResults.find(
      (p) => p.team?.toUpperCase() === team.toUpperCase(),
    );
    if (teamMatch) {
      targetPlayer = teamMatch;
    }
  }

  if (!targetPlayer) {
    return {
      error: `Player "${player_name}" not found in Sleeper database`,
      success: false,
    };
  }

  // Perform web search for recent news
  const searchQuery = `${targetPlayer.first_name} ${targetPlayer.last_name} ${targetPlayer.team} NFL injury news fantasy football`;
  const webResults = await performWebSearch(searchQuery);

  // Analyze current status
  const analysis = {
    player: targetPlayer,
    current_status: {
      roster_status: targetPlayer.status,
      injury_status: targetPlayer.injury_status || "Healthy",
      team: targetPlayer.team,
      position: targetPlayer.position,
      injury_details: targetPlayer.injury_status
        ? `${targetPlayer.injury_status}${targetPlayer.injury_start_date ? ` (since ${targetPlayer.injury_start_date})` : ""}`
        : "Healthy",
    },
    web_research: webResults,
    fantasy_impact: generateFantasyImpactAnalysis({
      ...targetPlayer,
      full_name: `${targetPlayer.first_name} ${targetPlayer.last_name}`,
      display_position: targetPlayer.position,
    }),
    recommendation: generatePlayerRecommendation({
      ...targetPlayer,
      full_name: `${targetPlayer.first_name} ${targetPlayer.last_name}`,
      display_position: targetPlayer.position,
    }),
  };

  return {
    analysis,
    success: true,
    message: `Researched status for ${targetPlayer.first_name} ${targetPlayer.last_name} (${targetPlayer.team} ${targetPlayer.position})`,
  };
}

async function handleAnalyzeLineup(args: any) {
  const { league_id, user_id, week } = AnalyzeLineupSchema.parse(args);

  let currentWeek = week;
  if (!currentWeek) {
    const nflState = await sleeperClient.getNFLState();
    currentWeek = nflState.week;
  }

  // Get user's roster and matchup
  const roster = await sleeperClient.findUserRosterInLeague(league_id, user_id);
  if (!roster) {
    return {
      error: "User not found in this league",
      success: false,
    };
  }

  const rosterDetails = await sleeperClient.getRosterWithUserDetails(
    roster,
    league_id,
  );
  const questionablePlayers = await sleeperClient.getQuestionablePlayers(
    roster.players,
  );

  // Generate recommendations
  const recommendations = await generateLineupRecommendations(
    rosterDetails,
    currentWeek,
  );

  const analysis = {
    user: rosterDetails.user,
    week: currentWeek,
    lineup: {
      starters: rosterDetails.starters,
      bench: rosterDetails.bench,
      total_projected_points: calculateProjectedPoints(rosterDetails.starters),
    },
    questionable_players: questionablePlayers,
    recommendations: recommendations.changes,
    waiver_suggestions: recommendations.waivers,
    overall_grade: calculateLineupGrade(rosterDetails, questionablePlayers),
  };

  return {
    analysis,
    success: true,
    message: `Analyzed lineup for ${rosterDetails.user.display_name} - Week ${currentWeek}`,
  };
}

async function handleGetWaiverSuggestions(args: any) {
  const { league_id, user_id, position } =
    GetWaiverSuggestionsSchema.parse(args);

  // Get trending players
  const trendingAdds = await sleeperClient.getTrendingPlayers("add", 24, 50);

  // Get user's roster to see current players
  const roster = await sleeperClient.findUserRosterInLeague(league_id, user_id);
  const userPlayerIds = new Set(roster?.players || []);

  // Filter trending players not on user's roster
  const availableTrending = trendingAdds.filter(
    (t) => !userPlayerIds.has(t.player_id),
  );

  // Get player details for trending players
  const playerDetails = await sleeperClient.getPlayersWithDetails(
    availableTrending.slice(0, 20).map((t) => t.player_id),
  );

  // Filter by position if specified
  let filteredPlayers = playerDetails;
  if (position) {
    filteredPlayers = playerDetails.filter((p) =>
      p.fantasy_positions?.includes(position.toUpperCase()),
    );
  }

  const suggestions = filteredPlayers.map((player, index) => {
    const trendingInfo = availableTrending.find(
      (t) => t.player_id === player.player_id,
    );
    return {
      player,
      trending_adds: trendingInfo?.count || 0,
      priority: index < 5 ? "high" : index < 15 ? "medium" : "low",
      reason: generateWaiverReason(player, trendingInfo?.count || 0),
    };
  });

  return {
    suggestions,
    position_filter: position,
    count: suggestions.length,
    success: true,
    message: `Generated ${suggestions.length} waiver suggestions${position ? ` for ${position}` : ""}`,
  };
}

async function handleGetTransactions(args: any) {
  const { league_id, week } = GetTransactionsSchema.parse(args);

  let currentWeek = week;
  if (!currentWeek) {
    const nflState = await sleeperClient.getNFLState();
    currentWeek = nflState.week;
  }

  const transactions = await sleeperClient.getTransactions(
    league_id,
    currentWeek,
  );

  // Enhance transactions with player and user details
  const enhancedTransactions = await Promise.all(
    transactions.map(async (transaction) => {
      const playerIds = [
        ...Object.keys(transaction.adds || {}),
        ...Object.keys(transaction.drops || {}),
      ];

      const playerDetails =
        await sleeperClient.getPlayersWithDetails(playerIds);
      const playerMap = new Map(playerDetails.map((p) => [p.player_id, p]));

      return {
        ...transaction,
        enhanced_adds: transaction.adds
          ? Object.fromEntries(
              Object.entries(transaction.adds).map(([playerId, rosterId]) => [
                playerId,
                { roster_id: rosterId, player: playerMap.get(playerId) },
              ]),
            )
          : null,
        enhanced_drops: transaction.drops
          ? Object.fromEntries(
              Object.entries(transaction.drops).map(([playerId, rosterId]) => [
                playerId,
                { roster_id: rosterId, player: playerMap.get(playerId) },
              ]),
            )
          : null,
        formatted_date: new Date(transaction.created).toLocaleDateString(),
      };
    }),
  );

  return {
    transactions: enhancedTransactions,
    week: currentWeek,
    count: enhancedTransactions.length,
    success: true,
    message: `Retrieved ${enhancedTransactions.length} transactions for week ${currentWeek}`,
  };
}

async function handleComparePlayers(args: any) {
  const { player1_id, player2_id, context } = ComparePlayersSchema.parse(args);

  const [player1, player2] = await sleeperClient.getPlayersWithDetails([
    player1_id,
    player2_id,
  ]);

  if (!player1 || !player2) {
    return {
      error: "One or both players not found",
      success: false,
    };
  }

  const comparison = {
    player1,
    player2,
    comparison: {
      basic_info: compareBasicInfo(player1, player2),
      injury_status: compareInjuryStatus(player1, player2),
      fantasy_relevance: compareFantasyRelevance(player1, player2),
      recommendation: generateComparisonRecommendation(
        player1,
        player2,
        context,
      ),
    },
    context: context || "general comparison",
  };

  return {
    comparison,
    success: true,
    message: `Compared ${player1.full_name} vs ${player2.full_name}`,
  };
}

async function handleGetStartSitAdvice(args: any) {
  const { league_id, user_id, position, week } =
    GetStartSitAdviceSchema.parse(args);

  let currentWeek = week;
  if (!currentWeek) {
    const nflState = await sleeperClient.getNFLState();
    currentWeek = nflState.week;
  }

  const roster = await sleeperClient.findUserRosterInLeague(league_id, user_id);
  if (!roster) {
    return {
      error: "User not found in this league",
      success: false,
    };
  }

  const rosterDetails = await sleeperClient.getRosterWithUserDetails(
    roster,
    league_id,
  );

  // Filter by position if specified
  let playersToAnalyze = rosterDetails.allPlayers;
  if (position) {
    playersToAnalyze = playersToAnalyze.filter((p) =>
      p.fantasy_positions?.includes(position.toUpperCase()),
    );
  }

  const advice = playersToAnalyze.map((player) => ({
    player,
    is_currently_starting: player.is_starter,
    recommendation: generateStartSitRecommendation(player),
    confidence: calculateRecommendationConfidence(player),
    reasoning: generateStartSitReasoning(player),
  }));

  // Sort by confidence and recommendation
  advice.sort((a, b) => {
    if (a.recommendation === "start" && b.recommendation !== "start") return -1;
    if (b.recommendation === "start" && a.recommendation !== "start") return 1;
    return b.confidence - a.confidence;
  });

  return {
    advice,
    user: rosterDetails.user,
    week: currentWeek,
    position_filter: position,
    count: advice.length,
    success: true,
    message: `Generated start/sit advice for ${advice.length} players${position ? ` at ${position}` : ""}`,
  };
}

async function handleClearCache(args: any) {
  const { confirm } = ClearCacheSchema.parse(args);

  if (!confirm) {
    return {
      error:
        "Cache clear requires confirmation. Set 'confirm' to true to proceed.",
      success: false,
      message: "Cache clear operation cancelled - confirmation required",
    };
  }

  try {
    await sleeperClient.clearCache();
    return {
      success: true,
      message:
        "Player data cache cleared successfully. Fresh data will be fetched on next request.",
      action: "cache_cleared",
    };
  } catch (error) {
    return {
      error: `Failed to clear cache: ${error instanceof Error ? error.message : "Unknown error"}`,
      success: false,
    };
  }
}

// Helper functions for analysis and recommendations
function generateFantasyImpactAnalysis(player: PlayerWithDetails): string {
  if (player.injury_status === "Out") {
    return "HIGH NEGATIVE IMPACT - Player is ruled out and should not be started";
  } else if (player.injury_status === "Doubtful") {
    return "HIGH RISK - Player unlikely to play, consider bench/alternative options";
  } else if (player.injury_status === "Questionable") {
    return "MODERATE RISK - Monitor closely, have backup plan ready";
  } else if (player.status !== "Active") {
    return "NOT FANTASY RELEVANT - Player not on active roster";
  }

  return "LOW RISK - Player appears healthy and available";
}

function generatePlayerRecommendation(player: PlayerWithDetails): string {
  if (player.injury_status === "Out") {
    return "DO NOT START - Find immediate replacement";
  } else if (player.injury_status === "Doubtful") {
    return "AVOID - High risk of not playing";
  } else if (player.injury_status === "Questionable") {
    return "CAUTION - Monitor injury reports leading up to game time";
  }

  const tier =
    (player.search_rank || 999) <= 50
      ? "elite"
      : (player.search_rank || 999) <= 150
        ? "solid"
        : "depth";

  return `CONSIDER STARTING - ${tier} option at ${player.position}`;
}

async function generateLineupRecommendations(
  roster: RosterWithDetails,
  week: number,
) {
  const changes = [];
  const waivers: any[] = [];

  // Check for injured starters
  for (const starter of roster.starters) {
    if (
      starter.injury_status === "Out" ||
      starter.injury_status === "Doubtful"
    ) {
      const replacement = roster.bench.find(
        (p) =>
          p.fantasy_positions?.some((pos) =>
            starter.fantasy_positions?.includes(pos),
          ) && p.injury_status !== "Out",
      );

      if (replacement) {
        changes.push({
          player: starter,
          recommendation: `Bench ${starter.full_name}`,
          reason: `Player is ${starter.injury_status} - replace with ${replacement.full_name}`,
        });
      }
    }
  }

  return { changes, waivers };
}

function calculateProjectedPoints(starters: PlayerWithDetails[]): number {
  // Simple projection based on player tier/rank
  return starters.reduce((total, player) => {
    const rank = player.search_rank || 999;
    let points = 8; // base points

    if (rank <= 24)
      points += 6; // elite tier
    else if (rank <= 60)
      points += 4; // strong tier
    else if (rank <= 120) points += 2; // decent tier

    if (player.injury_status === "Questionable") points -= 2;
    else if (player.injury_status === "Doubtful") points -= 5;
    else if (player.injury_status === "Out") points = 0;

    return total + points;
  }, 0);
}

function calculateLineupGrade(
  roster: RosterWithDetails,
  questionablePlayer: PlayerWithDetails[],
): string {
  const totalStarters = roster.starters.length;
  const injuredStarters = roster.starters.filter((p) =>
    ["Out", "Doubtful", "Questionable"].includes(p.injury_status || ""),
  ).length;

  const healthyRatio = (totalStarters - injuredStarters) / totalStarters;

  if (healthyRatio >= 0.9) return "A";
  if (healthyRatio >= 0.8) return "B";
  if (healthyRatio >= 0.7) return "C";
  if (healthyRatio >= 0.6) return "D";
  return "F";
}

function generateWaiverReason(
  player: PlayerWithDetails,
  trendingCount: number,
): string {
  let reason = `${trendingCount} managers added recently`;

  if (player.injury_status && player.injury_status !== "Healthy") {
    reason += ` - Monitor injury status (${player.injury_status})`;
  }

  if (player.team) {
    reason += ` - ${player.team} ${player.position}`;
  }

  return reason;
}

function compareBasicInfo(p1: PlayerWithDetails, p2: PlayerWithDetails) {
  return {
    positions: `${p1.position} vs ${p2.position}`,
    teams: `${p1.team || "FA"} vs ${p2.team || "FA"}`,
    ages:
      p1.age && p2.age
        ? `${p1.age} vs ${p2.age} years old`
        : "Age data unavailable",
    experience:
      p1.years_exp !== undefined && p2.years_exp !== undefined
        ? `${p1.years_exp} vs ${p2.years_exp} years experience`
        : "Experience data unavailable",
  };
}

function compareInjuryStatus(p1: PlayerWithDetails, p2: PlayerWithDetails) {
  const status1 = p1.injury_status || "Healthy";
  const status2 = p2.injury_status || "Healthy";

  return {
    status: `${status1} vs ${status2}`,
    advantage:
      status1 === "Healthy" && status2 !== "Healthy"
        ? p1.full_name
        : status2 === "Healthy" && status1 !== "Healthy"
          ? p2.full_name
          : "Even",
  };
}

function compareFantasyRelevance(p1: PlayerWithDetails, p2: PlayerWithDetails) {
  const rank1 = p1.search_rank || 999;
  const rank2 = p2.search_rank || 999;

  return {
    rankings: `#${rank1} vs #${rank2}`,
    advantage:
      rank1 < rank2 ? p1.full_name : rank2 < rank1 ? p2.full_name : "Even",
  };
}

function generateComparisonRecommendation(
  p1: PlayerWithDetails,
  p2: PlayerWithDetails,
  context?: string,
): string {
  const rank1 = p1.search_rank || 999;
  const rank2 = p2.search_rank || 999;
  const injury1 = p1.injury_status || "Healthy";
  const injury2 = p2.injury_status || "Healthy";

  // Factor in injuries first
  if (injury1 === "Out" && injury2 !== "Out")
    return `Start ${p2.full_name} - ${p1.full_name} is ruled out`;
  if (injury2 === "Out" && injury1 !== "Out")
    return `Start ${p1.full_name} - ${p2.full_name} is ruled out`;

  // Then ranking
  if (Math.abs(rank1 - rank2) > 30) {
    const better = rank1 < rank2 ? p1.full_name : p2.full_name;
    return `Start ${better} - significantly higher ranked player`;
  }

  return `Close decision - both viable options. Consider matchup and recent form.`;
}

function generateStartSitRecommendation(
  player: PlayerWithDetails,
): "start" | "sit" | "flex" {
  const rank = player.search_rank || 999;
  const injury = player.injury_status;

  if (injury === "Out" || injury === "Doubtful") return "sit";
  if (rank <= 60 && injury !== "Questionable") return "start";
  if (rank <= 120) return "flex";
  return "sit";
}

function calculateRecommendationConfidence(player: PlayerWithDetails): number {
  let confidence = 50; // base confidence

  const rank = player.search_rank || 999;
  if (rank <= 24) confidence += 30;
  else if (rank <= 60) confidence += 20;
  else if (rank <= 120) confidence += 10;
  else confidence -= 10;

  const injury = player.injury_status;
  if (injury === "Out")
    confidence = 95; // Very confident to sit
  else if (injury === "Doubtful")
    confidence += 20; // Confident to sit
  else if (injury === "Questionable") confidence -= 15; // Less confident

  return Math.max(0, Math.min(100, confidence));
}

function generateStartSitReasoning(player: PlayerWithDetails): string {
  const reasons = [];

  const rank = player.search_rank || 999;
  if (rank <= 24) reasons.push("Elite player ranking");
  else if (rank <= 60) reasons.push("Solid fantasy option");
  else if (rank > 200) reasons.push("Low fantasy ranking");

  const injury = player.injury_status;
  if (injury === "Out") reasons.push("Ruled out for game");
  else if (injury === "Doubtful") reasons.push("Unlikely to play");
  else if (injury === "Questionable") reasons.push("Game-time decision");
  else reasons.push("No injury concerns");

  if (player.team) reasons.push(`${player.team} ${player.position}`);

  return reasons.join(" • ");
}
