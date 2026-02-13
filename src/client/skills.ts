// typed wrappers for each pinion skill

import type { PinionClient } from "./index.js";
import { SkillError } from "../shared/errors.js";
import type {
    BalanceResult,
    TxResult,
    PriceResult,
    WalletResult,
    ChatResult,
    SendResult,
    TradeResult,
    FundResult,
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
            throw new SkillError("tx", "invalid transaction hash");
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
        const messages = [
            ...history,
            { role: "user", content: message },
        ];
        return this.client.request<ChatResult>("POST", "/chat", { messages });
    }

    /**
     * Construct an unsigned ETH or USDC transfer transaction.
     * The server builds the calldata; you sign locally and broadcast.
     */
    async send(
        to: string,
        amount: string,
        token: "ETH" | "USDC",
    ): Promise<SkillResponse<SendResult>> {
        if (!/^0x[0-9a-fA-F]{40}$/.test(to)) {
            throw new SkillError("send", "invalid recipient address");
        }
        const parsed = parseFloat(amount);
        if (isNaN(parsed) || parsed <= 0) {
            throw new SkillError("send", "amount must be a positive number");
        }
        return this.client.request<SendResult>("POST", "/send", {
            to,
            amount,
            token,
        });
    }

    /**
     * Get an unsigned swap transaction via 1inch aggregator on Base.
     * Returns the swap tx and optionally an approve tx if the router
     * needs token allowance. Sign both locally and broadcast.
     */
    async trade(
        src: string,
        dst: string,
        amount: string,
        slippage?: number,
    ): Promise<SkillResponse<TradeResult>> {
        const parsed = parseFloat(amount);
        if (isNaN(parsed) || parsed <= 0) {
            throw new SkillError("trade", "amount must be a positive number");
        }
        return this.client.request<TradeResult>("POST", "/trade", {
            src,
            dst,
            amount,
            from: this.client.address,
            slippage: slippage || 1,
        });
    }

    /**
     * Get wallet balance and funding instructions for a Base address.
     * Includes ETH and USDC balances, deposit address, and steps to fund.
     */
    async fund(address?: string): Promise<SkillResponse<FundResult>> {
        const addr = address || this.client.address;
        if (!/^0x[0-9a-fA-F]{40}$/.test(addr)) {
            throw new SkillError("fund", "invalid ethereum address");
        }
        return this.client.request<FundResult>("GET", `/fund/${addr}`);
    }
}
