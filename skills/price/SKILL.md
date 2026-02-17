---
name: pinion-price
description: Get current USD price for any token on Base via Birdeye (CoinGecko fallback). Costs $0.01 USDC via x402.
---

# Token Price

Returns the current USD price, 24h change, and liquidity for a token on Base.

## Endpoint

```
GET https://pinionos.com/skill/price/:token
```

**Price:** $0.01 USDC per call (x402 on Base)

## Parameters

| Parameter | Type   | Required | Description                                                       |
|-----------|--------|----------|-------------------------------------------------------------------|
| token     | string | yes      | Token symbol (ETH, USDC, WETH, DAI, USDT, CBETH) or any Base contract address (0x...) |

## Example Request (by symbol)

```bash
curl https://pinionos.com/skill/price/ETH
```

## Example Request (by contract address)

```bash
curl https://pinionos.com/skill/price/0x4200000000000000000000000000000000000006
```

The first request returns HTTP 402 with payment requirements. Sign a USDC `TransferWithAuthorization` (EIP-3009) and retry with the `X-PAYMENT` header.

## Example Response

```json
{
  "token": "ETH",
  "network": "base",
  "priceUSD": 2650.42,
  "change24h": "-1.23%",
  "liquidity": 10854103.38,
  "source": "birdeye",
  "timestamp": "2026-02-17T12:00:00.000Z"
}
```

## Supported Tokens

**By symbol:** ETH, USDC, WETH, DAI, USDT, CBETH

**By address:** Any Base mainnet token contract address (0x + 40 hex chars).

## Data Sources

- **Primary:** [Birdeye](https://birdeye.so) -- real-time DEX prices with liquidity data, 300 req/sec
- **Fallback:** CoinGecko -- used if Birdeye is unavailable or BIRDEYE_API_KEY is not set

## When to Use

- Get the current price before constructing a trade.
- Display token values in USD.
- Monitor price movements for an agent's portfolio.
- Look up the price of any Base token by contract address.
