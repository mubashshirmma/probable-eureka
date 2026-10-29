import test from "node:test";
import assert from "node:assert/strict";
import { createApp, normalize, sniffMime } from "./server.mjs";

const KEY = "test-secret-key-123";
const ENV = { GEMINI_API_KEY: KEY, GEMINI_MODEL: "models/test-model" };

const pdf = (bytes = 1000) => Buffer.concat([Buffer.from("%PDF-1.4\n"), Buffer.alloc(bytes)]).toString("base64");

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

const geminiReply = (obj, { fenced = false } = {}) => {
    const text = fenced ? "```json\n" + JSON.stringify(obj) + "\n```" : JSON.stringify(obj);
    return new Response(JSON.stringify({ candidates: [{ content: { parts: [{ text }] } }] }), { status: 200 });
};

/** Start the app on a random port with a scripted sequence of Gemini responses. */
async function withServer(replies, fn, env = ENV) {
    const calls = [];
    const fetchImpl = async (url, init) => {
        calls.push({ url, init });
        const next = replies.shift();
        if (!next) throw new Error("unexpected extra Gemini call");
        return typeof next === "function" ? next() : next;
    };
    const server = createApp({ env, fetchImpl }).listen(0);
    const base = "http://127.0.0.1:" + server.address().port;
    const post = (body, raw) =>
        fetch(base + "/api/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: raw ?? JSON.stringify(body),
        });
    try {
        await fn({ base, post, calls });
    } finally {
        server.close();
    }
}

test("health reports configuration without leaking the key", async () => {
    await withServer([], async ({ base }) => {
        const res = await fetch(base + "/api/health");
        const body = await res.json();
        assert.equal(res.status, 200);
        assert.equal(body.ok, true);
        assert.equal(body.model, "test-model");
        assert.ok(!JSON.stringify(body).includes(KEY));
    });
    await withServer([], async ({ base }) => {
        const res = await fetch(base + "/api/health");
        assert.equal(res.status, 503);
        assert.equal((await res.json()).configured, false);
    }, {});
});

test("generate without an API key returns 503 and does not call Gemini", async () => {
    await withServer([], async ({ post, calls }) => {
        const res = await post({ text: "notes" });
        assert.equal(res.status, 503);
        assert.equal(calls.length, 0);
    }, {});
});

test("valid notes return 8 flashcards and 10 four-option questions (fenced JSON accepted)", async () => {
    await withServer([geminiReply(goodSet(), { fenced: true })], async ({ post, calls }) => {
        const res = await post({ text: "Plants use light to make food.", title: "Bio" });
        const body = await res.json();
        assert.equal(res.status, 200);
        assert.equal(body.flashcards.length, 8);
        assert.equal(body.quiz.questions.length, 10);
        for (const q of body.quiz.questions) {
            assert.equal(q.options.length, 4);
            assert.ok(Number.isInteger(q.correctAnswer) && q.correctAnswer >= 0 && q.correctAnswer <= 3);
        }
        assert.equal(calls.length, 1);
        assert.ok(calls[0].url.includes("/models/test-model:generateContent"));
        assert.equal(calls[0].init.headers["x-goog-api-key"], KEY); // key only goes to Google
        assert.ok(!JSON.stringify(body).includes(KEY));
    });
});

test("empty input and bad bodies are rejected before calling Gemini", async () => {
    await withServer([], async ({ post, calls }) => {
        assert.equal((await post({ text: "   ", files: [] })).status, 400);
        assert.equal((await post({})).status, 400);
        assert.equal((await post({ text: 5 })).status, 400);
        assert.equal((await post(null, "{not json")).status, 400);
        assert.equal(calls.length, 0);
    });
});

test("file type is detected from content, not from the claimed MIME type", async () => {
    await withServer([], async ({ post, calls }) => {
        const fake = Buffer.from("this is plain text pretending to be a pdf").toString("base64");
        const res = await post({ files: [{ name: "a.pdf", mimeType: "application/pdf", data: fake }] });
        assert.equal(res.status, 415);
        const bad = await post({ files: [{ name: "a.pdf", data: "not*base64!" }] });
        assert.equal(bad.status, 400);
        assert.equal(calls.length, 0);
    });
});

