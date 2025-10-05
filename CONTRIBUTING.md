# Contributing to Sleeper MCP

Thank you for your interest in contributing to the Sleeper Fantasy Football MCP Server! This document provides guidelines and information for contributors.

## 🚀 Getting Started

### Prerequisites
- Node.js 18 or higher
- npm or yarn
- Git
- Claude Desktop (for testing MCP integration)

### Development Setup

1. **Fork and Clone**
   ```bash
   git clone https://github.com/yourusername/sleeper-mcp.git
   cd sleeper-mcp
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Build the Project**
   ```bash
   npm run build
   ```

4. **Run Tests**
   ```bash
   npm test
   npm run test:coverage
   ```

5. **Set up Claude Desktop** (for testing)
   - Copy `claude_desktop_config.example.json` to your Claude Desktop config
   - Update the path to point to your local development build

## 🔧 Development Workflow

### Making Changes

1. **Create a Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make Your Changes**
   - Follow the existing code style
   - Add tests for new functionality
   - Update documentation as needed

3. **Test Your Changes**
   ```bash
   # Run all tests
   npm test
   
   # Check code coverage
   npm run test:coverage
   
   # Build to ensure no compilation errors
   npm run build
   
   # Test with Claude Desktop manually
   npm run dev
   ```

4. **Commit Your Changes**
   ```bash
   git add .
   git commit -m "feat: add new player comparison tool"
   ```

5. **Push and Create PR**
   ```bash
   git push origin feature/your-feature-name
   ```

### Commit Message Convention

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification for automatic changelog generation:

#### Format
```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

#### Types
- `feat:` New features (shows in changelog)
- `fix:` Bug fixes (shows in changelog)
- `docs:` Documentation changes (shows in changelog)
- `refactor:` Code refactoring (shows in changelog)
- `perf:` Performance improvements (shows in changelog)
- `test:` Adding or updating tests (hidden from changelog)
- `build:` Build system changes (hidden from changelog)
- `ci:` CI configuration changes (hidden from changelog)
- `chore:` Maintenance tasks (hidden from changelog)
- `style:` Code style changes (hidden from changelog)

#### Examples
```
feat: add get_player_projections tool
feat(api): add injury status endpoint
fix: handle invalid league IDs gracefully
fix(cache): prevent memory leak in player data cache
docs: update API documentation for new tools
refactor: simplify error handling logic
perf: optimize player search algorithm
```

#### Breaking Changes
For breaking changes, add `BREAKING CHANGE:` in the footer:
```
feat: redesign player comparison API

BREAKING CHANGE: The compare_players tool now requires an array of player IDs instead of individual parameters.
```

#### Why This Matters
- **Automatic Changelog**: Our release-please workflow generates changelogs from these commits
- **Semantic Versioning**: Commit types determine version bumps (feat = minor, fix = patch, BREAKING CHANGE = major)
- **Better History**: Clear, searchable commit history

## 🧪 Testing Guidelines

### Writing Tests

We use a custom test framework. Tests are located in `test.mjs`.

#### Test Structure
```javascript
// Add to test.mjs
await testTool({
  name: 'your_new_tool',
  args: { param1: 'value1' },
  expectedType: 'array', // or 'object', 'string', etc.
  description: 'Test description'
});
```

#### Test Categories

1. **Unit Tests**: Test individual functions and methods
2. **Integration Tests**: Test MCP tool interactions
3. **API Tests**: Test Sleeper API integration
4. **Error Handling Tests**: Test edge cases and error scenarios

### Coverage Requirements

- Aim for >80% code coverage for new features
- All new tools must have corresponding tests
- Critical paths should have >95% coverage

### Manual Testing

Before submitting a PR:

1. Test the MCP server with Claude Desktop
2. Verify all tools work as expected
3. Test error scenarios (invalid inputs, network issues)
4. Confirm caching behavior is correct

## 📝 Code Style

### TypeScript Guidelines

- Use strict TypeScript settings
- Prefer explicit types over `any`
- Use interfaces for complex objects
- Add JSDoc comments for public functions

### Code Organization

```
src/
├── index.ts          # Main MCP server entry point
├── sleeper-client.ts # Sleeper API client
├── tools/           # Individual MCP tool implementations
├── types/           # TypeScript type definitions
└── utils/           # Utility functions
```

