---
name: pinion-balance
description: Get ETH and USDC balances for any Ethereum address on Base. Costs $0.01 USDC via x402.
---

# Balance Lookup

Returns ETH and USDC balances for any address on Base mainnet.

## Endpoint

```
GET https://pinionos.com/skill/balance/:address
```

**Price:** $0.01 USDC per call (x402 on Base)

## Parameters

| Parameter | Type   | Required | Description                        |
|-----------|--------|----------|------------------------------------|
| address   | string | yes      | Ethereum address (0x, 40 hex chars) |

## Example Request

```bash
curl https://pinionos.com/skill/balance/0x101Cd32b9bEEE93845Ead7Bc604a5F1873330acf
```

The first request returns HTTP 402 with payment requirements. Sign a USDC `TransferWithAuthorization` (EIP-3009) and retry with the `X-PAYMENT` header.

## Example Response

```json
{
  "address": "0x101Cd32b9bEEE93845Ead7Bc604a5F1873330acf",
  "network": "base",
  "balances": {
    "ETH": "0.042100",
    "USDC": "12.50"
  },
  "timestamp": "2026-02-16T12:00:00.000Z"
}
```

## When to Use

- Check any wallet's ETH and USDC holdings on Base before sending or trading.
- Verify an agent's funding level.
- Confirm a payment was received.
