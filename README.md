# StudySaathi AI

Turn class notes, PDFs and photos of notebooks into a summary, 8 flashcards and a 10-question quiz. Built for students who want to revise fast.

You add your material, the AI reads it, and you get a study set you can read, flip through and be tested on. Your quiz progress and score are saved, so a refresh never loses your place.

## How it works

```
Create page  ->  POST /api/generate  ->  Express server  ->  Groq  ->  validated study set  ->  Results / Quiz / Score
```

1. **Add material.** Type notes, upload PDFs, or add photos. Drag and drop works.
2. **Server checks the upload.** File type is detected from the file's first bytes, not its name. Limits are 5 files, 3 photos and 10 MB in total.
3. **Content is prepared.**
   - PDFs are turned into text on the server. Groq does not take PDF files.
   - Photos go to a vision model.
   - Scanned PDFs have no text to read, so they are refused with a clear message. Upload photos of the pages instead.
4. **Groq generates JSON.** One call to a text model, or the vision model when photos are included.
5. **The result is validated before anyone sees it.** Exactly 8 flashcards, exactly 10 questions, four different options each, a valid correct answer and an explanation. If the output is bad, the server asks once more. If it still fails, you get an error. Sample data is never used as a fallback.
6. **The browser keeps the set.** It is stored for the tab session, and Results, Quiz and Score all read the same set.
7. **Quiz and score.** Answers and position are saved as you go. The score is calculated from your answers and the answer key, never by the AI. Generating a new set resets the quiz.

If a generation fails, your files, notes and the previous study set stay as they were so you can retry.

## Tech stack

| Layer | What |
|---|---|
| Frontend | React 18, React Router 7, Vite 6 |
| Styling | Tailwind (CDN) plus a small custom CSS system: glass surfaces, neumorphic controls |
| State | React Context, saved in `sessionStorage` |
| Backend | Node.js 20.6+, Express 5, one file: `server/server.mjs` |
| PDF text | `unpdf` |
| AI | Groq chat completions API (OpenAI-compatible), JSON mode |
| Tests | Node test runner (server), Vitest, jsdom and Testing Library (UI) |

Default models: `openai/gpt-oss-120b` for text and PDFs, `qwen/qwen3.8-27b` for photos.

## Run it locally

```
npm install
cp .env.example .env      # then add your Groq key
npm run server            # terminal 1, API on port 8787
npm run dev               # terminal 2, app on http://localhost:5173
```

Get a free key at https://console.groq.com/keys. The key stays on the server and is never sent to the browser.

## Configuration

Set these in `.env`:

| Variable | Purpose |
|---|---|
| `GROQ_API_KEY` | Your Groq key |
| `GROQ_MODEL` | Model for notes and PDF text |
| `GROQ_VISION_MODEL` | Model for photos. Leave empty to turn photos off |
| `GROQ_MAX_INPUT_CHARS` | Most text sent to the model at once (default 20000) |
| `PORT` | API port (default 8787). The Vite proxy reads the same value |

Groq's docs can list models that your key cannot use, so check the live list:

```
curl -s -H "Authorization: Bearer $GROQ_API_KEY" https://api.groq.com/openai/v1/models
```

The server also checks this list when it starts and prints a warning if a configured model is missing. `GET /api/health` shows the provider and models, never the key.

## Tests

```
npm test            # server tests, then UI tests
npm run build       # production build
```

Groq is mocked in the tests, so they use no quota and need no key.

## Good to know

- Photos: JPG, PNG or WebP, up to 3 per request. HEIC is not supported.
- Material over the character limit is rejected with the numbers, never silently cut.
- Groq free plans have small per-minute token limits. The server waits and retries once for short limits, and tells you how long to wait for long ones.
- Dashboard quiz stats (quizzes taken, average and best score, study streak) are real. They are computed from the quizzes you finish and kept in this browser's local storage, one record per attempt, so a refresh or a reopened score page never counts twice. "Sets Created" and the recent set cards are still demo content, and only the Number System card opens a real sample set.

## Project layout

```
server/server.mjs     API: validation, PDF text, Groq call, output checks
server/server.test.mjs
src/pages/            Home, Dashboard, Create, Results, Quiz, Score
src/components/       Card, Button, Navbar, bottom nav, quiz header
src/context/          Study set and quiz progress state
src/lib/              Quiz save, restore and scoring logic
src/api/              Browser side call to /api/generate
src/data/             Sample set (demo card) and study set validator
SAATHI/               Original design mockups
```