### Naming Conventions

- **Files**: `kebab-case.ts`
- **Functions**: `camelCase`
- **Classes**: `PascalCase`
- **Constants**: `UPPER_SNAKE_CASE`
- **MCP Tools**: `snake_case` (following MCP conventions)

## 🛠️ Adding New Features

### Adding a New MCP Tool

1. **Define the Tool**
   ```typescript
   const myNewTool = {
     name: 'my_new_tool',
     description: 'Clear description of what this tool does',
     inputSchema: {
       type: 'object',
       properties: {
         param1: { type: 'string', description: 'Parameter description' }
       },
       required: ['param1']
     }
   };
   ```

2. **Implement the Handler**
   ```typescript
   async function handleMyNewTool(args: any) {
     // Validate inputs
     // Call Sleeper API if needed
     // Process data
     // Return formatted results
   }
   ```

3. **Add to Tools Registry**
   ```typescript
   tools.push(myNewTool);
   ```

4. **Add to Handler Switch**
   ```typescript
   case 'my_new_tool':
     return await handleMyNewTool(request.params.arguments);
   ```

5. **Write Tests**
   ```javascript
   await testTool({
     name: 'my_new_tool',
     args: { param1: 'test_value' },
     expectedType: 'object',
     description: 'Test my new tool'
   });
   ```

### API Integration Guidelines

- Always handle API errors gracefully
- Respect rate limits (1000 calls/minute for Sleeper)
- Implement appropriate caching for data that doesn't change frequently
- Use TypeScript interfaces for API responses

## 📚 Documentation

### Code Documentation

- Add JSDoc comments to all public functions
- Include parameter descriptions and return types
- Provide usage examples for complex functions

### User Documentation

- Update README.md for new features
- Add examples to EXAMPLES.md
- Update tool descriptions for clarity

## 🐛 Debugging

### Common Issues

1. **MCP Connection Issues**
   - Verify Claude Desktop configuration
   - Check that the server builds without errors
   - Ensure the path in config is correct

2. **API Rate Limiting**
   - Implement exponential backoff
   - Add appropriate delays between requests
   - Use caching to reduce API calls

3. **Type Errors**
   - Use TypeScript strict mode
   - Validate all inputs with Zod schemas
   - Handle undefined/null values

### Debugging Tools

```bash
# Development mode with hot reload
npm run dev

# Watch mode for TypeScript compilation
npm run watch

# Verbose test output
DEBUG=1 npm test
```

## 🚀 Release Process

### Automated Release Process

We use [release-please](https://github.com/googleapis/release-please) for fully automated releases:

#### How It Works
1. **Conventional Commits**: Your commits determine the release type
2. **Automatic PRs**: release-please creates PRs with changelog and version bump
3. **Merge to Release**: Merging the PR triggers automatic npm publishing

#### Version Bumping Rules
- `feat:` commits → **MINOR** version bump (1.0.0 → 1.1.0)
- `fix:` commits → **PATCH** version bump (1.0.0 → 1.0.1)
- `BREAKING CHANGE:` → **MAJOR** version bump (1.0.0 → 2.0.0)

#### Creating a Release
1. **Write conventional commits** and push to main
2. **Wait for release-please PR** (created automatically)
3. **Review the generated changelog** in the PR
4. **Merge the PR** → automatic npm publish + GitHub release

#### Manual Release (if needed)
```bash
# Only if release-please is not working
git tag v1.2.3
git push origin v1.2.3
```

## 🤝 Community

### Getting Help

- Open an issue for bugs or feature requests
- Use discussions for questions and ideas
- Check existing issues before creating new ones

### Code of Conduct

- Be respectful and inclusive
- Focus on constructive feedback
- Help others learn and grow

## 📋 Checklist for Contributors

Before submitting a PR:

- [ ] Code follows project style guidelines
- [ ] All tests pass (`npm test`)
- [ ] Code coverage is maintained or improved
- [ ] Documentation is updated
- [ ] MCP integration works with Claude Desktop
- [ ] Commit messages follow conventional format
- [ ] No console.log statements in production code
- [ ] Error handling is comprehensive

## 🏆 Recognition

Contributors will be recognized in:
- CONTRIBUTORS.md file
- GitHub releases
- Project documentation

Thank you for contributing to Sleeper MCP! 🚀