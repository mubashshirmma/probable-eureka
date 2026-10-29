import { createApp } from "../server/server.mjs";

// Vercel runs this Express app as a serverless function for POST /api/generate.
export const config = { maxDuration: 60 };
export default createApp();
