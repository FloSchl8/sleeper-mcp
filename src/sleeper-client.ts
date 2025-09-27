import { z } from "zod";
import { promises as fs } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import type {
  SleeperUser,
  SleeperLeague,
  SleeperRoster,
  SleeperLeagueUser,
  SleeperMatchup,
  SleeperPlayer,
  SleeperNFLState,
  SleeperTrendingPlayer,
  SleeperTransaction,
  SleeperDraft,
  PlayerWithDetails,
  RosterWithDetails,
} from "./types.js";

const BASE_URL = "https://api.sleeper.app/v1";

// Get the directory where this module is located
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const CACHE_DIR = join(__dirname, "..", ".cache");
const PLAYERS_CACHE_FILE = join(CACHE_DIR, "players.json");
const CACHE_META_FILE = join(CACHE_DIR, "cache-meta.json");

export class SleeperClient {
  private players: Map<string, SleeperPlayer> = new Map();
  private playersLastUpdated: number = 0;
  private readonly PLAYERS_CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
  private cacheInitialized: boolean = false;

  private async fetch<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${BASE_URL}${endpoint}`);

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(`Resource not found: ${endpoint}`);
      }
      if (response.status === 429) {
        throw new Error(
          "Rate limit exceeded. Please wait before making more requests.",
        );
      }
      throw new Error(
        `Sleeper API error: ${response.status} ${response.statusText}`,
      );
    }

    return response.json();
  }

  // User methods
  async getUser(usernameOrId: string): Promise<SleeperUser> {
    return this.fetch<SleeperUser>(`/user/${usernameOrId}`);
  }

  async getUserLeagues(
    userId: string,
    sport: string = "nfl",
    season: string = "2024",
  ): Promise<SleeperLeague[]> {
    return this.fetch<SleeperLeague[]>(
      `/user/${userId}/leagues/${sport}/${season}`,
    );
  }

  async getUserDrafts(
    userId: string,
    sport: string = "nfl",
    season: string = "2024",
  ): Promise<SleeperDraft[]> {
    return this.fetch<SleeperDraft[]>(
      `/user/${userId}/drafts/${sport}/${season}`,
    );
  }

  // League methods
  async getLeague(leagueId: string): Promise<SleeperLeague> {
    return this.fetch<SleeperLeague>(`/league/${leagueId}`);
  }

  async getLeagueRosters(leagueId: string): Promise<SleeperRoster[]> {
    return this.fetch<SleeperRoster[]>(`/league/${leagueId}/rosters`);
  }

  async getLeagueUsers(leagueId: string): Promise<SleeperLeagueUser[]> {
    return this.fetch<SleeperLeagueUser[]>(`/league/${leagueId}/users`);
  }

  async getMatchups(leagueId: string, week: number): Promise<SleeperMatchup[]> {
    return this.fetch<SleeperMatchup[]>(`/league/${leagueId}/matchups/${week}`);
  }

  async getTransactions(
    leagueId: string,
    round: number,
  ): Promise<SleeperTransaction[]> {
    return this.fetch<SleeperTransaction[]>(
      `/league/${leagueId}/transactions/${round}`,
    );
  }

  async getTradedPicks(leagueId: string): Promise<any[]> {
    return this.fetch<any[]>(`/league/${leagueId}/traded_picks`);
  }

  async getWinnersBracket(leagueId: string): Promise<any[]> {
    return this.fetch<any[]>(`/league/${leagueId}/winners_bracket`);
  }

  async getLosersBracket(leagueId: string): Promise<any[]> {
    return this.fetch<any[]>(`/league/${leagueId}/losers_bracket`);
  }

  // Draft methods
  async getLeagueDrafts(leagueId: string): Promise<SleeperDraft[]> {
    return this.fetch<SleeperDraft[]>(`/league/${leagueId}/drafts`);
  }

  async getDraft(draftId: string): Promise<SleeperDraft> {
    return this.fetch<SleeperDraft>(`/draft/${draftId}`);
  }

  async getDraftPicks(draftId: string): Promise<any[]> {
    return this.fetch<any[]>(`/draft/${draftId}/picks`);
  }

  async getDraftTradedPicks(draftId: string): Promise<any[]> {
    return this.fetch<any[]>(`/draft/${draftId}/traded_picks`);
  }

  // NFL State
  async getNFLState(): Promise<SleeperNFLState> {
    return this.fetch<SleeperNFLState>("/state/nfl");
  }

  // Players
  async getAllPlayers(
    sport: string = "nfl",
    forceRefresh: boolean = false,
  ): Promise<Map<string, SleeperPlayer>> {
    const now = Date.now();

    // Initialize cache from file if not done yet
    if (!this.cacheInitialized) {
      await this.loadPlayersFromCache();
      this.cacheInitialized = true;
    }

    // Check if we have valid cached data
    if (
      !forceRefresh &&
      this.players.size > 0 &&
      now - this.playersLastUpdated < this.PLAYERS_CACHE_DURATION
    ) {
      console.log(
        `Using cached player data (${this.players.size} players, age: ${Math.round((now - this.playersLastUpdated) / (60 * 60 * 1000))}h)`,
      );
      return this.players;
    }

    console.log(
      "Fetching all players from Sleeper API (this may take a moment)...",
    );
    const playersData = await this.fetch<Record<string, SleeperPlayer>>(
      `/players/${sport}`,
    );

    this.players.clear();
    Object.entries(playersData).forEach(([id, player]) => {
      this.players.set(id, { ...player, player_id: id });
    });

    this.playersLastUpdated = now;
    console.log(`Loaded ${this.players.size} players into memory cache`);

    // Save to persistent cache
    await this.savePlayersToCache();

    return this.players;
  }

  async getPlayer(playerId: string): Promise<SleeperPlayer | null> {
    await this.getAllPlayers(); // Ensure players are loaded
    return this.players.get(playerId) || null;
  }

  // Cache persistence methods
  private async ensureCacheDir(): Promise<void> {
    try {
      await fs.access(CACHE_DIR);
    } catch {
      await fs.mkdir(CACHE_DIR, { recursive: true });
    }
  }

  private async savePlayersToCache(): Promise<void> {
    try {
      await this.ensureCacheDir();

      // Convert Map to Object for JSON serialization
      const playersObject = Object.fromEntries(this.players.entries());

      // Save player data
      await fs.writeFile(
        PLAYERS_CACHE_FILE,
        JSON.stringify(playersObject, null, 2),
      );

      // Save cache metadata
      const cacheData = {
        lastUpdated: this.playersLastUpdated,
        playerCount: this.players.size,
        version: "1.0.0",
      };
      await fs.writeFile(CACHE_META_FILE, JSON.stringify(cacheData, null, 2));

      console.log(`Saved ${this.players.size} players to persistent cache`);
    } catch (error) {
      console.warn(
        "Failed to save players cache:",
        error instanceof Error ? error.message : "Unknown error",
      );
    }
  }

  private async loadPlayersFromCache(): Promise<void> {
    try {
      // Check if cache files exist
      await fs.access(PLAYERS_CACHE_FILE);
      await fs.access(CACHE_META_FILE);

      // Load cache metadata
      const metaData = JSON.parse(await fs.readFile(CACHE_META_FILE, "utf-8"));
      const now = Date.now();

      // Check if cache is still valid
      if (now - metaData.lastUpdated >= this.PLAYERS_CACHE_DURATION) {
        console.log("Persistent cache expired, will fetch fresh data");
        return;
      }

      // Load player data
      const playersData = JSON.parse(
        await fs.readFile(PLAYERS_CACHE_FILE, "utf-8"),
      );

      // Convert back to Map
      this.players.clear();
      Object.entries(playersData).forEach(([id, player]) => {
        this.players.set(id, player as SleeperPlayer);
      });

      this.playersLastUpdated = metaData.lastUpdated;

      const cacheAgeHours = Math.round(
        (now - this.playersLastUpdated) / (60 * 60 * 1000),
      );
      console.log(
        `Loaded ${this.players.size} players from persistent cache (age: ${cacheAgeHours}h)`,
      );
    } catch (error) {
      // Cache doesn't exist or is corrupted, will fetch fresh data
      console.log(
        "No valid persistent cache found, will fetch fresh player data",
      );
      this.players.clear();
      this.playersLastUpdated = 0;
    }
  }

  // Method to manually clear cache (useful for debugging)
  async clearCache(): Promise<void> {
    try {
      await fs.unlink(PLAYERS_CACHE_FILE);
      await fs.unlink(CACHE_META_FILE);
      this.players.clear();
      this.playersLastUpdated = 0;
      this.cacheInitialized = false;
      console.log("Cache cleared successfully");
    } catch (error) {
      console.log("Cache files not found or already cleared");
    }
  }

  async searchPlayers(
    query: string,
    limit: number = 10,
  ): Promise<SleeperPlayer[]> {
    await this.getAllPlayers();

    const searchTerm = query.toLowerCase();
    const results: SleeperPlayer[] = [];

    for (const player of this.players.values()) {
      if (results.length >= limit) break;

      if (
        player.search_full_name?.toLowerCase().includes(searchTerm) ||
        player.first_name?.toLowerCase().includes(searchTerm) ||
        player.last_name?.toLowerCase().includes(searchTerm) ||
        `${player.first_name} ${player.last_name}`
          .toLowerCase()
          .includes(searchTerm)
      ) {
        results.push(player);
      }
    }

    // Sort by search rank if available, then by position priority
    return results.sort((a, b) => {
      const rankA = a.search_rank || 9999;
      const rankB = b.search_rank || 9999;
      if (rankA !== rankB) return rankA - rankB;

      // Secondary sort by position priority (skill positions first)
      const positionPriority = { QB: 1, RB: 2, WR: 3, TE: 4, K: 5, DEF: 6 };
      const priorityA =
        positionPriority[a.position as keyof typeof positionPriority] || 7;
      const priorityB =
        positionPriority[b.position as keyof typeof positionPriority] || 7;
      return priorityA - priorityB;
    });
  }

  async getTrendingPlayers(
    type: "add" | "drop" = "add",
    lookbackHours: number = 24,
    limit: number = 25,
  ): Promise<SleeperTrendingPlayer[]> {
    const params = new URLSearchParams({
      lookback_hours: lookbackHours.toString(),
      limit: limit.toString(),
    });

    return this.fetch<SleeperTrendingPlayer[]>(
      `/players/nfl/trending/${type}?${params}`,
    );
  }

  // Helper methods
  async findUserRosterInLeague(
    leagueId: string,
    userId: string,
  ): Promise<SleeperRoster | null> {
    const rosters = await this.getLeagueRosters(leagueId);
    return rosters.find((roster) => roster.owner_id === userId) || null;
  }

  async getMatchupForUser(
    leagueId: string,
    week: number,
    userId: string,
  ): Promise<SleeperMatchup[] | null> {
    const roster = await this.findUserRosterInLeague(leagueId, userId);
    if (!roster) return null;

    const matchups = await this.getMatchups(leagueId, week);
    const userMatchup = matchups.find((m) => m.roster_id === roster.roster_id);

    if (!userMatchup) return null;

    // Return both teams in the matchup
    return matchups.filter((m) => m.matchup_id === userMatchup.matchup_id);
  }

  // Enhanced methods with player details
  async getPlayersWithDetails(
    playerIds: string[],
  ): Promise<PlayerWithDetails[]> {
    await this.getAllPlayers();

    return playerIds
      .map((id) => {
        const player = this.players.get(id);
        if (!player) return null;

        return this.enhancePlayerWithDetails(player);
      })
      .filter((player): player is PlayerWithDetails => player !== null);
  }

  private enhancePlayerWithDetails(player: SleeperPlayer): PlayerWithDetails {
    const full_name =
      `${player.first_name || ""} ${player.last_name || ""}`.trim();
    const display_position = player.position || "UNK";

    let injury_display: string | undefined;
    if (player.injury_status) {
      injury_display = player.injury_status;
      if (player.injury_start_date) {
        injury_display += ` (since ${player.injury_start_date})`;
      }
    }

    return {
      ...player,
      full_name,
      display_position,
      injury_display,
    };
  }

  async getRosterWithPlayerDetails(
    roster: SleeperRoster,
  ): Promise<RosterWithDetails> {
    const allPlayers = await this.getPlayersWithDetails(roster.players || []);
    const starters = await this.getPlayersWithDetails(roster.starters || []);

    // Mark starters
    const starterIds = new Set(roster.starters || []);
    allPlayers.forEach((player) => {
      player.is_starter = starterIds.has(player.player_id);
    });

    // Bench players are those in players array but not in starters
    const benchPlayers = allPlayers.filter((player) => !player.is_starter);

    // We need the user info - this will need to be fetched separately
    // For now, we'll create a placeholder
    const placeholderUser: SleeperLeagueUser = {
      user_id: roster.owner_id,
      username: "Unknown",
      display_name: "Unknown User",
      avatar: null,
    };

    return {
      roster,
      user: placeholderUser, // This should be populated by the caller
      starters: starters.map((p) => ({ ...p, is_starter: true })),
      bench: benchPlayers,
      allPlayers,
    };
  }

  async getRosterWithUserDetails(
    roster: SleeperRoster,
    leagueId: string,
  ): Promise<RosterWithDetails> {
    const rosterDetails = await this.getRosterWithPlayerDetails(roster);

    // Get league users to find the correct user
    const users = await this.getLeagueUsers(leagueId);
    const user = users.find((u) => u.user_id === roster.owner_id);

    if (user) {
      rosterDetails.user = user;
    }

    return rosterDetails;
  }

  // Utility methods
  async getCurrentWeek(): Promise<number> {
    const nflState = await this.getNFLState();
    return nflState.week;
  }

  async getCurrentSeason(): Promise<string> {
    const nflState = await this.getNFLState();
    return nflState.season;
  }

  async isSeasonActive(): Promise<boolean> {
    const nflState = await this.getNFLState();
    return (
      nflState.season_type === "regular" || nflState.season_type === "post"
    );
  }

  // Batch operations for efficiency
  async getMultipleRostersWithDetails(
    leagueId: string,
  ): Promise<RosterWithDetails[]> {
    const [rosters, users] = await Promise.all([
      this.getLeagueRosters(leagueId),
      this.getLeagueUsers(leagueId),
    ]);

    const userMap = new Map(users.map((user) => [user.user_id, user]));

    const rostersWithDetails = await Promise.all(
      rosters.map(async (roster) => {
        const details = await this.getRosterWithPlayerDetails(roster);
        const user = userMap.get(roster.owner_id);
        if (user) {
          details.user = user;
        }
        return details;
      }),
    );

    return rostersWithDetails;
  }

  // Player analysis helpers
  async getQuestionablePlayers(
    playerIds: string[],
  ): Promise<PlayerWithDetails[]> {
    const players = await this.getPlayersWithDetails(playerIds);

    return players.filter(
      (player) =>
        player.injury_status &&
        ["Questionable", "Doubtful", "Out"].includes(player.injury_status),
    );
  }

  async getActiveStartablePlayers(
    position?: string,
  ): Promise<PlayerWithDetails[]> {
    await this.getAllPlayers();

    const results: PlayerWithDetails[] = [];

    for (const player of this.players.values()) {
      if (player.status !== "Active") continue;
      if (position && !player.fantasy_positions?.includes(position)) continue;
      if (player.injury_status === "Out") continue;

      results.push(this.enhancePlayerWithDetails(player));
    }

    return results.sort(
      (a, b) => (a.search_rank || 9999) - (b.search_rank || 9999),
    );
  }
}

export const sleeperClient = new SleeperClient();
