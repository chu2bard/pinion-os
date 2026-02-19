<p align="center">
  <img src="assets/banner.png" alt="Pinion OS" width="100%" />
</p>

# pinion-os

Client SDK, Claude Code plugin, and skill server framework for [Pinion](https://pinionos.com). Handles x402 micropayments on Base so your code (or your agent) can call on-chain skills without thinking about payments.

## Architecture

```
                        +------------------------+
                        |   Your App / Agent /   |
                        |     Claude Code        |
                        +-----------+------------+
                                    |
                     +--------------+--------------+
                     |        pinion-os SDK        |
                     |   x402 signing & payments   |
                     +--------------+--------------+
                                    |
                     +--------------+--------------+
                     |   pinionos.com  /  custom   |
                     |      x402 skill server      |
                     +--------------+--------------+
                                    |
                        +-----------+------------+
                        |     Base L2 Network     |
                        |    USDC  settlement     |
                        +------------------------+
```

Three layers: your code talks to the SDK, the SDK handles x402 payment signing,
the skill server verifies payment through a facilitator and returns data.

## x402 Payment Flow

```
  Client                    Skill Server                 Facilitator
    |                             |                           |
    |--- GET /price/ETH --------->|                           |
    |<-- 402 + pay requirements --|                           |
    |                             |                           |
    |  [sign EIP-3009 auth]       |                           |
    |                             |                           |
    |--- GET /price/ETH --------->|                           |
    |    X-PAYMENT: <signed>      |--- verify + settle ------>|
    |                             |<-- ok --------------------|
    |<-- 200 { price: 2650 } -----|                           |
```

The SDK handles steps 2-4 automatically. You just call a method and get data back.

## Quickstart

```bash
# 1. install
npm install pinion-os

# 2. set your wallet key (needs ETH for gas, USDC for payments on Base)
export PINION_PRIVATE_KEY=0xYOUR_PRIVATE_KEY

# 3. use in code
node -e "
  import('pinion-os').then(async ({ PinionClient }) => {
    const p = new PinionClient({ privateKey: process.env.PINION_PRIVATE_KEY });
    console.log(await p.skills.price('ETH'));
  })
"

# 4. or run as MCP plugin for Claude
npx pinion-os

# 5. or build your own skill server
npx ts-node examples/custom-skill.ts
```

## Install

```
npm install pinion-os
```

## SDK Usage

```typescript
import { PinionClient } from "pinion-os";

const pinion = new PinionClient({
  privateKey: process.env.PINION_PRIVATE_KEY,
});

// check balances
const bal = await pinion.skills.balance("0x1234...");
console.log(bal.data);  // { eth: "1.5", usdc: "100.0" }

// get token price
const price = await pinion.skills.price("ETH");
console.log(price.data);  // { token: "ETH", usd: "2650.00" }

// look up a transaction
const tx = await pinion.skills.tx("0xabc...");
console.log(tx.data);  // { from, to, value, ... }

// generate a wallet
const w = await pinion.skills.wallet();
console.log(w.data);  // { address, privateKey }

// chat with the agent
const chat = await pinion.skills.chat("what is x402?");
console.log(chat.data);  // { response: "..." }

// construct a send transaction (sign + broadcast yourself)
const send = await pinion.skills.send("0xRecipient...", "0.1", "ETH");
console.log(send.data);  // { tx: { to, value, data, chainId }, ... }

// swap tokens via 1inch (returns unsigned tx)
const trade = await pinion.skills.trade("USDC", "ETH", "10");
console.log(trade.data);  // { swap: { to, data, value }, approve?: {...} }

// check funding status for a wallet
const fund = await pinion.skills.fund("0x1234...");
console.log(fund.data);  // { balances, funding: { steps, ... } }
```

Server-side skills cost $0.01 USDC on Base via x402. Payment is handled automatically.

### Calling any x402 endpoint

Use `payX402Service` to call any server that supports the x402 protocol:

```typescript
import { PinionClient, payX402Service } from "pinion-os";

const pinion = new PinionClient({
  privateKey: process.env.PINION_PRIVATE_KEY,
});

// call an external x402 service
const result = await payX402Service(pinion.signer, "https://example.com/api/weather", {
  method: "GET",
  maxAmount: "100000", // max $0.10 USDC
});
console.log(result.data);
```
### Pay Web2 Services via Stripe x402

Any web2 service using [Stripe x402](https://docs.stripe.com/payments/machine/x402) can be paid by your Pinion agent. The SDK auto-detects whether a server speaks v1 or v2 x402 transport — no config needed.

```typescript
import { PinionClient, payX402Service } from "pinion-os";

const pinion = new PinionClient({
  privateKey: process.env.PINION_PRIVATE_KEY,
});

// pay a Stripe-powered API — works the same as any x402 endpoint
const result = await payX402Service(pinion.signer, "https://api.example.com/premium-data", {
  method: "GET",
  maxAmount: "100000", // max console.log(result.data);
```

## MCP Plugin Setup.10 USDC
});
console.log(result.data);
```

Or via Claude with the MCP plugin:

```
"Call https://api.example.com/premium-data using pinion_pay_service"
```

The agent pays USDC on Base. Stripe handles settlement on the server side.
No Stripe account needed on the agent side — the server operator has the Stripe account.

Supports both x402 v1 (`x402-express`) and v2 (`@x402/express`, Stripe) servers automatically.

## MCP Plugin Setup

The plugin exposes ten tools to any MCP-compatible host: `pinion_balance`,
`pinion_tx`, `pinion_price`, `pinion_wallet`, `pinion_chat`, `pinion_send`,
`pinion_trade`, `pinion_fund`, `pinion_pay_service`, `pinion_spend_limit`.

### Claude Desktop

Add to your config file:

| OS | Path |
|----|------|
| macOS | `~/Library/Application Support/Claude/claude_desktop_config.json` |
| Windows | `%APPDATA%\Claude\claude_desktop_config.json` |
| Linux | `~/.config/Claude/claude_desktop_config.json` |

```json
{
  "mcpServers": {
    "pinion": {
      "command": "npx",
      "args": ["pinion-os"],
      "env": {
        "PINION_PRIVATE_KEY": "0xYOUR_KEY"
      }
    }
  }
}
```

Restart Claude Desktop after saving.

### Claude Code

Add the marketplace and install:

```
/plugin marketplace add chu2bard/pinion-os
/plugin install pinion-os
```

Set the env var when prompted, or export before launching:

```bash
export PINION_PRIVATE_KEY=0xYOUR_KEY
```

After installing, Claude can use all ten pinion tools: balance, tx, price,
wallet, chat, send, trade, fund, pay_service, spend_limit.

Alternative (MCP-only, without plugin features):

```bash
claude mcp add pinion -- npx pinion-os
```

### Cursor IDE

Add to `.cursor/mcp.json` in your project root:

```json
{
  "mcpServers": {
    "pinion": {
      "command": "npx",
      "args": ["pinion-os"],
      "env": {
        "PINION_PRIVATE_KEY": "0xYOUR_KEY"
      }
    }
  }
}
```

### Generic MCP Host

```bash
PINION_PRIVATE_KEY=0xYOUR_KEY npx pinion-os
```

The plugin communicates over stdio using the standard MCP protocol.

## Available Skills

### Server-side (x402-paid, $0.01 USDC each)

| Skill | SDK Method | Endpoint | Price | Returns |
|-------|------------|----------|-------|---------|
| balance | `skills.balance(addr)` | GET /balance/:address | $0.01 | ETH + USDC balances |
| tx | `skills.tx(hash)` | GET /tx/:hash | $0.01 | Decoded tx details |
| price | `skills.price(token)` | GET /price/:token | $0.01 | USD price |
| wallet | `skills.wallet()` | GET /wallet/generate | $0.01 | New keypair |
| chat | `skills.chat(msg)` | POST /chat | $0.01 | Agent response |
| send | `skills.send(to, amt, token)` | POST /send | $0.01 | Unsigned transfer tx |
| trade | `skills.trade(src, dst, amt)` | POST /trade | $0.01 | Unsigned swap tx (1inch) |
| fund | `skills.fund(addr)` | GET /fund/:address | $0.01 | Balance + deposit info |

### Client-side (SDK/MCP plugin only)

| Skill | SDK / MCP Tool | Description |
|-------|---------------|-------------|
| pay-for-service | `payX402Service(wallet, url)` / `pinion_pay_service` | Call any x402 endpoint on the internet |
| spend-limit | `pinion_spend_limit` (MCP only) | Per-session USDC budget tracking |

## Build Your Own Skills

Use the server framework to create x402-paywalled endpoints:

```typescript
import { createSkillServer, skill } from "pinion-os/server";

