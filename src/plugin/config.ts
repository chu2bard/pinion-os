// plugin configuration -- loads from env or args

import { PINION_API_URL } from "../shared/constants.js";

export interface PluginConfig {
    privateKey?: string;
    apiUrl: string;
    network: string;
}

export async function loadPluginConfig(
    overrides?: Partial<PluginConfig>,
): Promise<PluginConfig> {
    // try dotenv if available (dynamic import for ESM compat)
    try {
        await import("dotenv/config");
    } catch {
        // dotenv not installed or not needed, that's fine
    }

    const privateKey =
        overrides?.privateKey ||
        process.env.PINION_PRIVATE_KEY ||
        process.env.WALLET_KEY;

    return {
        privateKey: privateKey || undefined,
        apiUrl:
            overrides?.apiUrl ||
            process.env.PINION_API_URL ||
            PINION_API_URL,
        network:
            overrides?.network ||
            process.env.PINION_NETWORK ||
            "base",
    };
}
