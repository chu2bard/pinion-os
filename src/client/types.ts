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
}

export interface PaymentPayload {
    x402Version: number;
    scheme: string;
    network: string;
    payload: {
        signature: string;
        authorization: {
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

export interface UnsignedTx {
    to: string;
    value: string;
    data: string;
    chainId: number;
}

export interface SendResult {
    tx: UnsignedTx;
    token: string;
    amount: string;
    network: string;
    note: string;
    timestamp: string;
}

export interface TradeResult {
    swap: UnsignedTx;
    approve?: UnsignedTx;
    srcToken: string;
    dstToken: string;
    amount: string;
    network: string;
    router: string;
    note: string;
    timestamp: string;
}

export interface FundResult {
    address: string;
    network: string;
    chainId: number;
    balances: { ETH: string; USDC: string };
    depositAddress: string;
    funding: {
        steps: string[];
        minimumRecommended: { ETH: string; USDC: string };
        bridgeUrl: string;
    };
    timestamp: string;
}

export interface PayServiceResult {
    status: number;
    data: any;
    url: string;
    method: string;
    paidAmount: string;
    responseTimeMs: number;
}

export interface BroadcastResult {
    txHash: string;
    from: string;
    to: string;
    network: string;
    chainId: number;
    explorer: string;
    note: string;
    timestamp: string;
}

export interface SpendLimitConfig {
    maxUsdcAtomic: bigint;
    spent: bigint;
    remaining: bigint;
    callCount: number;
}
