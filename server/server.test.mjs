import test from "node:test";
import assert from "node:assert/strict";
import { createApp, normalize, sniffMime, sanitizeForLog, checkModels, LIMITS } from "./server.mjs";

// Groq is never called in these tests: fetch is replaced by a scripted sequence of replies.

const KEY = "gsk_" + "a1B2c3D4".repeat(5);
const ENV = { GROQ_API_KEY: KEY, GROQ_MODEL: "text-model", GROQ_VISION_MODEL: "vision-model" };

// ---- fixtures --------------------------------------------------------------
/** A real, minimal PDF. With no lines it has a page but no text (like a scan). */
function makePdf(lines = []) {
    const content = lines.length ? `BT /F1 12 Tf 50 750 Td ${lines.map((l) => `(${l}) Tj 0 -16 Td`).join(" ")} ET` : "";
    const objs = [
        "<< /Type /Catalog /Pages 2 0 R >>",
        "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
        "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>",
        `<< /Length ${content.length} >>\nstream\n${content}\nendstream`,
        "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    ];
    let out = "%PDF-1.4\n";
    const offsets = [];
    objs.forEach((o, i) => {
        offsets.push(out.length);
        out += `${i + 1} 0 obj\n${o}\nendobj\n`;
    });
    const xref = out.length;
    out += `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n` + offsets.map((o) => String(o).padStart(10, "0") + " 00000 n \n").join("");
    out += `trailer\n<< /Size ${objs.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
    return Buffer.from(out, "latin1");
}
const b64 = (buf) => buf.toString("base64");
const textPdf = (...lines) => b64(makePdf(lines));
const scannedPdf = () => b64(makePdf([]));
const pdfOfSize = (bytes) => b64(Buffer.concat([Buffer.from("%PDF-1.4\n"), Buffer.alloc(bytes)])); // not parseable; only for size checks
const png = () => b64(Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), Buffer.alloc(200, 7)]));
const jpg = () => b64(Buffer.concat([Buffer.from([0xff, 0xd8, 0xff, 0xe0]), Buffer.alloc(200, 9)]));
const gif = () => b64(Buffer.concat([Buffer.from("GIF89a"), Buffer.alloc(200)]));
const heic = () => b64(Buffer.concat([Buffer.alloc(4), Buffer.from("ftypheic"), Buffer.alloc(100)]));

function goodSet({ cards = 8, questions = 10 } = {}) {
    return {
        topicTitle: "Photosynthesis",
        summary: {
            quickSummary: "Plants make food using light.",
            hierarchy: [
                { symbol: "L", name: "Light", highlight: false },
                { symbol: "S", name: "Sugar", highlight: true },
            ],
            keyConcepts: [1, 2, 3, 4].map((n) => ({ id: "c" + n, title: "Concept " + n, description: "Explains " + n })),
        },
        flashcards: Array.from({ length: cards }, (_, i) => ({ id: i + 1, type: "TERM", question: "Q" + i, answer: "A" + i })),
        quiz: {
            questions: Array.from({ length: questions }, (_, i) => ({
                id: i + 1,
                topic: "Topic " + (i % 3),
                question: "Question " + i,
                options: ["w" + i, "x" + i, "y" + i, "z" + i],
                correctAnswer: i % 4,
                explanation: "Because " + i,
            })),
        },
    };
}

const completion = (content, finish = "stop") =>
    new Response(JSON.stringify({ choices: [{ index: 0, message: { role: "assistant", content }, finish_reason: finish }] }), { status: 200 });
const groqReply = (obj, { fenced = false } = {}) => completion(fenced ? "```json\n" + JSON.stringify(obj) + "\n```" : JSON.stringify(obj));
const groqError = (status, { code = "", message = "error", retryAfter } = {}) =>
    new Response(JSON.stringify({ error: { message, type: "invalid_request_error", code } }), {
        status,
        headers: retryAfter === undefined ? {} : { "retry-after": String(retryAfter) },
    });

/** Start the app on a random port with a scripted sequence of Groq responses. */
async function withServer(replies, fn, env = ENV) {
    const calls = [];
    const sleeps = [];
    const fetchImpl = async (url, init) => {
        calls.push({ url, init, body: JSON.parse(init.body) });
        const next = replies.shift();
        if (!next) throw new Error("unexpected extra Groq call");
        return typeof next === "function" ? next() : next;
    };
    const server = createApp({ env, fetchImpl, sleep: async (ms) => void sleeps.push(ms) }).listen(0);
    const base = "http://127.0.0.1:" + server.address().port;
    const post = (body, raw) =>
        fetch(base + "/api/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: raw ?? JSON.stringify(body),
        });
    try {
        await fn({ base, post, calls, sleeps });
    } finally {
        server.close();
    }
}

const userContent = (call) => call.body.messages[1].content;

// ---- health / configuration ---------------------------------------------------
test("health reports provider and models without leaking the key", async () => {
    await withServer([], async ({ base }) => {
        const res = await fetch(base + "/api/health");
        const body = await res.json();
        assert.equal(res.status, 200);
        assert.deepEqual(body, { ok: true, provider: "groq", configured: true, model: "text-model", visionModel: "vision-model", modelCheck: null });
        assert.ok(!JSON.stringify(body).includes(KEY));
    });
    await withServer([], async ({ base }) => {
        const res = await fetch(base + "/api/health");
        const body = await res.json();
        assert.equal(res.status, 503);
        assert.equal(body.configured, false);
        assert.equal(body.provider, "groq");
    }, {});
});

test("generate without an API key or model returns 503 and does not call Groq", async () => {
    await withServer([], async ({ post, calls }) => {
        assert.equal((await post({ text: "notes" })).status, 503);
        assert.equal(calls.length, 0);
    }, {});
    await withServer([], async ({ post, calls }) => {
        assert.equal((await post({ text: "notes" })).status, 503);
        assert.equal(calls.length, 0);
    }, { GROQ_API_KEY: KEY });
});

// ---- provider configuration: is the model one the key can really use? -----------------------------
const modelList = (...ids) => new Response(JSON.stringify({ object: "list", data: ids.map((id) => ({ id, object: "model", active: true })) }), { status: 200 });

test("the exact failure: Groq answers 404 model_not_found, and the student is told which model is wrong", async () => {
    const notFound = groqError(404, {
        code: "model_not_found",
        message: "The model `text-model` does not exist or you do not have access to it.",
    });
    await withServer([notFound], async ({ post, calls }) => {
        const res = await post({ text: "notes" });
        const body = await res.json();
        assert.equal(res.status, 502);
        assert.equal(body.error, 'The AI model "text-model" is not available for this server\'s API key (wrong name, retired, or no access). Check GROQ_MODEL on the server.');
        assert.equal(calls.length, 1); // retrying cannot fix a wrong model name
        assert.ok(!JSON.stringify(body).includes(KEY));
    });
});

test("a photo request that hits an unavailable vision model names the vision model", async () => {
    await withServer([groqError(404, { code: "model_not_found" })], async ({ post, calls }) => {
        const res = await post({ files: [{ name: "a.png", data: png() }] });
        assert.match((await res.json()).error, /AI model "vision-model" is not available/);
        assert.equal(calls[0].body.model, "vision-model");
    });
});

test("checkModels compares the configured models with Groq's live model list", async () => {
    const base = { apiKey: KEY, model: "text-model", visionModel: "vision-model" };
    const ok = await checkModels({ ...base, fetchImpl: async () => modelList("text-model", "vision-model", "other") });
    assert.equal(ok.status, "ok");

    const calls = [];
    const missing = await checkModels({ ...base, fetchImpl: async (url, init) => (calls.push({ url, init }), modelList("only-this-one", "another")) });
    assert.equal(missing.status, "unavailable");
    assert.deepEqual(missing.missing, ["text-model", "vision-model"]);
    assert.deepEqual(missing.available, ["another", "only-this-one"]);
    assert.equal(calls[0].url, "https://api.groq.com/openai/v1/models");
    assert.equal(calls[0].init.headers.Authorization, "Bearer " + KEY);

    // An unset vision model is not an error.
    assert.equal((await checkModels({ ...base, visionModel: "", fetchImpl: async () => modelList("text-model") })).status, "ok");
    // A bad key or a network failure means "unknown", never a crash.
    assert.equal((await checkModels({ ...base, fetchImpl: async () => groqError(401) })).status, "unknown");
    assert.equal((await checkModels({ ...base, fetchImpl: async () => { throw new TypeError("offline"); } })).status, "unknown");
});

test("health reports an unavailable model after the startup check, with the names and no key", async () => {
    const fetchImpl = async () => modelList("some-other-model");
    const app = createApp({ env: ENV, fetchImpl });
    const server = app.listen(0);
    const base = "http://127.0.0.1:" + server.address().port;
    try {
        assert.equal((await fetch(base + "/api/health")).status, 200); // before the check there is nothing to complain about
        await app.locals.verifyModels();
        const res = await fetch(base + "/api/health");
        const body = await res.json();
        assert.equal(res.status, 503);
        assert.equal(body.ok, false);
        assert.equal(body.modelCheck, "unavailable");
        assert.match(body.error, /text-model, vision-model/);
        assert.ok(!JSON.stringify(body).includes(KEY));
    } finally {
        server.close();
    }
    // And a healthy list keeps the server healthy.
    const good = createApp({ env: ENV, fetchImpl: async () => modelList("text-model", "vision-model") });
    const s2 = good.listen(0);
    try {
        await good.locals.verifyModels();
        const body = await (await fetch("http://127.0.0.1:" + s2.address().port + "/api/health")).json();
        assert.equal(body.ok, true);
        assert.equal(body.modelCheck, "ok");
    } finally {
        s2.close();
    }
});

test("the startup check does nothing without a key or model", async () => {
    const app = createApp({ env: {}, fetchImpl: async () => { throw new Error("must not be called"); } });
    assert.equal(await app.locals.verifyModels(), null);
});

test("the Groq API address and the Authorization header are used, and nothing points at Gemini", async () => {
    await withServer([groqReply(goodSet())], async ({ post, calls }) => {
        await post({ text: "notes" });
        assert.match(calls[0].url, /^https:\/\/api\.groq\.com\/openai\/v1\/chat\/completions$/);
        assert.doesNotMatch(JSON.stringify(calls[0]), /generativelanguage|gemini|x-goog-api-key/i);
    }, { ...ENV, GEMINI_API_KEY: "old-gemini-key", GEMINI_MODEL: "gemini-3.5-flash" }); // leftover Gemini variables are ignored
});

// ---- successful generation + request shape --------------------------------------
test("typed notes produce a valid study set and a correct Groq request (fenced JSON accepted)", async () => {
    await withServer([groqReply(goodSet(), { fenced: true })], async ({ post, calls }) => {
        const res = await post({ text: "Plants use light to make food.", title: "Bio" });
        const body = await res.json();
        assert.equal(res.status, 200);
        assert.equal(body.flashcards.length, 8);
        assert.equal(body.quiz.questions.length, 10);
        for (const q of body.quiz.questions) {
            assert.equal(q.options.length, 4);
            assert.ok(Number.isInteger(q.correctAnswer) && q.correctAnswer >= 0 && q.correctAnswer <= 3);
            assert.ok(q.explanation);
        }
        assert.equal(calls.length, 1);
        const { url, init, body: sent } = calls[0];
        assert.equal(url, "https://api.groq.com/openai/v1/chat/completions");
        assert.equal(init.method, "POST");
        assert.equal(init.headers.Authorization, "Bearer " + KEY); // the key travels only in the header
        assert.equal(sent.model, "text-model");
        assert.deepEqual(sent.response_format, { type: "json_object" });
        assert.equal(sent.max_completion_tokens, LIMITS.maxCompletionTokens);
        assert.deepEqual(sent.messages.map((m) => m.role), ["system", "user"]);
        assert.equal(typeof userContent(calls[0]), "string"); // plain string for text-only models
        assert.match(userContent(calls[0]), /Bio/);
        assert.match(userContent(calls[0]), /Plants use light to make food\./);
        assert.ok(!init.body.includes(KEY));
        assert.ok(!JSON.stringify(body).includes(KEY));
        assert.equal("reasoning_effort" in sent, false);
    });
});

test("gpt-oss models get a low reasoning effort so the JSON fits the output budget", async () => {
    await withServer([groqReply(goodSet())], async ({ post, calls }) => {
        await post({ text: "notes" });
        assert.equal(calls[0].body.reasoning_effort, "low");
        assert.equal(calls[0].body.model, "openai/gpt-oss-120b");
    }, { ...ENV, GROQ_MODEL: "openai/gpt-oss-120b" });
});

test("empty input and bad bodies are rejected before calling Groq", async () => {
    await withServer([], async ({ post, calls }) => {
        assert.equal((await post({ text: "   ", files: [] })).status, 400);
        assert.equal((await post({})).status, 400);
        assert.equal((await post({ text: 5 })).status, 400);
        assert.equal((await post(null, "{not json")).status, 400);
        assert.equal(calls.length, 0);
    });
});

// ---- PDF handling: text is extracted on the server ---------------------------------
test("PDF text is extracted and sent to the text model, not the PDF itself", async () => {
    await withServer([groqReply(goodSet())], async ({ post, calls }) => {
        const data = textPdf("Zorvanian tides are charted by the Order of the Lantern Tide", "The Brasswind Compass has 17 needles");
        const res = await post({ files: [{ name: "tides.pdf", data }] });
        assert.equal(res.status, 200);
        assert.equal(calls[0].body.model, "text-model");
        const content = userContent(calls[0]);
        assert.equal(typeof content, "string");
        assert.match(content, /Text taken from the PDF "tides\.pdf"/);
        assert.match(content, /Order of the Lantern Tide/);
        assert.match(content, /Brasswind Compass has 17 needles/);
        assert.ok(!calls[0].init.body.includes(data.slice(0, 40))); // the base64 PDF is never forwarded
        assert.ok(!/image_url|inlineData/.test(calls[0].init.body));
    });
});

test("typed notes and several PDFs are all included, in order", async () => {
    await withServer([groqReply(goodSet())], async ({ post, calls }) => {
        const res = await post({
            text: "My own typed notes about enzymes",
            files: [
                { name: "one.pdf", data: textPdf("First document talks about amylase") },
                { name: "two.pdf", data: textPdf("Second document talks about lipase") },
            ],
        });
        assert.equal(res.status, 200);
        const c = userContent(calls[0]);
        const order = [c.indexOf("typed notes about enzymes"), c.indexOf("amylase"), c.indexOf("lipase")];
        assert.ok(order.every((i) => i >= 0), "all content present");
        assert.deepEqual([...order].sort((a, b) => a - b), order, "typed notes, then PDF one, then PDF two");
    });
});

test("a scanned PDF (no text layer) is refused honestly instead of being ignored", async () => {
    await withServer([], async ({ post, calls }) => {
        const res = await post({ text: "also some notes", files: [{ name: "scan.pdf", data: scannedPdf() }] });
        const body = await res.json();
        assert.equal(res.status, 422);
        assert.match(body.error, /"scan\.pdf" has no selectable text/);
        assert.match(body.error, /photos/);
        assert.equal(calls.length, 0);
    });
});

test("a damaged PDF is reported by name, without internals", async () => {
    await withServer([], async ({ post, calls }) => {
        const damaged = b64(Buffer.concat([Buffer.from("%PDF-1.4\n"), Buffer.from("this is not really a pdf at all ".repeat(10))]));
        const res = await post({ files: [{ name: "broken.pdf", data: damaged }] });
        const body = await res.json();
        assert.equal(res.status, 422);
        assert.match(body.error, /"broken\.pdf" could not be read as a PDF/);
        assert.doesNotMatch(body.error, /InvalidPDF|Exception|stack/i);
        assert.equal(calls.length, 0);
    });
});

test("material longer than the input limit is rejected with the numbers, never silently cut", async () => {
    await withServer([], async ({ post, calls }) => {
        const res = await post({ text: "a".repeat(LIMITS.defaultMaxInputChars + 1) });
        const body = await res.json();
        assert.equal(res.status, 413);
        assert.match(body.error, /20,001 characters/);
        assert.match(body.error, /20,000 at a time/);
        assert.equal(calls.length, 0);
    });
    // The limit is configurable, and counts PDF text too.
    await withServer([], async ({ post, calls }) => {
        const res = await post({ text: "short", files: [{ name: "a.pdf", data: textPdf("x".repeat(60)) }] });
        assert.equal(res.status, 413);
        assert.equal(calls.length, 0);
    }, { ...ENV, GROQ_MAX_INPUT_CHARS: "50" });
});

// ---- images: routed to the vision model -----------------------------------------------
test("photos go to the vision model as image_url data URLs with detected MIME types", async () => {
    await withServer([groqReply(goodSet())], async ({ post, calls }) => {
        const pngData = png();
        const jpgData = jpg();
        const res = await post({
            text: "typed notes",
            files: [
                { name: "a.png", mimeType: "application/pdf", data: pngData }, // wrong claimed type is ignored
                { name: "b.jpg", data: jpgData },
            ],
        });
        assert.equal(res.status, 200);
        assert.equal(calls[0].body.model, "vision-model");
        const content = userContent(calls[0]);
        assert.ok(Array.isArray(content));
        assert.equal(content[0].type, "text");
        assert.match(content[0].text, /typed notes/);
        assert.deepEqual(content.slice(1).map((p) => p.image_url.url), [`data:image/png;base64,${pngData}`, `data:image/jpeg;base64,${jpgData}`]);
        assert.deepEqual(calls[0].body.response_format, { type: "json_object" });
    });
});

test("a photo together with a PDF sends the PDF text and the image in one vision request", async () => {
    await withServer([groqReply(goodSet())], async ({ post, calls }) => {
        const res = await post({
            files: [
                { name: "notes.pdf", data: textPdf("Hollowmere Treaty was signed in 1651") },
                { name: "board.jpg", data: jpg() },
            ],
        });
        assert.equal(res.status, 200);
        assert.equal(calls.length, 1);
        assert.equal(calls[0].body.model, "vision-model");
        const content = userContent(calls[0]);
        assert.match(content[0].text, /Hollowmere Treaty was signed in 1651/);
        assert.equal(content.filter((p) => p.type === "image_url").length, 1);
    });
});

test("photos are refused clearly when no vision model is configured", async () => {
    await withServer([], async ({ post, calls }) => {
        const res = await post({ files: [{ name: "a.png", data: png() }] });
        assert.equal(res.status, 503);
        assert.match((await res.json()).error, /Reading photos is not set up/);
        assert.equal(calls.length, 0);
    }, { GROQ_API_KEY: KEY, GROQ_MODEL: "text-model" });
});

// ---- upload validation -----------------------------------------------------------------
test("file type is detected from content; GIF, HEIC and fake PDFs are rejected before Groq", async () => {
    await withServer([], async ({ post, calls }) => {
        const fake = Buffer.from("this is plain text pretending to be a pdf").toString("base64");
        assert.equal((await post({ files: [{ name: "a.pdf", mimeType: "application/pdf", data: fake }] })).status, 415);
        assert.equal((await post({ files: [{ name: "a.gif", data: gif() }] })).status, 415);
        const h = await post({ files: [{ name: "a.heic", data: heic() }] });
        assert.equal(h.status, 415);
        assert.match((await h.json()).error, /HEIC/);
        assert.equal((await post({ files: [{ name: "bad", data: "not*base64!" }] })).status, 400);
        assert.equal((await post({ files: [{ name: "e.pdf", data: "" }] })).status, 400);
        assert.equal(calls.length, 0);
    });
});

test("more than 5 files, or more than 3 photos, is rejected", async () => {
    await withServer([], async ({ post, calls }) => {
        const six = Array.from({ length: 6 }, (_, i) => ({ name: i + ".pdf", data: textPdf("text number " + i) }));
        const r1 = await post({ files: six });
        assert.equal(r1.status, 400);
        assert.match((await r1.json()).error, /maximum of 5/);
        const four = Array.from({ length: 4 }, (_, i) => ({ name: i + ".png", data: png() }));
        const r2 = await post({ files: four });
        assert.equal(r2.status, 400);
        assert.match((await r2.json()).error, /up to 3 photos/);
        assert.equal(calls.length, 0);
    });
});

test("total decoded size over 10 MB is rejected; a request body over the transport limit returns 413", async () => {
    await withServer([], async ({ post, calls }) => {
        const big = pdfOfSize(5.5 * 1024 * 1024);
        const res = await post({ files: [{ name: "a.pdf", data: big }, { name: "b.pdf", data: big }] });
        assert.equal(res.status, 413);
        assert.equal((await post({ files: [{ name: "a.pdf", data: "A".repeat(18 * 1024 * 1024) }] })).status, 413);
        assert.equal(calls.length, 0);
    });
});

// ---- output validation ----------------------------------------------------------------------
test("wrong counts are retried once and then fail with 502 (never more than 2 calls)", async () => {
    await withServer([groqReply(goodSet({ cards: 5 })), groqReply(goodSet({ questions: 7 }))], async ({ post, calls }) => {
        assert.equal((await post({ text: "notes" })).status, 502);
        assert.equal(calls.length, 2);
    });
});

test("malformed JSON is retried once with a repair note, then succeeds", async () => {
    await withServer([completion("{oops"), groqReply(goodSet())], async ({ post, calls }) => {
        assert.equal((await post({ text: "notes" })).status, 200);
        assert.equal(calls.length, 2);
        assert.match(userContent(calls[1]), /previous answer was rejected/);
    });
});

test("empty and truncated answers are retried once", async () => {
    await withServer([completion(""), groqReply(goodSet())], async ({ post, calls }) => {
        assert.equal((await post({ text: "notes" })).status, 200);
        assert.equal(calls.length, 2);
    });
    const cut = () => completion('{"topicTitle":"x"', "length");
    await withServer([cut, cut], async ({ post, calls }) => {
        assert.equal((await post({ text: "notes" })).status, 502);
        assert.equal(calls.length, 2);
    });
});

test("Groq's json_validate_failed (HTTP 400) is treated as bad output and retried once", async () => {
    await withServer([groqError(400, { code: "json_validate_failed", message: "Failed to generate JSON." }), groqReply(goodSet())], async ({ post, calls, sleeps }) => {
        assert.equal((await post({ text: "notes" })).status, 200);
        assert.equal(calls.length, 2);
        assert.match(userContent(calls[1]), /not valid JSON/);
        assert.deepEqual(sleeps, []); // no pause needed for a fresh attempt
    });
});

test("extra items are trimmed to exactly 8 and 10, and every question needs an explanation", async () => {
    await withServer([groqReply(goodSet({ cards: 11, questions: 12 }))], async ({ post }) => {
        const body = await (await post({ text: "notes" })).json();
        assert.equal(body.flashcards.length, 8);
        assert.equal(body.quiz.questions.length, 10);
        assert.deepEqual(body.quiz.questions.map((q) => q.id), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    });
    const noExplanation = goodSet();
    noExplanation.quiz.questions[3].explanation = "";
    await withServer([groqReply(noExplanation), groqReply(goodSet())], async ({ post, calls }) => {
        assert.equal((await post({ text: "notes" })).status, 200);
        assert.match(userContent(calls[1]), /10 valid questions/);
    });
});

test("material with no study content returns 422", async () => {
    await withServer([groqReply({ error: "unreadable" })], async ({ post }) => {
        assert.equal((await post({ text: "asdf" })).status, 422);
    });
});

test("normalize rejects duplicate options and out-of-range answers, accepts numeric-string answers", () => {
    const dup = goodSet();
    dup.quiz.questions[0].options = ["same", "same", "b", "c"];
    assert.throws(() => normalize(dup), /10 valid questions/);
    const str = goodSet();
    str.quiz.questions[0].correctAnswer = "2";
    assert.equal(normalize(str).quiz.questions[0].correctAnswer, 2);
    const out = goodSet();
    out.quiz.questions[0].correctAnswer = 4;
    assert.throws(() => normalize(out), /10 valid questions/);
});

// ---- provider failures: messages, retries, backoff ------------------------------------------------
test("each Groq error maps to a clear message and the right retry behaviour", async () => {
    const cases = [
        { name: "400", replies: [groqError(400)], status: 502, message: /could not read this material/, calls: 1 },
        { name: "401", replies: [groqError(401, { code: "invalid_api_key" })], status: 502, message: /key is not valid/, calls: 1 },
        { name: "403", replies: [groqError(403)], status: 502, message: /key is not valid or is not allowed/, calls: 1 },
        { name: "404", replies: [groqError(404, { code: "model_not_found" })], status: 502, message: /AI model "text-model" is not available for this server's API key/, calls: 1 },
        { name: "retired model", replies: [groqError(400, { code: "model_decommissioned" })], status: 502, message: /AI model "text-model" is not available.*GROQ_MODEL/, calls: 1 },
        { name: "413", replies: [groqError(413)], status: 413, message: /too large for the AI/, calls: 1 },
        { name: "429 no retry-after", replies: [groqError(429)], status: 429, message: /limit has been reached/, calls: 1 },
        { name: "500", replies: [groqError(500), groqError(500)], status: 502, message: /having problems/, calls: 2, sleeps: [LIMITS.retryBackoffMs] },
        { name: "503", replies: [groqError(503), groqError(503)], status: 503, message: /overloaded/, calls: 2, sleeps: [LIMITS.retryBackoffMs] },
        { name: "498 capacity", replies: [groqError(498), groqError(498)], status: 502, message: /having problems/, calls: 2, sleeps: [LIMITS.retryBackoffMs] },
    ];
    for (const c of cases) {
        await withServer([...c.replies], async ({ post, calls, sleeps }) => {
            const res = await post({ text: "notes" });
            const body = await res.json();
            assert.equal(res.status, c.status, c.name + " status");
            assert.match(body.error, c.message, c.name + " message");
            assert.equal(calls.length, c.calls, c.name + " call count");
            assert.deepEqual(sleeps, c.sleeps || [], c.name + " backoff");
        });
    }
});

test("a short per-minute 429 waits for retry-after and retries once; a long (daily) one does not", async () => {
    await withServer([groqError(429, { retryAfter: 3 }), groqReply(goodSet())], async ({ post, calls, sleeps }) => {
        assert.equal((await post({ text: "notes" })).status, 200);
        assert.equal(calls.length, 2);
        assert.deepEqual(sleeps, [3000]);
    });
    await withServer([groqError(429, { retryAfter: 3 }), groqError(429, { retryAfter: 3 })], async ({ post, calls }) => {
        assert.equal((await post({ text: "notes" })).status, 429);
        assert.equal(calls.length, 2); // bounded: never a third call
    });
    await withServer([groqError(429, { retryAfter: 7200 })], async ({ post, calls, sleeps }) => {
        const res = await post({ text: "notes" });
        assert.equal(res.status, 429);
        assert.match((await res.json()).error, /about 120 minutes/);
        assert.equal(calls.length, 1);
        assert.deepEqual(sleeps, []);
    });
    await withServer([groqError(429, { retryAfter: 20 })], async ({ post, calls }) => {
        const res = await post({ text: "notes" });
        assert.match((await res.json()).error, /about 20 seconds/);
        assert.equal(calls.length, 1); // 20 s is above the retry ceiling
    });
});

test("a transient 5xx is retried once after backoff and can succeed", async () => {
    await withServer([groqError(503), groqReply(goodSet())], async ({ post, calls, sleeps }) => {
        assert.equal((await post({ text: "notes" })).status, 200);
        assert.equal(calls.length, 2);
        assert.deepEqual(sleeps, [LIMITS.retryBackoffMs]);
    });
});

test("timeouts return 504 without retrying", async () => {
    const timeout = () => {
        throw Object.assign(new Error("t"), { name: "TimeoutError" });
    };
    await withServer([timeout], async ({ post, calls }) => {
        assert.equal((await post({ text: "notes" })).status, 504);
        assert.equal(calls.length, 1);
    });
});

test("a network failure is retried once after backoff, without a bogus repair note", async () => {
    const down = () => {
        throw new TypeError("fetch failed: ECONNRESET 10.0.0.1");
    };
    await withServer([down, groqReply(goodSet())], async ({ post, calls, sleeps }) => {
        assert.equal((await post({ text: "notes" })).status, 200);
        assert.doesNotMatch(userContent(calls[1]), /previous answer was rejected/);
        assert.deepEqual(sleeps, [LIMITS.retryBackoffMs]);
    });
    await withServer([down, down], async ({ post, calls }) => {
        const res = await post({ text: "notes" });
        assert.equal(res.status, 502);
        assert.ok(!JSON.stringify(await res.json()).includes("ECONNRESET"));
        assert.equal(calls.length, 2);
    });
});

// ---- logging ----------------------------------------------------------------------------------------
test("logs never contain notes, PDF text, base64 data or the API key, but do say what failed", async () => {
    const lines = [];
    const original = console.error;
    console.error = (...a) => lines.push(a.join(" "));
    try {
        const secretNotes = "SECRET-NOTES-CONTENT-12345";
        const secretPdf = "SECRET-PDF-CONTENT-67890";
        const files = [{ name: "x.pdf", data: textPdf(secretPdf) }, { name: "y.png", data: png() }];
        const failure = new Response(
            JSON.stringify({
                error: {
                    code: "bad_thing",
                    message: `Request failed for key ${KEY} with payload ${"QUJD".repeat(40)} because the input was odd`,
                    failed_generation: secretNotes + " " + secretPdf, // Groq echoes model output here: must not be logged
                },
            }),
            { status: 400 }
        );
        await withServer([completion("not json " + secretNotes), failure], async ({ post }) => {
            await post({ text: secretNotes, files });
        });
        await withServer([groqError(401, { code: "invalid_api_key" })], async ({ post }) => {
            await post({ text: secretNotes });
        });
    } finally {
        console.error = original;
    }
    const all = lines.join("\n");
    assert.ok(lines.length > 0);
    for (const secret of ["SECRET-NOTES", "SECRET-PDF", KEY, "QUJDQUJD", "iVBORw"]) assert.ok(!all.includes(secret), "leaked " + secret);
    assert.match(all, /model=vision-model http=400 bad_thing/);
    assert.match(all, /because the input was odd/);
    assert.match(all, /http=401 invalid_api_key/);
});

test("sanitizeForLog redacts keys and long data runs and caps the length", () => {
    assert.equal(sanitizeForLog("bad key gsk_abcdefghijklmnopqrstuvwxyz1234 here"), "bad key [key] here");
    assert.equal(sanitizeForLog("x " + "A".repeat(100) + " y"), "x [data] y");
    assert.equal(sanitizeForLog("secret-xyz in text", "secret-xyz"), "[key] in text");
    assert.equal(sanitizeForLog("a ".repeat(500)).length, 200);
    assert.equal(sanitizeForLog(undefined), "");
});

test("sniffMime recognises supported types only", () => {
    assert.equal(sniffMime(Buffer.from("%PDF-1.7 xxxxxxxx")), "application/pdf");
    assert.equal(sniffMime(Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0, 0, 0, 0, 0, 0, 0, 0])), "image/jpeg");
    assert.equal(sniffMime(Buffer.from("MZ executable bytes here")), null);
});
