---
name: pinion-trade
description: Get an unsigned swap transaction via 1inch aggregator on Base. Includes approval tx if needed. Costs $0.01 USDC via x402.
---

# Trade

Returns an unsigned token swap transaction from the 1inch aggregator on Base. If the source token needs approval, an approve transaction is included.

## Endpoint

```
POST https://pinionos.com/skill/trade
```

**Price:** $0.01 USDC per call (x402 on Base)

## Request Body

```json
{
  "src": "USDC",
  "dst": "ETH",
  "amount": "10",
  "from": "0x...",
  "slippage": 1
}
```

| Field    | Type   | Required | Description                                  |
|----------|--------|----------|----------------------------------------------|
| src      | string | yes      | Source token symbol (ETH, USDC, WETH, DAI, CBETH) |
| dst      | string | yes      | Destination token symbol                      |
| amount   | string | yes      | Amount to swap (human-readable)               |
| from     | string | yes      | Sender address (0x, 40 hex chars)             |
| slippage | number | no       | Slippage tolerance in percent (default: 1)    |

## Supported Tokens

ETH, USDC, WETH, DAI, CBETH

## Example Request

```bash
curl -X POST https://pinionos.com/skill/trade \
  -H "Content-Type: application/json" \
  -d '{"src":"USDC","dst":"ETH","amount":"10","from":"0x101C..."}'
```

The first request returns HTTP 402 with payment requirements. Sign a USDC `TransferWithAuthorization` (EIP-3009) and retry with the `X-PAYMENT` header.

## Example Response (with approval needed)

```json
{
  "approve": {
    "to": "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
    "data": "0x095ea7b3...",
    "value": "0x0",
    "chainId": 8453
  },
  "swap": {
    "to": "0x111111125421ca6dc452d289314280a0f8842a65",
    "data": "0x...",
    "value": "0x0",
    "chainId": 8453
  },
  "srcToken": "USDC",
  "dstToken": "ETH",
  "amount": "10",
  "network": "base",
  "router": "0x111111125421ca6dc452d289314280a0f8842a65",
  "note": "Sign and broadcast the approve tx first, wait for confirmation, then sign and broadcast the swap tx.",
  "timestamp": "2026-02-16T12:00:00.000Z"
}
```

## When to Use

- Swap tokens on Base (e.g. USDC to ETH or ETH to USDC).
- Rebalance an agent's portfolio.
- Convert tokens before making a payment.

## Flow

1. Call this skill to get the unsigned tx(s).
2. If `approve` is present, sign and broadcast the approve tx first, then wait for confirmation.
3. Sign and broadcast the `swap` tx.
