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

    // lazy client -- only initialized when a key is available
    let client: PinionClient | null = null;

    if (config.privateKey) {
        client = new PinionClient({
            privateKey: config.privateKey,
            apiUrl: config.apiUrl,
            network: config.network,
        });
    }

    const server = new Server(
        { name: "pinion-os", version: "0.3.2" },
        { capabilities: { tools: {} } },
    );

    // list available tools
    server.setRequestHandler(ListToolsRequestSchema, async () => ({
        tools: getToolDefinitions(),
    }));

    // handle tool calls -- pass getter/setter so pinion_setup can init the client
    server.setRequestHandler(CallToolRequestSchema, async (request) => {
        const { name, arguments: args } = request.params;
        return handleToolCall(
            () => client,
            (c) => { client = c; },
            config.apiUrl,
            config.network,
            name,
            args || {},
        );
    });

    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error(
        "pinion-os MCP server running%s",
        client ? ` (wallet: ${client.address})` : " (no wallet -- use pinion_setup)",
    );
}