const server = createSkillServer({
  payTo: "0xYOUR_WALLET",
  network: "base",
});

server.add(skill("analyze", {
  price: "$0.02",
  endpoint: "/analyze/:address",
  handler: async (req, res) => {
    const data = await analyzeAddress(req.params.address);
    res.json(data);
  },
}));

server.add(skill("score", {
  price: "$0.05",
  endpoint: "/score/:address",
  handler: async (req, res) => {
    const score = await getScore(req.params.address);
    res.json({ score });
  },
}));

server.listen(4020);
// -> http://localhost:4020/analyze/0x... (x402 paywalled)
// -> http://localhost:4020/score/0x...  (x402 paywalled)
```

The server automatically:
- Returns 402 with payment requirements for unauthenticated requests
- Verifies x402 payment signatures via the facilitator
- Settles USDC on Base to your wallet

## Configuration

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PINION_PRIVATE_KEY` | yes | -- | Hex private key (0x...) with USDC on Base |
| `PINION_API_URL` | no | `https://pinionos.com/skill` | Override the skill API endpoint |
| `PINION_NETWORK` | no | `base` | Network: `base` or `base-sepolia` |
| `ADDRESS` | server only | -- | Wallet address to receive payments |
| `FACILITATOR_URL` | server only | `https://facilitator.payai.network` | x402 facilitator endpoint |
| `ANTHROPIC_API_KEY` | chat skill | -- | Anthropic API key for the chat skill |
| `ONEINCH_API_KEY` | trade skill | -- | 1inch API key for token swaps (server-side) |

