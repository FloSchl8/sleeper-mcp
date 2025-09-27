# Player Data Caching System

The Sleeper MCP Server implements an intelligent caching system to handle the large (~5MB) player database efficiently across server restarts.

## How It Works

### Problem Solved
- **Without caching**: Every server restart would re-download 5MB of player data from Sleeper API
- **With persistent caching**: Player data survives server restarts and is stored locally for 24 hours

### Cache Architecture

```
sleeper-mcp/
├── .cache/                    # Cache directory (auto-created)
│   ├── players.json          # Full player database (~5MB)
│   └── cache-meta.json       # Cache metadata (timestamps, etc.)
└── src/
    └── sleeper-client.ts     # Cache logic implementation
```

### Cache Lifecycle

1. **First Run**: Downloads fresh player data from Sleeper API
2. **Save**: Stores data to `.cache/players.json` + metadata
3. **Server Restart**: Loads data from cache if still valid (< 24h old)
4. **Cache Expiry**: After 24h, automatically fetches fresh data
5. **Manual Clear**: Use `clear_cache` tool to force refresh

## Cache Management

### Automatic Cache Management
```javascript
// Cache is automatically managed:
- Loaded on first API call
- Saved after successful API fetch
- Validated on each server startup
- Expired after 24 hours
```

### Manual Cache Control

#### Clear Cache via MCP Tool
```javascript
// In Claude conversation:
"Clear the player data cache to get fresh data"

// Or with explicit confirmation:
{
  "name": "clear_cache",
  "arguments": { "confirm": true }
}
```

#### Direct File System
```bash
# Remove cache directory
rm -rf sleeper-mcp/.cache/

# Next API call will fetch fresh data
```

## Cache Performance

### Benefits
- **Startup Speed**: ~100ms vs ~5000ms for API call
- **Rate Limit Conservation**: Saves API calls for actual fantasy data
- **Offline Capability**: Works without internet for cached player lookups
- **Bandwidth Savings**: 5MB saved per server restart

### Cache Hit Examples
```
✅ Using cached player data (15,847 players, age: 8h)
✅ Loaded 15,847 players from persistent cache (age: 2h)
```

### Cache Miss Examples
```
⏳ No valid persistent cache found, will fetch fresh player data
⏳ Persistent cache expired, will fetch fresh data
⏳ Fetching all players from Sleeper API (this may take a moment)...
```

## Technical Implementation

### Cache Files Structure

#### players.json
```json
{
  "6794": {
    "player_id": "6794",
    "first_name": "Lamar",
    "last_name": "Jackson",
    "position": "QB",
    "team": "BAL",
    "status": "Active",
    "injury_status": null,
    "fantasy_positions": ["QB"],
    "search_rank": 8,
    // ... more player data
  }
  // ... 15,000+ more players
}
```

#### cache-meta.json
```json
{
  "lastUpdated": 1703123456789,
  "playerCount": 15847,
  "version": "1.0.0"
}
```

### Cache Validation Logic
```typescript
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
const now = Date.now();

if (now - cacheTimestamp < CACHE_DURATION) {
  // Use cached data
} else {
  // Fetch fresh data
}
```

## Monitoring Cache Status

### Log Messages
```bash
# Cache loaded successfully
"Loaded 15,847 players from persistent cache (age: 2h)"

# Cache expired
"Persistent cache expired, will fetch fresh data"

# Fresh data fetched
"Loaded 15,847 players into memory cache"
"Saved 15,847 players to persistent cache"

# Cache cleared
"Cache cleared successfully"
```

### Health Checks
- Cache age displayed in hours
- Player count validation
- File existence checks
- Automatic fallback to API on cache corruption

## Best Practices

### For Users
- **Don't manually edit cache files** - they're auto-generated
- **Clear cache if player data seems outdated** after major NFL events
- **Monitor log messages** to understand cache behavior

### For Developers
- **Never commit .cache/ directory** - it's in .gitignore
- **Handle cache corruption gracefully** - always fallback to API
- **Test both cache hit and miss scenarios**
- **Consider cache versioning** for future player schema changes

## Troubleshooting

### Common Issues

#### Cache Not Loading
```bash
# Check if cache directory exists
ls -la sleeper-mcp/.cache/

# Check file permissions
chmod 644 sleeper-mcp/.cache/*
```

#### Outdated Player Data
```javascript
// Clear cache via MCP tool
"Clear the player data cache"

// Or manually delete cache
rm -rf sleeper-mcp/.cache/
```

#### Cache Corruption
```bash
# Server will automatically fallback to API
# Check logs for error messages
tail -f logs/server.log
```

### Performance Issues
- **Large cache file**: 5MB is normal for NFL player database
- **Slow first load**: Expected when cache is empty
- **Memory usage**: ~50MB in memory is normal for 15k+ players

## Cache Statistics

### Typical Sizes
- **players.json**: ~5MB (15,000+ NFL players)
- **cache-meta.json**: <1KB (metadata only)
- **Memory usage**: ~50MB when loaded

### Performance Metrics
- **Cache load time**: ~100ms
- **API fetch time**: ~3-5 seconds
- **Cache save time**: ~200ms
- **Startup improvement**: 95% faster with cache

## Future Enhancements

### Planned Features
- **Selective cache updates** for individual players
- **Compressed cache storage** to reduce file size
- **Cache analytics** and usage statistics
- **Multi-sport caching** when other sports are supported

### Configuration Options
```json
{
  "cache": {
    "duration": 24, // hours
    "compression": true,
    "analytics": true
  }
}
```

---

The persistent caching system ensures optimal performance and reliability while respecting Sleeper's API rate limits and providing the best user experience across server restarts.