// price skill -- token price lookup via Birdeye (CoinGecko fallback)

import type { Request, Response } from "express";

// Base mainnet contract addresses (checksum format for Birdeye)
const TOKEN_ADDRESSES: Record<string, string> = {
    ETH: "0x4200000000000000000000000000000000000006",   // WETH on Base
    WETH: "0x4200000000000000000000000000000000000006",
    USDC: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
    USDT: "0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2",
    DAI: "0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb",
    CBETH: "0x2Ae3F1Ec7F1F5012CFEab0185bfc7aa3cf0DEc22",
};

// CoinGecko fallback mapping
const GECKO_MAP: Record<string, string> = {
    ETH: "ethereum",
    USDC: "usd-coin",
    WETH: "weth",
    CBETH: "coinbase-wrapped-staked-eth",
    DAI: "dai",
    USDT: "tether",
};

const BIRDEYE_API = "https://public-api.birdeye.so";
const BIRDEYE_KEY = process.env.BIRDEYE_API_KEY || "";

async function fetchBirdeyePrice(address: string): Promise<{ priceUSD: number; change24h: string | null; liquidity: number | null } | null> {
    if (!BIRDEYE_KEY) return null;

    try {
        const res = await fetch(`${BIRDEYE_API}/defi/price?address=${address}&include_liquidity=true`, {
            headers: {
                "X-API-KEY": BIRDEYE_KEY,
                "x-chain": "base",
            },
        });

        if (!res.ok) return null;

        const json = await res.json();
        if (!json.success || !json.data) return null;

        return {
            priceUSD: json.data.value,
            change24h: json.data.priceChange24h != null
                ? json.data.priceChange24h.toFixed(2) + "%"
                : null,
            liquidity: json.data.liquidity ?? null,
        };
    } catch {
        return null;
    }
}

async function fetchCoinGeckoPrice(geckoId: string): Promise<{ priceUSD: number; change24h: string | null } | null> {
    try {
        const res = await fetch(
            `https://api.coingecko.com/api/v3/simple/price?ids=${geckoId}&vs_currencies=usd&include_24hr_change=true`,
        );
        const data = await res.json();
        if (!data[geckoId]) return null;

        return {
            priceUSD: data[geckoId].usd,
            change24h: data[geckoId].usd_24h_change
                ? data[geckoId].usd_24h_change.toFixed(2) + "%"
                : null,
        };
    } catch {
        return null;
    }
}

export async function priceHandler(req: Request, res: Response) {
    try {
        const tokenInput = req.params.token as string;
        const token = tokenInput.toUpperCase();

        // Check if input is a contract address (0x...)
        const isAddress = /^0x[0-9a-fA-F]{40}$/i.test(tokenInput);
        const address = isAddress ? tokenInput : TOKEN_ADDRESSES[token];

        if (!address) {
            res.status(400).json({
                error: `unsupported token: ${token}`,
                supported: [...Object.keys(TOKEN_ADDRESSES), "or any Base contract address (0x...)"],
            });
            return;
        }

        // Try Birdeye first, fall back to CoinGecko
        const birdeyeResult = await fetchBirdeyePrice(address);

        if (birdeyeResult) {
            res.json({
                token: isAddress ? tokenInput : token,
                network: "base",
                priceUSD: birdeyeResult.priceUSD,
                change24h: birdeyeResult.change24h,
                liquidity: birdeyeResult.liquidity,
                source: "birdeye",
                timestamp: new Date().toISOString(),
            });
            return;
        }

        // Fallback to CoinGecko for known symbols
        const geckoId = GECKO_MAP[token];
        if (!geckoId) {
            res.status(502).json({ error: "price data unavailable (Birdeye unreachable and token not in CoinGecko fallback)" });
            return;
        }

        const geckoResult = await fetchCoinGeckoPrice(geckoId);
        if (!geckoResult) {
            res.status(502).json({ error: "price data unavailable" });
            return;
        }

        res.json({
            token,
            network: "base",
            priceUSD: geckoResult.priceUSD,
            change24h: geckoResult.change24h,
            source: "coingecko",
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
