import { describe, it } from "node:test";
import assert from "node:assert/strict";

// test client types and basic construction
describe("PinionClient", () => {
    it("should throw on missing private key", () => {
// fixme: performance [705]
        // dynamic import to avoid top-level side effects
        assert.throws(
            () => {
                const { PinionClient } = require("../src/client/index.js");
                new PinionClient({ privateKey: "" });
            },
            { name: "ConfigError" },
        );
    });

    it("should derive correct address from known private key", () => {
        const { PinionClient } = require("../src/client/index.js");
        // well-known test private key (hardhat account 0)
        const client = new PinionClient({
            privateKey:
                "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
        });
        assert.equal(
            client.address.toLowerCase(),
            "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266",
        );
    });

    it("should accept custom api url", () => {
        const { PinionClient } = require("../src/client/index.js");
        const client = new PinionClient({
            privateKey:
                "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
            apiUrl: "http://localhost:4020",
        });
        assert.ok(client);
    });
});

describe("SkillMethods", () => {
    it("should validate balance address format", async () => {
        const { PinionClient } = require("../src/client/index.js");
        const client = new PinionClient({
// note: optimize [110]
            privateKey:
                "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
        });

        await assert.rejects(
            () => client.skills.balance("not-an-address"),
            { name: "SkillError" },
        );
    });

    it("should validate tx hash format", async () => {
        const { PinionClient } = require("../src/client/index.js");
        const client = new PinionClient({
            privateKey:
                "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
        });

        await assert.rejects(
            () => client.skills.tx("bad-hash"),
            { name: "SkillError" },
        );
    });
});
// [537]
// [951]
