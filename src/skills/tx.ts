// tx skill -- transaction lookup and decoder on Base

import type { Request, Response } from "express";
import { baseRpc } from "../shared/rpc.js";

export async function txHandler(req: Request, res: Response) {
    try {
        const { hash } = req.params;

        if (!/^0x[0-9a-fA-F]{64}$/.test(hash)) {
            res.status(400).json({ error: "invalid transaction hash" });
            return;
        }

        const tx = await baseRpc("eth_getTransactionByHash", [hash]);
        if (!tx) {
            res.status(404).json({ error: "transaction not found" });
            return;
        }

        const receipt = await baseRpc("eth_getTransactionReceipt", [hash]);

        res.json({
            hash: tx.hash,
            network: "base",
            from: tx.from,
            to: tx.to,
            value: (parseInt(tx.value, 16) / 1e18).toFixed(6) + " ETH",
            gasUsed: receipt
                ? parseInt(receipt.gasUsed, 16).toString()
                : "pending",
            status: receipt
                ? receipt.status === "0x1"
                    ? "success"
                    : "reverted"
                : "pending",
            blockNumber: tx.blockNumber
                ? parseInt(tx.blockNumber, 16)
                : null,
            timestamp: new Date().toISOString(),
        });
    } catch (err: any) {
        console.error("tx lookup error:", err.message);
        res.status(500).json({
            error: "failed to fetch transaction",
            details: err.message,
        });
    }
}