test("more than 5 files is rejected", async () => {
    await withServer([], async ({ post }) => {
        const files = Array.from({ length: 6 }, (_, i) => ({ name: i + ".pdf", data: pdf() }));
        const res = await post({ files });
        assert.equal(res.status, 400);
        assert.match((await res.json()).error, /maximum of 5/);
    });
});

test("total decoded size over 10 MB is rejected", async () => {
    await withServer([], async ({ post, calls }) => {
        const big = pdf(5.5 * 1024 * 1024);
        const res = await post({ files: [{ name: "a.pdf", data: big }, { name: "b.pdf", data: big }] });
        assert.equal(res.status, 413);
        assert.equal(calls.length, 0);
    });
});

test("a request body over the transport limit returns 413", async () => {
    await withServer([], async ({ post }) => {
        const res = await post({ files: [{ name: "a.pdf", data: "A".repeat(18 * 1024 * 1024) }] });
        assert.equal(res.status, 413);
    });
});

test("malformed JSON from Gemini is retried once, then succeeds", async () => {
    const broken = new Response(JSON.stringify({ candidates: [{ content: { parts: [{ text: "{oops" }] } }] }), { status: 200 });
    await withServer([broken, geminiReply(goodSet())], async ({ post, calls }) => {
        const res = await post({ text: "notes" });
        assert.equal(res.status, 200);
        assert.equal(calls.length, 2);
        assert.match(calls[1].init.body, /previous answer was rejected/);
    });
});

test("wrong counts are retried once and then fail with 502 (never more than 2 calls)", async () => {
    await withServer([geminiReply(goodSet({ cards: 5 })), geminiReply(goodSet({ questions: 7 }))], async ({ post, calls }) => {
        const res = await post({ text: "notes" });
        assert.equal(res.status, 502);
        assert.equal(calls.length, 2);
    });
});

test("extra items are trimmed to exactly 8 and 10", async () => {
    await withServer([geminiReply(goodSet({ cards: 11, questions: 12 }))], async ({ post }) => {
        const body = await (await post({ text: "notes" })).json();
        assert.equal(body.flashcards.length, 8);
        assert.equal(body.quiz.questions.length, 10);
        assert.deepEqual(body.quiz.questions.map((q) => q.id), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    });
});

test("auth errors and rate limits are not retried and map to safe messages", async () => {
    await withServer([new Response("{}", { status: 403 })], async ({ post, calls }) => {
        const res = await post({ text: "notes" });
        assert.equal(res.status, 502);
        assert.equal(calls.length, 1);
        assert.ok(!JSON.stringify(await res.json()).includes(KEY));
    });
    await withServer([new Response("{}", { status: 429 })], async ({ post, calls }) => {
        assert.equal((await post({ text: "notes" })).status, 429);
        assert.equal(calls.length, 1);
    });
});

test("transient 503 is retried once", async () => {
    await withServer([new Response("{}", { status: 503 }), geminiReply(goodSet())], async ({ post, calls }) => {
        assert.equal((await post({ text: "notes" })).status, 200);
        assert.equal(calls.length, 2);
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

test("material with no study content returns 422", async () => {
    await withServer([geminiReply({ error: "unreadable" })], async ({ post }) => {
        assert.equal((await post({ text: "asdf" })).status, 422);
    });
});

test("normalize rejects duplicate options and accepts numeric-string answers", () => {
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

test("sniffMime recognises supported types only", () => {
    assert.equal(sniffMime(Buffer.from("%PDF-1.7 xxxxxxxx")), "application/pdf");
    assert.equal(sniffMime(Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0, 0, 0, 0, 0, 0, 0, 0])), "image/jpeg");
    assert.equal(sniffMime(Buffer.from("MZ executable bytes here")), null);
});
