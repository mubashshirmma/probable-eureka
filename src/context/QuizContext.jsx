import React, { createContext, useContext, useEffect, useState } from 'react';
import { useStudySet } from './StudySetContext';

const QuizContext = createContext();

export function QuizProvider({ children }) {
  const { studySet } = useStudySet();
  const [studentAnswers, setStudentAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  const setAnswer = (questionId, optionIndex) => {
    setStudentAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex,
    }));
  };

  const resetQuiz = () => {
    setStudentAnswers({});
    setQuizSubmitted(false);
  };

  // A different study set means old answers no longer apply.
  useEffect(() => {
    setStudentAnswers({});
    setQuizSubmitted(false);
  }, [studySet]);

  // Questions come from the active study set (generated or demo).
  const questions = studySet?.quiz?.questions || [];
  let correctCount = 0;
  questions.forEach((q) => {
    if (studentAnswers[q.id] === q.correctAnswer) {
      correctCount++;
    }
  });

  return (
    <QuizContext.Provider
      value={{
        studentAnswers,
        setAnswer,
        resetQuiz,
        quizSubmitted,
        setQuizSubmitted,
        score: correctCount,
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
