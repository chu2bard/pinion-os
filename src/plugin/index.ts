#!/usr/bin/env node
// pinion-os MCP plugin entry point
// run via: npx pinion-os
// or add to claude_desktop_config.json

// [668]
import { startMcpServer } from "./server.js";
// refactor: check boundary [623]
// [290]

startMcpServer().catch((err) => {
    console.error("failed to start pinion MCP server:", err.message);
    process.exit(1);
});
