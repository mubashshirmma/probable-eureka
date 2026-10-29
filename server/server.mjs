import express from "express";
import { fileURLToPath } from "node:url";
import { LIMITS, getConfig, healthResponse, generateResponse, checkModels } from "./core.mjs";

// The request logic lives in core.mjs so Cloudflare Pages Functions can share it. Re-exported for tests.
export * from "./core.mjs";

// ---------------------------------------------------------------------------
// App
// ---------------------------------------------------------------------------
export function createApp({ env = process.env, fetchImpl = globalThis.fetch, sleep = (ms) => new Promise((r) => setTimeout(r, ms)) } = {}) {
    const app = express();
    app.disable("x-powered-by");
    app.use(express.json({ limit: LIMITS.jsonBodyLimit }));

    const config = () => getConfig(env, fetchImpl);

    // Result of the last model availability check ("ok", "unavailable", "unknown"), or null if it has not run.
    app.locals.modelCheck = null;
    app.locals.verifyModels = async () => {
        const cfg = config();
        if (!cfg.apiKey || !cfg.model) return null;
        const result = await checkModels(cfg);
        app.locals.modelCheck = { status: result.status, missing: result.missing || [] };
        return result;
    };

    app.get("/api/health", (req, res) => {
        const { status, body } = healthResponse(config(), app.locals.modelCheck);
        res.status(status).json(body);
    });

    app.post("/api/generate", async (req, res, next) => {
        try {
            const { status, body } = await generateResponse(req.body, config(), sleep);
            res.status(status).json(body);
        } catch (e) {
            next(e);
        }
    });

    // Malformed JSON, oversized bodies and unexpected exceptions: never leak details.
    // eslint-disable-next-line no-unused-vars
    app.use((err, req, res, next) => {
        if (err?.type === "entity.too.large") {
            return res.status(413).json({ error: "The files are too large. Total size must be 10 MB or less." });
        }
        if (err?.type === "entity.parse.failed" || err instanceof SyntaxError) {
            return res.status(400).json({ error: "Invalid request." });
        }
        console.error("Unexpected server error:", err?.name || "Error");
        res.status(500).json({ error: "Something went wrong. Please try again." });
    });

    return app;
}

// ---------------------------------------------------------------------------
// Start the server only when this file is run directly (not when imported by tests)
// ---------------------------------------------------------------------------
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
    const PORT = Number(process.env.PORT) || 8787;
    const HOST = "127.0.0.1"; // local only; the Vite dev proxy talks to this address
    if (!process.env.GROQ_API_KEY || !process.env.GROQ_MODEL) {
        console.warn("Warning: GROQ_API_KEY or GROQ_MODEL is missing. /api/generate will return 503 until it is set.");
    }
    const app = createApp();
    const server = app.listen(PORT, HOST, () => {
        console.log("StudySaathi server running on http://" + HOST + ":" + PORT);
        app.locals.verifyModels().then((result) => {
            if (!result) return;
            if (result.status === "ok") console.log(`Groq models verified: ${process.env.GROQ_MODEL}${process.env.GROQ_VISION_MODEL ? ", " + process.env.GROQ_VISION_MODEL : ""}`);
            else if (result.status === "unavailable") {
                console.error(`WARNING: these models are not available for your Groq key: ${result.missing.join(", ")}`);
                console.error("Models your key can use (chat): " + result.available.filter((id) => !/whisper|orpheus|guard|allam/.test(id)).join(", "));
                console.error("Set GROQ_MODEL / GROQ_VISION_MODEL in .env to one of them and restart.");
            } else console.warn("Could not check the Groq model list (is the API key valid and the network up?).");
        });
    });
    server.on("error", (e) => {
        console.error(
            e.code === "EADDRINUSE"
                ? `Port ${PORT} is already in use. Set a different PORT in .env and restart.`
                : "Could not start the server: " + e.message
        );
        process.exit(1);
    });
}
