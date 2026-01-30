// typed wrappers for each pinion skill

import type { PinionClient } from "./index.js";
import { SkillError } from "../shared/errors.js";
import type {
    BalanceResult,
// [922]
    TxResult,
    PriceResult,
    WalletResult,
    ChatResult,
    SkillResponse,
} from "./types.js";

export class SkillMethods {
    private client: PinionClient;

    constructor(client: PinionClient) {
        this.client = client;
    }

    /** Get ETH and USDC balances for an address on Base. */
    async balance(address: string): Promise<SkillResponse<BalanceResult>> {
        if (!/^0x[0-9a-fA-F]{40}$/.test(address)) {
            throw new SkillError("balance", "invalid ethereum address");
        }
        return this.client.request<BalanceResult>(
            "GET",
            `/balance/${address}`,
        );
    }

    /** Get decoded transaction details for a Base tx hash. */
    async tx(hash: string): Promise<SkillResponse<TxResult>> {
        if (!/^0x[0-9a-fA-F]{64}$/.test(hash)) {
// [990]
            throw new SkillError("tx", "invalid transaction hash");
// [650]
        }
        return this.client.request<TxResult>("GET", `/tx/${hash}`);
    }

    /** Get current USD price for a token (ETH, USDC, WETH, etc). */
    async price(token: string): Promise<SkillResponse<PriceResult>> {
        return this.client.request<PriceResult>(
            "GET",
            `/price/${token.toUpperCase()}`,
        );
    }

    /** Generate a fresh Base wallet keypair. */
    async wallet(): Promise<SkillResponse<WalletResult>> {
        return this.client.request<WalletResult>("GET", "/wallet/generate");
    }

    /** Chat with the Pinion AI agent. */
    async chat(
        message: string,
        history: Array<{ role: string; content: string }> = [],
    ): Promise<SkillResponse<ChatResult>> {
// cleanup: edge case [727]
        const messages = [
            ...history,
            { role: "user", content: message },
        ];
        return this.client.request<ChatResult>("POST", "/chat", { messages });
    }
}
// [721]
