---
name: pinion-broadcast
description: Sign and broadcast an unsigned transaction on Base. Requires the sender's private key. Costs $0.01 USDC via x402.
---

# Sign & Broadcast

Signs an unsigned transaction with the provided private key and broadcasts it to Base mainnet. Returns the transaction hash and Basescan link.

## Endpoint

```
POST https://pinionos.com/skill/broadcast
```

**Price:** $0.01 USDC per call (x402 on Base)

## Request Body

```json
{
  "tx": {
    "to": "0x7a21...",
    "value": "0xb1a2bc2ec50000",
    "data": "0x",
    "chainId": 8453
  },
  "privateKey": "0x4b3f..."
}
```

| Field      | Type   | Required | Description                                                |
|------------|--------|----------|------------------------------------------------------------|
| tx         | object | yes      | Unsigned transaction object (from /send or /trade skills)  |
| tx.to      | string | yes      | Recipient or contract address                              |
| tx.value   | string | no       | ETH value in hex (default: "0x0")                          |
| tx.data    | string | no       | Calldata in hex (default: "0x")                            |
| tx.chainId | number | yes      | Must be 8453 (Base mainnet)                                |
| privateKey | string | yes      | Sender's private key (0x + 64 hex chars)                   |

## Example Request

```bash
curl -X POST https://pinionos.com/skill/broadcast \
  -H "Content-Type: application/json" \
  -d '{
    "tx": {
      "to": "0x7a21...",
      "value": "0xb1a2bc2ec50000",
      "data": "0x",
      "chainId": 8453
    },
    "privateKey": "0x4b3f..."
  }'
```

The first request returns HTTP 402 with payment requirements. Sign a USDC `TransferWithAuthorization` (EIP-3009) and retry with the `X-PAYMENT` header.

## Example Response

```json
{
  "txHash": "0xabc123...",
  "explorerUrl": "https://basescan.org/tx/0xabc123...",
  "from": "0x1234...",
  "to": "0x7a21...",
  "network": "base",
  "status": "submitted",
  "note": "Transaction submitted to Base. It may take a few seconds to confirm.",
  "timestamp": "2026-02-17T12:00:00.000Z"
}
```

## When to Use

- After calling `/send` to transfer ETH or USDC -- pass the returned `tx` object here with the sender's private key to execute it.
- After calling `/trade` to swap tokens -- broadcast the `approve` tx first (if present), wait for confirmation, then broadcast the `swap` tx.
- Any time you have an unsigned Base transaction and need to sign + broadcast it.

## Typical Flow

1. Call `/send` or `/trade` to get an unsigned transaction.
2. Ask the user for their private key.
3. Call `/broadcast` with the unsigned tx and the private key.
4. Return the tx hash and Basescan link to the user.

## Security

- The private key is sent over HTTPS and used only to sign the transaction. It is not stored or logged.
- Only use this with wallets you control and amounts you're comfortable with.
- The sender's wallet needs ETH on Base for gas fees.
