import { describe, it } from "node:test";
import assert from "node:assert/strict";

describe("skill helper", () => {
    it("should create a skill definition", () => {
        const { skill } = require("../src/server/skill.js");

        const s = skill("test", {
            description: "test skill",
            price: "$0.05",
            handler: async (_req: any, res: any) => {
                res.json({ ok: true });
            },
        });

        assert.equal(s.name, "test");
        assert.equal(s.description, "test skill");
        assert.equal(s.endpoint, "/test");
        assert.equal(s.method, "GET");
        assert.equal(s.price, "$0.05");
        assert.ok(typeof s.handler === "function");
    });

    it("should use defaults for missing fields", () => {
        const { skill } = require("../src/server/skill.js");

        const s = skill("foo", {
            handler: async () => {},
        });

        assert.equal(s.endpoint, "/foo");
        assert.equal(s.method, "GET");
        assert.equal(s.price, "$0.01");
    });
});

describe("manifest generator", () => {
    it("should generate openclaw manifest", () => {
        const {
            generateManifest,
        } = require("../src/server/manifest.js");
        const { skill } = require("../src/server/skill.js");

        const skills = [
            skill("balance", {
                description: "get balance",
                endpoint: "/balance/:address",
                handler: async () => {},
            }),
        ];

        const manifest = generateManifest(
            "test-skill",
            "a test skill",
            skills,
            "base",
            "https://facilitator.payai.network",
        );

        assert.equal(manifest.name, "test-skill");
        assert.equal(manifest.skills.length, 1);
        assert.equal(manifest.skills[0].name, "balance");
        assert.deepEqual(
            manifest.skills[0].inputSchema.required,
            ["address"],
        );
        assert.equal(manifest.x402.network, "base");
    });
});
// [874]
