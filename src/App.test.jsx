import React from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import App from './App';
import { studySetData } from './data/sampleData';

// ---------------------------------------------------------------------------
// Test helpers. The AI provider is never called: fetch is mocked, and the "server"
// response is a study set shaped exactly like the real /api/generate output.
// ---------------------------------------------------------------------------
const makeSet = (label, count = 3) => ({
  topicTitle: `${label} Title`,
  gradeSubject: 'AI Generated',
  curriculumBadge: 'From your notes',
  subtitle: `${label} subtitle`,
  summary: {
    quickSummary: `${label} quick summary text`,
    hierarchy: [
      { symbol: 'A', name: 'Alpha', highlight: false },
      { symbol: 'B', name: 'Beta', highlight: true },
    ],
    keyConcepts: [
      { id: 'c1', symbol: 'A', title: `${label} Concept One`, badge: 'Key', description: 'Concept one description', code: 'x', isHighlight: false },
      { id: 'c2', symbol: 'B', title: `${label} Concept Two`, badge: 'Key', description: 'Concept two description', code: 'y', isHighlight: false },
    ],
  },
  flashcards: [1, 2].map((i) => ({ id: i, type: 'TERM', question: `${label} flash question ${i}`, answer: `${label} flash answer ${i}` })),
  quiz: {
    totalQuestions: count,
    timeLimitMinutes: 5,
    format: 'MCQ',
    coveredConcepts: ['Alpha'],
    targetAccuracy: '2/3',
    questions: Array.from({ length: count }, (_, i) => ({
      id: i + 1,
      topic: 'Alpha',
      question: `${label} question ${i + 1}?`,
      subtitle: 'Pick one',
      options: [0, 1, 2, 3].map((o) => `${label} q${i + 1} option ${o}`),
      correctAnswer: i % 4, // q1 -> option 0, q2 -> option 1, q3 -> option 2
      explanation: `${label} explanation ${i + 1}`,
    })),
  },
});

const SET_KEY = 'studysaathi.activeStudySet';
const QUIZ_KEY = 'studysaathi.quizProgress';

const seedSet = (set, source = 'ai', sessionId = 'seeded-session') =>
  sessionStorage.setItem(SET_KEY, JSON.stringify({ studySet: set, source, sessionId }));
const storedSet = () => JSON.parse(sessionStorage.getItem(SET_KEY) || 'null');

/** "Opening" or "refreshing" a page: mount the whole app at a URL with the current storage. */
const openApp = (path) => {
  window.history.pushState({}, '', path);
  return render(<App />);
};
const refresh = (view) => {
  const path = window.location.pathname;
  view.unmount();
  cleanup();
  return openApp(path);
};

const jsonResponse = (body, status = 200) =>
  Promise.resolve({ ok: status < 400, status, json: () => Promise.resolve(body) });

const clickOption = (label, q, o) =>
  fireEvent.click(screen.getByText(`${label} q${q} option ${o}`).closest('label'));
const clickButton = (name) => fireEvent.click(screen.getByRole('button', { name }));
// Results page tabs (the sidebar has links with similar names, so look only inside the page nav).
const clickTab = (name) =>
  fireEvent.click([...document.querySelectorAll('main nav button')].find((b) => b.textContent.endsWith(name)));
// The score ring renders e.g. "67% SCORE" in its own element.
const expectScore = (pct) => {
  const el = [...document.querySelectorAll('span')].find((e) => /^\d+% SCORE$/.test(e.textContent.trim()));
  expect(el, 'score element').toBeTruthy();
  expect(el.textContent.trim()).toBe(`${pct}% SCORE`);
};

/** Answer questions of the given set; `picks` is the option index per question. */
const answerAll = (label, picks) => {
  picks.forEach((pick, i) => {
    clickOption(label, i + 1, pick);
    clickButton(i === picks.length - 1 ? /Submit Quiz/ : /Next Question/);
  });
};

