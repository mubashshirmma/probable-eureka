import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuiz } from '../context/QuizContext';
import { useStudySet } from '../context/StudySetContext';
import Button from '../components/Button';
import Card from '../components/Card';

export default function QuizPage() {
  const navigate = useNavigate();
  const { questions, studentAnswers, setAnswer, setQuizSubmitted } = useQuiz();

  const { studySet } = useStudySet();

  const [currentIndex, setCurrentIndex] = useState(0);
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
    <div className="bg-background font-body-md text-body-md text-on-surface flex flex-col min-h-screen">
      {/* Header Bar */}
      <header className="fixed top-0 w-full z-50 pt-safe bg-surface-container-lowest/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="h-16 px-margin flex items-center justify-between gap-space-sm max-w-xl mx-auto">
          <div className="flex items-center gap-space-sm min-w-0">
            <button
              type="button"
              onClick={handleExitQuiz}
              aria-label="Go Back"
              className="w-11 h-11 flex items-center justify-center -ml-2 rounded-full text-on-surface hover:bg-surface-container-high transition-colors"
            >
              <span className="material-symbols-outlined text-[24px]">arrow_back</span>
            </button>
            <img
              alt="StudySaathi AI Logo"
              className="h-7 w-auto object-contain flex-shrink-0"
              src="https://lh3.googleusercontent.com/aida/AEtjO1U5Hn00h2H0TL7BbCuRbZgZBFHrg8f0KkPf8JVr28GieRip7ub7II3vWQR36WFgGfUFTn8E8mGIE6EGxq57n1209T_CFsM9Nql89um3TW34cRO0lZEgKPRgudDCKPc1F1nwdj3wC7fiT9XMzMj-7MIb7dLXZIBu6u_MHqcxiWiPJYWqWZkQmpAqSXWOl4sH_GwcyfbsdnA6d0xdmfuqCwI-Xj6rqoQjXZFvQyBzl30r"
            />
            <h1 className="font-headline-sm text-headline-sm text-primary tracking-tight truncate font-bold">
              Active Quiz Session
            </h1>
          </div>

          <div className="flex items-center">
            <button
              type="button"
              onClick={handleExitQuiz}
              className="flex items-center gap-1 px-3 py-1 rounded-full bg-error-container text-on-error-container font-label-md text-label-md shadow-sm active:scale-95 transition-transform"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
              <span>Exit</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Quiz Content */}
      <main className="flex-1 flex flex-col relative w-full pt-16 pb-20 bg-background">
        <div className="flex flex-col w-full px-margin py-space-md max-w-xl mx-auto gap-space-md">
          {/* Top Session Bar */}
          <div className="flex items-center justify-between pt-space-xs">
            <div className="flex items-center gap-space-xs">
              <span
                className="material-symbols-outlined text-secondary text-[20px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                psychology
              </span>
              <span className="font-label-md text-label-md text-primary tracking-wide uppercase font-semibold">
                Live Practice Session
              </span>
            </div>
            <div className="flex items-center gap-1.5 px-space-sm py-1 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-label-md text-label-md shadow-sm">
              <span className="material-symbols-outlined text-[16px] text-tertiary-container animate-pulse">
                timer
              </span>
              <span className="font-semibold tracking-tight">{formattedTime} left</span>
            </div>
          </div>

          {/* Progress Tracker Banner */}
          <Card className="flex flex-col gap-space-sm">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-headline-sm text-headline-sm text-primary-container font-bold">
                  Question {currentIndex + 1} of {questions.length}
                </span>
                <p className="font-label-sm text-label-sm text-on-surface-variant">
                  {studySet?.topicTitle}
                </p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-surface-container rounded-full h-2 overflow-hidden flex">
              <div
                className="bg-secondary-container h-full transition-all duration-300 rounded-full"
                style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
              ></div>
            </div>

            <div className="flex items-center justify-between text-on-surface-variant font-label-sm text-label-sm pt-0.5">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-secondary"></span>
                {attemptedCount} Attempted
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-surface-container-highest"></span>
                {leftCount} Left
              </span>
            </div>
          </Card>

          {/* Active Question Container */}
          <Card className="flex flex-col gap-space-md">
            {/* Category & Difficulty Pill */}
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-container-high text-primary font-label-md text-label-md">
                <span className="material-symbols-outlined text-[16px] text-secondary">
                  topic
                </span>
                {currentQuestion.topic || 'General'}
              </span>
              <span className="font-label-sm text-label-sm text-secondary font-semibold bg-secondary-fixed px-2 py-0.5 rounded-full">
                Single Choice
              </span>
            </div>

            {/* Question Text */}
            <div>
              <h2 className="font-headline-sm text-headline-sm text-primary-container leading-snug font-bold">
                {currentQuestion.question}
              </h2>
              {currentQuestion.subtitle && (
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                  {currentQuestion.subtitle}
                </p>
              )}
            </div>

            {/* Options Stack */}
            <fieldset className="flex flex-col gap-space-sm">
              <legend className="sr-only">Answer Options</legend>
              {currentQuestion.options.map((option, idx) => {
                const isCurrentSelected = studentAnswers[currentQuestion.id] === idx;

                return (
                  <label
                    key={idx}
                    onClick={() => handleOptionSelect(idx)}
                    className={`group relative flex items-center justify-between p-space-md rounded-xl cursor-pointer transition-all duration-200 active:scale-[0.99] border ${
                      isCurrentSelected
                        ? 'bg-secondary-fixed text-primary border-secondary/40 shadow-sm'
                        : 'bg-surface-container-low text-on-surface border-transparent hover:bg-surface-container'
                    }`}
                  >
                    <div className="flex items-center gap-space-sm min-w-0 pr-2">
                      <span
                        className={`w-7 h-7 rounded-full flex items-center justify-center font-label-md text-label-md font-bold shrink-0 transition-colors ${
                          isCurrentSelected
                            ? 'bg-secondary text-on-secondary shadow-sm'
                            : 'bg-surface-container-highest text-primary'
                        }`}
                      >
                        {optionLetters[idx]}
                      </span>
                      <span className="font-body-md text-body-md leading-snug font-medium">
                        {option}
                      </span>
                    </div>

                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 border ${
                        isCurrentSelected
                          ? 'bg-secondary border-secondary'
                          : 'border-outline/40 bg-surface-container-lowest'
                      }`}
                    >
                      {isCurrentSelected && (
                        <div className="w-2 h-2 rounded-full bg-on-secondary"></div>
                      )}
                    </div>
                  </label>
                );
              })}
            </fieldset>

            {/* Saathi AI Concept Hint */}
            <div className="p-space-sm bg-tertiary-fixed rounded-xl flex items-start gap-space-sm">
              <div className="w-7 h-7 rounded-full bg-on-tertiary-fixed text-tertiary-fixed flex items-center justify-center shrink-0 mt-0.5">
                <span className="material-symbols-outlined text-[16px]">lightbulb</span>
              </div>
              <div className="flex-1 min-w-0">
                <span className="font-label-md text-label-md font-bold text-on-tertiary-fixed block">
                  Saathi Hint
                </span>
                <p className="font-body-sm text-body-sm text-on-tertiary-fixed-variant leading-relaxed">
                  Focus on definitions, terminating vs non-terminating decimals, and core set properties.
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
              className={`flex-1 ${!isSelected ? 'opacity-50 cursor-not-allowed' : ''}`}
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

