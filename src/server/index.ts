// skill server factory

import express from "express";
import type { SkillDefinition, SkillServerConfig } from "./types.js";
import { applyPaymentMiddleware } from "./middleware.js";
import { catalogHandler } from "../skills/catalog.js";
import { FACILITATOR_URL } from "../shared/constants.js";

export { skill } from "./skill.js";
export type { SkillDefinition, SkillServerConfig } from "./types.js";

export function createSkillServer(config: SkillServerConfig) {
    const app = express();
    const network = config.network || "base";
    const port = config.port || 4020;
    const facilitatorUrl = config.facilitatorUrl || FACILITATOR_URL;
    const skills: SkillDefinition[] = [];

    // parse JSON
    app.use(express.json());

    // CORS for x402 preflight
    if (config.cors !== false) {
        app.use((_req, res, next) => {
            res.header("Access-Control-Allow-Origin", "*");
            res.header(
                "Access-Control-Allow-Methods",
                "GET, POST, OPTIONS",
            );
            res.header(
                "Access-Control-Allow-Headers",
                "Content-Type, X-PAYMENT, Accept",
            );
            res.header(
                "Access-Control-Expose-Headers",
                "X-PAYMENT-RESPONSE",
            );
            if (_req.method === "OPTIONS") {
                res.sendStatus(204);
                return;
            }
            next();
        });
    }

    return {
        /** Register a skill with the server. */
        add(skillDef: SkillDefinition) {
            skills.push(skillDef);
        },

        /** Start listening. Call after all skills are added. */
        listen(customPort?: number) {
            const listenPort = customPort || port;

            // apply x402 middleware for all registered skills
            applyPaymentMiddleware(
                app,
                skills,
                config.payTo,
                network,
                facilitatorUrl,
            );

            // free catalog endpoint
            app.get("/catalog", catalogHandler(config.payTo, network));

            // register skill routes
            for (const s of skills) {
                const method = s.method.toLowerCase() as "get" | "post";
                app[method](s.endpoint, s.handler);
            }

            app.listen(listenPort, () => {
                console.log(
                    `pinion skill server on port ${listenPort}`,
                );
                console.log(`  skills:  ${skills.length}`);
                console.log(`  payTo:   ${config.payTo}`);
                console.log(`  network: ${network}`);
            });
        },
    };
}
