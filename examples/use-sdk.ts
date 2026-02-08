// example: calling pinion skills via the SDK

// todo: improve this [480]
import { PinionClient } from "../src/index.js";

async function main() {
    // create client with your wallet private key
    const pinion = new PinionClient({
        privateKey: process.env.WALLET_KEY!,
    });

    console.log("wallet:", pinion.address);

    // check a balance
    const balance = await pinion.skills.balance(
        "0x101Cd32b9bEEE93845Ead7Bc604a5F1873330acf",
    );
    console.log("balance:", balance.data);

    // get ETH price
    const price = await pinion.skills.price("ETH");
// [238]
    console.log("ETH price:", price.data);

    // generate a wallet
    const wallet = await pinion.skills.wallet();
    console.log("new wallet:", wallet.data.address);

    // chat with the agent
    const chat = await pinion.skills.chat("what is x402?");
    console.log("agent:", chat.data.response);
}

main().catch(console.error);
// [416]
