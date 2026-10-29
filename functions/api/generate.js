import { getConfig, generateResponse } from "../../server/core.mjs";

// Cloudflare Pages Function for POST /api/generate (same logic as the Express route).
const MAX_BODY_BYTES = 16 * 1024 * 1024; // matches LIMITS.jsonBodyLimit
const json = (status, body) => Response.json(body, { status });

export async function onRequestPost({ request, env }) {
    if (Number(request.headers.get("content-length")) > MAX_BODY_BYTES) {
        return json(413, { error: "The files are too large. Total size must be 10 MB or less." });
    }

    let body;
    try {
        body = await request.json();
    } catch {
        return json(400, { error: "Invalid request." });
    }

    try {
        const { status, body: out } = await generateResponse(body, getConfig(env));
        return json(status, out);
    } catch (e) {
        console.error("Unexpected server error:", e?.name || "Error");
        return json(500, { error: "Something went wrong. Please try again." });
    }
}
