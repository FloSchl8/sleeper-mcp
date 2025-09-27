# Sleeper Fantasy Football MCP Server

A comprehensive Model Context Protocol (MCP) Server for integrating with Sleeper Fantasy Football. This server enables AI assistants like Claude to perform advanced fantasy football analysis and provide strategic recommendations.

## 🎯 What Can This Server Do?

### 📊 League Management
- **User Information**: Sleeper profiles and league memberships
- **League Details**: Scoring settings, roster positions, team overviews
- **Current Matchups**: Who's playing whom, scores, lineups

### 🏈 Player Analysis
- **Player Search**: Find any NFL player in the Sleeper database
- **Trending Players**: Hottest waiver wire pickups
- **Injury Status**: Current injury reports with web research
- **Player Comparisons**: Head-to-head analysis for trade decisions

### 🧠 AI-Powered Recommendations
- **Lineup Analysis**: Automatic start/sit recommendations
- **Waiver Wire Tips**: Personalized pickup suggestions
- **Matchup Strategies**: Opponent analysis and winning strategies
- **Transaction Tracking**: Follow league activity and trends

## 🚀 Quick Start

### 1. Installation
```bash
npm install
npm run build
```

### 2. Claude Desktop Configuration
Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "sleeper-mcp": {
      "command": "node",
      "args": ["/full/path/to/sleeper-mcp/dist/index.js"],
      "env": {}
    }
  }
}
```

### 3. Test
```bash
npm test
```

## 🎮 Get Started Immediately

Start a conversation with Claude and try:

```
"Show me my current lineup against my opponent this week"
"Which players are questionable this week and should I replace them?"
"Give me waiver wire recommendations based on trends"
```

## 🛠️ Available Tools

### League Management
- `get_user_info` - Retrieve user information
- `get_user_leagues` - Get all leagues for a user
- `get_league_info` - Details of a specific league
- `get_league_rosters` - All team rosters in a league
- `get_league_users` - All users/managers in a league

### Matchup Analysis
- `get_current_matchups` - Current week matchups
- `get_matchup_details` - Detailed matchup information
- `get_nfl_state` - Current NFL status (week, season)

### Player Tools
- `search_players` - Search players in the database
- `get_trending_players` - Trending add/drop players
- `get_player_details` - Detailed player information
- `compare_players` - Head-to-head player comparisons

### Analysis & Recommendations
- `analyze_lineup` - AI-powered lineup analysis
- `research_player_status` - Web research on player status
- `get_waiver_suggestions` - Waiver wire recommendations
- `get_start_sit_advice` - Specific start/sit advice
- `get_transactions` - Recent league transactions

## 📋 Example Workflows

### Weekly Preparation
1. **Find Your User Info**: `get_user_info` with your Sleeper username
2. **Get Your Leagues**: `get_user_leagues` with your user ID
3. **Analyze Current Matchup**: `get_matchup_details` for your league
4. **Check Injured Players**: `research_player_status` for questionable players
5. **Find Waiver Pickups**: `get_waiver_suggestions` for improvements

### Trade Analysis
1. **Compare Players**: `compare_players` for trade targets
2. **Research Status**: `research_player_status` for injury concerns
3. **Analyze Impact**: `analyze_lineup` to model trade effects

## 🏆 Key Features

- **No API Keys Required** - Uses Sleeper's public API
- **Intelligent Caching** - Player data cached for 24 hours
- **Rate Limit Respecting** - Handles Sleeper's 1000 calls/minute limit
- **Comprehensive Error Handling** - Robust error recovery
- **Web Research Integration** - Automatic injury report research
- **Personalized Recommendations** - All advice tailored to your specific league

## 📖 Documentation

- **SETUP.md** - Detailed installation and configuration guide
- **EXAMPLES.md** - Comprehensive usage examples and scenarios
- **Inline Documentation** - Fully commented codebase

## ⚡ Technical Details

- **TypeScript** for type safety
- **Zod** for input validation
- **MCP SDK** for Claude integration
- **Read-only API** - Cannot modify lineups (Sleeper limitation)
- **Real-time Data** - Always current information

## 🔧 Development

```bash
# Development with hot reload
npm run dev

# Build for production
npm run build
npm start

# Watch mode (automatic rebuilding)
npm run watch
```

## ⚠️ Limitations

- Sleeper API is read-only (no lineup modifications possible)
- Rate limit: Maximum 1000 API calls per minute
- Player data automatically cached (24h refresh)

## 📄 License

MIT License

## 🤝 Contributing

This server can be extended with:
- Additional Sleeper API endpoints
- Enhanced analysis and recommendations
- Integration with other fantasy platforms
- Historical data analysis

---

**Dominate your fantasy league with AI-powered analysis! 🏆**