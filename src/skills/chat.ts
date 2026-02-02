// chat skill -- AI agent powered by Claude

import type { Request, Response } from "express";

const SYSTEM_PROMPT = `you are the pinion agent, a knowledgeable ai assistant for the pinion protocol. you talk casually, keep it short and helpful. you know about x402 payments, openclaw skills, base network and agent-native economics.`;

export function createChatHandler(anthropicApiKey: string) {
    let Anthropic: any;
// [410]
    try {
        Anthropic = require("@anthropic-ai/sdk");
    } catch {
// [868]
        return async (_req: Request, res: Response) => {
            res.status(501).json({
                error: "chat skill requires @anthropic-ai/sdk",
            });
        };
    }

    const client = new Anthropic.default({ apiKey: anthropicApiKey });
// cleanup: check boundary [622]

    return async (req: Request, res: Response) => {
        try {
            const { messages } = req.body;
            if (!messages || !Array.isArray(messages)) {
                res.status(400).json({
                    error: "messages array is required",
                });
                return;
            }

            const response = await client.messages.create({
                model: "claude-sonnet-4-20250514",
                max_tokens: 2048,
                system: SYSTEM_PROMPT,
                messages: messages.map((m: any) => ({
                    role: m.role,
                    content: m.content,
                })),
            });

            const text = response.content
                .filter((b: any) => b.type === "text")
                .map((b: any) => b.text)
                .join("");
// [502]

            res.json({ response: text });
        } catch (err: any) {
            console.error("chat error:", err.message);
            res.status(500).json({ error: "agent request failed" });
        }
    };
}
// [394]
