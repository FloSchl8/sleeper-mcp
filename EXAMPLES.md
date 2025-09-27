# Sleeper MCP Server - Usage Examples

This document provides comprehensive examples of how to use the Sleeper MCP Server with AI assistants.

## Setup Examples

### 1. Finding Your User Information

```
AI: Use get_user_info with "your_sleeper_username" to get your user details
```

**Response:**
```json
{
  "user": {
    "user_id": "123456789012345678",
    "username": "your_username",
    "display_name": "Your Display Name",
    "avatar": "abc123def456"
  },
  "success": true,
  "message": "Successfully retrieved user information for Your Display Name (@your_username)"
}
```

### 2. Getting Your Leagues

```
AI: Use get_user_leagues with user_id "123456789012345678" for season "2024"
```

**Response:**
```json
{
  "leagues": [
    {
      "league_id": "987654321098765432",
      "name": "Friends & Family League",
      "season": "2024",
      "sport": "nfl",
      "status": "in_season",
      "total_rosters": 12,
      "scoring_settings": {
        "pass_td": 4,
        "pass_yd": 0.04,
        "rush_yd": 0.1,
        "rec": 1,
        "rec_yd": 0.1
      }
    }
  ],
  "count": 1,
  "success": true
}
```

## League Analysis Examples

### 3. Current Week Matchups

```
AI: Use get_current_matchups with league_id "987654321098765432"
```

**Response:** Shows all matchups for the current week with team lineups and scores.

### 4. Your Specific Matchup

```
AI: Use get_matchup_details with league_id "987654321098765432" and user_id "123456789012345678"
```

**Response:**
```json
{
  "matchup": [
    {
      "roster_id": 1,
      "user": {
        "display_name": "Your Team",
        "metadata": { "team_name": "Fantasy Champions" }
      },
      "points": 127.5,
      "starters": [
        {
          "full_name": "Josh Allen",
          "position": "QB",
          "team": "BUF",
          "injury_status": null
        }
      ],
      "bench": [...]
    },
    {
      "roster_id": 5,
      "user": {
        "display_name": "Opponent Team",
        "metadata": { "team_name": "The Underdogs" }
      },
      "points": 112.3,
      "starters": [...],
      "bench": [...]
    }
  ],
  "week": 8,
  "success": true
}
```

## Player Research Examples

### 5. Search for Players

```
AI: Use search_players with query "Josh Allen" and limit 3
```

**Response:**
```json
{
  "players": [
    {
      "player_id": "4881",
      "full_name": "Josh Allen",
      "position": "QB",
      "team": "BUF",
      "injury_status": null,
      "fantasy_positions": ["QB"],
      "search_rank": 12
    },
    {
      "player_id": "6797",
      "full_name": "Josh Allen",
      "position": "LB",
      "team": "JAX",
      "fantasy_positions": ["LB"]
    }
  ],
  "count": 2,
  "success": true
}
```

### 6. Research Player Status

```
AI: Use research_player_status with player_name "Christian McCaffrey" and team "SF"
```

**Response:**
```json
{
  "analysis": {
    "player": {
      "full_name": "Christian McCaffrey",
      "position": "RB",
      "team": "SF",
      "injury_status": "Questionable"
    },
    "current_status": {
      "roster_status": "Active",
      "injury_status": "Questionable",
      "injury_details": "Questionable (since 2024-10-15)"
    },
    "web_research": [
      "Search result for 'Christian McCaffrey SF NFL injury news': Recent reports suggest limited practice participation",
      "Expert analysis: Monitor pregame warmups for final decision"
    ],
    "fantasy_impact": "MODERATE RISK - Monitor closely, have backup plan ready",
    "recommendation": "CAUTION - Monitor injury reports leading up to game time"
  },
  "success": true
}
```

### 7. Trending Players

```
AI: Use get_trending_players with type "add" and limit 10
```

**Response:**
```json
{
  "trending_players": [
    {
      "player_id": "8885",
      "count": 15420,
      "player": {
        "full_name": "Jordan Mason",
        "position": "RB",
        "team": "SF",
        "injury_status": null
      }
    }
  ],
  "type": "add",
  "count": 10,
  "success": true
}
```

