# Sleeper MCP Server - Setup Guide

A comprehensive setup guide for the Sleeper Fantasy Football MCP Server.

## Overview

This MCP Server enables AI assistants like Claude to retrieve and analyze fantasy football data from Sleeper. The server provides comprehensive tools for league management, player analysis, and strategic recommendations.

## Prerequisites

- **Node.js**: Version 18 or higher
- **npm**: Comes with Node.js
- **Claude Desktop** or other MCP-compatible client

### Check Node.js Installation

```bash
node --version  # should show v18+
npm --version   # should be available
```

## Installation

### 1. Repository Setup

```bash
# Clone or create the project directory
cd /path/to/your/projects
git clone <repository-url> sleeper-mcp  # or copy the files
cd sleeper-mcp
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Build the Server

```bash
npm run build
```

### 4. Run Tests (Optional)

```bash
npm test
```

## Claude Desktop Configuration

### 1. Find Configuration File

**macOS:**
```bash
~/Library/Application Support/Claude/claude_desktop_config.json
```

**Windows:**
```bash
%APPDATA%\Claude\claude_desktop_config.json
```

**Linux:**
```bash
~/.config/Claude/claude_desktop_config.json
```

### 2. Add MCP Server

Edit `claude_desktop_config.json` and add:

```json
{
  "mcpServers": {
    "sleeper-mcp": {
      "command": "node",
      "args": ["/FULL/PATH/TO/sleeper-mcp/dist/index.js"],
      "env": {}
    }
  }
}
```

**Important:** Replace `/FULL/PATH/TO/sleeper-mcp` with the actual path to your project.

### 3. Determine Correct Path

```bash
# In the sleeper-mcp directory:
pwd
# Output example: /Users/username/projects/sleeper-mcp

# The correct path would then be:
# /Users/username/projects/sleeper-mcp/dist/index.js
```

### Example Configuration (Complete)

```json
{
  "mcpServers": {
    "sleeper-mcp": {
      "command": "node",
      "args": ["/Users/john/projects/sleeper-mcp/dist/index.js"],
      "env": {}
    },
    "other-server": {
      "command": "python",
      "args": ["/path/to/other-server.py"]
    }
  }
}
```

## Getting Started

### 1. Restart Claude Desktop

After configuration, Claude Desktop must be completely closed and reopened.

### 2. Test Connection

Start a new conversation in Claude and test:

```
Can you show me which Sleeper tools are available?
```

Claude should display a list of available tools.

### 3. Perform First API Test

```
Can you get the current NFL status?
```

## Common Usage Scenarios

### League Setup

```
My Sleeper username is "your_username". 
Can you retrieve my leagues for 2024?
```

### Lineup Analysis

```
Analyze my lineup for this week in league [league_id]. 
My user ID is [user_id].
```

### Injury Research

```
Check the status of Christian McCaffrey. 
Is he ready to play this week?
```

### Waiver Wire

```
Show me the best available RBs on the waiver wire 
based on current trends.
```

## Troubleshooting

### Server Won't Start

1. **Check Path:**
   ```bash
   ls -la /path/to/sleeper-mcp/dist/index.js
   ```

2. **Node.js Version:**
   ```bash
   node --version  # must be v18+
   ```

3. **Build Status:**
   ```bash
   cd /path/to/sleeper-mcp
   npm run build
   ```

### Claude Doesn't Recognize Server

1. **Check Configuration:**
   - Is the JSON syntax correct?
   - Is the path absolute and correct?
   - Was Claude Desktop restarted?

2. **Check Logs:**
   ```bash
   # Test server manually:
   cd /path/to/sleeper-mcp
   node dist/index.js
   ```

### API Errors

1. **Rate Limiting:**
   - Sleeper allows max 1000 requests/minute
   - Wait briefly on 429 errors

2. **Network Issues:**
   - Check internet connection
   - Verify firewall/proxy settings

3. **Invalid IDs:**
   - User IDs and league IDs must be correct
   - Usernames can change, IDs remain constant

### Performance Issues

1. **Player Cache:**
   - Player data is cached for 24h
   - First queries may take longer

2. **Parallel Requests:**
   - Server limits concurrent API calls
   - Be patient with multiple queries

## Maintenance

### Install Updates

```bash
cd /path/to/sleeper-mcp
git pull  # if using git repository
npm install  # new dependencies
npm run build  # rebuild
```

### Check Logs

Find Claude Desktop logs:
- **macOS:** `~/Library/Logs/Claude/`
- **Windows:** `%USERPROFILE%\AppData\Local\Claude\logs\`

### Clear Cache

```bash
# Player cache automatically refreshes after 24h
# Manual reset by restarting server
```

## Advanced Configuration

### Environment Variables (Optional)

```json
{
  "mcpServers": {
    "sleeper-mcp": {
      "command": "node",
      "args": ["/path/to/sleeper-mcp/dist/index.js"],
      "env": {
        "DEBUG": "true",
        "CACHE_DURATION": "86400"
      }
    }
  }
}
```

### Multiple Instances

```json
{
  "mcpServers": {
    "sleeper-mcp-main": {
      "command": "node",
      "args": ["/path/to/sleeper-mcp/dist/index.js"]
    },
    "sleeper-mcp-backup": {
      "command": "node", 
      "args": ["/path/to/sleeper-mcp-backup/dist/index.js"]
    }
  }
}
```

## Security

### Privacy

- Server makes only READ-only API calls
- No personal data is stored
- All data comes directly from Sleeper's public API

### API Limits

- Respects Sleeper's rate limits
- Automatic error handling on limit exceeded
- No API keys required

## Support & Development

### Reporting Issues

When reporting problems, please gather:

1. **System Info:**
   - Operating system
   - Node.js version
   - Claude Desktop version

2. **Error Details:**
   - Exact error message
   - Steps to reproduce
   - Relevant logs

3. **Configuration:**
   - `claude_desktop_config.json` (without sensitive data)
   - Used tool names and parameters

### Feature Requests

The server can be extended with:
- Additional Sleeper API endpoints
- Enhanced analysis and recommendations
- Integration with other fantasy platforms
- Historical data analysis

### Development

```bash
# Development Mode
npm run dev

# Watch Mode (automatic rebuilding)
npm run watch

# Code Style Check
npm run lint  # if configured
```

## Conclusion

With this setup, you have a fully functional Sleeper MCP Server that enables Claude to perform comprehensive fantasy football analysis. The server provides over 15 different tools for everything from league management to strategic recommendations.

**Good luck dominating your fantasy league! 🏆**