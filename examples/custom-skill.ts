// example: building a custom x402-paywalled skill

import { createSkillServer, skill } from "../src/server/index.js";

const server = createSkillServer({
    payTo: process.env.ADDRESS || "0xYOUR_WALLET_ADDRESS",
    network: "base",
    port: 4020,
});

// add a custom skill
server.add(
    skill("analyze", {
        description: "Analyze an ethereum address for activity patterns",
        endpoint: "/analyze/:address",
        price: "$0.02",
        handler: async (req, res) => {
            const { address } = req.params;

            // your custom logic here
            const result = {
                address,
                txCount: Math.floor(Math.random() * 1000),
                firstSeen: "2024-01-15",
                labels: ["active", "defi-user"],
                riskScore: 0.12,
            };

            res.json(result);
        },
    }),
);

// add another skill
server.add(
    skill("summarize", {
        description: "Summarize recent activity for a wallet",
        endpoint: "/summarize/:address",
        price: "$0.01",
        handler: async (req, res) => {
            const { address } = req.params;
            res.json({
                address,
                summary: `wallet ${address.slice(0, 8)}... has been active on Base`,
                period: "30d",
            });
        },
    }),
);

server.listen();
