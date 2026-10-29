import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuiz } from '../context/QuizContext';
import { useStudySet } from '../context/StudySetContext';
import Button from '../components/Button';
import Card from '../components/Card';
import FocusHeader from '../components/FocusHeader';

export default function QuizScorePage() {
  const navigate = useNavigate();
  const { questions, studentAnswers, resetQuiz, quizSubmitted } = useQuiz();
  const { studySet } = useStudySet();

  // Let the score ring sweep in after the page appears
  const [gaugeReady, setGaugeReady] = useState(false);
  useEffect(() => {
    const frame = requestAnimationFrame(() => setGaugeReady(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  const isQuizComplete = questions && questions.length > 0 && quizSubmitted;

  // Safe redirect ONLY if opened directly without completing the quiz on initial load
  useEffect(() => {
    if (!isQuizComplete) {
      navigate('/dashboard', { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRetake = () => {
    resetQuiz();
    navigate('/quiz');
  };

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  if (!isQuizComplete) {
    return null;
  }

  // Calculate score & statistics
  let correctCount = 0;
  const wrongTopics = new Set();

  questions.forEach((q) => {
    const studentChoice = studentAnswers[q.id];
    if (studentChoice === q.correctAnswer) {
      correctCount++;
    } else if (q.topic) {
      wrongTopics.add(q.topic);
    }
  });

  const total = questions.length;
  const wrongCount = total - correctCount;
  const percentage = Math.round((correctCount / total) * 100);

  // Circular gauge calculations
  const circumference = 314.159; // 2 * pi * 50
  const strokeDashoffset = gaugeReady ? circumference - (circumference * percentage) / 100 : circumference;

  const optionLetters = ['A', 'B', 'C', 'D'];

  return (
    <div className="font-body-md text-body-md text-on-surface flex flex-col min-h-screen">
      <FocusHeader
        title="Quiz Results"
        backTo="/dashboard"
        backLabel="Back to Dashboard"
        action={
          <button
            type="button"
            onClick={handleBackToDashboard}
            className="neu-btn neu-btn--ghost px-3.5 py-2 min-h-[40px] rounded-xl font-label-md text-label-md !text-secondary"
          >
            Dashboard
          </button>
        }
      />

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative w-full pt-24 pb-16">
        <div className="flex flex-col w-full px-4 sm:px-6 max-w-xl md:max-w-3xl lg:max-w-6xl mx-auto gap-6">
          {/* Header Banner */}
          <div className="flex flex-col items-center text-center mt-space-xs rise">
            <div className="neu-icon neu-icon--round !w-16 !h-16 mb-space-sm">
              <span aria-label="Target Dart" className="text-2xl" role="img">
                🎯
              </span>
            </div>
            <h2 className="font-headline-lg-mobile text-headline-lg-mobile lg:font-headline-lg lg:text-headline-lg text-primary tracking-tight font-bold">
              Quiz Completed!
            </h2>
            <p className="font-body-sm text-body-sm text-outline mt-space-xs font-medium">
              {studySet?.topicTitle} Quiz • {total} Questions
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-5 lg:sticky lg:top-24 flex flex-col gap-6">
          {/* Score Summary Hero Card */}
          <Card className="flex flex-col items-center text-center relative overflow-hidden rise" style={{ '--i': 1 }}>
            {/* Circular Progress Gauge */}
            <div className="relative w-36 h-36 flex items-center justify-center my-space-xs">
              <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 120 120">
                <circle
                  className="text-[#e2e0ee]"
                  cx="60"
                  cy="60"
                  fill="transparent"
                  r="50"
                  stroke="currentColor"
                  strokeWidth="10"
                />
                <circle
                  className="text-secondary transition-all duration-1000 ease-out drop-shadow-[0_0_6px_rgba(61,85,240,0.35)]"
                  cx="60"
                  cy="60"
                  fill="transparent"
                  r="50"
                  stroke="currentColor"
                  strokeWidth="10"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="font-display-mobile text-display-mobile text-primary leading-none font-extrabold tracking-tight">
                  {correctCount}
                  <span className="text-body-md text-outline font-normal">/{total}</span>
                </span>
                <span className="font-label-md text-label-md text-secondary font-bold mt-1">
                  {percentage}% SCORE
                </span>
              </div>
            </div>

            {/* Performance Level Badge */}
            <div className="pill px-4 py-2 text-on-surface mt-space-sm mb-space-md">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  percentage >= 80 ? 'bg-[#15803d]' : percentage >= 50 ? 'bg-secondary' : 'bg-[#b91c1c]'
                }`}
              ></span>
              <span className="font-label-lg text-label-lg text-primary font-semibold">
                {percentage >= 80
                  ? 'Great Job! Proficient Level'
                  : percentage >= 50
                  ? 'Good Effort! Needs Quick Revision'
                  : 'Keep Practicing! Review Concepts'}
              </span>
            </div>

            {/* Quick Metrics Strip */}
            <div className="w-full grid grid-cols-3 gap-space-xs neu-well p-space-sm">
              <div className="flex flex-col items-center py-space-xs">
                <div className="flex items-center gap-1 text-[#15803d]">
                  <span className="material-symbols-outlined text-[18px]">check_circle</span>
                  <span className="font-headline-sm text-headline-sm font-bold text-primary">
                    {correctCount}
                  </span>
                </div>
                <span className="font-label-sm text-label-sm text-outline mt-0.5">Correct</span>
              </div>

              <div className="flex flex-col items-center py-space-xs border-x border-outline/10">
                <div className="flex items-center gap-1 text-[#b91c1c]">
                  <span className="material-symbols-outlined text-[18px]">cancel</span>
                  <span className="font-headline-sm text-headline-sm font-bold text-primary">
                    {wrongCount}
                  </span>
                </div>
                <span className="font-label-sm text-label-sm text-outline mt-0.5">Incorrect</span>
              </div>

              <div className="flex flex-col items-center py-space-xs">
                <div className="flex items-center gap-1 text-secondary">
                  <span className="material-symbols-outlined text-[18px]">percent</span>
                  <span className="font-headline-sm text-headline-sm font-bold text-primary">
                    {percentage}%
                  </span>
                </div>
                <span className="font-label-sm text-label-sm text-outline mt-0.5">Accuracy</span>
              </div>
            </div>
          </Card>

          {/* Topics to Revise Section */}
          <section className="flex flex-col gap-space-xs">
            <div className="flex items-center justify-between px-1">
              <h2 className="font-headline-sm text-headline-sm text-primary font-bold">
                Topics to Revise
              </h2>
              <span className="font-label-sm text-label-sm text-on-surface-variant">
                {wrongTopics.size > 0 ? `${wrongTopics.size} Area(s)` : 'All Clear'}
              </span>
            </div>

            <Card className="flex flex-col gap-space-sm">
              {wrongTopics.size > 0 ? (
                <>
                  <div className="flex items-center gap-2 text-on-surface-variant font-body-sm text-body-sm">
                    <span className="material-symbols-outlined text-[20px] text-tertiary-container">
                      warning
                    </span>
                    <span>Review flashcards and notes for the following topics:</span>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {Array.from(wrongTopics).map((topic) => (
                      <span
                        key={topic}
                        className="px-3 py-1.5 rounded-full bg-error-container text-on-error-container font-label-md text-label-md font-semibold flex items-center gap-1.5 shadow-sm"
                      >
                        <span className="material-symbols-outlined text-[16px]">menu_book</span>
                        {topic}
                      </span>
                    ))}
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-3 py-2 text-[#15803d]">
                  <span className="material-symbols-outlined text-[28px]">verified</span>
                  <div>
                    <h3 className="font-title-md text-title-md font-bold text-primary">
                      Outstanding Mastery!
                    </h3>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      You answered every question correctly. No revision needed! 🎉
                    </p>
                  </div>
                </div>
              )}
            </Card>
          </section>

          </div>

          {/* Detailed Question Review */}
          <section className="flex flex-col gap-space-sm lg:col-span-7">
            <h2 className="font-headline-sm text-headline-sm text-primary font-bold px-1">
              Detailed Question Review
            </h2>

            {questions.map((q, index) => {
              const studentChoice = studentAnswers[q.id];
              const isCorrect = studentChoice === q.correctAnswer;

              return (
                <Card key={q.id} className="flex flex-col gap-space-sm">
                  {/* Status header */}
                  <div className="flex items-center justify-between">
                    <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">
                      Question {index + 1} • {q.topic}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full font-label-sm text-label-sm font-bold flex items-center gap-1 ${
                        isCorrect
                          ? 'bg-[#15803d]/10 text-[#15803d]'
                          : 'bg-[#b91c1c]/10 text-[#b91c1c]'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        {isCorrect ? 'check_circle' : 'cancel'}
                      </span>
                      {isCorrect ? 'Correct (+1)' : 'Incorrect (0)'}
                    </span>
                  </div>

                  {/* Question Text */}
                  <h3 className="font-title-md text-title-md text-primary font-bold leading-snug">
                    {q.question}
                  </h3>

                  {/* Student Answer */}
                  <div
                    className={`p-space-sm rounded-xl border flex flex-col gap-1 ${
                      isCorrect
                        ? 'border-[#15803d] bg-[#15803d]/5 text-[#15803d]'
                        : 'border-[#b91c1c] bg-[#b91c1c]/5 text-[#b91c1c]'
                    }`}
                  >
                    <span className="font-label-sm text-label-sm font-bold uppercase tracking-wider">
                      Your Answer:
                    </span>
                    <p className="font-body-md text-body-md font-medium text-on-surface">
                      {studentChoice !== undefined
                        ? `${optionLetters[studentChoice]}. ${q.options[studentChoice]}`
                        : 'Not Attempted'}
                    </p>
                  </div>

                  {/* If incorrect, show correct answer */}
                  {!isCorrect && (
                    <div className="p-space-sm rounded-xl border border-[#15803d] bg-[#15803d]/5 text-[#15803d] flex flex-col gap-1">
                      <span className="font-label-sm text-label-sm font-bold uppercase tracking-wider">
                        Correct Answer:
                      </span>
                      <p className="font-body-md text-body-md font-medium text-on-surface">
                        {optionLetters[q.correctAnswer]}. {q.options[q.correctAnswer]}
                      </p>
                    </div>
                  )}

                  {/* Explanation */}
                  <div className="p-space-sm glass-panel flex items-start gap-2 text-on-surface">
                    <span
                      className="material-symbols-outlined text-[18px] text-secondary shrink-0 mt-0.5"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      info
                    </span>
                    <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                      <strong className="text-primary">Explanation:</strong> {q.explanation}
                    </p>
                  </div>
                </Card>
              );
            })}
          </section>

          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-space-sm pt-space-xs">
            <Button
              variant="primary"
              size="lg"
              icon="replay"
              className="w-full sm:flex-1"
              onClick={handleRetake}
            >
              Retake Quiz
            </Button>
            <Button
              variant="secondary"
              size="lg"
              icon="home"
              className="w-full sm:flex-1"
              onClick={handleBackToDashboard}
            >
              Back to Dashboard
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}

