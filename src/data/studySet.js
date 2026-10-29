// Shape check for a study set. Used before trusting data restored from
// sessionStorage or received from the API. The server does the strict
// validation (exactly 8 flashcards and 10 questions); this guards the UI.

const isText = (v) => typeof v === 'string' && v.trim().length > 0;

export function isValidStudySet(s) {
  if (!s || typeof s !== 'object') return false;
  if (!isText(s.topicTitle)) return false;

  const summary = s.summary;
  if (!summary || !isText(summary.quickSummary)) return false;
  if (!Array.isArray(summary.hierarchy)) return false;
  if (!Array.isArray(summary.keyConcepts) || summary.keyConcepts.length === 0) return false;
  if (!summary.keyConcepts.every((c) => c && isText(c.id) && isText(c.title) && isText(c.description))) {
    return false;
  }

  if (!Array.isArray(s.flashcards) || s.flashcards.length === 0) return false;
  if (!s.flashcards.every((c) => c && isText(c.question) && isText(c.answer))) return false;

  const questions = s.quiz?.questions;
  if (!Array.isArray(questions) || questions.length === 0) return false;
  const ids = new Set();
  for (const q of questions) {
    if (!q || q.id === undefined || ids.has(q.id) || !isText(q.question)) return false;
    ids.add(q.id);
    if (!Array.isArray(q.options) || q.options.length !== 4 || !q.options.every(isText)) return false;
    if (!Number.isInteger(q.correctAnswer) || q.correctAnswer < 0 || q.correctAnswer > 3) return false;
  }
  return true;
}
