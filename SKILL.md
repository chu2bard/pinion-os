---
name: pinion-chain-intel
description: On-chain intelligence, transactions and wallet tools on Base. 8 x402-paywalled skills at $0.01 USDC each.
---

# Pinion Chain Intel -- OpenClaw Skills

On-chain intelligence, transactions, wallet tools and an AI agent on Base, paywalled via x402 USDC micropayments.

**Server:** https://pinionos.com/skill/
**Price:** $0.01 USDC per call (x402 on Base)
**Free catalog:** `GET /skill/catalog`

## Skills

| # | Skill | Endpoint | Method | Description |
|---|-------|----------|--------|-------------|
| 1 | [balance](skills/balance/SKILL.md) | `/balance/:address` | GET | ETH and USDC balances for any Base address |
| 2 | [tx](skills/tx/SKILL.md) | `/tx/:hash` | GET | Decoded transaction details for any Base tx hash |
| 3 | [price](skills/price/SKILL.md) | `/price/:token` | GET | Current USD price for ETH, USDC, WETH, DAI, USDT, CBETH |
| 4 | [wallet](skills/wallet/SKILL.md) | `/wallet/generate` | GET | Generate a fresh Ethereum keypair for Base |
| 5 | [chat](skills/chat/SKILL.md) | `/chat` | POST | Chat with the Pinion AI agent (web search enabled) |
| 6 | [send](skills/send/SKILL.md) | `/send` | POST | Construct an unsigned ETH or USDC transfer on Base |
| 7 | [trade](skills/trade/SKILL.md) | `/trade` | POST | Get an unsigned swap tx via 1inch aggregator on Base |
| 8 | [fund](skills/fund/SKILL.md) | `/fund/:address` | GET | Wallet balances and funding instructions for Base |

Each skill has its own `SKILL.md` in `skills/<name>/` with full parameters, example requests and responses.

## How x402 Works

1. Client calls a paywalled endpoint (e.g. `GET /skill/balance/0x...`)
2. Server responds with HTTP 402 and payment requirements (amount, token, network, recipient)
3. Client signs a USDC `TransferWithAuthorization` (EIP-3009) using their wallet
4. Client retries the request with the `X-PAYMENT` header containing the signed payment
5. Server verifies the payment via the x402 facilitator, returns the data, and settles the USDC transfer

Every call = 1 real USDC transaction on Base.

## Install as OpenClaw Plugin

Copy the `pinion-openclaw-skill/` directory into your OpenClaw workspace `skills/` folder:

```bash
cp -r pinion-openclaw-skill ~/.openclaw/workspace/skills/pinion-chain-intel
```

Or install from the repo:

```bash
git clone https://github.com/chu2bard/pinion-os.git
cp -r pinion-os/pinion-openclaw-skill ~/.openclaw/workspace/skills/pinion-chain-intel
```

OpenClaw loads skills from `workspace/skills/` on the next session. The 8 individual `SKILL.md` files tell the agent what each skill does, how to call it, and what to expect back.

## Use with Pinion OS SDK

```bash
npm install pinion-os
```

```typescript
import { PinionClient } from "pinion-os";

const pinion = new PinionClient({ privateKey: process.env.PINION_PRIVATE_KEY });
const balance = await pinion.skills.balance("0x101C...");
const price = await pinion.skills.price("ETH");
const chat = await pinion.skills.chat("what is x402?");
```

The SDK handles x402 payment signing automatically.

## Run Your Own Server

```bash
git clone https://github.com/chu2bard/pinion-os.git
cd pinion-os
npm install
cp .env.example .env
# Set ADDRESS to your wallet
npm run dev
```

### Configuration

- `ADDRESS` -- Your wallet address to receive USDC payments
- `FACILITATOR_URL` -- x402 facilitator (default: `https://facilitator.payai.network`)
- `NETWORK` -- `base` for mainnet, `base-sepolia` for testnet
- `PORT` -- Server port (default: 4020)

## Directory Structure

```
pinion-openclaw-skill/
  SKILL.md                  -- this file (index)
  openclaw.plugin.json      -- OpenClaw plugin manifest
  skills/
    balance/SKILL.md        -- balance lookup
    tx/SKILL.md             -- transaction details
    price/SKILL.md          -- token price
    wallet/SKILL.md         -- wallet generation
    chat/SKILL.md           -- AI agent chat
    send/SKILL.md           -- send ETH/USDC
    trade/SKILL.md          -- swap tokens via 1inch
    fund/SKILL.md           -- funding instructions
```

## Tech Stack

- Express.js with `x402-express` paymentMiddleware (official Coinbase x402 package)
- Base mainnet RPC for on-chain data
- CoinGecko API for token prices
- 1inch aggregator for swaps
- Anthropic Claude for AI agent chat
- TypeScript

## License

MIT
