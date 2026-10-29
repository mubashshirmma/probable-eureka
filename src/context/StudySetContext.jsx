import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { isValidStudySet } from '../data/studySet';
import { clearQuizState } from '../lib/quizSession';

// The active study set is the single source of truth for the results, quiz and
// score pages. It survives a refresh within the same browser tab via
// sessionStorage. Only study content is stored, never keys or secrets.
// Each time a new set is loaded it gets a new sessionId, which is how quiz
// progress knows which set it belongs to.

const STORAGE_KEY = 'studysaathi.activeStudySet';

const StudySetContext = createContext(null);

const newSessionId = () => Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);

function restore() {
  try {
    const saved = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || 'null');
    if (saved && isValidStudySet(saved.studySet)) {
      return {
        studySet: saved.studySet,
        source: saved.source === 'demo' ? 'demo' : 'ai',
        sessionId: typeof saved.sessionId === 'string' && saved.sessionId ? saved.sessionId : newSessionId(),
      };
    }
  } catch {
    /* ignore corrupt or unavailable storage */
  }
  return { studySet: null, source: null, sessionId: null };
}

export function StudySetProvider({ children }) {
  const [state, setState] = useState(restore);
  const stateRef = useRef(state);
  stateRef.current = state;

  // source: 'ai' for a generated set, 'demo' for the built-in sample set.
  // Loading a different set starts a new session and drops old quiz progress.
  const setStudySet = useCallback((studySet, source = 'ai') => {
    if (!isValidStudySet(studySet)) return false;

    const current = stateRef.current;
    // Re-opening the demo set that is already active keeps the student's progress.
    if (source === 'demo' && current.source === 'demo' && current.studySet?.topicTitle === studySet.topicTitle) {
      return true;
    }

    const next = { studySet, source, sessionId: newSessionId() };
    stateRef.current = next;
    setState(next);
    clearQuizState(sessionStorage);
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* storage full or blocked: the set still works in memory */
    }
    return true;
  }, []);

  const clearStudySet = useCallback(() => {
    const empty = { studySet: null, source: null, sessionId: null };
    stateRef.current = empty;
    setState(empty);
    clearQuizState(sessionStorage);
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }, []);

  const value = useMemo(
    () => ({ ...state, setStudySet, clearStudySet }),
    [state, setStudySet, clearStudySet]
  );

  return <StudySetContext.Provider value={value}>{children}</StudySetContext.Provider>;
}

export function useStudySet() {
  const context = useContext(StudySetContext);
  if (!context) {
    throw new Error('useStudySet must be used within a StudySetProvider');
  }
  return context;
}