## Advanced Analysis Examples

### 8. Lineup Analysis

```
AI: Use analyze_lineup with league_id "987654321098765432" and user_id "123456789012345678"
```

**Response:**
```json
{
  "analysis": {
    "user": {
      "display_name": "Your Team",
      "metadata": { "team_name": "Fantasy Champions" }
    },
    "week": 8,
    "lineup": {
      "starters": [
        {
          "full_name": "Josh Allen",
          "position": "QB",
          "team": "BUF",
          "injury_status": null,
          "is_starter": true
        }
      ],
      "bench": [...],
      "total_projected_points": 142.5
    },
    "questionable_players": [
      {
        "full_name": "Christian McCaffrey",
        "position": "RB",
        "team": "SF",
        "injury_status": "Questionable"
      }
    ],
    "recommendations": [
      {
        "player": {
          "full_name": "Christian McCaffrey",
          "position": "RB"
        },
        "recommendation": "Monitor closely",
        "reason": "Player is Questionable - have backup ready"
      }
    ],
    "overall_grade": "B"
  },
  "success": true
}
```

### 9. Waiver Wire Suggestions

```
AI: Use get_waiver_suggestions with league_id "987654321098765432", user_id "123456789012345678", and position "RB"
```

**Response:**
```json
{
  "suggestions": [
    {
      "player": {
        "full_name": "Kareem Hunt",
        "position": "RB",
        "team": "KC"
      },
      "trending_adds": 8540,
      "priority": "high",
      "reason": "8540 managers added recently - KC RB"
    }
  ],
  "position_filter": "RB",
  "count": 5,
  "success": true
}
```

### 10. Player Comparison

```
AI: Use compare_players with player1_id "4881" and player2_id "6794" and context "this week matchup"
```

**Response:**
```json
{
  "comparison": {
    "player1": {
      "full_name": "Josh Allen",
      "position": "QB",
      "team": "BUF"
    },
    "player2": {
      "full_name": "Lamar Jackson",
      "position": "QB",
      "team": "BAL"
    },
    "comparison": {
      "basic_info": {
        "positions": "QB vs QB",
        "teams": "BUF vs BAL",
        "ages": "28 vs 27 years old"
      },
      "injury_status": {
        "status": "Healthy vs Healthy",
        "advantage": "Even"
      },
      "fantasy_relevance": {
        "rankings": "#12 vs #8",
        "advantage": "Lamar Jackson"
      },
      "recommendation": "Start Lamar Jackson - slightly higher ranked player"
    },
    "context": "this week matchup"
  },
  "success": true
}
```

## Conversation Examples

### Fantasy Football Analysis Session

**User:** "Analyze my lineup for this week and tell me if I should make any changes"

**AI Response:**
1. First, I'll get your user info to find your leagues
2. Then analyze your current lineup
3. Check for any injured or questionable players
4. Look at trending players for potential pickups
5. Give you specific recommendations

**User:** "My username is 'fantasyguru2024'"

**AI uses tools:**
- `get_user_info` → Gets user_id
- `get_user_leagues` → Shows available leagues
- `analyze_lineup` → Reviews current starters/bench
- `research_player_status` → Checks injury status for questionable players
- `get_waiver_suggestions` → Finds potential replacements

**AI Response:**
"Based on your lineup analysis for Week 8:

✅ **Strong Starters:** Josh Allen (QB) and Tyreek Hill (WR) are must-starts
⚠️ **Monitor Closely:** Christian McCaffrey is Questionable - have Jordan Mason ready as backup
🔄 **Consider Changes:** Your FLEX spot could be upgraded

**Waiver Wire Recommendations:**
1. Jordan Mason (RB) - High priority handcuff for CMC
2. Romeo Doubs (WR) - Trending up with 5,240 recent adds

**Overall Grade: B+** - Solid lineup with minor adjustments needed"

### Weekly Matchup Preview

