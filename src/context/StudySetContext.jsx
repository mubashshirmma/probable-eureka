import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { isValidStudySet } from '../data/studySet';

// The active study set is the single source of truth for the results, quiz and
// score pages. It survives a refresh within the same browser tab via
// sessionStorage. Only study content is stored, never keys or secrets.

const STORAGE_KEY = 'studysaathi.activeStudySet';

const StudySetContext = createContext(null);

function restore() {
  try {
    const saved = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || 'null');
    if (saved && isValidStudySet(saved.studySet)) {
      return { studySet: saved.studySet, source: saved.source === 'demo' ? 'demo' : 'ai' };
    }
  } catch {
    /* ignore corrupt or unavailable storage */
  }
  return { studySet: null, source: null };
}

export function StudySetProvider({ children }) {
  const [state, setState] = useState(restore);

  // source: 'ai' for a generated set, 'demo' for the built-in sample set.
  const setStudySet = useCallback((studySet, source = 'ai') => {
    if (!isValidStudySet(studySet)) return false;
    setState({ studySet, source });
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ studySet, source }));
    } catch {
      /* storage full or blocked: the set still works in memory */
    }
    return true;
  }, []);

  const clearStudySet = useCallback(() => {
    setState({ studySet: null, source: null });
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }, []);

  const value = useMemo(
    () => ({ studySet: state.studySet, source: state.source, setStudySet, clearStudySet }),
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
