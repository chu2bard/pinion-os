---
name: pinion-wallet
description: Generate a fresh Ethereum keypair for Base. Useful for funding OpenClaw agents. Costs $0.01 USDC via x402.
---

# Wallet Generation

Generates a cryptographically secure Ethereum keypair for the Base network. Returns the address and private key.

## Endpoint

```
GET https://pinionos.com/skill/wallet/generate
```

**Price:** $0.01 USDC per call (x402 on Base)

## Parameters

None.

## Example Request

```bash
curl https://pinionos.com/skill/wallet/generate
```

The first request returns HTTP 402 with payment requirements. Sign a USDC `TransferWithAuthorization` (EIP-3009) and retry with the `X-PAYMENT` header.

## Example Response

```json
{
  "address": "0x7a21...",
  "privateKey": "0x4b3f...",
  "network": "base",
  "chainId": 8453,
  "note": "Fund this wallet with ETH for gas and USDC for x402 payments. Keep the private key safe.",
  "timestamp": "2026-02-16T12:00:00.000Z"
}
```

## When to Use

- Bootstrap a new agent wallet on Base.
- Create disposable wallets for isolated agent tasks.
- Generate a receiving address for incoming funds.

## Security

The private key is returned once. Store it securely. Anyone with the key controls the wallet.
