---
name: pinion-tx
description: Get decoded transaction details for any Base transaction hash. Costs $0.01 USDC via x402.
---

# Transaction Details

Returns decoded transaction data and receipt for any transaction on Base mainnet.

## Endpoint

```
GET https://pinionos.com/skill/tx/:hash
```

**Price:** $0.01 USDC per call (x402 on Base)

## Parameters

| Parameter | Type   | Required | Description                           |
|-----------|--------|----------|---------------------------------------|
| hash      | string | yes      | Transaction hash (0x, 64 hex chars)    |

## Example Request

```bash
curl https://pinionos.com/skill/tx/0xabc123...
```

The first request returns HTTP 402 with payment requirements. Sign a USDC `TransferWithAuthorization` (EIP-3009) and retry with the `X-PAYMENT` header.

## Example Response

```json
{
  "hash": "0xabc123...",
  "network": "base",
  "from": "0x101C...",
  "to": "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
  "value": "0.000000 ETH",
  "gasUsed": "52341",
  "status": "success",
  "blockNumber": 18442017,
  "timestamp": "2026-02-16T12:00:00.000Z"
}
```

## When to Use

- Verify a transaction went through (status, gas, block).
- Decode sender, recipient and value for any Base tx.
- Audit agent activity on-chain.
