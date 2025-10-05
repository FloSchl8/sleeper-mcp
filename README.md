# Sleeper Fantasy Football MCP Server

[![npm version](https://badge.fury.io/js/sleeper-mcp.svg)](https://badge.fury.io/js/sleeper-mcp)
[![Downloads](https://img.shields.io/npm/dm/sleeper-mcp.svg)](https://npmjs.org/package/sleeper-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/node/v/sleeper-mcp.svg)](https://nodejs.org/en/)

A comprehensive Model Context Protocol (MCP) Server for integrating with Sleeper Fantasy Football. This server enables AI assistants like Claude to perform advanced fantasy football analysis and provide strategic recommendations.

## 📦 Installation

```bash
# Install globally (recommended)
npm install -g sleeper-mcp

# Or use with npx (no installation needed)
npx sleeper-mcp
```

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

Choose one of these installation methods:

#### Option A: Global NPM Install (Recommended)
```bash
npm install -g sleeper-mcp
```

#### Option B: Using npx (No Installation)
```bash
npx sleeper-mcp
```

#### Option C: Local Development
```bash
git clone https://github.com/yourusername/sleeper-mcp.git
cd sleeper-mcp
npm install
npm run build
```

### 2. Claude Desktop Configuration

#### For Global Install or npx:
```json
{
  "mcpServers": {
    "sleeper-mcp": {
      "command": "sleeper-mcp",
      "args": [],
      "env": {}
    }
  }
}
```

#### For npx (alternative):
```json
{
  "mcpServers": {
    "sleeper-mcp": {
      "command": "npx",
      "args": ["sleeper-mcp"],
      "env": {}
    }
  }
}
```

#### For Local Development:
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
npm run test:coverage  # Show detailed code coverage
```

## 🧪 Test Coverage

The server includes comprehensive tests covering:

### ✅ Core Infrastructure (100%)
- **MCP Protocol**: Server initialization and tool registration
- **Error Handling**: Invalid tools and malformed requests
- **JSON-RPC**: Proper request/response formatting

### ✅ API Integration (65%)
- **Basic API**: NFL state, player search, trending players
- **User Management**: Invalid user handling
- **League Data**: Invalid league ID handling
- **Cache System**: Clear cache confirmation logic

### ✅ Edge Cases & Validation (90%)
- **Empty Arrays**: Graceful handling of empty player lists
- **Missing Parameters**: Required field validation
- **Invalid IDs**: Non-existent user/league/player handling
- **Parameter Validation**: Type checking and bounds testing

### 📊 Real Coverage Metrics
```
File Coverage:   55.13% statements | 62.36% branches | 35.52% functions
Test Results:    13/13 passing (100%)
Tool Coverage:   8/19 tools tested (42%)
Edge Cases:      ~90% covered

Handler Functions: 27.35% (core logic)
Tools Registry:    93.06% (tool definitions)  
Sleeper Client:    51.21% (API integration)
Server Core:       100% (MCP protocol)
```

**Commands:**
```bash
npm test              # Run all tests
npm run test:coverage # Show detailed coverage report
npm run coverage      # Alias for test:coverage
```

**Key tested scenarios:**
- Server startup and MCP handshake
- Basic API functionality with real data
- Invalid input handling and error responses
- Cache management and confirmation flows
- Parameter validation and type checking

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

### For Users
```bash
# Install globally
npm install -g sleeper-mcp

# Or use directly
npx sleeper-mcp
```

### For Contributors
```bash
# Clone the repository
git clone https://github.com/yourusername/sleeper-mcp.git
cd sleeper-mcp
npm install

# Development with hot reload
npm run dev

# Build for production
npm run build
npm start

# Watch mode (automatic rebuilding)
npm run watch

# Run tests
npm test
npm run test:coverage
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