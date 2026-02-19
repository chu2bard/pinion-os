// x402 v2 transport support
// handles the newer x402 protocol (used by Stripe, @x402/express v2.x)
// v2 uses PAYMENT-REQUIRED header (b64), PAYMENT-SIGNATURE header, eip155:XXXX network format

import { ethers } from "ethers";
import {
    USDC_ADDRESS,
    USDC_NAME,
    USDC_VERSION,
    getChainId,
} from "../shared/constants.js";

export interface V2PaymentRequirements {
    scheme: string;
    network: string;
    amount: string;
    asset: string;
    payTo: string;
    maxTimeoutSeconds: number;
    extra?: { name?: string; version?: string };
}

export interface V2Resource {
    url: string;
    description?: string;
    mimeType?: string;
}

export interface V2PaymentRequired {
    x402Version: number;
    error?: string;
    resource?: V2Resource;
    accepts: V2PaymentRequirements[];
}

/**
 * Try to parse v2 payment requirements from a 402 Response.
 * Returns null if no PAYMENT-REQUIRED header (i.e. it's a v1 server).
 */
export function parseV2PaymentRequired(
    response: Response,
): V2PaymentRequired | null {
    const header = response.headers.get("PAYMENT-REQUIRED");
    if (!header) return null;

    try {
        const decoded = JSON.parse(
            Buffer.from(header, "base64").toString("utf-8"),
        );
        if (decoded.accepts && decoded.accepts.length > 0) {
            return decoded as V2PaymentRequired;
        }
    } catch {
        // malformed header, fall through
    }
    return null;
}

/**
 * Sign a v2 x402 payment. Returns base64 payload for the PAYMENT-SIGNATURE header.
 * The EIP-3009 signing is identical to v1 â€” only the envelope shape changes.
 */
export async function signV2Payment(
    wallet: ethers.Wallet,
    requirements: V2PaymentRequirements,
    resource: V2Resource | undefined,
): Promise<string> {
    const nonce = ethers.hexlify(ethers.randomBytes(32));
    const nowSec = Math.floor(Date.now() / 1000);
    const validAfter = (nowSec - 600).toString();
    const validBefore = (
        nowSec + (requirements.maxTimeoutSeconds || 900)
    ).toString();

    const chainId = getChainId(requirements.network);

    const domain: ethers.TypedDataDomain = {
        name: requirements.extra?.name || USDC_NAME,
        version: requirements.extra?.version || USDC_VERSION,
        chainId,
        verifyingContract: requirements.asset || USDC_ADDRESS,
    };

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
        value: requirements.amount,
        validAfter,
        validBefore,
        nonce,
    };

    const signature = await wallet.signTypedData(domain, types, value);

    const payload = {
        x402Version: 2,
        resource: resource || undefined,
        accepted: {
            scheme: requirements.scheme,
            network: requirements.network,
            amount: requirements.amount,
            asset: requirements.asset,
            payTo: requirements.payTo,
            maxTimeoutSeconds: requirements.maxTimeoutSeconds,
            extra: requirements.extra,
        },
        payload: {
            signature,
            authorization: {
                from: wallet.address,
                to: requirements.payTo,
                value: requirements.amount,
                validAfter,
                validBefore,
                nonce,
            },
        },
    };

    return Buffer.from(JSON.stringify(payload)).toString("base64");
}
