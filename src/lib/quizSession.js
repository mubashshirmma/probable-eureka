// Pure helpers for saving and restoring quiz progress. Kept free of React so
// they can be unit tested. Progress belongs to one study session (sessionId);
// progress saved for another session is ignored.

import { newAttemptId } from './quizHistory';

export const QUIZ_STORAGE_KEY = 'studysaathi.quizProgress';

// attemptId identifies one attempt at the quiz. It is kept in the saved progress, so a refresh
// does not make a new attempt, and it is replaced only when the quiz is restarted.
export const emptyQuizState = (sessionId) => ({
  sessionId,
  attemptId: newAttemptId(),
  answers: {},
  submitted: false,
  currentIndex: 0,
});

/** Score comes only from the student's answers and the stored answer key. */
export function scoreQuiz(questions, answers) {
  let correct = 0;
  for (const q of questions) {
    if (answers[q.id] === q.correctAnswer) correct++;
  }
  return correct;
}

/** Keep only answers that refer to a real question and a real option (0 to 3). */
export function sanitizeAnswers(questions, answers) {
  const clean = {};
  if (!answers || typeof answers !== 'object') return clean;
  for (const q of questions) {
    const value = answers[q.id];
    if (Number.isInteger(value) && value >= 0 && value < (q.options?.length || 4)) {
      clean[q.id] = value;
    }
  }
  return clean;
}

/** Read saved progress. Returns an empty state when missing, malformed or from another session. */
export function loadQuizState(storage, sessionId, questions) {
  const fresh = emptyQuizState(sessionId);
  if (!sessionId || !questions.length) return fresh;
  try {
    const saved = JSON.parse(storage.getItem(QUIZ_STORAGE_KEY) || 'null');
    if (!saved || saved.sessionId !== sessionId) return fresh;

    const answers = sanitizeAnswers(questions, saved.answers);
    const allAnswered = questions.every((q) => answers[q.id] !== undefined);
    const index = Number.isInteger(saved.currentIndex) ? saved.currentIndex : 0;
    return {
      sessionId,
      attemptId: typeof saved.attemptId === 'string' && saved.attemptId ? saved.attemptId : newAttemptId(),
      answers,
      // "Submitted" is only believed when every question really has an answer.
      submitted: saved.submitted === true && allAnswered,
      currentIndex: Math.min(Math.max(index, 0), questions.length - 1),
    };
  } catch {
    return fresh;
  }
}

export function saveQuizState(storage, state) {
  try {
    storage.setItem(QUIZ_STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* storage full or blocked: progress still works in memory */
  }
}

export function clearQuizState(storage) {
  try {
    storage.removeItem(QUIZ_STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
