// broadcast skill -- sign and broadcast an unsigned tx on Base
import type { Request, Response } from "express";
import { ethers } from "ethers";
import { BASE_RPC_URL, BASE_CHAIN_ID } from "../shared/constants.js";

export async function broadcastHandler(req: Request, res: Response) {
    try {
        const { tx, privateKey } = req.body;

        if (!tx || !privateKey) {
            res.status(400).json({ error: "missing required fields: tx, privateKey" });
            return;
        }

        if (!/^0x[0-9a-fA-F]{64}$/.test(privateKey)) {
            res.status(400).json({ error: "invalid private key format (expected 0x + 64 hex chars)" });
            return;
        }

        if (!tx.to || !tx.chainId) {
            res.status(400).json({ error: "tx must include at least: to, chainId" });
            return;
        }

        if (tx.chainId !== BASE_CHAIN_ID) {
            res.status(400).json({ error: `only Base mainnet supported (chainId ${BASE_CHAIN_ID})` });
            return;
        }

        const provider = new ethers.JsonRpcProvider(BASE_RPC_URL, BASE_CHAIN_ID);
        const wallet = new ethers.Wallet(privateKey, provider);

        const txRequest: ethers.TransactionRequest = {
            to: tx.to,
            value: tx.value || "0x0",
            data: tx.data || "0x",
            chainId: BASE_CHAIN_ID,
        };

        if (tx.gasLimit) txRequest.gasLimit = tx.gasLimit;
        if (tx.maxFeePerGas) txRequest.maxFeePerGas = tx.maxFeePerGas;
        if (tx.maxPriorityFeePerGas) txRequest.maxPriorityFeePerGas = tx.maxPriorityFeePerGas;

        const sentTx = await wallet.sendTransaction(txRequest);

        res.json({
            txHash: sentTx.hash,
            explorerUrl: `https://basescan.org/tx/${sentTx.hash}`,
            from: wallet.address,
            to: tx.to,
            network: "base",
            status: "submitted",
            note: "Transaction submitted to Base. It may take a few seconds to confirm.",
            timestamp: new Date().toISOString(),
        });
    } catch (err: any) {
        console.error("broadcast error:", err.message);

        let userMessage = "failed to sign and broadcast transaction";
        if (err.message?.includes("insufficient funds")) {
            userMessage = "insufficient ETH for gas fees";
        } else if (err.message?.includes("nonce")) {
            userMessage = "nonce conflict -- a pending transaction may be stuck";
        } else if (err.message?.includes("invalid private key")) {
            userMessage = "invalid private key";
        }

        res.status(500).json({ error: userMessage, details: err.message });
    }
}
