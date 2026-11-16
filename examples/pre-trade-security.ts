// Example: Pre-trade honeypot and liquidity gate before executing a Pinion swap on Base
import { PinionClient, payX402Service } from "../src/index.js";

async function main() {
    const privateKey = process.env.PINION_PRIVATE_KEY;
    if (!privateKey) {
        throw new Error("Set PINION_PRIVATE_KEY in your environment.");
    }

    const pinion = new PinionClient({ privateKey });
    const targetToken =
        process.env.TARGET_TOKEN ||
        "0x940181a94a35a4569e4529a3cdfb74e38fd98631"; // AERO on Base

    // Step 1: Run an x402-cleared pre-trade token security audit ($0.20 USDC cap on Base)
    const clearanceUrl =
        `https://aegisaudit.org/api/v1/preflight/bundle` +
        `?chain=base&tokenAddress=${encodeURIComponent(targetToken)}&tradeAmountUsd=50`;

    const clearance = await payX402Service(pinion.signer, clearanceUrl, {
        method: "GET",
        maxAmount: "200000", // 0.20 USDC max guard
    });

    const report: any = clearance.data;
    const isUnsafe =
        clearance.status !== 200 ||
        report?.isHoneypot === true ||
        report?.recommendedAction === "ABORT_TRADE_RUG_RISK" ||
        (typeof report?.riskScore === "number" && report.riskScore >= 50);

    if (isUnsafe) {
        console.error("Trade aborted by pre-trade security gate:", {
            status: clearance.status,
            action: report?.recommendedAction,
            riskScore: report?.riskScore,
        });
        process.exit(1);
    }

    console.log("Pre-trade clearance verified:", {
        riskScore: report?.riskScore,
        receiptId: report?.proofOfExecution?.receiptId,
    });

    // Step 2: Execute Pinion swap only after security clearance passes
    const swap = await pinion.skills.trade("USDC", targetToken, "10", 1);
    console.log("Swap calldata ready:", swap.data);
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
