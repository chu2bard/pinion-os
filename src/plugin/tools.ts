// tool definitions for Claude MCP integration

import type { PinionClient } from "../client/index.js";
import { payX402Service } from "../client/x402-generic.js";
import { SpendTracker } from "./limits.js";

interface ToolDef {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: Record<string, any>;
        required?: string[];
    };
}

// session-level spend tracker shared across all tool calls
const spendTracker = new SpendTracker();

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
        {
            name: "pinion_send",
            description:
                "Construct an unsigned ETH or USDC transfer transaction on Base. Returns tx object to sign locally. Costs $0.01 USDC via x402.",
            inputSchema: {
                type: "object",
                properties: {
                    to: {
                        type: "string",
                        description: "Recipient address (0x...)",
                    },
                    amount: {
                        type: "string",
                        description:
                            "Amount to send in human-readable units (e.g. '0.1' for 0.1 ETH or '10' for 10 USDC)",
                    },
                    token: {
                        type: "string",
                        description: "Token to send",
                        enum: ["ETH", "USDC"],
                    },
                },
                required: ["to", "amount", "token"],
            },
        },
        {
            name: "pinion_trade",
            description:
                "Get an unsigned swap transaction via 1inch aggregator on Base. Returns swap tx (and optional approve tx) to sign locally. Costs $0.01 USDC via x402.",
            inputSchema: {
                type: "object",
                properties: {
                    src: {
                        type: "string",
                        description: "Source token symbol (e.g. USDC, ETH, WETH)",
                    },
                    dst: {
                        type: "string",
                        description: "Destination token symbol (e.g. ETH, USDC, WETH)",
                    },
                    amount: {
                        type: "string",
                        description: "Amount of source token in human-readable units",
                    },
                    slippage: {
                        type: "number",
                        description: "Slippage tolerance in percent (default: 1)",
                    },
                },
                required: ["src", "dst", "amount"],
            },
        },
        {
            name: "pinion_fund",
            description:
                "Get wallet balance and funding instructions for a Base address. Returns ETH/USDC balances and steps to fund. Costs $0.01 USDC via x402.",
            inputSchema: {
                type: "object",
                properties: {
                    address: {
                        type: "string",
                        description:
                            "Ethereum address to check (0x...). If omitted, uses the plugin wallet address.",
                    },
                },
            },
        },
        {
            name: "pinion_pay_service",
            description:
                "Call any x402-paywalled endpoint on the internet. Handles the full 402 -> sign -> pay -> get response flow. Works with any server using the x402 protocol.",
            inputSchema: {
                type: "object",
                properties: {
                    url: {
                        type: "string",
                        description: "The full URL of the x402 endpoint to call",
                    },
                    method: {
                        type: "string",
                        description: "HTTP method (default: GET)",
                        enum: ["GET", "POST", "PUT", "PATCH", "DELETE"],
                    },
                    body: {
                        type: "object",
                        description: "Request body for POST/PUT/PATCH requests",
                    },
                    max_amount: {
                        type: "string",
                        description:
                            "Max USDC to pay in atomic units (1000000 = $1.00). Default: 1000000",
                    },
                },
                required: ["url"],
            },
        },
        {
            name: "pinion_spend_limit",
            description:
                "Set, check, or clear a per-session USDC spending limit. Helps prevent runaway spending by agents. No x402 cost.",
            inputSchema: {
                type: "object",
                properties: {
                    action: {
                        type: "string",
                        description: "What to do",
                        enum: ["set", "status", "clear"],
                    },
                    max_usdc: {
                        type: "string",
                        description:
                            "Max USDC budget for this session (only for 'set' action, e.g. '1.00')",
                    },
                },
                required: ["action"],
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
        // spend limit check for paid tools
        const COST_ATOMIC = "10000"; // $0.01 = 10000 atomic USDC
        const paidTools = [
            "pinion_balance", "pinion_tx", "pinion_price",
            "pinion_wallet", "pinion_chat", "pinion_send",
            "pinion_trade", "pinion_fund",
        ];

        if (paidTools.includes(toolName) && !spendTracker.canSpend(COST_ATOMIC)) {
            const status = spendTracker.getStatus();
            return {
                content: [{
                    type: "text",
                    text: `spend limit reached: spent $${status.spent} of $${status.maxBudget} budget (${status.callCount} calls). Use pinion_spend_limit to adjust.`,
                }],
            };
        }

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
            case "pinion_send":
                result = await client.skills.send(args.to, args.amount, args.token);
                break;
            case "pinion_trade":
                result = await client.skills.trade(
                    args.src, args.dst, args.amount, args.slippage,
                );
                break;
            case "pinion_fund":
                result = await client.skills.fund(args.address);
                break;
            case "pinion_pay_service": {
                const psResult = await payX402Service(client.signer, args.url, {
                    method: args.method,
                    body: args.body,
                    maxAmount: args.max_amount || "1000000",
                });
                if (psResult.paidAmount !== "0") {
                    spendTracker.recordSpend(psResult.paidAmount);
                }
                return {
                    content: [{
                        type: "text",
                        text: JSON.stringify(psResult, null, 2),
                    }],
                };
            }
            case "pinion_spend_limit": {
                if (args.action === "set") {
                    if (!args.max_usdc) {
                        return {
                            content: [{ type: "text", text: "max_usdc is required for 'set' action" }],
                        };
                    }
                    spendTracker.setLimit(args.max_usdc);
                    const st = spendTracker.getStatus();
                    return {
                        content: [{ type: "text", text: `spend limit set to $${st.maxBudget}. spent so far: $${st.spent}` }],
                    };
                } else if (args.action === "clear") {
                    spendTracker.clearLimit();
                    return {
                        content: [{ type: "text", text: "spend limit cleared. no budget cap." }],
                    };
                } else {
                    const st = spendTracker.getStatus();
                    return {
                        content: [{ type: "text", text: JSON.stringify(st, null, 2) }],
                    };
                }
            }
            default:
                return {
                    content: [{
                        type: "text",
                        text: `unknown tool: ${toolName}`,
                    }],
                };
        }

        // record spend for paid tools
        if (paidTools.includes(toolName) && result.paidAmount !== "0") {
            spendTracker.recordSpend(result.paidAmount);
        }

        const paid =
            result.paidAmount !== "0"
                ? ` (paid ${result.paidAmount} wei USDC)`
                : "";

        return {
            content: [{
                type: "text",
                text: JSON.stringify(result.data, null, 2) + paid,
            }],
        };
    } catch (err: any) {
        return {
            content: [
                { type: "text", text: `error: ${err.message}` },
            ],
        };
    }
}
