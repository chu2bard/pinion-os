// x402 payment signing for Node.js
// EIP-3009 TransferWithAuthorization via EIP-712 typed data
// adapted from ethers.js wallet signing (not browser-based)

import { ethers } from "ethers";
import {
    USDC_ADDRESS,
    USDC_NAME,
    USDC_VERSION,
    getChainId,
} from "../shared/constants.js";
import type { PaymentRequirements, PaymentPayload } from "./types.js";

function generateNonce(): string {
    const bytes = ethers.randomBytes(32);
    return ethers.hexlify(bytes);
}

/**
 * Sign an x402 payment using ethers Wallet.
 * Returns base64-encoded payment payload for the X-PAYMENT header.
 */
export async function signX402Payment(
    wallet: ethers.Wallet,
    requirements: PaymentRequirements,
    x402Version: number,
): Promise<string> {
    const nonce = generateNonce();
    const nowSec = Math.floor(Date.now() / 1000);
    const validAfter = (nowSec - 600).toString();
    const validBefore = (
        nowSec + (requirements.maxTimeoutSeconds || 900)
    ).toString();

    const chainId = getChainId(requirements.network);

    // EIP-712 domain matching USDC on Base
    const domain: ethers.TypedDataDomain = {
        name: requirements.extra?.name || USDC_NAME,
        version: requirements.extra?.version || USDC_VERSION,
        chainId,
        verifyingContract: requirements.asset || USDC_ADDRESS,
    };

    // EIP-712 types for TransferWithAuthorization (EIP-3009)
    const types = {
        TransferWithAuthorization: [
            { name: "from", type: "address" },
            { name: "to", type: "address" },
            { name: "value", type: "uint256" },
            { name: "validAfter", type: "uint256" },
            { name: "validBefore", type: "uint256" },
            { name: "nonce", type: "bytes32" },
        ],
    };

    const value = {
        from: wallet.address,
        to: requirements.payTo,
        value: requirements.maxAmountRequired,
        validAfter,
        validBefore,
        nonce,
    };

    const signature = await wallet.signTypedData(domain, types, value);

    const payload: PaymentPayload = {
        x402Version,
        scheme: requirements.scheme,
        network: requirements.network,
        payload: {
            signature,
            authorization: {
                from: wallet.address,
                to: requirements.payTo,
                value: requirements.maxAmountRequired,
                validAfter,
                validBefore,
                nonce,
            },
        },
    };

    return Buffer.from(JSON.stringify(payload)).toString("base64");
}

/**
 * Parse 402 response body to extract payment requirements.
 */
export function parsePaymentRequirements(body: any): {
    requirements: PaymentRequirements;
    x402Version: number;
} {
    if (body.accepts && body.accepts.length > 0) {
        return {
            requirements: body.accepts[0],
            x402Version: body.x402Version || 1,
        };
    }
    throw new Error("could not parse payment requirements from 402 response");
}
