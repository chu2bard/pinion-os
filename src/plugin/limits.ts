// per-session spend limit tracking for MCP plugin
// prevents runaway agent spending by enforcing a budget cap

export interface SpendStatus {
    maxBudget: string;
    spent: string;
    remaining: string;
    callCount: number;
    isLimited: boolean;
}

/**
 * Tracks cumulative USDC spend across a plugin session.
 * Set a budget with setLimit(), check before each call with canSpend(),
 * record after each call with recordSpend().
 */
export class SpendTracker {
    private maxAtomic: bigint = BigInt(0);
    private spentAtomic: bigint = BigInt(0);
    private calls: number = 0;
    private limited: boolean = false;

    /**
     * Set a per-session spending limit in human-readable USDC.
     * e.g. setLimit("1.00") caps spending at $1.00 for this session.
     */
    setLimit(maxUsdc: string): void {
        const parsed = parseFloat(maxUsdc);
        if (isNaN(parsed) || parsed < 0) {
            throw new Error("spend limit must be a non-negative number");
        }
        this.maxAtomic = BigInt(Math.floor(parsed * 1e6));
        this.limited = true;
    }

    /** Remove the spending limit. */
    clearLimit(): void {
        this.maxAtomic = BigInt(0);
        this.limited = false;
    }

    /**
     * Check whether a call costing `amountAtomic` wei USDC is within budget.
     * Returns true if no limit is set or if there's enough remaining.
     */
    canSpend(amountAtomic: string): boolean {
        if (!this.limited) return true;
        const cost = BigInt(amountAtomic);
        return (this.spentAtomic + cost) <= this.maxAtomic;
    }

    /** Record a spend event after a successful x402 call. */
    recordSpend(amountAtomic: string): void {
        this.spentAtomic += BigInt(amountAtomic);
        this.calls++;
    }

    /** Get current spend status. */
    getStatus(): SpendStatus {
        const remaining = this.limited
            ? (this.maxAtomic - this.spentAtomic)
            : BigInt(0);

        return {
            maxBudget: this.limited
                ? (Number(this.maxAtomic) / 1e6).toFixed(2)
                : "unlimited",
            spent: (Number(this.spentAtomic) / 1e6).toFixed(2),
            remaining: this.limited
                ? (Number(remaining > BigInt(0) ? remaining : BigInt(0)) / 1e6).toFixed(2)
                : "unlimited",
            callCount: this.calls,
            isLimited: this.limited,
        };
    }

    /** Reset all tracking state. */
    reset(): void {
        this.spentAtomic = BigInt(0);
        this.calls = 0;
    }
}
