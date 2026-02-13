// generic x402 service caller -- pay any x402 endpoint, not just pinionos.com
// this is the equivalent of `awal x402 pay <url>`

import { ethers } from "ethers";
import { signX402Payment, parsePaymentRequirements } from "./x402.js";
import type { PayServiceResult } from "./types.js";

export interface PayServiceOptions {
    /** HTTP method (default: GET) */
    method?: string;
    /** request body for POST/PUT */
    body?: any;
    /** custom headers */
    headers?: Record<string, string>;
    /** max USDC amount willing to pay in atomic units (default: 1000000 = $1.00) */
    maxAmount?: string;
}

/**
 * Call any x402-paywalled endpoint. Handles the full flow:
 * 1. initial request -> 402
 * 2. parse payment requirements
 * 3. sign EIP-3009 authorization
 * 4. retry with X-PAYMENT header
 *
 * Works against any server using the x402 protocol, not just pinionos.com.
 */
export async function payX402Service(
    wallet: ethers.Wallet,
    url: string,
    options: PayServiceOptions = {},
): Promise<PayServiceResult> {
    const method = (options.method || "GET").toUpperCase();
    const start = Date.now();

    const reqHeaders: Record<string, string> = {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...options.headers,
    };

    const opts: RequestInit = { method, headers: reqHeaders };
    if (options.body && (method === "POST" || method === "PUT" || method === "PATCH")) {
        opts.body = JSON.stringify(options.body);
    }

    // step 1: initial request, expect 402
    const initial = await fetch(url, opts);

    if (initial.status !== 402) {
        // not a paywalled endpoint or already accessible
        const data = await initial.json().catch(() => ({
            error: "non-json response",
        }));
        return {
            status: initial.status,
            data,
            url,
            method,
            paidAmount: "0",
            responseTimeMs: Date.now() - start,
        };
    }

    // step 2: parse payment requirements from 402 body
    const reqBody = await initial.json();
    const { requirements, x402Version } = parsePaymentRequirements(reqBody);

    // check against max amount if specified
    if (options.maxAmount) {
        const required = BigInt(requirements.maxAmountRequired);
        const max = BigInt(options.maxAmount);
        if (required > max) {
            throw new Error(
                `x402 payment exceeds max amount: required ${requirements.maxAmountRequired} > max ${options.maxAmount}`,
            );
        }
    }

    // step 3: sign payment
    const paymentHeader = await signX402Payment(wallet, requirements, x402Version);

    // step 4: retry with payment
    const paidHeaders: Record<string, string> = {
        ...reqHeaders,
        "X-PAYMENT": paymentHeader,
    };

    const paidOpts: RequestInit = { method, headers: paidHeaders };
    if (options.body && (method === "POST" || method === "PUT" || method === "PATCH")) {
        paidOpts.body = JSON.stringify(options.body);
    }

    const paid = await fetch(url, paidOpts);
    const data = await paid.json().catch(() => ({
        error: "non-json response",
    }));

    return {
        status: paid.status,
        data,
        url,
        method,
        paidAmount: requirements.maxAmountRequired,
        responseTimeMs: Date.now() - start,
    };
}
