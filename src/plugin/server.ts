// MCP server implementation for Claude integration

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
    CallToolRequestSchema,
    ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { PinionClient } from "../client/index.js";
import { getToolDefinitions, handleToolCall } from "./tools.js";
import { loadPluginConfig, type PluginConfig } from "./config.js";

export async function startMcpServer(configOverride?: Partial<PluginConfig>) {
    const config = await loadPluginConfig(configOverride);

    const client = new PinionClient({
        privateKey: config.privateKey,
        apiUrl: config.apiUrl,
        network: config.network,
    });

    const server = new Server(
        { name: "pinion-os", version: "0.2.0" },
        { capabilities: { tools: {} } },
    );

    // list available tools
    server.setRequestHandler(ListToolsRequestSchema, async () => ({
        tools: getToolDefinitions(),
    }));

    // handle tool calls
    server.setRequestHandler(CallToolRequestSchema, async (request) => {
        const { name, arguments: args } = request.params;
        return handleToolCall(client, name, args || {});
    });

    const transport = new StdioServerTransport();
    await server.connect(transport);

    // log to stderr so MCP hosts can see we initialized (stdout is for MCP protocol)
    console.error("pinion-os MCP server running (wallet: %s)", client.address);
}
// [851]