**User:** "Who am I playing against this week and how do our teams compare?"

**AI uses tools:**
- `get_matchup_details` → Gets opponent info
- `compare_players` → Compares key players
- `get_nfl_state` → Confirms current week

**AI Response:**
"You're facing **The Underdogs** this week (Week 8).

**Your Team (127.5 proj points):**
- QB: Josh Allen vs weak NYJ defense ✅
- RB: CMC (questionable) + Saquon Barkley
- WR: Tyreek Hill + CeeDee Lamb

**Their Team (112.3 proj points):**
- QB: Joe Burrow (tough matchup vs SF)
- RB: Josh Jacobs + Tony Pollard
- WR: Davante Adams + Mike Evans

**Key Matchups:**
- Your Josh Allen vs their Joe Burrow: Advantage YOU (better matchup)
- Their Mike Evans vs your CMC: Monitor CMC's status

**Prediction:** You're favored by 15.2 points, but watch CMC's injury status closely."

### Injury Research Deep Dive

**User:** "Christian McCaffrey is questionable again. Should I start him or play it safe?"

**AI uses tools:**
- `research_player_status` → Web search for latest news
- `get_player_details` → Current roster status
- `get_waiver_suggestions` → Backup options

**AI Response:**
"Here's the latest on Christian McCaffrey:

**Current Status:** Questionable with calf injury (limited practice Wednesday)

**Latest Reports:**
- ESPN: 'CMC participated in light drills but sat out contact portions'
- SF Chronicle: 'Coach Kyle Shanahan optimistic but will be game-time decision'
- Fantasy experts: 'Have Jordan Mason ready as pivot option'

**My Recommendation:**
🟡 **CAUTIOUS START** - Keep CMC in lineup BUT:
- Set Jordan Mason as your backup plan
- Monitor Friday injury report
- Check inactives list 90 minutes before kickoff

**Risk Assessment:** 70% chance he plays, but could be limited if he does play"

## Error Handling Examples

### Invalid League ID

```json
{
  "error": "Resource not found: /league/invalid_id",
  "success": false,
  "tool": "get_league_info"
}
```

### Rate Limit Hit

```json
{
  "error": "Rate limit exceeded - please wait before making more requests",
  "success": false,
  "tool": "get_trending_players"
}
```

### Player Not Found

```json
{
  "error": "Player \"NonExistent Player\" not found in Sleeper database",
  "success": false,
  "tool": "research_player_status"
}
```

## Tips for Effective Usage

1. **Start with User Setup:**
   - Always begin by getting user info and leagues
   - Keep user_id and league_id handy for subsequent calls

2. **Current Week Context:**
   - Most tools automatically use current week if not specified
   - Use `get_nfl_state` to confirm current NFL week

3. **Injury Monitoring:**
   - Use `research_player_status` for latest injury news
   - Check `analyze_lineup` for all questionable players at once

4. **Waiver Planning:**
   - Combine `get_trending_players` with `get_waiver_suggestions`
   - Filter by position for targeted recommendations

5. **Matchup Strategy:**
   - Use `get_matchup_details` for head-to-head analysis
   - Compare key players with `compare_players`

6. **Regular Maintenance:**
   - Run weekly lineup analysis
   - Monitor transactions to see league activity
   - Check trending players for emerging opportunities

## Advanced Workflows

### Weekly Preparation Workflow

1. `get_nfl_state` - Confirm current week
2. `analyze_lineup` - Review your team
3. `get_matchup_details` - Study opponent
4. `research_player_status` - Check questionable players
5. `get_waiver_suggestions` - Find improvements
6. `get_transactions` - See league activity

### Trade Analysis Workflow

1. `compare_players` - Evaluate trade targets
2. `get_league_rosters` - See all team needs
3. `research_player_status` - Check injury concerns
4. `analyze_lineup` - Model trade impact

### Waiver Wire Workflow

1. `get_trending_players` - See hot pickups
2. `get_waiver_suggestions` - Personalized recommendations
3. `research_player_status` - Validate opportunities
4. `get_league_rosters` - Check availability