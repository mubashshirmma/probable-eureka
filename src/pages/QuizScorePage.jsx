import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuiz } from '../context/QuizContext';
import { useStudySet } from '../context/StudySetContext';
import Button from '../components/Button';
import Card from '../components/Card';

export default function QuizScorePage() {
  const navigate = useNavigate();
  const { questions, studentAnswers, resetQuiz } = useQuiz();
  const { studySet } = useStudySet();

  const isQuizComplete = questions && questions.length > 0 && Object.keys(studentAnswers).length > 0;

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
    resetQuiz();
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
  const strokeDashoffset = circumference - (circumference * percentage) / 100;

  const optionLetters = ['A', 'B', 'C', 'D'];

  return (
    <div className="bg-background font-body-md text-body-md text-on-surface flex flex-col min-h-screen">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 pt-safe bg-surface-container-lowest/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="h-16 px-margin flex items-center justify-between gap-space-sm max-w-xl mx-auto">
          <div className="flex items-center gap-space-sm min-w-0">
            <Link
              to="/dashboard"
              aria-label="Back to Dashboard"
              className="w-11 h-11 flex items-center justify-center -ml-2 rounded-full text-on-surface hover:bg-surface-container-high transition-colors"
            >
              <span className="material-symbols-outlined text-[24px]">arrow_back</span>
            </Link>
            <img
              alt="StudySaathi AI Logo"
              className="h-7 w-auto object-contain flex-shrink-0"
              src="https://lh3.googleusercontent.com/aida/AEtjO1U5Hn00h2H0TL7BbCuRbZgZBFHrg8f0KkPf8JVr28GieRip7ub7II3vWQR36WFgGfUFTn8E8mGIE6EGxq57n1209T_CFsM9Nql89um3TW34cRO0lZEgKPRgudDCKPc1F1nwdj3wC7fiT9XMzMj-7MIb7dLXZIBu6u_MHqcxiWiPJYWqWZkQmpAqSXWOl4sH_GwcyfbsdnA6d0xdmfuqCwI-Xj6rqoQjXZFvQyBzl30r"
            />
            <h1 className="font-headline-sm text-headline-sm text-primary tracking-tight truncate font-bold">
              Quiz Results
            </h1>
          </div>
          <button
            type="button"
            onClick={handleBackToDashboard}
            className="text-secondary font-label-md text-label-md hover:underline font-semibold"
          >
            Dashboard
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative w-full pt-16 pb-20 bg-background">
        <div className="flex flex-col w-full px-margin pb-space-xl max-w-xl mx-auto gap-space-md">
          {/* Header Banner */}
          <div className="flex flex-col items-center text-center mt-space-md mb-space-sm">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-secondary-fixed text-primary mb-space-sm shadow-sm animate-bounce">
              <span aria-label="Target Dart" className="text-2xl" role="img">
                🎯
              </span>
            </div>
            <h2 className="font-headline-lg-mobile text-headline-lg-mobile text-primary tracking-tight font-bold">
              Quiz Completed!
            </h2>
            <p className="font-body-sm text-body-sm text-outline mt-space-xs font-medium">
              {studySet?.topicTitle} Quiz • {total} Questions
            </p>
          </div>

          {/* Score Summary Hero Card */}
          <Card className="flex flex-col items-center text-center relative overflow-hidden">
            {/* Circular Progress Gauge */}
            <div className="relative w-36 h-36 flex items-center justify-center my-space-xs">
              <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 120 120">
                <circle
                  className="text-surface-container"
                  cx="60"
                  cy="60"
                  fill="transparent"
                  r="50"
                  stroke="currentColor"
                  strokeWidth="10"
                />
                <circle
                  className="text-secondary transition-all duration-1000 ease-out"
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
            <div className="inline-flex items-center gap-1.5 px-space-md py-1.5 rounded-full bg-surface-container-low text-on-surface mt-space-sm mb-space-md">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  percentage >= 80 ? 'bg-[#16A34A]' : percentage >= 50 ? 'bg-secondary' : 'bg-[#DC2626]'
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
            <div className="w-full grid grid-cols-3 gap-space-xs pt-space-xs bg-surface-container-low rounded-xl p-space-sm">
              <div className="flex flex-col items-center py-space-xs">
                <div className="flex items-center gap-1 text-[#16A34A]">
                  <span className="material-symbols-outlined text-[18px]">check_circle</span>
                  <span className="font-headline-sm text-headline-sm font-bold text-primary">
                    {correctCount}
                  </span>
                </div>
                <span className="font-label-sm text-label-sm text-outline mt-0.5">Correct</span>
              </div>

              <div className="flex flex-col items-center py-space-xs border-x border-outline/10">
                <div className="flex items-center gap-1 text-[#DC2626]">
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
                <div className="flex items-center gap-3 py-2 text-[#16A34A]">
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

          {/* Detailed Question Review */}
          <section className="flex flex-col gap-space-sm">
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
                          ? 'bg-[#16A34A]/10 text-[#16A34A]'
                          : 'bg-[#DC2626]/10 text-[#DC2626]'
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
                    className={`p-space-sm rounded-lg border flex flex-col gap-1 ${
                      isCorrect
                        ? 'border-[#16A34A] bg-[#16A34A]/5 text-[#16A34A]'
                        : 'border-[#DC2626] bg-[#DC2626]/5 text-[#DC2626]'
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
                    <div className="p-space-sm rounded-lg border border-[#16A34A] bg-[#16A34A]/5 text-[#16A34A] flex flex-col gap-1">
                      <span className="font-label-sm text-label-sm font-bold uppercase tracking-wider">
                        Correct Answer:
                      </span>
                      <p className="font-body-md text-body-md font-medium text-on-surface">
                        {optionLetters[q.correctAnswer]}. {q.options[q.correctAnswer]}
                      </p>
                    </div>
                  )}

                  {/* Explanation */}
                  <div className="p-space-sm bg-surface-container-low rounded-lg flex items-start gap-2 text-on-surface">
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

