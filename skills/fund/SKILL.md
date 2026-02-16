---
name: pinion-fund
description: Check wallet balances and get funding instructions for Base. ETH and USDC. Costs $0.01 USDC via x402.
---

# Fund

Returns ETH and USDC balances for any Base address along with step-by-step funding instructions and minimum recommended amounts.

## Endpoint

```
GET https://pinionos.com/skill/fund/:address
```

**Price:** $0.01 USDC per call (x402 on Base)

## Parameters

| Parameter | Type   | Required | Description                        |
|-----------|--------|----------|------------------------------------|
| address   | string | yes      | Ethereum address (0x, 40 hex chars) |

## Example Request

```bash
curl https://pinionos.com/skill/fund/0x101Cd32b9bEEE93845Ead7Bc604a5F1873330acf
```

The first request returns HTTP 402 with payment requirements. Sign a USDC `TransferWithAuthorization` (EIP-3009) and retry with the `X-PAYMENT` header.

## Example Response

```json
{
  "address": "0x101Cd32b9bEEE93845Ead7Bc604a5F1873330acf",
  "network": "base",
  "chainId": 8453,
  "balances": {
    "ETH": "0.001200",
    "USDC": "5.00"
  },
  "depositAddress": "0x101Cd32b9bEEE93845Ead7Bc604a5F1873330acf",
  "funding": {
    "steps": [
      "Buy ETH on any exchange (Coinbase, Binance, etc.)",
      "Withdraw ETH to the address above on the Base network",
      "Swap some ETH to USDC using the /trade skill or any DEX",
      "ETH is needed for gas, USDC is needed for x402 payments"
    ],
    "minimumRecommended": {
      "ETH": "0.001 ETH (for gas fees)",
      "USDC": "1.00 USDC (for ~100 skill calls at $0.01 each)"
    },
    "bridgeUrl": "https://bridge.base.org"
  },
  "timestamp": "2026-02-16T12:00:00.000Z"
}
```

## When to Use

- Check if an agent wallet has enough funds to operate.
- Get instructions for funding a new wallet.
- Determine if bridging or swapping is needed before running other skills.
