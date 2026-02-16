---
name: pinion-send
description: Construct an unsigned ETH or USDC transfer transaction on Base. Client signs and broadcasts. Costs $0.01 USDC via x402.
---

# Send

Constructs an unsigned ETH or USDC transfer transaction on Base. Returns the raw transaction object for the client to sign and broadcast.

## Endpoint

```
POST https://pinionos.com/skill/send
```

**Price:** $0.01 USDC per call (x402 on Base)

## Request Body

```json
{
  "to": "0x...",
  "amount": "0.1",
  "token": "ETH"
}
```

| Field  | Type   | Required | Description                              |
|--------|--------|----------|------------------------------------------|
| to     | string | yes      | Recipient address (0x, 40 hex chars)      |
| amount | string | yes      | Amount to send (human-readable)           |
| token  | string | yes      | `ETH` or `USDC`                          |

## Example Request

```bash
curl -X POST https://pinionos.com/skill/send \
  -H "Content-Type: application/json" \
  -d '{"to":"0x7a21...","amount":"0.05","token":"ETH"}'
```

The first request returns HTTP 402 with payment requirements. Sign a USDC `TransferWithAuthorization` (EIP-3009) and retry with the `X-PAYMENT` header.

## Example Response (ETH)

```json
{
  "tx": {
    "to": "0x7a21...",
    "value": "0xb1a2bc2ec50000",
    "data": "0x",
    "chainId": 8453
  },
  "token": "ETH",
  "amount": "0.05",
  "network": "base",
  "note": "Sign this transaction with your private key and broadcast to Base.",
  "timestamp": "2026-02-16T12:00:00.000Z"
}
```

## Example Response (USDC)

```json
{
  "tx": {
    "to": "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
    "value": "0x0",
    "data": "0xa9059cbb...",
    "chainId": 8453
  },
  "token": "USDC",
  "amount": "10",
  "network": "base",
  "note": "Sign this transaction with your private key and broadcast to Base.",
  "timestamp": "2026-02-16T12:00:00.000Z"
}
```

## When to Use

- Transfer ETH or USDC to another address on Base.
- Build payment workflows where the agent constructs the tx and the user (or another agent) signs.
- Fund a sub-wallet or pay for services.
