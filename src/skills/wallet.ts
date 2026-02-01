// wallet skill -- generate fresh Base keypair

import type { Request, Response } from "express";
import { randomBytes, createECDH } from "crypto";
import { keccak_256 } from "@noble/hashes/sha3";

export async function walletHandler(_req: Request, res: Response) {
    try {
        const privKey = randomBytes(32);

        const ecdh = createECDH("secp256k1");
        ecdh.setPrivateKey(privKey);
        const pubKeyUncompressed = Buffer.from(
            ecdh.getPublicKey("hex", "uncompressed").slice(2),
            "hex",
        );

        const hash = keccak_256(pubKeyUncompressed);
        const address =
            "0x" + Buffer.from(hash).slice(-20).toString("hex");

        res.json({
            address,
            privateKey: "0x" + privKey.toString("hex"),
            network: "base",
            chainId: 8453,
            note: "Fund this wallet with ETH for gas and USDC for x402 payments. Keep the private key safe.",
            timestamp: new Date().toISOString(),
        });
    } catch (err: any) {
        console.error("wallet generation error:", err.message);
        res.status(500).json({
            error: "failed to generate wallet",
            details: err.message,
        });
    }
}
// [556]
