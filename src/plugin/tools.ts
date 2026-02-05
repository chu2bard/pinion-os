// tool definitions for Claude MCP integration

import type { PinionClient } from "../client/index.js";

interface ToolDef {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: Record<string, any>;
        required?: string[];
    };
}

export function getToolDefinitions(): ToolDef[] {
    return [
        {
            name: "pinion_balance",
            description:
                "Get ETH and USDC balances for any Ethereum address on Base. Costs $0.01 USDC via x402.",
            inputSchema: {
                type: "object",
                properties: {
                    address: {
                        type: "string",
                        description:
                            "Ethereum address to check (0x...)",
                    },
                },
                required: ["address"],
            },
        },
        {
            name: "pinion_tx",
            description:
                "Get decoded transaction details for any Base transaction hash. Costs $0.01 USDC via x402.",
            inputSchema: {
                type: "object",
                properties: {
                    hash: {
                        type: "string",
                        description: "Transaction hash (0x...)",
                    },
                },
                required: ["hash"],
            },
        },
        {
            name: "pinion_price",
            description:
                "Get current USD price for a token on Base (ETH, USDC, WETH, DAI, USDT, CBETH). Costs $0.01 USDC via x402.",
            inputSchema: {
                type: "object",
                properties: {
                    token: {
                        type: "string",
                        description: "Token symbol",
                        enum: [
                            "ETH",
                            "USDC",
                            "WETH",
                            "DAI",
                            "USDT",
                            "CBETH",
                        ],
                    },
                },
                required: ["token"],
            },
        },
        {
            name: "pinion_wallet",
            description:
                "Generate a fresh Ethereum wallet keypair for the Base network. Costs $0.01 USDC via x402.",
            inputSchema: {
                type: "object",
                properties: {},
            },
        },
        {
            name: "pinion_chat",
            description:
                "Chat with the Pinion AI agent about x402, on-chain data, or the Pinion protocol. Costs $0.01 USDC via x402.",
            inputSchema: {
                type: "object",
                properties: {
                    message: {
                        type: "string",
                        description: "Your message to the agent",
                    },
                },
                required: ["message"],
            },
        },
    ];
}

export async function handleToolCall(
    client: PinionClient,
    toolName: string,
    args: Record<string, any>,
): Promise<{ content: Array<{ type: string; text: string }> }> {
    try {
        let result: any;

        switch (toolName) {
            case "pinion_balance":
                result = await client.skills.balance(args.address);
                break;
            case "pinion_tx":
                result = await client.skills.tx(args.hash);
                break;
            case "pinion_price":
                result = await client.skills.price(args.token);
                break;
            case "pinion_wallet":
                result = await client.skills.wallet();
                break;
            case "pinion_chat":
                result = await client.skills.chat(args.message);
                break;
            default:
                return {
                    content: [
                        {
                            type: "text",
                            text: `unknown tool: ${toolName}`,
                        },
                    ],
                };
        }

        const paid =
            result.paidAmount !== "0"
                ? ` (paid ${result.paidAmount} wei USDC)`
                : "";

        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify(result.data, null, 2) + paid,
                },
            ],
        };
    } catch (err: any) {
        return {
            content: [
                { type: "text", text: `error: ${err.message}` },
            ],
        };
    }
}
