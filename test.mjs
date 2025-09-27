#!/usr/bin/env node

/**
 * Test script for Sleeper MCP Server
 * This script tests basic functionality without requiring a full MCP client
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class MCPServerTester {
  constructor() {
    this.serverPath = join(__dirname, 'dist', 'index.js');
    this.testResults = [];
  }

  async runTest(testName, testFn) {
    console.log(`\n🧪 Running test: ${testName}`);
    try {
      const result = await testFn();
      console.log(`✅ ${testName} - PASSED`);
      this.testResults.push({ name: testName, status: 'PASSED', result });
      return result;
    } catch (error) {
      console.error(`❌ ${testName} - FAILED: ${error.message}`);
      this.testResults.push({ name: testName, status: 'FAILED', error: error.message });
      return null;
    }
  }

  async sendMCPRequest(request) {
    return new Promise((resolve, reject) => {
      const server = spawn('node', [this.serverPath], {
        stdio: ['pipe', 'pipe', 'pipe']
      });

      let stdout = '';
      let stderr = '';

      server.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      server.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      server.on('close', (code) => {
        if (code === 0 || stdout.trim()) {
          try {
            // Try to parse JSON response
            const lines = stdout.trim().split('\n');
            const jsonLine = lines.find(line => {
              try {
                JSON.parse(line);
                return true;
              } catch {
                return false;
              }
            });

            if (jsonLine) {
              resolve(JSON.parse(jsonLine));
            } else {
              resolve({ stdout, stderr, code });
            }
          } catch (error) {
            resolve({ stdout, stderr, code, parseError: error.message });
          }
        } else {
          reject(new Error(`Server exited with code ${code}: ${stderr}`));
        }
      });

      server.on('error', (error) => {
        reject(error);
      });

      // Send the request
      server.stdin.write(JSON.stringify(request) + '\n');
      server.stdin.end();

      // Timeout after 10 seconds
      setTimeout(() => {
        server.kill();
        reject(new Error('Test timeout after 10 seconds'));
      }, 10000);
    });
  }

  async testServerStartup() {
    const initRequest = {
      jsonrpc: '2.0',
      id: 1,
      method: 'initialize',
      params: {
        protocolVersion: '2024-11-05',
        capabilities: {},
        clientInfo: {
          name: 'test-client',
          version: '1.0.0'
        }
      }
    };

    const response = await this.sendMCPRequest(initRequest);

    if (response.stdout && response.stdout.includes('Sleeper MCP Server running')) {
      return { success: true, message: 'Server started successfully' };
    }

    throw new Error('Server did not start properly');
  }

  async testListTools() {
    const request = {
      jsonrpc: '2.0',
      id: 2,
      method: 'tools/list',
      params: {}
    };

    const response = await this.sendMCPRequest(request);

    if (response.result && response.result.tools && Array.isArray(response.result.tools)) {
      const toolNames = response.result.tools.map(tool => tool.name);
      const expectedTools = [
        'get_user_info',
        'get_user_leagues',
        'get_league_info',
        'search_players',
        'get_trending_players'
      ];

      const hasExpectedTools = expectedTools.every(tool => toolNames.includes(tool));

      if (hasExpectedTools) {
        return {
          success: true,
          toolCount: response.result.tools.length,
          tools: toolNames
        };
      } else {
        throw new Error(`Missing expected tools. Found: ${toolNames.join(', ')}`);
      }
    }

    throw new Error('Invalid tools/list response');
  }

  async testGetNFLState() {
    const request = {
      jsonrpc: '2.0',
      id: 3,
      method: 'tools/call',
      params: {
        name: 'get_nfl_state',
        arguments: {}
      }
    };

    const response = await this.sendMCPRequest(request);

    if (response.result && response.result.content) {
      const content = JSON.parse(response.result.content[0].text);

      if (content.success && content.nfl_state) {
        return {
          success: true,
          week: content.nfl_state.week,
          season: content.nfl_state.season,
          season_type: content.nfl_state.season_type
        };
      }
    }

    throw new Error('Failed to get NFL state');
  }

  async testSearchPlayers() {
    const request = {
      jsonrpc: '2.0',
      id: 4,
      method: 'tools/call',
      params: {
        name: 'search_players',
        arguments: {
          query: 'Josh Allen',
          limit: 3
        }
      }
    };

    const response = await this.sendMCPRequest(request);

    if (response.result && response.result.content) {
      const content = JSON.parse(response.result.content[0].text);

      if (content.success && content.players && content.players.length > 0) {
        return {
          success: true,
          playerCount: content.players.length,
          firstPlayer: content.players[0].full_name || `${content.players[0].first_name} ${content.players[0].last_name}`
        };
      }
    }

    throw new Error('Failed to search players');
  }

  async testInvalidTool() {
    const request = {
      jsonrpc: '2.0',
      id: 5,
      method: 'tools/call',
      params: {
        name: 'nonexistent_tool',
        arguments: {}
      }
    };

    const response = await this.sendMCPRequest(request);

    if (response.result && response.result.content) {
      const content = JSON.parse(response.result.content[0].text);

      if (!content.success && content.error) {
        return {
          success: true,
          message: 'Correctly handled invalid tool call'
        };
      }
    }

    throw new Error('Should have failed for invalid tool');
  }

  async runAllTests() {
    console.log('🚀 Starting Sleeper MCP Server Tests\n');
    console.log('=' .repeat(50));

    // Test server startup
    await this.runTest('Server Startup', () => this.testServerStartup());

    // Test list tools
    await this.runTest('List Tools', () => this.testListTools());

    // Test NFL state (no external dependencies)
    await this.runTest('Get NFL State', () => this.testGetNFLState());

    // Test player search (requires API call)
    await this.runTest('Search Players', () => this.testSearchPlayers());

    // Test error handling
    await this.runTest('Invalid Tool Handling', () => this.testInvalidTool());

    // Print summary
    this.printSummary();
  }

  printSummary() {
    console.log('\n' + '=' .repeat(50));
    console.log('📊 TEST SUMMARY');
    console.log('=' .repeat(50));

    const passed = this.testResults.filter(r => r.status === 'PASSED').length;
    const failed = this.testResults.filter(r => r.status === 'FAILED').length;
    const total = this.testResults.length;

    console.log(`\n✅ Passed: ${passed}/${total}`);
    console.log(`❌ Failed: ${failed}/${total}`);

    if (failed > 0) {
      console.log('\n🔍 Failed Tests:');
      this.testResults
        .filter(r => r.status === 'FAILED')
        .forEach(r => {
          console.log(`  • ${r.name}: ${r.error}`);
        });
    }

    if (passed === total) {
      console.log('\n🎉 All tests passed! Your Sleeper MCP Server is ready to use.');
      console.log('\nNext steps:');
      console.log('1. Add the server to your Claude Desktop configuration');
      console.log('2. Start using the fantasy football tools with Claude');
      console.log('\nExample Claude Desktop config:');
      console.log(JSON.stringify({
        mcpServers: {
          "sleeper-mcp": {
            command: "node",
            args: [join(process.cwd(), "dist", "index.js")],
            env: {}
          }
        }
      }, null, 2));
    } else {
      console.log('\n⚠️  Some tests failed. Please check the errors above.');
      process.exit(1);
    }
  }
}

// Run tests if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const tester = new MCPServerTester();
  tester.runAllTests().catch(error => {
    console.error('\n💥 Test runner failed:', error.message);
    process.exit(1);
  });
}

export default MCPServerTester;