beforeEach(() => {
  sessionStorage.clear();
  window.history.pushState({}, '', '/');
  vi.stubGlobal('fetch', vi.fn(() => Promise.reject(new Error('unexpected fetch'))));
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

// ---------------------------------------------------------------------------
describe('generation from the Create Set page', () => {
  it('sends notes and a file to /api/generate, stores the result and opens /results', async () => {
    fetch.mockImplementation(() => jsonResponse(makeSet('Gen')));
    openApp('/create');

    fireEvent.change(screen.getByPlaceholderText(/Type or paste concepts/), { target: { value: 'Some real notes' } });
    const pdfInput = document.querySelector('input[accept=".pdf,application/pdf"]');
    const file = new File(['%PDF-1.4 fake'], 'notes.pdf', { type: 'application/pdf' });
    fireEvent.change(pdfInput, { target: { files: [file] } });
    clickButton(/Generate Study Materials/);

    await waitFor(() => expect(screen.getByText('Gen Title')).toBeTruthy());
    expect(window.location.pathname).toBe('/results');

    expect(fetch).toHaveBeenCalledTimes(1);
    const [url, init] = fetch.mock.calls[0];
    expect(url).toBe('/api/generate');
    expect(init.method).toBe('POST');
    const body = JSON.parse(init.body);
    expect(body.text).toBe('Some real notes');
    expect(body.files).toHaveLength(1);
    expect(body.files[0].name).toBe('notes.pdf');
    expect(atob(body.files[0].data)).toBe('%PDF-1.4 fake'); // real file bytes, base64 encoded
    expect(storedSet().studySet.topicTitle).toBe('Gen Title');
    expect(storedSet().source).toBe('ai');
  });

  it('blocks empty input without calling the API', () => {
    openApp('/create');
    clickButton(/Generate Study Materials/);
    expect(screen.getByText(/Please add some notes/)).toBeTruthy();
    expect(fetch).not.toHaveBeenCalled();
    expect(window.location.pathname).toBe('/create');
  });

  it('sends only one request when the button is clicked repeatedly', async () => {
    let finish;
    fetch.mockImplementation(() => new Promise((resolve) => { finish = () => resolve({ ok: true, status: 200, json: () => Promise.resolve(makeSet('Once')) }); }));
    openApp('/create');
    fireEvent.change(screen.getByPlaceholderText(/Type or paste concepts/), { target: { value: 'notes' } });
    const button = screen.getByRole('button', { name: /Generate Study Materials/ });
    fireEvent.click(button);
    fireEvent.click(button);
    fireEvent.click(button);
    await waitFor(() => expect(fetch).toHaveBeenCalled());
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(screen.getByText(/analyzing your material/)).toBeTruthy();
    finish();
    await waitFor(() => expect(window.location.pathname).toBe('/results'));
  });

  it('keeps the uploaded PDF and notes after a failure and succeeds on retry without re-adding anything', async () => {
    seedSet(makeSet('Previous'));
    fetch
      .mockImplementationOnce(() => jsonResponse({ error: 'The AI service is overloaded right now. Please try again in a minute.' }, 503))
      .mockImplementationOnce(() => jsonResponse(makeSet('Retry')));
    openApp('/create');

    fireEvent.change(screen.getByPlaceholderText(/Type or paste concepts/), { target: { value: 'my notes' } });
    const file = new File(['%PDF-1.4 demo'], 'StudySaathi_AI_Demo_Notes.pdf', { type: 'application/pdf' });
    fireEvent.change(document.querySelector('input[accept=".pdf,application/pdf"]'), { target: { files: [file] } });
    expect(screen.getByText('StudySaathi_AI_Demo_Notes.pdf')).toBeTruthy();

    clickButton(/Generate Study Materials/);
    await waitFor(() => expect(screen.getByText(/overloaded right now/)).toBeTruthy());

    // Still on the page, with the file, the notes and the previous study set all intact.
    expect(window.location.pathname).toBe('/create');
    expect(screen.getByText('StudySaathi_AI_Demo_Notes.pdf')).toBeTruthy();
    expect(screen.getByPlaceholderText(/Type or paste concepts/).value).toBe('my notes');
    expect(storedSet().studySet.topicTitle).toBe('Previous Title');

    // Retry with the same button: the same file is sent again.
    clickButton(/Generate Study Materials/);
    await waitFor(() => expect(window.location.pathname).toBe('/results'));
    expect(fetch).toHaveBeenCalledTimes(2);
    const retryBody = JSON.parse(fetch.mock.calls[1][1].body);
    expect(retryBody.files[0].name).toBe('StudySaathi_AI_Demo_Notes.pdf');
    expect(atob(retryBody.files[0].data)).toBe('%PDF-1.4 demo');
    expect(storedSet().studySet.topicTitle).toBe('Retry Title');
  });

  it.each(['400', '401', '429', '503', '504'])('shows the server\'s specific message for HTTP %s', async (code) => {
    const messages = {
      400: 'The AI could not read this material. Try a smaller or clearer file.',
      401: 'The AI service key is not valid.',
      429: 'The AI service limit has been reached (too many requests or the quota is used up).',
      503: 'The AI service is overloaded right now. Please try again in a minute.',
      504: 'The AI took too long to answer. Please try again, or use shorter notes or a smaller file.',
    };
    fetch.mockImplementation(() => jsonResponse({ error: messages[code] }, Number(code)));
    openApp('/create');
    fireEvent.change(screen.getByPlaceholderText(/Type or paste concepts/), { target: { value: 'notes' } });
    clickButton(/Generate Study Materials/);
    await waitFor(() => expect(screen.getByText(messages[code])).toBeTruthy());
    expect(window.location.pathname).toBe('/create');
  });

  it.each([
    ['rate limit (429)', () => jsonResponse({ error: 'The AI service limit has been reached.' }, 429), /limit has been reached/],
    ['server error (502)', () => jsonResponse({ error: 'The AI service is having problems right now.' }, 502), /having problems/],
    ['non-JSON error page', () => Promise.resolve({ ok: false, status: 500, json: () => Promise.reject(new Error('not json')) }), /Something went wrong/],
    ['network failure', () => Promise.reject(new TypeError('Failed to fetch')), /Could not reach the server/],
    ['incomplete schema in a 200 response', () => jsonResponse({ topicTitle: 'half a set' }), /incomplete study set/],
    ['malformed question (3 options)', () => { const s = makeSet('Bad'); s.quiz.questions[0].options.pop(); return jsonResponse(s); }, /incomplete study set/],
    ['answer index out of range', () => { const s = makeSet('Bad'); s.quiz.questions[1].correctAnswer = 9; return jsonResponse(s); }, /incomplete study set/],
  ])('keeps the previous valid study set when generation fails: %s', async (_name, respond, message) => {
    const previous = makeSet('Previous');
    seedSet(previous);
    fetch.mockImplementation(respond);
    openApp('/create');

    fireEvent.change(screen.getByPlaceholderText(/Type or paste concepts/), { target: { value: 'notes' } });
    clickButton(/Generate Study Materials/);

    await waitFor(() => expect(screen.getByText(message)).toBeTruthy());
    expect(window.location.pathname).toBe('/create');
    expect(storedSet().studySet.topicTitle).toBe('Previous Title'); // untouched, not sample data, not empty

    // The previous set is still what /results shows.
    cleanup();
    openApp('/results');
    expect(screen.getByText('Previous Title')).toBeTruthy();
    expect(screen.queryByText(/Number System/)).toBeNull();
  });

  it('shows the empty state, never sample data, when generation fails and nothing was saved', async () => {
    fetch.mockImplementation(() => jsonResponse({ error: 'The AI service key is not valid.' }, 502));
    openApp('/create');
    fireEvent.change(screen.getByPlaceholderText(/Type or paste concepts/), { target: { value: 'notes' } });
    clickButton(/Generate Study Materials/);
    await waitFor(() => expect(screen.getByText(/key is not valid/)).toBeTruthy());
    expect(storedSet()).toBeNull();

    cleanup();
    openApp('/results');
    expect(screen.getByText('No study set yet')).toBeTruthy();
    expect(screen.queryByText(/Number System/)).toBeNull();
  });
});

// ---------------------------------------------------------------------------
describe('same study session across results, quiz and score', () => {
  it('shows the generated set on /results and keeps it after a refresh', () => {
    seedSet(makeSet('Alpha'));
    let view = openApp('/results');
    expect(screen.getByText('Alpha Title')).toBeTruthy();
    expect(screen.getByText(/Alpha quick summary text/)).toBeTruthy();
    expect(screen.getByText('Alpha Concept One')).toBeTruthy();

    clickTab('Flashcards');
    expect(screen.getByText('Alpha flash question 1')).toBeTruthy();

    view = refresh(view);
    expect(screen.getByText('Alpha Title')).toBeTruthy();
    expect(screen.queryByText(/Number System/)).toBeNull();
  });

  it('walks results -> quiz -> score with the same questions and keeps progress through refreshes', () => {
    seedSet(makeSet('Alpha'));
    let view = openApp('/results');
    clickTab('Quiz');
    fireEvent.click(screen.getByRole('link', { name: /Start Quiz/ }));
    expect(window.location.pathname).toBe('/quiz');
    expect(screen.getByText('Alpha question 1?')).toBeTruthy();

    // Answer Q1, go to Q2, answer it, then refresh in the middle of the quiz.
    clickOption('Alpha', 1, 0);
    clickButton(/Next Question/);
    clickOption('Alpha', 2, 3); // wrong on purpose (key says option 1)
    view = refresh(view);
    expect(window.location.pathname).toBe('/quiz');
    expect(screen.getByText('Alpha question 2?')).toBeTruthy(); // position restored
    expect(JSON.parse(sessionStorage.getItem(QUIZ_KEY)).answers).toEqual({ 1: 0, 2: 3 });

    // Q1's answer is still selected after going back.
    clickButton(/Previous/);
    expect(screen.getByText('Alpha q1 option 0').closest('label').className).toMatch(/is-selected/);
    clickButton(/Next Question/);

    clickButton(/Next Question/); // Q2 -> Q3 (answer already stored)
    clickOption('Alpha', 3, 2); // right
    clickButton(/Submit Quiz/);
    expect(window.location.pathname).toBe('/score');

    // Score: Q1 right, Q2 wrong, Q3 right => 2 of 3 = 67%.
    expectScore(67);
    expect(screen.getByText(/Alpha explanation 2/)).toBeTruthy();

    // Refreshing the score page keeps the same score and does not bounce to the dashboard.
    view = refresh(view);
    expect(window.location.pathname).toBe('/score');
    expectScore(67);
    expect(screen.getByText(/Alpha explanation 2/)).toBeTruthy();

    // Going back to results still shows the same set.
    cleanup();
    openApp('/results');
    expect(screen.getByText('Alpha Title')).toBeTruthy();
  });

  it('calculates the score from the answer key: all right = 100%, all wrong = 0%', () => {
    seedSet(makeSet('Alpha'));
    let view = openApp('/quiz');
    answerAll('Alpha', [0, 1, 2]);
    expectScore(100);

    clickButton(/Retake Quiz/);
    expect(window.location.pathname).toBe('/quiz');
    expect(screen.getByText('Alpha question 1?')).toBeTruthy();
    expect(JSON.parse(sessionStorage.getItem(QUIZ_KEY) || 'null')?.answers ?? {}).toEqual({});
    answerAll('Alpha', [3, 3, 3]);
    expectScore(0);
  });

  it('does not wipe answers when leaving the score page for the dashboard and coming back', () => {
    seedSet(makeSet('Alpha'));
    openApp('/quiz');
    answerAll('Alpha', [0, 1, 2]);
    fireEvent.click(screen.getByRole('button', { name: /Back to Dashboard/ }));
    expect(window.location.pathname).toBe('/dashboard');
    expect(JSON.parse(sessionStorage.getItem(QUIZ_KEY)).submitted).toBe(true);
  });

  it('redirects /quiz and /score to the dashboard when there is no study set', () => {
    openApp('/quiz');
    expect(window.location.pathname).toBe('/dashboard');
    cleanup();
    openApp('/score');
    expect(window.location.pathname).toBe('/dashboard');
  });

  it('redirects /score to the dashboard when the quiz was never finished', () => {
    seedSet(makeSet('Alpha'));
    openApp('/quiz');
    clickOption('Alpha', 1, 0);
    cleanup();
    openApp('/score');
    expect(window.location.pathname).toBe('/dashboard');
  });
});

// ---------------------------------------------------------------------------
describe('starting a new session', () => {
  it('replaces the set and resets quiz progress after a successful new generation', async () => {
    seedSet(makeSet('Old'));
    let view = openApp('/quiz');
    clickOption('Old', 1, 0);
    clickButton(/Next Question/);
    expect(JSON.parse(sessionStorage.getItem(QUIZ_KEY)).answers).toEqual({ 1: 0 });
    cleanup();

    fetch.mockImplementation(() => jsonResponse(makeSet('New')));
    openApp('/create');
    fireEvent.change(screen.getByPlaceholderText(/Type or paste concepts/), { target: { value: 'fresh notes' } });
    clickButton(/Generate Study Materials/);
    await waitFor(() => expect(screen.getByText('New Title')).toBeTruthy());
    expect(storedSet().studySet.topicTitle).toBe('New Title');
    expect(sessionStorage.getItem(QUIZ_KEY)).toBeNull(); // old progress gone

    clickTab('Quiz');
    fireEvent.click(screen.getByRole('link', { name: /Start Quiz/ }));
    expect(screen.getByText('New question 1?')).toBeTruthy(); // starts at Q1
    expect(screen.getByText(/Question 1 of 3/)).toBeTruthy();
    expect(screen.queryByText(/Old question/)).toBeNull();
    // none of the new options is pre-selected
    screen.getAllByText(/New q1 option/).forEach((el) => expect(el.closest('label').className).not.toMatch(/is-selected/));
  });

  it('ignores quiz progress that belongs to a different session', () => {
    seedSet(makeSet('Alpha'), 'ai', 'session-B');
    sessionStorage.setItem(QUIZ_KEY, JSON.stringify({ sessionId: 'session-A', answers: { 1: 0, 2: 1, 3: 2 }, submitted: true, currentIndex: 2 }));
    openApp('/score');
    expect(window.location.pathname).toBe('/dashboard'); // stale "submitted" quiz is not trusted
    cleanup();
    openApp('/quiz');
    expect(screen.getByText('Alpha question 1?')).toBeTruthy();
  });

  it('survives malformed saved quiz state and malformed saved study sets', () => {
    seedSet(makeSet('Alpha'));
    sessionStorage.setItem(QUIZ_KEY, '{{{ definitely not json');
    openApp('/quiz');
    expect(screen.getByText('Alpha question 1?')).toBeTruthy();
    cleanup();

    sessionStorage.setItem(SET_KEY, JSON.stringify({ studySet: { topicTitle: 'x' }, source: 'ai' }));
    openApp('/results');
    expect(screen.getByText('No study set yet')).toBeTruthy();
  });

  it('keeps demo progress when the demo set is re-opened, and never loads the demo on its own', () => {
    openApp('/results');
    expect(screen.getByText('No study set yet')).toBeTruthy(); // no silent sample data
    cleanup();

    openApp('/dashboard');
    fireEvent.click(screen.getAllByRole('link', { name: /Take Quiz/ })[0]);
    expect(window.location.pathname).toBe('/quiz');
    expect(storedSet().source).toBe('demo');
    const first = studySetData.quiz.questions[0];
    fireEvent.click(screen.getByText(first.options[first.correctAnswer]).closest('label'));
    cleanup();

    openApp('/dashboard');
    fireEvent.click(screen.getAllByRole('link', { name: /Take Quiz/ })[0]);
    expect(JSON.parse(sessionStorage.getItem(QUIZ_KEY)).answers[first.id]).toBe(first.correctAnswer);
  });
});

// ---------------------------------------------------------------------------
describe('photo uploads', () => {
  beforeEach(() => {
    // jsdom has no object URLs; the photo preview needs them.
    URL.createObjectURL = () => 'blob:test';
    URL.revokeObjectURL = () => {};
  });
  const photoInput = () => document.querySelector('input[accept="image/*"]');
  const photo = (name, type = 'image/jpeg') => new File(['x'], name, { type });

  it('accepts up to 3 photos and refuses a 4th with a clear message, keeping the first three', () => {
    openApp('/create');
    fireEvent.change(photoInput(), { target: { files: [photo('a.jpg'), photo('b.png', 'image/png'), photo('c.webp', 'image/webp')] } });
    expect(screen.getByText('a.jpg')).toBeTruthy();
    expect(screen.getByText('c.webp')).toBeTruthy();

    fireEvent.change(photoInput(), { target: { files: [photo('d.jpg')] } });
    expect(screen.getByText('You can add up to 3 photos at a time.')).toBeTruthy();
    expect(screen.queryByText('d.jpg')).toBeNull();
    expect(screen.getByText('a.jpg')).toBeTruthy();
  });

  it('refuses unsupported photo formats (HEIC, GIF) up front', () => {
    openApp('/create');
    fireEvent.change(photoInput(), { target: { files: [photo('iphone.heic', 'image/heic')] } });
    expect(screen.getByText('Only JPG, PNG or WebP photos are allowed here.')).toBeTruthy();
    expect(screen.queryByText('iphone.heic')).toBeNull();
  });

  it('shows the server\'s message about a scanned PDF and keeps the file for a retry', async () => {
    fetch.mockImplementation(() =>
      jsonResponse({ error: '"scan.pdf" has no selectable text, so it looks like a scan. Upload photos of its pages (up to 3) or paste the text instead.' }, 422)
    );
    openApp('/create');
    fireEvent.change(document.querySelector('input[accept=".pdf,application/pdf"]'), {
      target: { files: [new File(['%PDF-1.4'], 'scan.pdf', { type: 'application/pdf' })] },
    });
    clickButton(/Generate Study Materials/);
    await waitFor(() => expect(screen.getByText(/looks like a scan/)).toBeTruthy());
    expect(screen.getByText('scan.pdf')).toBeTruthy();
    expect(window.location.pathname).toBe('/create');
  });
});
