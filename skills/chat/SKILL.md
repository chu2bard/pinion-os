---
name: pinion-chat
description: Chat with the Pinion AI agent. Send a messages array, get an AI response with web search. Costs $0.01 USDC via x402.
---

# AI Agent Chat

Send messages to the Pinion AI agent and get a response. The agent knows about the Pinion protocol, x402, OpenClaw, ERC-8004 and on-chain topics. It has web search for current information.

## Endpoint

```
POST https://pinionos.com/skill/chat
```

**Price:** $0.01 USDC per call (x402 on Base)

## Request Body

```json
{
  "messages": [
    { "role": "user", "content": "what is x402?" }
  ]
}
```

| Field    | Type  | Required | Description                                      |
|----------|-------|----------|--------------------------------------------------|
| messages | array | yes      | Array of `{ role, content }` message objects       |

Roles: `user` or `assistant`. Send conversation history for multi-turn chat.

## Example Request

```bash
curl -X POST https://pinionos.com/skill/chat \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"what is x402?"}]}'
```

The first request returns HTTP 402 with payment requirements. Sign a USDC `TransferWithAuthorization` (EIP-3009) and retry with the `X-PAYMENT` header.

## Example Response

```json
{
  "response": "x402 is a protocol that brings the HTTP 402 Payment Required status code to life..."
}
```

## When to Use

- Ask about the Pinion protocol, x402, or Base.
- Get explanations of on-chain concepts.
- Use as a sub-agent for research within an autonomous workflow.
