// Record of quizzes the student has finished. The dashboard statistics are computed from it.
//
// Stored in localStorage (not sessionStorage like the current study set): "quizzes taken" is a
// lifetime figure, so it must survive closing the tab. Each entry is keyed by an attempt id, so
// recording the same attempt again can never count it twice.

export const HISTORY_KEY = 'studysaathi.quizHistory';
const MAX_ENTRIES = 1000;

export const newAttemptId = () => Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10);

const isValidEntry = (e) =>
  e &&
  typeof e === 'object' &&
  typeof e.attemptId === 'string' &&
  e.attemptId &&
  Number.isInteger(e.total) &&
  e.total > 0 &&
  Number.isInteger(e.correct) &&
  e.correct >= 0 &&
  e.correct <= e.total &&
  !Number.isNaN(Date.parse(e.completedAt));

/** Read the saved history. Anything malformed or duplicated is dropped. */
export function loadHistory(storage) {
  try {
    const saved = JSON.parse(storage.getItem(HISTORY_KEY) || '[]');
    if (!Array.isArray(saved)) return [];
    const seen = new Set();
    return saved
      .filter(isValidEntry)
      .filter((e) => (seen.has(e.attemptId) ? false : seen.add(e.attemptId)))
      .sort((a, b) => Date.parse(a.completedAt) - Date.parse(b.completedAt));
  } catch {
    return [];
  }
}

export function saveHistory(storage, history) {
  try {
    storage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch {
    /* storage full or blocked: the in-memory history still works for this visit */
  }
}

/** Build a history entry from a finished attempt. The score comes from the answers and the answer key. */
export function buildEntry({ attemptId, sessionId, title, source, questions, answers, now = new Date() }) {
  const correct = questions.filter((q) => answers[q.id] === q.correctAnswer).length;
  return {
    attemptId,
    sessionId: sessionId || '',
    title: String(title || 'Study set'),
    source: source === 'demo' ? 'demo' : 'ai',
    correct,
    total: questions.length,
    percent: Math.round((correct / questions.length) * 100),
    completedAt: now.toISOString(),
  };
}

/**
 * Add a finished attempt. If this attempt is already recorded (a second submit of the same
 * attempt, or a refresh) it is updated in place, never counted again.
 */
export function upsertAttempt(history, entry) {
  if (!isValidEntry(entry)) return history;
  const existing = history.find((e) => e.attemptId === entry.attemptId);
  if (existing) {
    return history.map((e) =>
      e.attemptId === entry.attemptId ? { ...entry, completedAt: existing.completedAt } : e
    );
  }
  return [...history, entry].slice(-MAX_ENTRIES);
}

const dayKey = (date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

/** Numbers for the dashboard tiles. Everything is derived from the recorded attempts. */
export function summarizeHistory(history, now = new Date()) {
  const count = history.length;
  if (count === 0) return { count: 0, average: null, best: null, streak: 0 };

  const average = Math.round(history.reduce((sum, e) => sum + (e.correct / e.total) * 100, 0) / count);
  const best = Math.round(Math.max(...history.map((e) => (e.correct / e.total) * 100)));

  // Study streak: consecutive days with at least one finished quiz, counting back from today
  // (or from yesterday, so the streak is not lost before the student has studied today).
  const days = new Set(history.map((e) => dayKey(new Date(e.completedAt))));
  const cursor = new Date(now);
  if (!days.has(dayKey(cursor))) cursor.setDate(cursor.getDate() - 1);
  let streak = 0;
  while (days.has(dayKey(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return { count, average, best, streak };
}
