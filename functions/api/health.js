import { getConfig, healthResponse } from "../../server/core.mjs";

// Cloudflare Pages Function for GET /api/health.
export function onRequestGet({ env }) {
    const { status, body } = healthResponse(getConfig(env));
    return Response.json(body, { status });
}
