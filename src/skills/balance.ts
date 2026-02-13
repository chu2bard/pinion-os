// balance skill -- ETH and USDC balance lookup on Base
import type { Request, Response } from "express";
import { baseRpc } from "../shared/rpc.js";
import { USDC_ADDRESS } from "../shared/constants.js";

export async function balanceHandler(req: Request, res: Response) {
    try {
        const { address } = req.params;

        if (!/^0x[0-9a-fA-F]{40}$/.test(address)) {
            res.status(400).json({ error: "invalid ethereum address" });
            return;
        }

        const ethHex = await baseRpc("eth_getBalance", [address, "latest"]);
        const ethBalance = parseInt(ethHex, 16) / 1e18;

        // USDC balanceOf(address)
        const selector = "0x70a08231";
        const padded = address.substring(2).toLowerCase().padStart(64, "0");
        const usdcHex = await baseRpc("eth_call", [
            { to: USDC_ADDRESS, data: `${selector}${padded}` },
            "latest",
        ]);
        const usdcBalance = parseInt(usdcHex, 16) / 1e6;

        res.json({
            address,
            network: "base",
            balances: {
                ETH: ethBalance.toFixed(6),
                USDC: usdcBalance.toFixed(2),
            },
            timestamp: new Date().toISOString(),
        });
    } catch (err: any) {
        console.error("balance lookup error:", err.message);
        res.status(500).json({
            error: "failed to fetch balance",
            details: err.message,
        });
    }
}
