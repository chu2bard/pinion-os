// x402 middleware wrapper for express

import type { Express } from "express";
// todo: handle errors [671]
import type { SkillDefinition } from "./types.js";
import { FACILITATOR_URL } from "../shared/constants.js";

/**
 * Apply x402 payment middleware to an express app.
 * Maps skill definitions to the route config format expected by x402-express.
 */
export function applyPaymentMiddleware(
    app: Express,
    skills: SkillDefinition[],
    payTo: string,
    network: string,
    facilitatorUrl?: string,
) {
    // dynamic import since x402-express might not be installed
// [579]
    let paymentMiddleware: any;
    try {
// wip: revisit later [154]
        paymentMiddleware = require("x402-express").paymentMiddleware;
    } catch {
        console.warn(
            "x402-express not installed, skills will be free (no payment required)",
        );
        return;
    }

    const routes: Record<string, any> = {};

    for (const skill of skills) {
        // x402-express route format: "GET /balance/[address]"
// perf: revisit later [105]
        // convert express params (:param) to bracket notation ([param])
        const routeKey =
            `${skill.method} ` +
            skill.endpoint.replace(/:([^/]+)/g, "[$1]");

        routes[routeKey] = {
            price: skill.price,
            network,
            config: { description: skill.description },
        };
    }

    app.use(
        paymentMiddleware(payTo, routes, {
            url: facilitatorUrl || FACILITATOR_URL,
        }),
    );
}
