import { describe, it, expect, beforeEach } from 'vitest';
import {
  QUIZ_STORAGE_KEY,
  clearQuizState,
  emptyQuizState,
  loadQuizState,
  sanitizeAnswers,
  saveQuizState,
  scoreQuiz,
} from './quizSession';

const questions = [1, 2, 3, 4].map((id) => ({
  id,
  question: 'Q' + id,
  options: ['a', 'b', 'c', 'd'],
  correctAnswer: id % 4,
}));

describe('scoreQuiz', () => {
  it('counts only answers that match the answer key', () => {
    expect(scoreQuiz(questions, { 1: 1, 2: 2, 3: 0, 4: 0 })).toBe(3); // q1,q2 right; q3 wrong; q4 right (4%4=0)
    expect(scoreQuiz(questions, {})).toBe(0);
  });

  it('ignores answers for questions that do not exist and never goes above the total', () => {
    expect(scoreQuiz(questions, { 99: 0, 1: 1 })).toBe(1);
  });

  it('is not fooled by string or out-of-range values', () => {
    expect(scoreQuiz(questions, { 1: '1', 2: 7, 3: -1 })).toBe(0);
  });
});

describe('sanitizeAnswers', () => {
  it('keeps valid answers and drops unknown ids, non-integers and out-of-range options', () => {
    expect(sanitizeAnswers(questions, { 1: 2, 2: 4, 3: 'x', 4: 1.5, 99: 0 })).toEqual({ 1: 2 });
  });

  it('handles non-object input', () => {
    expect(sanitizeAnswers(questions, null)).toEqual({});
    expect(sanitizeAnswers(questions, 'oops')).toEqual({});
  });
});

describe('save / load', () => {
  beforeEach(() => sessionStorage.clear());

  it('restores answers, position and submitted state for the same session', () => {
    const state = { sessionId: 's1', answers: { 1: 1, 2: 0, 3: 3, 4: 2 }, submitted: true, currentIndex: 3 };
    saveQuizState(sessionStorage, state);
    expect(loadQuizState(sessionStorage, 's1', questions)).toEqual(state);
  });

  it('ignores progress saved for a different session', () => {
    saveQuizState(sessionStorage, { sessionId: 'old', answers: { 1: 1 }, submitted: false, currentIndex: 2 });
    expect(loadQuizState(sessionStorage, 'new', questions)).toEqual(emptyQuizState('new'));
  });

  it('falls back to an empty state for missing, malformed or wrong-shaped data', () => {
    expect(loadQuizState(sessionStorage, 's1', questions)).toEqual(emptyQuizState('s1'));
    sessionStorage.setItem(QUIZ_STORAGE_KEY, '{not json');
    expect(loadQuizState(sessionStorage, 's1', questions)).toEqual(emptyQuizState('s1'));
    sessionStorage.setItem(QUIZ_STORAGE_KEY, '"a string"');
    expect(loadQuizState(sessionStorage, 's1', questions)).toEqual(emptyQuizState('s1'));
    sessionStorage.setItem(QUIZ_STORAGE_KEY, 'null');
    expect(loadQuizState(sessionStorage, 's1', questions)).toEqual(emptyQuizState('s1'));
  });

  it('cleans outdated answers (questions that no longer exist) and clamps the position', () => {
    saveQuizState(sessionStorage, { sessionId: 's1', answers: { 1: 1, 77: 2 }, submitted: false, currentIndex: 50 });
    expect(loadQuizState(sessionStorage, 's1', questions)).toEqual({
      sessionId: 's1',
      answers: { 1: 1 },
      submitted: false,
      currentIndex: 3,
    });
    saveQuizState(sessionStorage, { sessionId: 's1', answers: {}, submitted: false, currentIndex: -4 });
    expect(loadQuizState(sessionStorage, 's1', questions).currentIndex).toBe(0);
  });

  it('does not believe "submitted" unless every question has an answer', () => {
    saveQuizState(sessionStorage, { sessionId: 's1', answers: { 1: 1 }, submitted: true, currentIndex: 0 });
    expect(loadQuizState(sessionStorage, 's1', questions).submitted).toBe(false);
  });

  it('clearQuizState removes saved progress', () => {
    saveQuizState(sessionStorage, { sessionId: 's1', answers: { 1: 1 }, submitted: false, currentIndex: 1 });
    clearQuizState(sessionStorage);
    expect(sessionStorage.getItem(QUIZ_STORAGE_KEY)).toBeNull();
  });

  it('never throws when storage is unavailable', () => {
    const broken = {
      getItem() { throw new Error('blocked'); },
      setItem() { throw new Error('blocked'); },
      removeItem() { throw new Error('blocked'); },
    };
    expect(() => saveQuizState(broken, emptyQuizState('s1'))).not.toThrow();
    expect(() => clearQuizState(broken)).not.toThrow();
    expect(loadQuizState(broken, 's1', questions)).toEqual(emptyQuizState('s1'));
  });
});
