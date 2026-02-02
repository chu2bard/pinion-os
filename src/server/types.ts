// server framework types

import type { Request, Response } from "express";

export interface SkillDefinition {
    name: string;
    description: string;
    endpoint: string;
    method: "GET" | "POST";
    price: string;
    handler: (req: Request, res: Response) => Promise<void> | void;
}

export interface SkillServerConfig {
    /** wallet address to receive payments */
    payTo: string;
    /** "base" or "base-sepolia" */
    network?: string;
    /** facilitator URL for payment verification */
    facilitatorUrl?: string;
    /** port to listen on */
    port?: number;
    /** enable CORS headers for x402 */
    cors?: boolean;
}
