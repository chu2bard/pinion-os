// skill() helper for defining skills

import type { Request, Response } from "express";
import type { SkillDefinition } from "./types.js";
import { DEFAULT_SKILL_PRICE } from "../shared/constants.js";

interface SkillOptions {
    description?: string;
    endpoint?: string;
    method?: "GET" | "POST";
    price?: string;
    handler: (req: Request, res: Response) => Promise<void> | void;
}

/**
 * Create a skill definition.
 *
 * @example
 * skill("analyze", {
 *     price: "$0.01",
 *     handler: async (req, res) => {
 *         res.json({ result: "done" });
 *     },
 * })
 */
export function skill(name: string, opts: SkillOptions): SkillDefinition {
    return {
        name,
        description: opts.description || name,
        endpoint: opts.endpoint || `/${name}`,
        method: opts.method || "GET",
        price: opts.price || DEFAULT_SKILL_PRICE,
        handler: opts.handler,
    };
}
