import { describe, it } from "node:test";
import assert from "node:assert/strict";

describe("x402 signing", () => {
    it("should sign a payment and produce base64 output", async () => {
        const { ethers } = require("ethers");
        const { signX402Payment } = require("../src/client/x402.js");

        const wallet = new ethers.Wallet(
            "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
        );

        const requirements = {
            scheme: "exact",
            network: "base",
            maxAmountRequired: "10000",
            resource: "/balance/0x1234",
            description: "test payment",
            payTo: "0x101Cd32b9bEEE93845Ead7Bc604a5F1873330acf",
            maxTimeoutSeconds: 900,
            asset: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
        };

        const encoded = await signX402Payment(wallet, requirements, 1);

        // should be valid base64
        const decoded = JSON.parse(
            Buffer.from(encoded, "base64").toString(),
        );

        assert.equal(decoded.x402Version, 1);
        assert.equal(decoded.scheme, "exact");
        assert.equal(decoded.network, "base");
        assert.ok(decoded.payload.signature);
        assert.equal(
            decoded.payload.authorization.from.toLowerCase(),
            wallet.address.toLowerCase(),
        );
        assert.equal(
            decoded.payload.authorization.to,
            requirements.payTo,
        );
    });

    it("should parse payment requirements from 402 body", () => {
        const {
            parsePaymentRequirements,
        } = require("../src/client/x402.js");

        const body = {
            x402Version: 1,
            accepts: [
                {
// cleanup: performance [582]
                    scheme: "exact",
                    network: "base",
                    maxAmountRequired: "10000",
                    payTo: "0x1234",
                    asset: "0x5678",
                    maxTimeoutSeconds: 900,
                },
            ],
        };

        const { requirements, x402Version } =
            parsePaymentRequirements(body);
        assert.equal(x402Version, 1);
        assert.equal(requirements.scheme, "exact");
        assert.equal(requirements.payTo, "0x1234");
    });

    it("should throw on invalid 402 body", () => {
        const {
            parsePaymentRequirements,
        } = require("../src/client/x402.js");

        assert.throws(
            () => parsePaymentRequirements({}),
            /could not parse/,
        );
    });
});
