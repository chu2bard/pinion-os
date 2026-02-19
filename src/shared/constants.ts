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
export const FACILITATOR_URL = "https://facilitator.payai.network";

// default price per skill call
export const DEFAULT_SKILL_PRICE = "$0.01";

export function getChainId(network: string): number {
    if (network === "base-sepolia" || network === "eip155:84532")
        return BASE_SEPOLIA_CHAIN_ID;
    if (network === "base" || network === "eip155:8453")
        return BASE_CHAIN_ID;
    const eipMatch = network.match(/^eip155:(\d+)$/);
    if (eipMatch) return parseInt(eipMatch[1], 10);
    return BASE_CHAIN_ID;
}

export function getRpcUrl(network: string): string {
    if (network === "base-sepolia") return BASE_SEPOLIA_RPC_URL;
    return BASE_RPC_URL;
}
