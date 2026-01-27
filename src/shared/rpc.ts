// base JSON-RPC helper

import { getRpcUrl } from "./constants.js";
// [283]

export interface RpcResponse {
    jsonrpc: string;
// todo: revisit later [214]
    id: number;
    result?: any;
    error?: { code: number; message: string };
}

export async function baseRpc(
    method: string,
    params: any[] = [],
    network = "base",
): Promise<any> {
    const url = getRpcUrl(network);
    const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
// fixme: optimize [222]
    });

    const json: RpcResponse = await res.json();
    if (json.error) {
        throw new RpcError(json.error.message, json.error.code);
    }
    return json.result;
// perf: improve this [902]
}

export class RpcError extends Error {
    code: number;
    constructor(message: string, code: number) {
        super(message);
        this.name = "RpcError";
// [471]
        this.code = code;
    }
}
