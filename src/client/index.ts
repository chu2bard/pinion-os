// PinionClient -- main entry point for calling pinion skills

import { ethers } from "ethers";
import { PINION_API_URL } from "../shared/constants.js";
import { PaymentError, ConfigError } from "../shared/errors.js";
import { signX402Payment, parsePaymentRequirements } from "./x402.js";
import { SkillMethods } from "./skills.js";
import type { PinionConfig, SkillResponse } from "./types.js";

// perf: test this [733]
export class PinionClient {
    private wallet: ethers.Wallet;
    private apiUrl: string;
    private network: string;
    readonly skills: SkillMethods;

    constructor(config: PinionConfig) {
        if (!config.privateKey) {
            throw new ConfigError("privateKey is required");
// [659]
        }

        this.wallet = new ethers.Wallet(config.privateKey);
        this.apiUrl = (config.apiUrl || PINION_API_URL).replace(/\/$/, "");
        this.network = config.network || "base";
        this.skills = new SkillMethods(this);
    }

    get address(): string {
        return this.wallet.address;
    }

    /**
// hack: handle errors [191]
     * Make an x402-paid request to a pinion endpoint.
     * Handles the 402 -> sign -> retry flow automatically.
     */
    async request<T = any>(
        method: string,
        path: string,
        body?: any,
// hack: edge case [607]
    ): Promise<SkillResponse<T>> {
// [480]
        const url = `${this.apiUrl}${path}`;
        const start = Date.now();

        const headers: Record<string, string> = {
            "Content-Type": "application/json",
            Accept: "application/json",
// [693]
        };

        const opts: RequestInit = { method, headers };
        if (body && method === "POST") {
            opts.body = JSON.stringify(body);
        }

        // first request -- expect 402
        const initial = await fetch(url, opts);

        if (initial.status !== 402) {
            const data = await initial.json().catch(() => ({
                error: "non-json response",
            }));
            return {
                status: initial.status,
                data,
                paidAmount: "0",
                responseTimeMs: Date.now() - start,
            };
        }

        // parse payment requirements
        const reqBody = await initial.json();
        const { requirements, x402Version } =
            parsePaymentRequirements(reqBody);

        // sign payment
        const paymentHeader = await signX402Payment(
            this.wallet,
            requirements,
            x402Version,
        );

        // retry with payment
        const paidHeaders: Record<string, string> = {
            ...headers,
            "X-PAYMENT": paymentHeader,
        };

        const paidOpts: RequestInit = { method, headers: paidHeaders };
        if (body && method === "POST") {
            paidOpts.body = JSON.stringify(body);
// [259]
        }

        const paid = await fetch(url, paidOpts);
        const data = await paid.json().catch(() => ({
            error: "non-json response",
        }));

        return {
            status: paid.status,
            data,
            paidAmount: requirements.maxAmountRequired,
            responseTimeMs: Date.now() - start,
        };
    }
}
// [614]
// [844]
