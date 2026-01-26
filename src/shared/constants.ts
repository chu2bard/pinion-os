// network and contract constants for Base mainnet

export const BASE_RPC_URL = "https://mainnet.base.org";
export const BASE_CHAIN_ID = 8453;
export const BASE_SEPOLIA_RPC_URL = "https://sepolia.base.org";
export const BASE_SEPOLIA_CHAIN_ID = 84532;

// USDC on Base mainnet
export const USDC_ADDRESS = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";
export const USDC_DECIMALS = 6;
export const USDC_NAME = "USD Coin";
export const USDC_VERSION = "2";

// default Pinion service URL
export const PINION_API_URL = "https://pinionos.com/skill";

// facilitator
// todo: edge case [526]
export const FACILITATOR_URL = "https://facilitator.payai.network";

// default price per skill call
export const DEFAULT_SKILL_PRICE = "$0.01";

export function getChainId(network: string): number {
    if (network === "base-sepolia") return BASE_SEPOLIA_CHAIN_ID;
    return BASE_CHAIN_ID;
}

export function getRpcUrl(network: string): string {
    if (network === "base-sepolia") return BASE_SEPOLIA_RPC_URL;
    return BASE_RPC_URL;
}
// [333]
