import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useStudySet } from './StudySetContext';
import {
  HISTORY_KEY,
  buildEntry,
  loadHistory,
  newAttemptId,
  saveHistory,
  upsertAttempt,
} from '../lib/quizHistory';
import {
  clearQuizState,
  emptyQuizState,
  loadQuizState,
  saveQuizState,
  scoreQuiz,
} from '../lib/quizSession';

const QuizContext = createContext();

export function QuizProvider({ children }) {
  const { studySet, sessionId, source } = useStudySet();
  const questions = useMemo(() => studySet?.quiz?.questions || [], [studySet]);

  // Progress is tagged with the sessionId it belongs to. If the study session
  // changes, the old progress is simply not used, so it can never leak into a
  // new set (and nothing needs an effect to clear it).
  const [saved, setSaved] = useState(() => loadQuizState(sessionStorage, sessionId, questions));
  const state = saved.sessionId === sessionId ? saved : emptyQuizState(sessionId);

  const update = useCallback(
    (change) => {
      setSaved((prev) => {
        const base = prev.sessionId === sessionId ? prev : emptyQuizState(sessionId);
        return { ...base, ...change(base) };
      });
    },
    [sessionId]
  );

  // Finished quizzes. The dashboard reads this; it is saved so the count survives refreshes and new visits.
  const [history, setHistory] = useState(() => loadHistory(localStorage));

  // Keep other open tabs in step.
  useEffect(() => {
    const onStorage = (event) => {
      if (event.key === HISTORY_KEY || event.key === null) setHistory(loadHistory(localStorage));
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  // Save progress whenever it changes.
  useEffect(() => {
    if (sessionId && saved.sessionId === sessionId) saveQuizState(sessionStorage, saved);
  }, [saved, sessionId]);

  const setAnswer = (questionId, optionIndex) =>
    update((s) => ({ answers: { ...s.answers, [questionId]: optionIndex } }));

  const setQuizSubmitted = (submitted) => update(() => ({ submitted }));

  const setCurrentIndex = (value) =>
    update((s) => {
      const next = typeof value === 'function' ? value(s.currentIndex) : value;
      return { currentIndex: Math.min(Math.max(next, 0), Math.max(questions.length - 1, 0)) };
    });

  const resetQuiz = () => {
    clearQuizState(sessionStorage);
    // A restarted quiz is a new attempt, so it can be counted on its own.
    update(() => ({ attemptId: newAttemptId(), answers: {}, submitted: false, currentIndex: 0 }));
  };

  // Submit the quiz: mark it finished and record it. Recorded by attempt id, so submitting the same
  // attempt again, refreshing, or reopening the score page can never add a second entry.
  const completeQuiz = () => {
    if (questions.length === 0) return;
    const entry = buildEntry({
      attemptId: state.attemptId,
      sessionId,
      title: studySet?.topicTitle,
      source,
      questions,
      answers: state.answers,
    });
    const next = upsertAttempt(history, entry);
    setHistory(next);
    saveHistory(localStorage, next);
    update(() => ({ submitted: true }));
  };

  // Entry point for "Start Quiz": continue an unfinished attempt, or begin a new one after a finished attempt.
  const startQuiz = () => {
    if (state.submitted) resetQuiz();
  };

  return (
    <QuizContext.Provider
      value={{
        studentAnswers: state.answers,
        setAnswer,
        resetQuiz,
        startQuiz,
        completeQuiz,
        history,
        quizSubmitted: state.submitted,
        setQuizSubmitted,
        currentIndex: state.currentIndex,
        setCurrentIndex,
        score: scoreQuiz(questions, state.answers),
        totalQuestions: questions.length,
        questions,
      }}
    >
      {children}
    </QuizContext.Provider>
  );
}

export function useQuiz() {
  const context = useContext(QuizContext);
  if (!context) {
    throw new Error('useQuiz must be used within a QuizProvider');
  }
  return context;
}
