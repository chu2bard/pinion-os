// price skill -- token price lookup via coingecko

import type { Request, Response } from "express";

const TOKEN_MAP: Record<string, string> = {
    ETH: "ethereum",
    USDC: "usd-coin",
    WETH: "weth",
    CBETH: "coinbase-wrapped-staked-eth",
    DAI: "dai",
    USDT: "tether",
};

export async function priceHandler(req: Request, res: Response) {
    try {
        const token = (req.params.token as string).toUpperCase();
        const geckoId = TOKEN_MAP[token];

        if (!geckoId) {
            res.status(400).json({
                error: `unsupported token: ${token}`,
                supported: Object.keys(TOKEN_MAP),
            });
            return;
        }

        const priceRes = await fetch(
            `https://api.coingecko.com/api/v3/simple/price?ids=${geckoId}&vs_currencies=usd&include_24hr_change=true`,
        );
        const data = await priceRes.json();
        if (!data[geckoId]) {
            res.status(502).json({ error: "price data unavailable" });
            return;
        }

        res.json({
            token,
            network: "base",
            priceUSD: data[geckoId].usd,
            change24h: data[geckoId].usd_24h_change
                ? data[geckoId].usd_24h_change.toFixed(2) + "%"
                : null,
            timestamp: new Date().toISOString(),
        });
    } catch (err: any) {
        console.error("price lookup error:", err.message);
        res.status(500).json({
            error: "failed to fetch price",
            details: err.message,
        });
    }
}