## Project Structure

```
pinion-os/
  .claude-plugin/
    plugin.json        Claude Code plugin manifest
    marketplace.json   Plugin marketplace catalog
  .mcp.json            MCP server auto-config
  src/
    client/            SDK for calling pinion skills
      index.ts           PinionClient class
      skills.ts          typed skill wrappers
      types.ts           TypeScript interfaces
      x402.ts            EIP-3009 payment signing
      x402-generic.ts    generic x402 caller for any endpoint
    plugin/            Claude MCP server
      server.ts          MCP request handlers
      tools.ts           tool definitions + dispatch (10 tools)
      limits.ts          per-session spend limit tracker
      config.ts          env/arg configuration
      index.ts           CLI entry point (npx pinion-os)
    server/            Framework for building skills
      index.ts           createSkillServer factory
      skill.ts           skill() definition helper
      middleware.ts      x402 middleware wrapper
      types.ts           server types
    skills/            Built-in skill handlers
      balance.ts         ETH/USDC balance lookup
      tx.ts              transaction decoder
      price.ts           token price via CoinGecko
      wallet.ts          keypair generation
      chat.ts            AI chat via Anthropic
    shared/            Shared utilities
      constants.ts       RPC URLs, contract addresses
      rpc.ts             Base JSON-RPC helper
      errors.ts          custom error classes
  examples/
    use-sdk.ts           SDK usage example
    custom-skill.ts      custom skill server example
    claude-config.json   example MCP config
  tests/
    client.test.ts       SDK tests
    x402.test.ts         payment signing tests
    server.test.ts       skill server tests
  openclaw.plugin.json   OpenClaw skill manifest
```

## Troubleshooting

**`PINION_PRIVATE_KEY or WALLET_KEY environment variable is required`**

Set the env var before running. The key must be a hex string starting with `0x`.

**`insufficient USDC balance`**

Your wallet needs USDC on Base (not Ethereum mainnet). Bridge USDC to Base via
https://bridge.base.org or buy directly on Base.

**`402 Payment Required` in response**

The SDK should handle this automatically. If you see raw 402 responses, check that
your private key has both ETH (for gas) and USDC (for payments) on Base.

**MCP plugin not showing up in Claude**

Make sure the config file path is correct for your OS (see setup section above).
Restart Claude Desktop or Claude Code after changing config.

**`Cannot find module 'pinion-os'`**

Run `npm install pinion-os` in your project, or use `npx pinion-os` to auto-install.

**`ESOCKETTIMEDOUT` or network errors**

Check your internet connection. The SDK calls `pinionos.com` by default.
You can override with `PINION_API_URL` env var.

## Development

```bash
git clone https://github.com/chu2bard/pinion-os
cd pinion-os
npm install
npm run build
npm test
```

## Contributing

PRs welcome. Keep it simple:

1. Fork and create a branch
2. Make your changes
3. Run `npm test` and `npm run lint`
4. Open a PR with a clear description

No need for elaborate commit messages. Just describe what changed and why.

## License

MIT
