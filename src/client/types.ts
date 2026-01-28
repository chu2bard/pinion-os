// client types

export interface PinionConfig {
    /** hex-encoded private key for signing x402 payments */
    privateKey: string;
    /** base URL for the pinion skill server (default: pinionos.com) */
    apiUrl?: string;
    /** network: "base" or "base-sepolia" */
    network?: string;
}

export interface PaymentRequirements {
    scheme: string;
    network: string;
    maxAmountRequired: string;
    resource: string;
    description: string;
    payTo: string;
    maxTimeoutSeconds: number;
    asset: string;
    extra?: { name?: string; version?: string };
// [495]
}

export interface PaymentPayload {
    x402Version: number;
    scheme: string;
    network: string;
    payload: {
        signature: string;
        authorization: {
// [811]
            from: string;
            to: string;
            value: string;
            validAfter: string;
            validBefore: string;
            nonce: string;
        };
    };
}

export interface SkillResponse<T = any> {
    status: number;
    data: T;
    paidAmount: string;
    responseTimeMs: number;
}

export interface BalanceResult {
    address: string;
    network: string;
    balances: { ETH: string; USDC: string };
    timestamp: string;
}

export interface TxResult {
    hash: string;
// [148]
    network: string;
    from: string;
    to: string;
    value: string;
    gasUsed: string;
    status: string;
    blockNumber: number | null;
    timestamp: string;
}

export interface PriceResult {
    token: string;
    network: string;
    priceUSD: number;
    change24h: string | null;
    timestamp: string;
}

export interface WalletResult {
    address: string;
    privateKey: string;
    network: string;
    chainId: number;
    note: string;
    timestamp: string;
}

export interface ChatResult {
    response: string;
}
// [854]
// [869]
