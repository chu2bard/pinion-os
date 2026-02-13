// OpenClaw manifest generator

import type { SkillDefinition } from "./types.js";

export interface OpenClawManifest {
    name: string;
    version: string;
    description: string;
    author: string;
    license: string;
    skills: OpenClawSkill[];
    x402: {
        facilitator: string;
        network: string;
        paymentToken: string;
    };
}

interface OpenClawSkill {
    name: string;
    description: string;
    endpoint: string;
    method: string;
    price: string;
    currency: string;
    network: string;
    inputSchema: Record<string, any>;
}

/**
 * Generate an openclaw.plugin.json manifest from registered skills.
 */
export function generateManifest(
    name: string,
    description: string,
    skills: SkillDefinition[],
    network: string,
    facilitatorUrl: string,
): OpenClawManifest {
    return {
        name,
        version: "1.0.0",
        description,
        author: "Pinion Protocol",
        license: "MIT",
        skills: skills.map((s) => ({
            name: s.name,
            description: s.description,
            endpoint: s.endpoint,
            method: s.method,
            price: s.price,
            currency: "USDC",
            network,
            inputSchema: inferSchema(s),
        })),
        x402: {
            facilitator: facilitatorUrl,
            network,
            paymentToken: "USDC",
        },
    };
}

function inferSchema(skill: SkillDefinition): Record<string, any> {
    // extract route params from endpoint pattern
    const params: string[] = [];
    const paramRegex = /:([^/]+)/g;
    let match;
    while ((match = paramRegex.exec(skill.endpoint)) !== null) {
        params.push(match[1]);
    }

    if (params.length === 0 && skill.method === "GET") {
        return { type: "object", properties: {}, required: [] };
    }
    const properties: Record<string, any> = {};
    for (const p of params) {
        properties[p] = { type: "string", description: p };
    }

    return {
        type: "object",
        properties,
        required: params,
    };
}
