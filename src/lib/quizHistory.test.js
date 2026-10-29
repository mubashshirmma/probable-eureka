import { describe, it, expect, beforeEach } from 'vitest';
import {
  HISTORY_KEY,
  buildEntry,
  loadHistory,
  newAttemptId,
  saveHistory,
  summarizeHistory,
  upsertAttempt,
} from './quizHistory';

const questions = [1, 2, 3, 4].map((id) => ({ id, correctAnswer: id % 4, options: ['a', 'b', 'c', 'd'] }));
const entry = (over = {}) => ({
  attemptId: 'a1',
  sessionId: 's1',
  title: 'T',
  source: 'ai',
  correct: 3,
  total: 4,
  percent: 75,
  completedAt: '2025-03-10T10:00:00.000Z',
  ...over,
});

describe('buildEntry', () => {
  it('scores from the answers and the answer key', () => {
    const e = buildEntry({ attemptId: 'x', sessionId: 's', title: 'Bio', source: 'ai', questions, answers: { 1: 1, 2: 2, 3: 0, 4: 0 } });
    // q1 right (1), q2 right (2), q3 wrong (key 3), q4 right (key 0)
    expect(e).toMatchObject({ attemptId: 'x', correct: 3, total: 4, percent: 75, source: 'ai', title: 'Bio' });
    expect(Number.isNaN(Date.parse(e.completedAt))).toBe(false);
  });

  it('counts unanswered questions as wrong and labels the demo set', () => {
    const e = buildEntry({ attemptId: 'x', questions, answers: {}, source: 'demo' });
    expect(e).toMatchObject({ correct: 0, total: 4, percent: 0, source: 'demo' });
  });
});

describe('upsertAttempt', () => {
  it('adds a new attempt', () => {
    expect(upsertAttempt([], entry())).toHaveLength(1);
    expect(upsertAttempt([entry()], entry({ attemptId: 'a2' }))).toHaveLength(2);
  });

  it('never counts the same attempt twice: it updates the score and keeps the original time', () => {
    const first = entry({ correct: 1, percent: 25, completedAt: '2025-03-10T10:00:00.000Z' });
    const again = entry({ correct: 4, percent: 100, completedAt: '2025-03-11T09:00:00.000Z' });
    const result = upsertAttempt([first], again);
    expect(result).toHaveLength(1);
    expect(result[0].correct).toBe(4);
    expect(result[0].completedAt).toBe('2025-03-10T10:00:00.000Z');
  });

  it('ignores an invalid entry', () => {
    expect(upsertAttempt([entry()], { attemptId: '', total: 0 })).toHaveLength(1);
    expect(upsertAttempt([entry()], entry({ attemptId: 'b', correct: 9 }))).toHaveLength(1);
  });

  it('keeps only the newest 1000 attempts', () => {
    let list = [];
    for (let i = 0; i < 1005; i++) list = upsertAttempt(list, entry({ attemptId: 'id' + i }));
    expect(list).toHaveLength(1000);
    expect(list[0].attemptId).toBe('id5');
  });
});

describe('save / load', () => {
  beforeEach(() => localStorage.clear());

  it('round-trips', () => {
    saveHistory(localStorage, [entry(), entry({ attemptId: 'a2' })]);
    expect(loadHistory(localStorage).map((e) => e.attemptId)).toEqual(['a1', 'a2']);
  });

  it('drops malformed entries and duplicates, and survives bad JSON', () => {
    localStorage.setItem(HISTORY_KEY, JSON.stringify([entry(), entry(), { nope: true }, entry({ attemptId: 'z', completedAt: 'not a date' }), null, 'x']));
    expect(loadHistory(localStorage)).toHaveLength(1);
    localStorage.setItem(HISTORY_KEY, '{{{');
    expect(loadHistory(localStorage)).toEqual([]);
    localStorage.setItem(HISTORY_KEY, '{"not":"an array"}');
    expect(loadHistory(localStorage)).toEqual([]);
  });

  it('never throws when storage is blocked', () => {
    const blocked = { getItem() { throw new Error('no'); }, setItem() { throw new Error('no'); } };
    expect(loadHistory(blocked)).toEqual([]);
    expect(() => saveHistory(blocked, [entry()])).not.toThrow();
  });
});

describe('summarizeHistory', () => {
  const now = new Date(2025, 2, 10, 15, 0, 0); // local time, 10 March 2025
  const at = (dayOfMonth, hour = 12) => new Date(2025, 2, dayOfMonth, hour).toISOString();

  it('is all zero or empty when nothing has been taken', () => {
    expect(summarizeHistory([], now)).toEqual({ count: 0, average: null, best: null, streak: 0 });
  });

  it('counts, averages and finds the best score from the real attempts', () => {
    const history = [
      entry({ attemptId: '1', correct: 4, total: 4, completedAt: at(10) }),
      entry({ attemptId: '2', correct: 1, total: 4, completedAt: at(10, 14) }),
      entry({ attemptId: '3', correct: 2, total: 4, completedAt: at(10, 16) }),
    ];
    expect(summarizeHistory(history, now)).toMatchObject({ count: 3, average: 58, best: 100 }); // (100+25+50)/3 = 58.3
  });

  it('streak counts consecutive days ending today', () => {
    const days = [8, 9, 10].map((d, i) => entry({ attemptId: 'd' + i, completedAt: at(d) }));
    expect(summarizeHistory(days, now).streak).toBe(3);
  });

  it('streak is not lost before the student has studied today, but breaks after a missed day', () => {
    const yesterdayOnly = [entry({ attemptId: 'y', completedAt: at(9) }), entry({ attemptId: 'y2', completedAt: at(8) })];
    expect(summarizeHistory(yesterdayOnly, now).streak).toBe(2);
    const gap = [entry({ attemptId: 'g1', completedAt: at(10) }), entry({ attemptId: 'g2', completedAt: at(8) })];
    expect(summarizeHistory(gap, now).streak).toBe(1);
    const old = [entry({ attemptId: 'o', completedAt: at(5) })];
    expect(summarizeHistory(old, now).streak).toBe(0);
  });

  it('several quizzes on one day make a one-day streak, not more', () => {
    const same = [1, 2, 3].map((i) => entry({ attemptId: 's' + i, completedAt: at(10, 8 + i) }));
    expect(summarizeHistory(same, now).streak).toBe(1);
  });
});

describe('newAttemptId', () => {
  it('is unique', () => {
    expect(new Set(Array.from({ length: 200 }, newAttemptId)).size).toBe(200);
  });
});
