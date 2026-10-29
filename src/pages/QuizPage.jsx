import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuiz } from '../context/QuizContext';
import { useStudySet } from '../context/StudySetContext';
import Button from '../components/Button';
import Card from '../components/Card';
import FocusHeader from '../components/FocusHeader';

export default function QuizPage() {
  const navigate = useNavigate();
  const { questions, studentAnswers, setAnswer, setQuizSubmitted, currentIndex, setCurrentIndex } = useQuiz();

  const { studySet } = useStudySet();

  const [timeLeft, setTimeLeft] = useState((studySet?.quiz?.timeLimitMinutes || 15) * 60); // seconds

  // Safe check if questions are missing
  useEffect(() => {
    if (!questions || questions.length === 0) {
      navigate('/dashboard', { replace: true });
    }
  }, [questions, navigate]);

  // Countdown timer effect
  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  if (!questions || questions.length === 0) {
    return null;
  }

  const currentQuestion = questions[currentIndex];
  const isSelected = studentAnswers[currentQuestion.id] !== undefined;
  const isLastQuestion = currentIndex === questions.length - 1;

  // Format timer
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const attemptedCount = Object.keys(studentAnswers).length;
  const leftCount = questions.length - attemptedCount;

  const handleOptionSelect = (optionIndex) => {
    setAnswer(currentQuestion.id, optionIndex);
  };

  const handleNextOrSubmit = () => {
    if (!isSelected) return;

    if (isLastQuestion) {
      setQuizSubmitted(true);
      navigate('/score');
    } else {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handleExitQuiz = () => {
    if (window.confirm('Are you sure you want to pause or exit this quiz? Your current progress will be preserved.')) {
      navigate('/results');
    }
  };

  const optionLetters = ['A', 'B', 'C', 'D'];

  return (
    <div className="font-body-md text-body-md text-on-surface flex flex-col min-h-screen">
      <FocusHeader
        title="Active Quiz Session"
        onBack={handleExitQuiz}
        backLabel="Go back"
        action={
          <button
            type="button"
            onClick={handleExitQuiz}
            className="neu-btn flex items-center gap-1 px-3.5 py-2 min-h-[40px] rounded-xl font-label-md text-label-md !text-error"
          >
            <span className="material-symbols-outlined text-[18px]" aria-hidden="true">close</span>
            <span>Exit</span>
          </button>
        }
      />

      {/* Main Quiz Content */}
      <main className="flex-1 flex flex-col relative w-full pt-24 pb-16">
        <div className="flex flex-col w-full px-4 sm:px-6 max-w-xl md:max-w-2xl mx-auto gap-5">
          {/* Top Session Bar */}
          <div className="flex items-center justify-between gap-3 rise">
            <div className="flex items-center gap-space-xs min-w-0">
              <span
                className="material-symbols-outlined text-secondary text-[20px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
                aria-hidden="true"
              >
                psychology
              </span>
              <span className="font-label-md text-label-md text-primary tracking-wide uppercase font-semibold truncate">
                Live Practice Session
              </span>
            </div>
            <div className="pill pill--gold px-3 py-1.5 font-label-md text-label-md shrink-0" role="timer" aria-label={`${formattedTime} left`}>
              <span className="material-symbols-outlined text-[16px]" aria-hidden="true">timer</span>
              <span className="font-semibold tracking-tight tabular-nums">{formattedTime} left</span>
            </div>
          </div>

          {/* Progress Tracker */}
          <Card className="flex flex-col gap-space-sm rise" style={{ '--i': 1 }}>
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <span className="font-headline-sm text-headline-sm text-primary-container font-bold">
                  Question {currentIndex + 1} of {questions.length}
                </span>
                <p className="font-label-sm text-label-sm text-on-surface-variant truncate">
                  {studySet?.topicTitle}
                </p>
              </div>
              <span className="font-headline-sm text-headline-sm text-secondary font-bold tabular-nums">
                {Math.round(((currentIndex + 1) / questions.length) * 100)}%
              </span>
            </div>

            <div
              className="progress-track"
              role="progressbar"
              aria-label="Quiz progress"
              aria-valuemin={1}
              aria-valuemax={questions.length}
              aria-valuenow={currentIndex + 1}
            >
              <div className="progress-fill" style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}></div>
            </div>

            <div className="flex items-center justify-between text-on-surface-variant font-label-sm text-label-sm pt-0.5">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-secondary"></span>
                {attemptedCount} Attempted
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-surface-container-highest"></span>
                {leftCount} Left
              </span>
            </div>
          </Card>

          {/* Active Question */}
          <Card key={currentQuestion.id} className="flex flex-col gap-space-md rise">
            <div className="flex items-center justify-between gap-3">
              <span className="pill px-3 py-1.5 text-primary font-label-md text-label-md min-w-0">
                <span className="material-symbols-outlined text-[16px] text-secondary" aria-hidden="true">topic</span>
                <span className="truncate">{currentQuestion.topic || 'General'}</span>
              </span>
              <span className="pill pill--accent px-3 py-1 font-label-sm text-label-sm font-semibold shrink-0">
                Single Choice
              </span>
            </div>

            <div>
              <h2 className="font-headline-sm text-headline-sm sm:font-headline-md sm:text-headline-md text-primary-container leading-snug font-bold">
                {currentQuestion.question}
              </h2>
              {currentQuestion.subtitle && (
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                  {currentQuestion.subtitle}
                </p>
              )}
            </div>

            {/* Options: real radio buttons, so the keyboard and screen readers work */}
            <fieldset className="flex flex-col gap-3.5">
              <legend className="sr-only">Answer options for question {currentIndex + 1}</legend>
              {currentQuestion.options.map((option, idx) => {
                const isCurrentSelected = studentAnswers[currentQuestion.id] === idx;

                return (
                  <label key={idx} className={`option ${isCurrentSelected ? 'is-selected' : ''}`}>
                    <input
                      type="radio"
                      name={`question-${currentQuestion.id}`}
                      className="sr-only"
                      checked={isCurrentSelected}
                      onChange={() => handleOptionSelect(idx)}
                    />
                    <span className="flex items-center gap-space-sm min-w-0">
                      <span
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-label-md text-label-md font-bold shrink-0 transition-colors ${
                          isCurrentSelected
                            ? 'bg-secondary text-on-secondary shadow-md'
                            : 'neu-raised neu-raised--sm !rounded-full text-primary'
                        }`}
                        aria-hidden="true"
                      >
                        {optionLetters[idx]}
                      </span>
                      <span className="font-body-md text-body-md leading-snug font-medium break-words min-w-0">
                        {option}
                      </span>
                    </span>

                    <span
                      className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 border-2 transition-colors ${
                        isCurrentSelected ? 'bg-secondary border-secondary' : 'border-outline/40'
                      }`}
                      aria-hidden="true"
                    >
                      {isCurrentSelected && <span className="w-2 h-2 rounded-full bg-on-secondary"></span>}
                    </span>
                  </label>
                );
              })}
            </fieldset>

            {/* Study tip */}
            <div className="glass-panel p-space-sm flex items-start gap-space-sm">
              <span className="neu-icon neu-icon--sm neu-icon--round !text-tertiary-container mt-0.5">
                <span className="material-symbols-outlined text-[16px]" aria-hidden="true">lightbulb</span>
              </span>
              <div className="flex-1 min-w-0">
                <span className="font-label-md text-label-md font-bold text-on-tertiary-fixed block">Saathi Hint</span>
                <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                  Read all four options before you choose, and rule out the ones that are clearly wrong first.
                </p>
              </div>
            </div>
          </Card>

          {/* Action Row */}
          <div className="flex items-center gap-space-sm">
            {currentIndex > 0 && (
              <Button
                variant="subtle"
                size="lg"
                icon="arrow_back"
                className="flex-1"
                onClick={() => setCurrentIndex((prev) => prev - 1)}
              >
                Previous
              </Button>
            )}

            <Button
              variant="primary"
              size="lg"
              disabled={!isSelected}
              className="flex-1"
              iconRight={isLastQuestion ? 'check_circle' : 'arrow_forward'}
              onClick={handleNextOrSubmit}
            >
              {isLastQuestion ? 'Submit Quiz' : 'Next Question'}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
