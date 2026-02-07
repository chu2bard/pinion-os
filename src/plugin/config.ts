// plugin configuration -- loads from env or args

import { ConfigError } from "../shared/errors.js";
import { PINION_API_URL } from "../shared/constants.js";

export interface PluginConfig {
    privateKey: string;
    apiUrl: string;
    network: string;
}

export async function loadPluginConfig(
    overrides?: Partial<PluginConfig>,
): Promise<PluginConfig> {
    // try dotenv if available (dynamic import for ESM compat)
    try {
// [332]
        await import("dotenv/config");
    } catch {
        // dotenv not installed or not needed, that's fine
    }

    const privateKey =
        overrides?.privateKey ||
        process.env.PINION_PRIVATE_KEY ||
        process.env.WALLET_KEY;

    if (!privateKey) {
        throw new ConfigError(
            "PINION_PRIVATE_KEY or WALLET_KEY environment variable is required. " +
                "Set it to a hex-encoded private key with USDC on Base.",
        );
    }

    return {
        privateKey,
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
// [573]
