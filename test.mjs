#!/usr/bin/env node

/**
 * Test script for Sleeper MCP Server
 * This script tests basic functionality without requiring a full MCP client
 */

import { spawn } from "child_process";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class MCPServerTester {
  constructor() {
    this.serverPath = join(__dirname, "dist", "index.js");
    this.testResults = [];
  }

  async runTest(testName, testFn) {
    console.log(`\n🧪 Running test: ${testName}`);
    try {
      const result = await testFn();
      console.log(`✅ ${testName} - PASSED`);
      this.testResults.push({ name: testName, status: "PASSED", result });
      return result;
    } catch (error) {
      console.error(`❌ ${testName} - FAILED: ${error.message}`);
      this.testResults.push({
        name: testName,
        status: "FAILED",
        error: error.message,
      });
      return null;
    }
  }

  async sendMCPRequest(request) {
    return new Promise((resolve, reject) => {
      const server = spawn("node", [this.serverPath], {
        stdio: ["pipe", "pipe", "pipe"],
      });

      let stdout = "";
      let stderr = "";

      server.stdout.on("data", (data) => {
        stdout += data.toString();
      });

      server.stderr.on("data", (data) => {
        stderr += data.toString();
      });

      server.on("close", (code) => {
        if (code === 0 || stdout.trim()) {
          try {
            // Try to parse JSON response
            const lines = stdout.trim().split("\n");
            const jsonLine = lines.find((line) => {
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

      server.on("error", (error) => {
        reject(error);
      });

      // Send the request
      server.stdin.write(JSON.stringify(request) + "\n");
      server.stdin.end();

      // Timeout after 10 seconds
      setTimeout(() => {
        server.kill();
        reject(new Error("Test timeout after 10 seconds"));
      }, 10000);
    });
  }

  async testServerStartup() {
    const initRequest = {
      jsonrpc: "2.0",
      id: 1,
      method: "initialize",
      params: {
        protocolVersion: "2024-11-05",
        capabilities: {},
        clientInfo: {
          name: "test-client",
          version: "1.0.0",
        },
      },
    };

    const response = await this.sendMCPRequest(initRequest);

    // Check if we got a valid JSON-RPC initialize response
    if (
      response.result &&
      response.result.serverInfo &&
      response.result.serverInfo.name === "sleeper-mcp" &&
      response.result.protocolVersion
    ) {
      return {
        success: true,
        message: "Server started successfully",
        serverInfo: response.result.serverInfo,
        protocolVersion: response.result.protocolVersion,
      };
    }

    throw new Error(
      "Server did not start properly - invalid initialize response",
    );
  }

  async testListTools() {
    const request = {
      jsonrpc: "2.0",
      id: 2,
      method: "tools/list",
      params: {},
    };

    const response = await this.sendMCPRequest(request);

    if (
      response.result &&
      response.result.tools &&
      Array.isArray(response.result.tools)
    ) {
      const toolNames = response.result.tools.map((tool) => tool.name);
      const expectedTools = [
        "get_user_info",
        "get_user_leagues",
        "get_league_info",
        "search_players",
        "get_trending_players",
      ];

      const hasExpectedTools = expectedTools.every((tool) =>
        toolNames.includes(tool),
      );

      if (hasExpectedTools) {
        return {
          success: true,
          toolCount: response.result.tools.length,
          tools: toolNames,
        };
      } else {
        throw new Error(
          `Missing expected tools. Found: ${toolNames.join(", ")}`,
        );
      }
    }

    throw new Error("Invalid tools/list response");
  }

  async testGetNFLState() {
    const request = {
      jsonrpc: "2.0",
      id: 3,
      method: "tools/call",
      params: {
        name: "get_nfl_state",
        arguments: {},
      },
    };

    const response = await this.sendMCPRequest(request);

    if (response.result && response.result.content) {
      const content = JSON.parse(response.result.content[0].text);

      if (content.success && content.nfl_state) {
        return {
          success: true,
          week: content.nfl_state.week,
          season: content.nfl_state.season,
          season_type: content.nfl_state.season_type,
        };
      }
    }

    throw new Error("Failed to get NFL state");
  }

  async testSearchPlayers() {
    const request = {
      jsonrpc: "2.0",
      id: 4,
      method: "tools/call",
      params: {
        name: "search_players",
        arguments: {
          query: "Josh Allen",
          limit: 3,
        },
      },
    };

    const response = await this.sendMCPRequest(request);

    if (response.result && response.result.content) {
      const content = JSON.parse(response.result.content[0].text);

      if (content.success && content.players && content.players.length > 0) {
        return {
          success: true,
          playerCount: content.players.length,
          firstPlayer:
            content.players[0].full_name ||
            `${content.players[0].first_name} ${content.players[0].last_name}`,
        };
      }
    }

    throw new Error("Failed to search players");
  }

  async testInvalidTool() {
    const request = {
      jsonrpc: "2.0",
      id: 5,
      method: "tools/call",
      params: {
        name: "nonexistent_tool",
        arguments: {},
      },
    };

    const response = await this.sendMCPRequest(request);

    if (response.result && response.result.content) {
      const content = JSON.parse(response.result.content[0].text);

      if (!content.success && content.error) {
        return {
          success: true,
          message: "Correctly handled invalid tool call",
        };
      }
    }

    throw new Error("Should have failed for invalid tool");
  }

  async testGetUserInfo() {
    const request = {
      jsonrpc: "2.0",
      id: 6,
      method: "tools/call",
      params: {
        name: "get_user_info",
        arguments: {
          username_or_id: "invalid_user_12345",
        },
      },
    };

    const response = await this.sendMCPRequest(request);

    if (response.result && response.result.content) {
      const content = JSON.parse(response.result.content[0].text);

      // Should handle invalid user gracefully
      if (!content.success && content.error) {
        return {
          success: true,
          message: "Correctly handled invalid user lookup",
        };
      }
    }

    throw new Error("Failed to handle invalid user properly");
  }

  async testGetTrendingPlayers() {
    const request = {
      jsonrpc: "2.0",
      id: 7,
      method: "tools/call",
      params: {
        name: "get_trending_players",
        arguments: {
          type: "add",
          limit: 5,
          lookback_hours: 12,
        },
      },
    };

    const response = await this.sendMCPRequest(request);

    if (response.result && response.result.content) {
      const content = JSON.parse(response.result.content[0].text);

      if (
        content.success &&
        content.trending_players &&
        Array.isArray(content.trending_players)
      ) {
        return {
          success: true,
          playerCount: content.trending_players.length,
          type: "trending adds",
        };
      }
    }

    throw new Error("Failed to get trending players");
  }

  async testGetPlayerDetails() {
    const request = {
      jsonrpc: "2.0",
      id: 8,
      method: "tools/call",
      params: {
        name: "get_player_details",
        arguments: {
          player_ids: [], // Empty array edge case
        },
      },
    };

    const response = await this.sendMCPRequest(request);

    if (response.result && response.result.content) {
      const content = JSON.parse(response.result.content[0].text);

      // Should handle empty array gracefully (returns success with 0 players)
      if (
        content.success &&
        content.count === 0 &&
        content.requested_count === 0
      ) {
        return {
          success: true,
          message: "Correctly handled empty player ID array",
        };
      }
    }

    throw new Error("Failed to handle empty player array");
  }

  async testClearCache() {
    const request = {
      jsonrpc: "2.0",
      id: 9,
      method: "tools/call",
      params: {
        name: "clear_cache",
        arguments: {
          confirm: false, // Should not clear without confirmation
        },
      },
    };

    const response = await this.sendMCPRequest(request);

    if (response.result && response.result.content) {
      const content = JSON.parse(response.result.content[0].text);

      if (
        !content.success &&
        content.message &&
        content.message.includes("confirmation required")
      ) {
        return {
          success: true,
          message: "Correctly handled cache clear without confirmation",
        };
      }
    }

    throw new Error("Failed to handle cache clear confirmation");
  }

  async testGetLeagueInfo() {
    const request = {
      jsonrpc: "2.0",
      id: 10,
      method: "tools/call",
      params: {
        name: "get_league_info",
        arguments: {
          league_id: "invalid_league_xyz", // Invalid league ID
        },
      },
    };

    const response = await this.sendMCPRequest(request);

    if (response.result && response.result.content) {
      const content = JSON.parse(response.result.content[0].text);

      // Should handle invalid league ID gracefully
      if (!content.success && content.error) {
        return {
          success: true,
          message: "Correctly handled invalid league ID",
        };
      }
    }

    throw new Error("Failed to handle invalid league ID");
  }

  async testComparePlayersInvalid() {
    const request = {
      jsonrpc: "2.0",
      id: 11,
      method: "tools/call",
      params: {
        name: "compare_players",
        arguments: {
          player1_id: "invalid_player_1",
          player2_id: "invalid_player_2",
          context: "test comparison",
        },
      },
    };

    const response = await this.sendMCPRequest(request);

    if (response.result && response.result.content) {
      const content = JSON.parse(response.result.content[0].text);

      // Should handle invalid player IDs gracefully
      if (!content.success && content.error) {
        return {
          success: true,
          message: "Correctly handled invalid player comparison",
        };
      }
    }

    throw new Error("Failed to handle invalid player comparison");
  }

  async testMissingRequiredParameter() {
    const request = {
      jsonrpc: "2.0",
      id: 12,
      method: "tools/call",
      params: {
        name: "search_players",
        arguments: {}, // Missing required 'query' parameter
      },
    };

    const response = await this.sendMCPRequest(request);

    if (response.result && response.result.content) {
      const content = JSON.parse(response.result.content[0].text);

      // Should handle missing parameters gracefully
      if (
        !content.success &&
        content.error &&
        content.error.includes("query")
      ) {
        return {
          success: true,
          message: "Correctly handled missing required parameter",
        };
      }
    }

    throw new Error("Failed to handle missing required parameter");
  }

  async testGetWaiverSuggestionsInvalid() {
    const request = {
      jsonrpc: "2.0",
      id: 13,
      method: "tools/call",
      params: {
        name: "get_waiver_suggestions",
        arguments: {
          league_id: "nonexistent_league",
          user_id: "nonexistent_user",
          position: "INVALID_POSITION", // Invalid position
        },
      },
    };

    const response = await this.sendMCPRequest(request);

    if (response.result && response.result.content) {
      const content = JSON.parse(response.result.content[0].text);

      // Should handle invalid league/user/position gracefully
      if (!content.success && content.error) {
        return {
          success: true,
          message: "Correctly handled invalid waiver request",
        };
      }
    }

    throw new Error("Failed to handle invalid waiver request");
  }

  async runAllTests() {
    console.log("🚀 Starting Sleeper MCP Server Tests\n");
    console.log("=".repeat(50));

    // Core Infrastructure Tests
    await this.runTest("Server Startup", () => this.testServerStartup());
    await this.runTest("List Tools", () => this.testListTools());
    await this.runTest("Invalid Tool Handling", () => this.testInvalidTool());

    // Basic API Tests
    await this.runTest("Get NFL State", () => this.testGetNFLState());
    await this.runTest("Search Players", () => this.testSearchPlayers());
    await this.runTest("Get Trending Players", () =>
      this.testGetTrendingPlayers(),
    );

    // Edge Case Tests
    await this.runTest("Invalid User Info", () => this.testGetUserInfo());
    await this.runTest("Empty Player Array", () => this.testGetPlayerDetails());
    await this.runTest("Invalid League Info", () => this.testGetLeagueInfo());
    await this.runTest("Cache Clear Confirmation", () => this.testClearCache());
    await this.runTest("Invalid Player Comparison", () =>
      this.testComparePlayersInvalid(),
    );
    await this.runTest("Missing Required Parameter", () =>
      this.testMissingRequiredParameter(),
    );
    await this.runTest("Invalid Waiver Request", () =>
      this.testGetWaiverSuggestionsInvalid(),
    );

    // Print summary
    this.printSummary();
  }

  printSummary() {
    console.log("\n" + "=".repeat(50));
    console.log("📊 TEST SUMMARY");
    console.log("=".repeat(50));

    const passed = this.testResults.filter((r) => r.status === "PASSED").length;
    const failed = this.testResults.filter((r) => r.status === "FAILED").length;
    const total = this.testResults.length;

    console.log(`\n✅ Passed: ${passed}/${total}`);
    console.log(`❌ Failed: ${failed}/${total}`);

    if (failed > 0) {
      console.log("\n🔍 Failed Tests:");
      this.testResults
        .filter((r) => r.status === "FAILED")
        .forEach((r) => {
          console.log(`  • ${r.name}: ${r.error}`);
        });
    }

    if (passed === total) {
      console.log(
        "\n🎉 All tests passed! Your Sleeper MCP Server is ready to use.",
      );
      console.log("\nNext steps:");
      console.log("1. Add the server to your Claude Desktop configuration");
      console.log("2. Start using the fantasy football tools with Claude");
      console.log("\nExample Claude Desktop config:");
      console.log(
        JSON.stringify(
          {
            mcpServers: {
              "sleeper-mcp": {
                command: "node",
                args: [join(process.cwd(), "dist", "index.js")],
                env: {},
              },
            },
          },
          null,
          2,
        ),
      );
    } else {
      console.log("\n⚠️  Some tests failed. Please check the errors above.");
      process.exit(1);
    }
  }
}

// Run tests if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const tester = new MCPServerTester();
  tester.runAllTests().catch((error) => {
    console.error("\n💥 Test runner failed:", error.message);
    process.exit(1);
  });
}

export default MCPServerTester;
