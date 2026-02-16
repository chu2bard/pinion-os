---
name: pinion-price
description: Get current USD price for ETH or other Base tokens via CoinGecko. Costs $0.01 USDC via x402.
---

# Token Price

Returns the current USD price and 24h change for a token on Base.

## Endpoint

```
GET https://pinionos.com/skill/price/:token
```

**Price:** $0.01 USDC per call (x402 on Base)

## Parameters

| Parameter | Type   | Required | Description                                          |
|-----------|--------|----------|------------------------------------------------------|
| token     | string | yes      | Token symbol: ETH, USDC, WETH, DAI, USDT, or CBETH   |

## Example Request

```bash
curl https://pinionos.com/skill/price/ETH
```

The first request returns HTTP 402 with payment requirements. Sign a USDC `TransferWithAuthorization` (EIP-3009) and retry with the `X-PAYMENT` header.

## Example Response

```json
{
  "token": "ETH",
  "network": "base",
  "priceUSD": 2650.42,
  "change24h": "-1.23%",
  "timestamp": "2026-02-16T12:00:00.000Z"
}
```

## Supported Tokens

ETH, USDC, WETH, DAI, USDT, CBETH

## When to Use

- Get the current price before constructing a trade.
- Display token values in USD.
- Monitor price movements for an agent's portfolio.
